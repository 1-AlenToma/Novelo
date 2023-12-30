import createDbContext, { IDatabase, IQueryResultItem, IBaseModule } from 'expo-sqlite-wrapper'
import * as SQLite from 'expo-sqlite';
import { Book, Chapter, Tables, TableNames } from "./";
export default class DbContext {
    databaseName: string = "mydatabase.db";
    database: IDatabase<TableNames>;
    constructor() {
        this.database = createDbContext<TableNames>(
            Tables,
            async () => {
                return SQLite.openDatabase(this.databaseName);
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
}
