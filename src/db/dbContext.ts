import { Database, DatabaseDrive, encrypt, decrypt, oEncypt, oDecrypt } from "react-native-ts-sqlite-orm";
import {
  openDatabaseAsync
} from "expo-sqlite";
import {
  Book,
  Chapter,
  Session,
  TableNames,
  AppSettings
} from "./";
import { AppLocalSettings, DownloadOptions } from "../Types";
import {
  removeProps,
  joinKeys,
  sleep
} from "../Methods";
import { DetailInfo, ZipBook } from "../native";
import { AlertDialog } from "react-native-short-style";
export default class DbContext extends Database<TableNames> {
  databaseName: string = "Novelo";
  appLocalSettings: AppLocalSettings;
  readonly Books = this.DbSet<Book>(Book);
  readonly Chapters = this.DbSet<Chapter>(Chapter);
  readonly AppSettings = this.DbSet<AppSettings>(AppSettings);

  async sendToServer(sql, args, operation) {
    try {

      let rep = await methods.fetchWithTimeout(this.appLocalSettings.serverIp.join("sql"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, args: JSON.stringify(args ?? []).encode(), operation })
      }, 8000)
      if (rep.ok) {
        let txt = await rep.text();
        if (txt && (txt.startsWith("{") || txt.startsWith("[")))
          return JSON.parse(txt);
      }
    } catch (e) {
      AlertDialog.alert({ title: "Novelo Server", message: `Could not connect to Novelo server, Check your internet settings or make sure that Novelo server is reachable\nError Message:${e.toString()}` })
      console.error(e);
    }

    return undefined
  }

  constructor(appLocalSettings?: AppLocalSettings) {

    super(
      async () => {
        let db = await openDatabaseAsync(this.databaseName);
        let driver: DatabaseDrive = {
          close: async () => await db.closeAsync(),
          executeSql: async (sql, args, operation) => {
            console.info("Sql Operation", operation);
            switch (operation) {
              case "Bulk":
                if (this.appLocalSettings)
                  this.sendToServer(sql, args, operation);
                else
                  await db.execAsync(sql);
                break;
              case "READ":
                if (this.appLocalSettings)
                  return await this.sendToServer(sql, args, operation);
                else
                  return await db.getAllAsync(sql, args);
              case "WRITE":
                if (this.appLocalSettings)
                  return (await this.sendToServer(sql, args, operation))?.lastInsertRowId;
                else {
                  let item = await db.runAsync(sql, args);
                  return item?.lastInsertRowId;
                }
            }
            return undefined;
          },
        }
        return driver;
      },
      async db => {
        try {

          await db.executeRawSql([{
            sql: `
              PRAGMA cache_size=8192;
              PRAGMA encoding="UTF-8";
              PRAGMA synchronous=NORMAL;
              PRAGMA temp_store=FILE;
              `, args: []
          }]);

        } catch (e) {
          console.error(e);
        } finally {
          db.startRefresher(3600000);
        }
      },
      !__DEV__
    );

    this.appLocalSettings = appLocalSettings;
    this.addTables(Session)
  }

  downloadDatabase = async (
    folder: string,
    options: DownloadOptions
  ) => {
    try {
      context.zip.beginNew();
      let item = {
        appSettings: undefined as AppSettings | undefined,
        books: [] as Book[],
        epubs: [] as any[]
      };

      if (options.appSettings) {
        item.appSettings = context.appSettings;
      }

      if (options.all) {
        item.books = await this.Books.query.load("chapterSettings")
          .where.column(x => x.favorit)
          .equalTo(true)
          .toList();
      } else if (options.items.length > 0) {
        item.books = await this.Books.query.load("chapterSettings")
          .where
          .column(x => x.favorit).equalTo(true)
          .and
          .column(x => x.url).in(options.items.map(x => x.url))
          .and
          .column(x => x.parserName)
          .in(options.items.map(x => x.parserName))
          .toList();
      }
      let bookImages = item.books.map(x => {
        if (x.imageBase64 && !x.imageBase64.isBase64Url() && x.imageBase64.isLocalPath())
          return context.imageCache.dir.path(x.imageBase64)
        return undefined
      }).filter(x => x != undefined)
      context.zip.files(...bookImages)
      if (options.epubs) {
        let files = await context.files.allFiles();
        let images = await context.imageCache.allFiles();
        images = images.filter(x => !x.has("db/"));
        context.zip.appendFiles(...files, ...images);

        for (let file of files) {
          let novel: ZipBook = JSON.parse(
            await context.files.read(file) ?? "{}"
          );
          novel.fileName = file;
          let book = await this.Books.query.load("chapterSettings")
            .where
            .column(x => x.url).equalTo(novel.url)
            .firstOrDefault();

          if (book) {
            item.epubs.push(novel);
            item.books.push(book);
          }
        }
      }
      item = removeProps(
        item,
        "id",
        "parent_Id",
        "tableName"
      );
      context.zip.data({ content: await JSON.stringify(item), path: "Novelo_Backup.json" });
      await context.zip.zipFiles(folder, context.appSettings.filesDataLocation ?? context.files.DocumentDirectoryPath);
    } catch (e) {
      console.error("DownloadDatabase", e);
      return e.message;
    }
  };

  uploadData = async (
    uri: string
  ) => {
    let total = 0;
    let index = 0;
    const calc = async (finished?: boolean, filePath?: string) => {
      index++;
      let p = total.procent(index)
      if (finished) p = 100;
      context.zip.trigger("CopyProgress", { progress: p, filePath: filePath ?? "Copy content", color: "green" });
      if (index % 30 === 0) await sleep(10);
    };
    try {
      context.zip.beginNew();
      await context.zip.unzip(uri, context.appSettings.filesDataLocation ?? context.files.DocumentDirectoryPath, "Novelo_Backup")
      let Novelo_BackupFile = context.zip._data.find(x => x.path.has("Novelo_Backup"))?.content;
      if (!Novelo_BackupFile) {
        console.error("Could not find Novel_Backup file")
        return;
      }
      context.zip.loading = true;
      Novelo_BackupFile = await Novelo_BackupFile.decodeAsync();
      await this.disableWatchers();
      await this.disableHooks();
      await this.beginTransaction();
      context.files.disable();
      let item = JSON.parse(Novelo_BackupFile) as {
        appSettings: AppSettings | undefined,
        books: Book[],
        epubs: any[]
      };
      if (item) {
        total =
          item.books.length +
          item.epubs.length +
          1;
        await calc();
        await sleep(30);
        if (item.appSettings) {
          joinKeys(
            context.appSettings,
            item.appSettings
          );
          await context.appSettings.saveChanges();
        }

        for (let book of item.books ?? []) {
          let b = await this.Books.query.load("chapterSettings")
            .where.column(x => x.url).equalTo(book.url)
            .and
            .column(x => x.parserName)
            .equalTo(book.parserName)
            .firstOrDefault();
          if (b) {
            joinKeys(b, book, "chapterSettings");
            b.chapterSettings = [
              ...b.chapterSettings,
              ...book.chapterSettings.filter(
                x =>
                  !b.chapterSettings.find(
                    c => c.url === x.url
                  )
              )
            ];

            book = b;
          }

          book.tableName = "Books";
          await this.save(book);
          total += book.chapterSettings.length;
          const bulk = await this.Books.bulkSave()
          for (let ch of book.chapterSettings) {
            ch.tableName = "Chapters";
            ch.parent_Id = book.id;
            await calc(false, book.name);
            await this.save(ch);


          }
          await calc(false, book.name);

        }
      }

      await this.commitTransaction();
    } catch (e) {
      await this.rollbackTransaction();
      console.error(e);
      return e.message;
    } finally {
      await this.enableHooks();
      await this.enableWatchers();
      context.files.enable();
      context.zip.loading = false;
      calc(true);
    }
  };

  async deleteBook(id: number) {
    let book = await this.Books.byId(id);
    await this.Books.query
      .where
      .column(x => x.id)
      .equalTo(id)
      .delete();

    if (book && book.imageBase64 && !book.imageBase64.isBase64String() && book.imageBase64.isLocalPath(false)) {
      await context.imageCache.delete(book.imageBase64)
    }

    if (context.player && context.player.book?.id == id) {
      await context.player.stop();
      context.player = undefined;
    }
  }
}
