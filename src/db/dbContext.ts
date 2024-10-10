import createDbContext, {
  IDatabase,
  IQueryResultItem,
  IBaseModule,
  encrypt,
  decrypt
} from "../expo-sqlite-wrapper/src";
import {
  openDatabaseAsync,
  SQLiteProvider,
  useSQLiteContext,
  addDatabaseChangeListener
} from "expo-sqlite/next";
import {
  Book,
  Chapter,
  Tables,
  TableNames,
  AppSettings
} from "./";
import { DownloadOptions } from "../Types";
import {
  writeFile,
  removeProps,
  joinKeys,
  sleep
} from "../Methods";
let encKey = "novelo.enc";
let encKeys = ["url", "parserName", "image"];
export default class DbContext {
  databaseName: string = "Novelo";
  database: IDatabase<TableNames>;
  constructor() {
    this.database = createDbContext<TableNames>(
      Tables,
      async () => {
        let db = await openDatabaseAsync(
          this.databaseName
        );
        //console.error(db.execAsync);
        //console.error(db.execSync);
        return db;
      },
      async db => {
        try {
          for (let sql of `
      PRAGMA cache_size=8192;
      PRAGMA encoding="UTF-8";
      PRAGMA synchronous=NORMAL;
      PRAGMA temp_store=FILE;
      `
            .split(";")
            .filter(x => x.length > 2)
            .map(x => {
              return { sql: x, args: [] };
            })) {
            await db.executeRawSql([sql]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          db.startRefresher(3600000);
        }
      },
      !__DEV__
    );
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
      value&&
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
    options: DownloadOptions
  ) => {
    try {
      let item = {
        appSettings: undefined as AppSettings | undefined,
        books: [] as Book[],
        epubs: [] as any[]
      };

      if (options.appSettings) {
        item.appSettings = context.appSettings;
      }

      if (options.all) {
        item.books = await this.database
          .querySelector<Book>("Books")
          .LoadChildren<Chapter>(
            "Chapters",
            "parent_Id",
            "id",
            "chapterSettings",
            true
          )
          .Where.Column(x => x.favorit)
          .EqualTo(true)
          .toList();
      } else if (options.items.length > 0) {
        item.books = await this.database
          .querySelector<Book>("Books")
          .LoadChildren<Chapter>(
            "Chapters",
            "parent_Id",
            "id",
            "chapterSettings",
            true
          )
          .Where.Column(x => x.favorit)
          .EqualTo(true)
          .AND.Column(x => x.url)
          .IN(options.items.map(x => x.url))
          .AND.Column(x => x.parserName)
          .IN(
            options.items.map(x => x.parserName)
          )
          .toList();
      }
      if (options.epubs) {
        let files = await context.files.allFiles();
        for (let file of files) {
          let novel = JSON.parse(
            await context.files.read(file)
          );
          novel.fileName = file;
          let book = await this.database
            .querySelector<Book>("Books")
            .LoadChildren<Chapter>(
              "Chapters",
              "parent_Id",
              "id",
              "chapterSettings",
              true
            )
            .Where.Column(x => x.url)
            .EqualTo(novel.url)
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
      await writeFile(
        JSON.stringify(item),
        "Novelo_Backup.json"
      );
    } catch (e) {
      console.error(e);
      return e.message;
    }
  };

  uploadData = async (
    uri: string,
    onChange: (p: number) => void
  ) => {
    let total = 0; 
    let index = 0;
    const calc = (finished?: boolean) => {
      index++;
      let p = (100 * index + 1) / total;
      if (finished) p = 100;
      onChange?.(p);
    };
    try {
      await this.database.disableWatchers();
      await this.database.disableHooks();
      await this.database.beginTransaction();
      let file = await context.files.read(uri);
      let item = file?.has()
        ? JSON.parse(file)
        : undefined;

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
          let b = await this.database
            .querySelector<Book>("Books")
            .LoadChildren<Chapter>(
              "Chapters",
              "parent_Id",
              "id",
              "chapterSettings",
              true
            )
            .Where.Column(x => x.url)
            .EqualTo(book.url)
            .AND.Column(x => x.parserName)
            .EqualTo(book.parserName)
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
          await this.database.save(book);
          for (let ch of book.chapterSettings) {
            ch.tableName = "Chapters";
            ch.parent_Id = book.id;
            await this.database.save(ch);
          }
          calc();
          if (index % 5 === 0) await sleep(10);
        }

        for (let epub of item.epubs) {
          await context
            .files
            .write(
              epub.fileName,
              JSON.stringify(epub)
            );
          calc();
          if (index % 5 === 0) await sleep(10);
        }
      }

      await this.database.commitTransaction();
    } catch (e) {
      await this.database.rollbackTransaction();
      console.error(e);
      return e.message;
    } finally {
      await this.database.enableHooks();
      await this.database.enableWatchers();
      calc(true);
    }
  };

  async deleteBook(id: number) {
    await this.database
      .querySelector<Chapter>("Chapters")
      .Where.Column(x => x.parent_Id)
      .EqualTo(id)
      .delete();
    await this.database
      .querySelector<Book>("Books")
      .Where.Column(x => x.id)
      .EqualTo(id)
      .delete();
  }
}
