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
import { DownloadOptions } from "../Types";
import {
  removeProps,
  joinKeys,
  sleep
} from "../Methods";
import { DetailInfo, ZipBook } from "../native";
let encKey = "novelo.enc";
let encKeys = ["url", "parserName", "image"];
export default class DbContext extends Database<TableNames> {
  databaseName: string = "Novelo";
  readonly Books = this.DbSet<Book>(Book);
  readonly Chapters = this.DbSet<Chapter>(Chapter);
  readonly AppSettings = this.DbSet<AppSettings>(AppSettings);
  constructor() {
    super(
      async () => {
        let db = await openDatabaseAsync(this.databaseName);
        let driver: DatabaseDrive = {
          close: async () => await db.closeAsync(),
          executeSql: async (sql, args, operation) => {
            console.info("Sql Operation", operation);
            switch (operation) {
              case "Bulk":
                await db.execAsync(sql);
                break;
              case "READ":
                return await db.getAllAsync(sql, args);
              case "WRITE":
                let item = await db.runAsync(sql, args);
                return item?.lastInsertRowId;
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

    this.addTables(Session)
  }

  encryptItem = (item: any) => {
    if (!item) return undefined;
    if (
      Array.isArray(item) &&
      typeof item == "object"
    ) {
      if (
        item.length > 0 &&
        typeof item.firstOrDefault() === "object"
      ) {
        item.forEach(x => {
          this.encryptItem(x);
        });
      }
    } else {
      for (let k in item) {
        let value = item[k];
        if (
          encKeys.includes(k) &&
          value &&
          typeof value === "string" &&
          !value.startsWith("#")
        ) {
          item[k] = encrypt(value, encKey);
        } else if (
          value &&
          typeof value == "object"
        ) {
          this.encryptItem(value);
        }
      }
    }

    return item;
  };

  encode(value: string) {
    if (
      value &&
      typeof value === "string" &&
      !value.startsWith("#")
    )
      return encrypt(value, encKey);
    return value;
  }

  decode(value: string) {
    if (
      value &&
      typeof value === "string" &&
      value.startsWith("#")
    )
      return decrypt(value, encKey);
    return value;
  }

  decryptItem = (item: any) => {
    if (!item) return undefined;
    if (
      Array.isArray(item) &&
      typeof item == "object"
    ) {
      item.forEach(x => {
        this.decryptItem(x);
      });
    } else {
      for (let k in item) {
        console.info(k);
        let value = item[k];
        if (
          value &&
          typeof value === "string" &&
          value.startsWith("#")
        ) {
          item[k] = decrypt(value, encKey);
        } else if (
          value &&
          typeof value == "object"
        ) {
          this.decryptItem(value);
        }
      }
    }

    return item;
  };

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
      if (options.epubs) {
        let files = await context.files.allFiles();
        let images = await context.imageCache.allFiles();
        context.zip.files(...files, ...images);

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
      this.encryptItem(item);
      context.zip.data({ content: JSON.stringify(item), path: "Novelo_Backup.json" });
      await context.zip.zipFiles(folder, context.appSettings.filesDataLocation ?? context.files.DocumentDirectoryPath);
    } catch (e) {
      console.error(e);
      return e.message;
    }
  };

  uploadData = async (
    uri: string
  ) => {
    let total = 0;
    let index = 0;
    const calc = (finished?: boolean) => {
      index++;
      let p = (100 * index + 1) / total;
      if (finished) p = 100;
      context.zip.trigger("CopyProgress", { progress: p, filePath: "Copy content" })
    };
    try {
      context.zip.beginNew();
      await context.zip.unzip(uri, context.appSettings.filesDataLocation ?? context.files.DocumentDirectoryPath, "Novelo_Backup")
      let file = context.zip._data.find(x => x.path.has("Novelo_Backup"))?.content;
      if (!file) {
        console.error("Could not find Novel_Backup file")
        return;

      }
      await this.disableWatchers();
      await this.disableHooks();
      await this.beginTransaction();
      context.files.disable();
      let item = JSON.parse(file);
      if (item) {
        let total =
          item.books.length +
          item.epubs.length +
          1;
        calc();
        await sleep(30);
        this.decryptItem(item);
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
          for (let ch of book.chapterSettings) {
            ch.tableName = "Chapters";
            ch.parent_Id = book.id;
            await this.save(ch);
          }
          calc();
          if (index % 5 === 0) await sleep(10);
        }

        /*for (let epub of item.epubs) {
          await context
            .files
            .write(
              epub.fileName,
              JSON.stringify(epub)
            );
          calc();
          if (index % 5 === 0) await sleep(10);
        }*/
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
      calc(true);
    }
  };

  async deleteBook(id: number) {
    await this.Books.query
      .where
      .column(x => x.id)
      .equalTo(id)
      .delete();

    if (context.player && context.player.book?.id == id) {
      await context.player.stop();
      context.player = undefined;
    }
  }
}
