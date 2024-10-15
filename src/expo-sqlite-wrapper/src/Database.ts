import {
  IBaseModule,
  IWatcher,
  IQuery,
  IDatabase,
  Operation,
  ColumnType,
  ITableBuilder,
  IUseQuery,
  IQueryResultItem,
  SOperation,
  TempStore,
  WatchIdentifier,
  IId,
  Query
} from "./expo.sql.wrapper.types";
import { TableBuilder } from "./TableStructor";
import * as SQLite from "expo-sqlite/next";
import BulkSave from "./BulkSave";
import UseQuery from "./hooks/useQuery";
import QuerySelector, {
  IQuerySelector
} from "./QuerySelector";
import {
  createQueryResultType,
  Functions
} from "./UsefullMethods";

export default function <D extends string>(
  databaseTables: ITableBuilder<any, D>[],
  getDatabase: () => Promise<SQLite.SQLiteDatabase>,
  onInit?: (
    database: IDatabase<D>
  ) => Promise<void>,
  disableLog?: boolean
) {
  return new Database<D>(
    databaseTables,
    getDatabase,
    onInit,
    disableLog
  ) as IDatabase<D>;
}

const watchers: IWatcher<any, string>[] = [];
class Watcher<T, D extends string>
  implements IWatcher<T, D>
{
  tableName: D;
  onSave?: (
    item: T[],
    operation: Operation
  ) => Promise<void>;
  onDelete?: (item: T[]) => Promise<void>;
  onBulkSave?: () => Promise<void>;
  readonly removeWatch: () => void;
  identifier: WatchIdentifier;
  constructor(tableName: D) {
    this.removeWatch = () =>
      watchers.splice(
        watchers.findIndex(x => x == this),
        1
      );
    this.tableName = tableName;
    this.identifier = "Other";
  }
}

class Database<D extends string>
  implements IDatabase<D>
{
  private mappedKeys: Map<D, string[]>;
  private dataBase: () => Promise<SQLite.SQLiteDatabase>;
  public tables: TableBuilder<any, D>[];
  private timeout: any = undefined;
  private static dbIni: boolean = false;
  private onInit?: (
    database: IDatabase<D>
  ) => Promise<void>;
  private db?: SQLite.SQLiteDatabase;
  public isClosed?: boolean;
  private isClosing: boolean;
  private isOpen: boolean;
  private timer: any;
  private transacting: boolean;
  private refresherSettings?:
    | { ms: number }
    | undefined;
  private disableLog?: boolean;
  private _disableWatchers?: boolean;
  private _disableHooks?: boolean;
  private tempStore: TempStore<D>[];
  private timeStamp: Date | number = new Date();
  constructor(
    databaseTables: ITableBuilder<any, D>[],
    getDatabase: () => Promise<SQLite.SQLiteDatabase>,
    onInit?: (
      database: IDatabase<D>
    ) => Promise<void>,
    disableLog?: boolean
  ) {
    this.disableLog = disableLog;
    this.onInit = onInit;
    this.mappedKeys = new Map<D, string[]>();
    this.isClosing = false;
    this.timer = undefined;
    this.transacting = false;
    this.tempStore = [];
    this.dataBase = async () => {
      while (this.isClosing) await this.wait();
      if (
        this.db === undefined ||
        this.isClosed
      ) {
        this.db = await getDatabase();
        this.isClosed = false;
        await this.onInit?.(this as any);
      }
      this.isOpen = true;
      return this.db ?? (await getDatabase());
    };
    this.tables = databaseTables as TableBuilder<
      any,
      D
    >[];
  }

  private log(...items: any[]) {
    if (!this.disableLog) console.log(items);
  }

  private info(...items: any[]) {
    if (!this.disableLog) console.info(items);
  }

  //#region Hooks

  public useQuery<
    T extends IId<D>,
    D extends string
  >(
    tableName: D,
    query:
      | IQuery<T, D>
      | Query
      | (() => Promise<T[]>),
    onDbItemChanged?: (items: T[]) => T[],
    updateIf?: (
      items: T[],
      operation: string
    ) => boolean
  ) {
    return UseQuery(
      query as any,
      this as any,
      tableName,
      onDbItemChanged,
      updateIf
    ) as any;
  }

  //#endregion Hooks

  //#region private methods

  private resetRefresher() {
    if (this.refresherSettings) {
      this.startRefresher(
        this.refresherSettings.ms
      );
    }
  }

  private isLocked() {
    return this.transacting === true;
  }

  private AddToTempStore(
    items: IBaseModule<D>[],
    operation: SOperation,
    subOperation?: Operation,
    tableName?: D,
    identifier?: WatchIdentifier
  ) {
    try {
      let store = this.tempStore.find(
        x =>
          x.tableName === tableName &&
          x.operation === operation &&
          x.subOperation === subOperation &&
          x.identifier === identifier
      );
      if (store === undefined) {
        store = {
          operation: operation,
          subOperation: subOperation,
          tableName: tableName as D,
          items: [...items],
          identifier: identifier
        };
        this.tempStore.push(store);
      } else {
        items.forEach(x => {
          if (
            !store?.items.find(a => a.id === x.id)
          )
            store?.items.push(x);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  private async executeStore(
    identifier: WatchIdentifier
  ) {
    for (let item of this.tempStore
      .filter(x => x.identifier === identifier)
      .sort((a, b) => {
        if (a.operation !== "onBulkSave")
          return -1;
        if (b.operation !== "onBulkSave")
          return 1;
        return 0;
      })) {
      await this.triggerWatch(
        item.items,
        item.operation,
        item.subOperation,
        item.tableName,
        item.identifier
      );
    }

    this.tempStore = this.tempStore.filter(
      x => x.identifier !== identifier
    );
  }

  public async triggerWatch<
    T extends IBaseModule<D>
  >(
    items: T | T[],
    operation: SOperation,
    subOperation?: Operation,
    tableName?: D,
    identifier?: WatchIdentifier
  ) {
    try {
      this.log("watcher for " + tableName);
      const tItems = Array.isArray(items)
        ? items
        : [items];
      var s = Functions.single(tItems);
      if (s && !tableName && s && s.tableName)
        tableName = s.tableName;
      if (!tableName) return;
      const w = watchers.filter(x => {
        const watcher = x as Watcher<T, D>;
        return (
          watcher.tableName == tableName &&
          (identifier === undefined ||
            identifier === x.identifier)
        );
      }) as Watcher<T, D>[];

      for (let watcher of w) {
        try {
          if (
            this._disableWatchers &&
            watcher.identifier !== "Hook"
          ) {
            // this.info("Watcher is Frozen", operation);
            this.AddToTempStore(
              tItems,
              operation,
              subOperation,
              tableName,
              "Other"
            );
            continue;
          }

          if (
            this._disableHooks &&
            watcher.identifier === "Hook"
          ) {
            // this.info("Hook is Frozen", operation);
            this.AddToTempStore(
              tItems,
              operation,
              subOperation,
              tableName,
              "Hook"
            );
            continue;
          }

          if (
            operation === "onSave" &&
            watcher.onSave
          ) {
            // this.info("Call Watcher", operation);
            await watcher.onSave(
              tItems,
              subOperation ?? "INSERT"
            );
          }

          if (
            operation === "onDelete" &&
            watcher.onDelete
          ) {
            //  this.info("Call Watcher", operation);
            await watcher.onDelete(tItems);
          }

          if (
            operation === "onBulkSave" &&
            watcher.onBulkSave
          ) {
            // this.info("Call Watcher", operation);
            await watcher.onBulkSave();
          }
        } catch (e) {
          console.error(
            "Watchers.Error:",
            operation,
            subOperation,
            tableName,
            e
          );
        }
      }
    } catch (e) {
      console.error("Watchers.Error:", e);
    }
  }

  private localSave<T>(
    item?: IBaseModule<D>,
    insertOnly?: Boolean,
    tableName?: D,
    saveAndForget?: boolean
  ) {
    Functions.validateTableName(item as any, tableName);
    return new Promise(
      async (resolve, reject) => {
        try {
          if (!item) {
            reject(undefined);
            return;
          }
          this.log("Executing Save...");
          const uiqueItem =
            await this.getUique(item);
          let table = this.tables.find(
            x => x.tableName == item.tableName
          );
          const keys = Functions.getAvailableKeys(
            await this.allowedKeys(
              item.tableName,
              true
            ),
            item
          );
          const sOperations = uiqueItem
            ? "UPDATE"
            : "INSERT";
          let query = "";
          let args = [] as any[];
          if (uiqueItem) {
            if (insertOnly) {
              resolve(item as any);
              return;
            }
            query = `UPDATE ${item.tableName} SET `;
            keys.forEach((k, i) => {
              query +=
                ` ${k}=? ` +
                (i < keys.length - 1 ? "," : "");
            });
            query += " WHERE id=?";
          } else {
            query = `INSERT INTO ${item.tableName} (`;
            keys.forEach((k, i) => {
              query +=
                k +
                (i < keys.length - 1 ? "," : "");
            });
            query += ") values(";
            keys.forEach((k, i) => {
              query +=
                "?" +
                (i < keys.length - 1 ? "," : "");
            });
            query += ")";
          }
          keys.forEach((k: string, i) => {
            let value = (item as any)[k];
            let column = table?.props.find(
              x => x.columnName.toString() === k
            );

            if (column?.columnType === "JSON")
              value = JSON.stringify(value);
            let v = value ?? null;
            v = Functions.translateAndEncrypt(
              v,
              this as any,
              item.tableName,
              k
            );
            args.push(v);
          });
          if (uiqueItem) item.id = uiqueItem.id;
          if (uiqueItem != undefined)
            args.push(uiqueItem.id);
          await this.execute(query, args);
          if (
            saveAndForget !== true ||
            item.id === 0 ||
            item.id === undefined
          ) {
            const lastItem =
              (await this.selectLastRecord<
                IBaseModule<D>
              >(item)) ?? item;
            item.id = lastItem.id;
          }
          await this.triggerWatch(
            [item],
            "onSave",
            sOperations,
            item.tableName || tableName
          );
          resolve(item as any as T);
        } catch (error) {
          console.error(error, item);
          reject(error);
        }
      }
    ) as Promise<T | undefined>;
  }

  private async localDelete(
    items: IBaseModule<D>[],
    tableName: string
  ) {
    var q = `DELETE FROM ${tableName} WHERE id IN (${items
      .map(x => "?")
      .join(",")})`;
    await this.execute(
      q,
      items.map(x => x.id)
    );
  }

  private async getUique(item: IBaseModule<D>) {
    if (item.id != undefined && item.id > 0)
      return Functions.single(
        await this.where<IBaseModule<D>>(
          item.tableName,
          { id: item.id }
        )
      );
    this.log("Executing getUique...");
    const trimValue = (value: any) => {
      if (typeof value === "string")
        return (value as string).trim();
      return value;
    };

    var filter = {} as any;
    var addedisUnique = false;
    var table = this.tables.find(
      x => x.tableName === item.tableName
    );
    if (table)
      table.props
        .filter(x => x.isUnique === true)
        .forEach(x => {
          var anyItem = item as any;
          var columnName = x.columnName as string;
          if (
            anyItem[columnName] !== undefined &&
            anyItem[columnName] !== null
          ) {
            filter[columnName] = trimValue(
              anyItem[columnName]
            );
            addedisUnique = true;
          }
        });

    if (!addedisUnique) return undefined;

    return Functions.single(
      await this.where<IBaseModule<D>>(
        item.tableName,
        filter
      )
    );
  }

  private async selectLastRecord<T>(
    item: IBaseModule<D>
  ) {
    this.log("Executing SelectLastRecord... ");
    if (!item.tableName) {
      this.log(
        "TableName cannot be empty for:",
        item
      );
      return;
    }
    return Functions.single<T>(
      (
        await this.find(
          !item.id || item.id <= 0
            ? `SELECT * FROM ${item.tableName} ORDER BY id DESC LIMIT 1;`
            : `SELECT * FROM ${item.tableName} WHERE id=?;`,
          item.id && item.id > 0
            ? [item.id]
            : undefined,
          item.tableName
        )
      ).map((x: any) => {
        x.tableName = item.tableName;
        return x;
      })
    );
  }

  private wait(ms?: number) {
    return new Promise<void>((resolve, reject) =>
      setTimeout(resolve, ms ?? 100)
    );
  }

  //#endregion

  //#region public Methods for Select

  public disableWatchers() {
    this._disableWatchers = true;
    return this;
  }

  public async enableWatchers() {
    this._disableWatchers = false;
    await this.executeStore("Other");
  }

  public disableHooks() {
    this._disableHooks = true;
    return this;
  }

  public async enableHooks() {
    this._disableHooks = false;
    await this.executeStore("Hook");
  }

  public async beginTransaction() {
    this.resetRefresher();
    if (this.transacting) return;
    this.info("creating transaction");
    await this.execute("begin transaction");
    this.transacting = true;
  }

  public async commitTransaction() {
    this.resetRefresher();
    if (!this.transacting) return;
    this.info("commiting transaction");
    await this.execute("commit");
    this.transacting = false;
  }

  public async rollbackTransaction() {
    this.resetRefresher();
    if (!this.transacting) return;
    this.info("rollback transaction");
    await this.execute("rollback");
    this.transacting = false;
  }

  public startRefresher(ms: number) {
    if (this.timer) clearInterval(this.timer);
    this.refresherSettings = { ms };
    this.timer = setInterval(async () => {
      let h =
        Math.abs((this.timeStamp as any) - (new Date() as any)) /
        36e5;
      if (
        h < 2 ||
        this.isClosing ||
        this.isClosed
      )
        return;
      this.info(
        "db refresh:",
        await this.tryToClose()
      );
    }, ms);
  }

  public async close() {
    const db = this.db as any;
    if (db && db.closeAsync != undefined) {
      await db.closeAsync();
      this.isOpen = false;
      this.isClosed = true;
      this.db = undefined;
      this.isClosing = false;
    }
  }

  public async tryToClose() {
    let r = false;
    try {
      const db = this.db as any;
      if (!this.db || !this.isOpen) return false;
      if (db.closeAsync === undefined)
        throw "Cant close the database, name cant be undefined";

      if (this.isLocked()) return false;

      this.isClosing = true;
      await db.closeAsync();
      r = true;
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      if (r) {
        this.isOpen = false;
        this.isClosed = true;
        this.db = undefined;
      }
      this.isClosing = false;
    }
  }

  public allowedKeys = async (
    tableName: D,
    fromCachedKyes?: boolean,
    allKeys?: boolean
  ) => {
    if (
      fromCachedKyes === true &&
      !allKeys &&
      this.mappedKeys.has(tableName)
    )
      return this.mappedKeys.get(tableName) as string[];

    try {
      let result = await (
        await this.dataBase()
      ).getAllAsync(
        `PRAGMA table_info(${tableName})`
      );
      const table = this.tables.find(
        x => x.tableName === tableName
      );
      var keys = [] as string[];

      for (let row of result as any[]) {
        if (
          (table === undefined &&
            row.name != "id") ||
          (table &&
            (table.props.find(
              x =>
                x.columnName == row.name &&
                !x.isAutoIncrement
            ) ||
              allKeys))
        )
          keys.push(row.name);
      }

      if (!allKeys)
        this.mappedKeys.set(tableName, keys);
      return keys;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  public watch<T extends IId<D>>(tableName: D) {
    var watcher = new Watcher<T, D>(
      tableName
    ) as IWatcher<T, D>;
    watchers.push(watcher);
    return watcher;
  }

  public async asQueryable<T extends IId<D>>(
    item: IId<D> | IBaseModule<D>,
    tableName?: D
  ) {
    Functions.validateTableName(item, tableName);
    var db = this as IDatabase<D>;
    return await createQueryResultType<T, D>(
      item as any,
      db
    );
  }

  public querySelector<T extends IId<D>>(
    tableName: D
  ) {
    return new QuerySelector(
      tableName,
      this
    ) as IQuerySelector<T, D>;
  }

  public async save<T extends IId<D>>(
    items: (T & T) | (T & T)[],
    insertOnly?: Boolean,
    tableName?: D,
    saveAndForget?: boolean
  ) {
    const tItems = Array.isArray(items)
      ? items
      : [items];
    try {
      var returnItem = [] as T[];
      for (var item of tItems) {
        returnItem.push(
          (await this.localSave<T>(
            item as any,
            insertOnly,
            tableName,
            saveAndForget
          )) ?? (item as any)
        );
      }
      return returnItem as T[];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async delete(
    items: IId<D> | IId<D>[],
    tableName?: D
  ) {
    try {
      var tItems = (
        Array.isArray(items) ? items : [items]
      ).reduce((v, c) => {
        const x = Functions.validateTableName(
          c,
          tableName
        );
        if (v[x.tableName])
          v[x.tableName].push(c);
        else v[x.tableName] = [c];

        return v;
      }, {} as any);

      for (let key of Object.keys(tItems)) {
        await this.localDelete(tItems[key], key);
        await this.triggerWatch(
          tItems[key],
          "onDelete",
          undefined,
          tableName
        );
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async jsonToSql<T>(
    jsonQuery: any,
    tableName?: D
  ) {
    const query =
      Functions.jsonToSqlite(jsonQuery);
    return (await this.find(
      query.sql,
      query.args,
      tableName
    )) as any as T[];
  }

  async where<T extends IId<D>>(
    tableName: D,
    query?: any | T
  ) {
    const q = Functions.translateSimpleSql(
      this,
      tableName,
      query
    );
    return (await this.find(
      q.sql,
      q.args,
      tableName
    )) as any as T[];
  }

  async find(
    query: string,
    args?: any[],
    tableName?: string
  ) {
    try {
      this.timeStamp = new Date();
      let db = await this.dataBase();
      this.info("executing find:", query);
      let result = await db.getAllAsync(
        query,
        ...(args ?? [])
      );

      const table = this.tables.find(
        x => x.tableName == tableName
      );
      const booleanColumns = table?.props.filter(
        x => x.columnType == "Boolean"
      );
      const dateColumns = table?.props.filter(
        x => x.columnType == "DateTime"
      );
      const jsonColumns = table?.props.filter(
        x => x.columnType == "JSON"
      );
      const translateKeys = (item: any) => {
        if (!item || !table) return item;
        jsonColumns?.forEach(column => {
          var columnName =
            column.columnName as string;
          if (
            item[columnName] != undefined &&
            item[columnName] != null &&
            item[columnName] != ""
          )
            item[columnName] = JSON.parse(
              item[columnName]
            );
        });
        booleanColumns?.forEach(column => {
          var columnName =
            column.columnName as string;
          if (
            item[columnName] != undefined &&
            item[columnName] != null
          ) {
            if (
              item[columnName] === 0 ||
              item[columnName] === "0" ||
              item[columnName] === false
            )
              item[columnName] = false;
            else item[columnName] = true;
          }
        });

        dateColumns?.forEach(column => {
          var columnName =
            column.columnName as string;
          if (
            item[columnName] != undefined &&
            item[columnName] != null &&
            item[columnName].length > 0
          ) {
            try {
              item[columnName] = new Date(
                item[columnName]
              );
            } catch {
              /// ignore
            }
          }
        });
        return item;
      };
      var items = [] as IBaseModule<D>[];

      for (let item of result as any[]) {
        if (tableName) item.tableName = tableName;
        let translatedItem = translateKeys(item);
        Functions.oDecrypt(translatedItem, table);
        if (table && table.typeProptoType)
          translatedItem =
            Functions.createSqlInstaceOfType(
              table.typeProptoType,
              translatedItem
            );
        const rItem =
          table && table.itemCreate
            ? table.itemCreate(translatedItem)
            : translatedItem;
        items.push(rItem);
      }

      return items;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  executeRawSql = async (
    queries: Query[]
  ) => {
    try {
      this.timeStamp = new Date();
      let db = await this.dataBase();
      for (let sql of queries) {
        if (sql.args.length > 0)
          await db.runAsync(sql.sql, ...sql.args);
        else await db.execAsync(sql.sql);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  execute = async (
    query: string,
    args?: any[]
  ) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          this.info("Executing Query:" + query);
          await this.executeRawSql([
            { sql: query, args: args || [] }
          ]);
          this.info("Quary executed");
          resolve(true);
        } catch (e) {
          console.error(
            "Could not execute query:",
            query,
            args,
            e
          );
          reject(e);
        } finally {
          clearTimeout(this.timeout);
        }
      }
    ) as Promise<boolean>;
  };

  async bulkSave<T>(tableName: D) {
    const item = new BulkSave<T, D>(
      this as IDatabase<D>,
      await this.allowedKeys(tableName, true),
      tableName
    );
    return item;
  }

  //#endregion

  //#region TableSetup
  public async tableHasChanges<T>(
    item: ITableBuilder<T, D>
  ) {
    const tbBuilder = item as TableBuilder<T, D>;
    var appSettingsKeys = await this.allowedKeys(
      tbBuilder.tableName
    );
    return (
      appSettingsKeys.filter(x => x != "id")
        .length !=
        tbBuilder.props.filter(
          x => x.columnName != "id"
        ).length ||
      tbBuilder.props.filter(
        x =>
          x.columnName != "id" &&
          !appSettingsKeys.find(
            a => a == x.columnName
          )
      ).length > 0
    );
  }

  public dropTables = async () => {
    try {
      for (var x of this.tables) {
        await this.execute(
          `DROP TABLE if exists ${x.tableName}`
        );
      }
      await this.setUpDataBase(true);
    } catch (e) {
      console.error(e);
    }
  };

  async migrateNewChanges() {
    const dbType = (columnType: ColumnType) => {
      if (
        columnType == "Boolean" ||
        columnType == "Number"
      )
        return "INTEGER";
      if (columnType == "Decimal") return "REAL";
      if (columnType == "BLOB") return "BLOB";
      return "TEXT";
    };
    let sqls : any[] = [];
    for (var table of this.tables) {
      this.log(
        `migrating-check ${table.tableName}`
      );
      let keys = await this.allowedKeys(
        table.tableName,
        false,
        true
      );
      let rColumns = keys.filter(
        x =>
          !table.props.find(
            k => x == k.columnName.toString()
          )
      );

      let aColumns = table.props.filter(
        x =>
          !keys.find(
            k => k == x.columnName.toString()
          )
      );

      rColumns.forEach(x => {
        sqls.push(
          `ALTER TABLE ${table.tableName} DROP COLUMN ${x}`
        );
      });

      aColumns.forEach(x => {
        sqls.push(
          `ALTER TABLE ${
            table.tableName
          } ADD COLUMN ${x.columnName.toString()} ${dbType(
            x.columnType
          )}`
        );
      });
    }
    this.log(`migrating`);
    try {
      if (sqls.length > 0) {
        await this.beginTransaction();
        await this.execute(
          "PRAGMA foreign_keys=OFF"
        );
      }
      for (let sql of sqls) {
        await this.execute(sql);
      }
      if (sqls.length > 0) {
        await this.execute(
          "PRAGMA foreign_keys=ON"
        );
        await this.commitTransaction();
      } else
        this.log(
          "The database is upp to date, no migration needed"
        );
    } catch (e) {
      await this.execute(
        "PRAGMA foreign_keys=ON"
      );
      await this.rollbackTransaction();
      console.error("migrating failed", e);
      throw e;
    }
  }

  setUpDataBase = async (
    forceCheck?: boolean
  ) => {
    try {
      if (!Database.dbIni || forceCheck) {
        await this.beginTransaction();
        const dbType = (
          columnType: ColumnType
        ) => {
          if (
            columnType == "Boolean" ||
            columnType == "Number"
          )
            return "INTEGER";
          if (columnType == "Decimal")
            return "REAL";
          if (columnType == "BLOB") return "BLOB";
          return "TEXT";
        };
        this.log(`dbIni= ${Database.dbIni}`);
        this.log(`forceCheck= ${forceCheck}`);
        this.log(
          "initilize database table setup"
        );
        for (var table of this.tables) {
          var query = `CREATE TABLE if not exists ${table.tableName} (`;
          table.props.forEach((col, index) => {
            query += `${col.columnName.toString()} ${dbType(
              col.columnType
            )} ${
              !col.isNullable ? "NOT NULL" : ""
            } ${
              col.isPrimary ? "UNIQUE" : ""
            },\n`;
          });
          table.props
            .filter(x => x.isPrimary === true)
            .forEach((col, index) => {
              query +=
                `PRIMARY KEY(${col.columnName.toString()} ${
                  col.isAutoIncrement === true
                    ? "AUTOINCREMENT"
                    : ""
                })` +
                (index <
                table.props.filter(
                  x => x.isPrimary === true
                ).length -
                  1
                  ? ",\n"
                  : "\n");
            });

          if (
            table.constrains &&
            table.constrains.length > 0
          ) {
            query += ",";
            table.constrains.forEach(
              (col, index) => {
                query +=
                  `CONSTRAINT "fk_${col.columnName.toString()}" FOREIGN KEY(${col.columnName.toString()}) REFERENCES ${
                    col.contraintTableName
                  }(${col.contraintColumnName})` +
                  (index <
                  (table.constrains?.length ??
                    0) -
                    1
                    ? ",\n"
                    : "\n");
              }
            );
          }
          query += ");";
          await this.execute(query);
        }
        await this.commitTransaction();
      }
    } catch (e) {
      console.error(e);
      await this.rollbackTransaction();
      throw e;
    }
  };

  //#endregion TableSetup
}
