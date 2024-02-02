import createDbContext, {
  IDatabase,
  IQueryResultItem,
  IBaseModule
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
  TableNames
} from "./";

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
            await db.executeRawSql([sql], false);
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

  async deleteBook(id: number) {
    await this.database
      .querySelector<Chapter>("Chapters")
      .Where.Column(x => x.parent_Id)
      .EqualTo(id)
      .delete();
    await this.database
      .querySelector<Book>("Books").Where
      .Column(x => x.id)
      .EqualTo(id)
      .delete();
  }
}
