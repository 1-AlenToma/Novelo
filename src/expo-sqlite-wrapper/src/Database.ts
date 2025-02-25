import {
  IWatcher,
  IDatabase,
  Operation,
  ITableBuilder,
  SOperation,
  TempStore,
  WatchIdentifier,
  IId,
  Query,
  IDataBaseExtender,
  DatabaseDrive,
  IDbSet,
  Operations
} from "./sql.wrapper.types";
import { TableBuilder } from "./TableStructor";
import BulkSave from "./BulkSave";
import UseQuery from "./hooks/useQuery";
import QuerySelector, { IQuerySelector, IReturnMethods } from "./QuerySelector";
import { createQueryResultType, Functions } from "./UsefullMethods";
import { DbSet } from "./DbSet";
import Table from "./Table";
export abstract class ORMDataBase<D extends string> implements IDatabase<D> {
  private db: Database<D>;
  constructor(
    getDatabase: () => Promise<DatabaseDrive>,
    onInit?: (database: IDatabase<D>) => Promise<void>,
    disableLog?: boolean) {
    this.db = new Database<D>(getDatabase, onInit, disableLog);
  }

  addTables(...tables: (typeof Table<D>[])) {
    try {
      let configs: ITableBuilder<any, D>[] = [];
      for (let item of tables) {
        let instanse = Functions.createSqlInstaceOfType(item.prototype) as Table<D>;
        let config = instanse?.config();
        if (config == undefined)
          throw "each dbSet must containes TableBuilder, eg result from config methods";
        configs.push(config);
      }
      this.db.addTables(...configs);
    } catch (e) {
      this.db.error(e)
      throw e;
    }
  }

  /**
   * 
   * @returns mark the probs as dbSet
   */
  DbSet<T extends IId<D>>(item: typeof Table<D>) {
    try {
      let instanse = Functions.createSqlInstaceOfType(item.prototype) as Table<D>;
      let config = instanse?.config();
      if (config == undefined)
        throw "each dbSet must containes TableBuilder, eg result from config methods";
      this.db.addTables(config);
      return new DbSet(config.tableName, this as any) as any as IDbSet<T, D>;
    } catch (e) {
      this.db.error(e)
      throw e;
    }
  }

  useQuery<T extends IId<D>>(tableName: D, query: Query | IReturnMethods<T, D> | (() => Promise<T[]>), onDbItemsChanged?: (items: T[]) => T[], updateIf?: (items: T[], operation: string) => boolean) {
    return this.db.useQuery(tableName, query as any, onDbItemsChanged, updateIf)
  }
  get isClosed() {
    return this.db.isClosed;
  }

  disableWatchers() { return this.db.disableWatchers() };
  enableWatchers() { return this.db.enableWatchers(); }
  disableHooks() { return this.db.disableHooks(); }
  enableHooks() { return this.db.enableHooks(); }
  bulkSave<T extends IId<D>>(tabelName: D) { return this.db.bulkSave(tabelName); }
  tryToClose() { return this.db.tryToClose(); }
  close() { return this.db.close(); }
  beginTransaction() { return this.db.beginTransaction(); }
  commitTransaction() { return this.db.commitTransaction(); }
  rollbackTransaction() { return this.db.rollbackTransaction(); }
  startRefresher(ms: number) { return this.db.startRefresher(ms); }
  allowedKeys(tableName: D) { return this.db.allowedKeys(tableName); }
  asQueryable<T extends IId<D>>(item: IId<D> | IId<D>, tableName?: D) { return this.db.asQueryable<T>(item, tableName); }
  watch<T extends IId<D>>(tableName: D) { return this.db.watch(tableName); }
  querySelector<T extends IId<D>>(tabelName: D) { return this.db.querySelector<T>(tabelName); }
  find(query: string, args?: any[], tableName?: D) { return this.db.find(query, args, tableName); }
  save<T extends IId<D>>(item: T | T[], insertOnly?: Boolean, tableName?: D, saveAndForget?: boolean) { return this.db.save<T>(item, insertOnly, tableName, saveAndForget); }
  where<T extends IId<D>>(tableName: D, query?: any | T) { return this.db.where<T>(tableName, query); }
  delete(item: IId<D> | IId<D>[], tableName?: D) { return this.db.delete(item, tableName); }
  execute(query: string, args?: any[]) { return this.db.execute(query, args); }
  dropTables() { return this.db.dropTables(); }
  setUpDataBase(forceCheck?: boolean) { return this.db.setUpDataBase(); }
  tableHasChanges<T extends IId<D>>(item: ITableBuilder<T, D>) { return this.db.tableHasChanges<T>(item); }
  executeRawSql(queries: Query[]) { return this.db.executeRawSql(queries); }
  migrateNewChanges() { return this.db.migrateNewChanges(); }

}

const watchers: IWatcher<any, string>[] = [];
class Watcher<T, D extends string>
  implements IWatcher<T, D> {
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
  implements IDatabase<D> {
  private mappedKeys: Map<D, string[]>;
  private dataBase: () => Promise<DatabaseDrive>;
  public tables: TableBuilder<any, D>[] = [];
  private static dbIni: boolean = false;
  private onInit?: (database: IDatabase<D>) => Promise<void>;
  private db?: DatabaseDrive;
  public isClosed?: boolean;
  private isClosing: boolean;
  private isOpen: boolean = false;
  private timer: any;
  private transacting: boolean;
  private refresherSettings?: { ms: number } | undefined;
  private disableLog?: boolean;
  private _disableWatchers?: boolean;
  private _disableHooks?: boolean;
  private tempStore: TempStore<D>[];
  private timeStamp: Date | number = new Date();
  constructor(
    getDatabase: () => Promise<DatabaseDrive>,
    onInit?: (database: IDatabase<D>) => Promise<void>,
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
    //   this.tables = databaseTables as TableBuilder<any, D>[];
  }

  addTables(...tables: ITableBuilder<any, D>[]) {
    for (let table of tables) {
      if (!this.tables.find(x => x.tableName == table.tableName)) {
        this.info("adding", table.tableName)
        this.tables.push(table as any)

      }

      let items = Functions.reorderTables(this.tables as any);
      if (items.length == this.tables.length) {
        this.tables = items;
        this.info("Sorting table tree, to ", items.map(x => x.tableName))
      }
    }
  }

  public log(...items: any[]) {
    if (!this.disableLog) console.log(items);
  }

  public error(...items: any[]) {
    console.error("SQLError:", items);
  }

  public info(...items: any[]) {
    if (!this.disableLog) console.info(items);
  }

  //#region Hooks

  public useQuery<T extends IId<D>>(
    tableName: D,
    query:
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
    );
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
    items: IId<D>[],
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
      this.error(e);
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
    T extends IId<D>
  >(
    items: T | T[],
    operation: SOperation,
    subOperation?: Operation,
    tableName?: D,
    identifier?: WatchIdentifier
  ) {
    try {

      const tItems = Functions.toArray<T>(items)
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

      if (w.length > 0)
        this.log("watcher for " + tableName);
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
            await watcher.onSave(tItems, subOperation ?? "INSERT");
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
          this.error(
            "Watchers.Error:",
            operation,
            subOperation,
            tableName,
            e
          );
        }
      }
    } catch (e) {
      this.error("Watchers.Error:", e);
    }
  }

  private async localSave<T extends IId<D>>(
    item?: T,
    insertOnly?: Boolean,
    tableName?: D,
    saveAndForget?: boolean
  ) {
    if (!item) {
      return undefined;
    }
    Functions.validateTableName(item as any, tableName);
    try {

      this.log("Executing Save...");
      const uiqueItem = await this.getUique(item);
      let table = this.tables.find(x => x.tableName == item.tableName);
      const keys = Functions.getAvailableKeys(await this.allowedKeys(item.tableName, true), item);
      const sOperations = uiqueItem ? "UPDATE" : "INSERT";
      let query = "";
      let args = [] as any[];
      if (uiqueItem) {
        if (insertOnly) {
          return item;
        }
        query = `UPDATE ${item.tableName} SET `;
        keys.forEach((k, i) => {
          query += ` ${k}=? ` + (i < keys.length - 1 ? "," : "");
        });
        query += " WHERE id=?";
      } else {
        query = `INSERT INTO ${item.tableName} (`;
        keys.forEach((k, i) => {
          query += k + (i < keys.length - 1 ? "," : "");
        });
        query += ") values(";
        keys.forEach((k, i) => {
          query += "?" + (i < keys.length - 1 ? "," : "");
        });
        query += ")";
      }

      keys.forEach((k: string, i) => {
        let value = (item as any)[k];
        let column = table?.props.find(x => x.columnName.toString() === k);

        if (column?.columnType === "JSON")
          value = JSON.stringify(value);
        let v = value ?? null;
        v = Functions.translateAndEncrypt(v, this as any, item.tableName, k);
        args.push(v);
      });

      if (uiqueItem) item.id = uiqueItem.id;
      if (uiqueItem != undefined)
        args.push(uiqueItem.id);

      let result = await this.execute(query, args);
      if (saveAndForget !== true || item.id === 0 || item.id === undefined) {
        if (result == undefined || typeof result != "number" || result <= 0) {
          const lastItem = (await this.selectLastRecord<IId<D>>(item)) ?? item;
          item.id = lastItem.id;
        } else item.id = result;

      }
      await this.triggerWatch([item], "onSave", sOperations, item.tableName || tableName);
      return item as T;
    } catch (error) {
      this.error(error, item);
      throw error;
    }
  }

  private async localDelete(items: IId<D>[], tableName: string) {
    await Functions.executeContraineDelete(tableName, this as any, `WHERE id IN (${items.map(x => x.id).join(",")})`, [])
    var q = `DELETE FROM ${tableName} WHERE id IN (${items.map(x => "?").join(",")})`;
    await this.execute(q, items.map(x => x.id));
  }

  private async getUique(item: IId<D>) {
    if (item.id != undefined && item.id > 0)
      return Functions.single(
        await this.where<IId<D>>(
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
      await this.where<IId<D>>(
        item.tableName,
        filter
      )
    );
  }

  private async selectLastRecord<T>(item: IId<D>) {
    this.info("Executing SelectLastRecord... ");
    if (!item.tableName) {
      this.error("TableName cannot be empty for:", item);
      throw "TableName cannot be empty";
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
      let h = Math.abs((this.timeStamp as any) - (new Date() as any)) / 36e5;
      if (h < 2 || this.isClosing || this.isClosed)
        return;
      this.info("db refresh:", await this.tryToClose());
    }, ms);
  }

  public async close() {
    const db = this.db;
    if (db) {
      await db.close();
      this.isOpen = false;
      this.isClosed = true;
      this.db = undefined;
      this.isClosing = false;
    }

  }

  public async tryToClose() {
    let r = false;
    try {
      if (!this.db || !this.isOpen) return false;
      if (this.db === undefined)
        throw "Cant close the database, name cant be undefined";

      if (this.isLocked()) return false;

      this.isClosing = true;
      await this.db.close();
      r = true;
      return true;
    } catch (e) {
      this.error(e);
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

  private async getAllAsync(q: string, ...args: any[]) {
    let db = await this.dataBase();
    let result = (await db.executeSql(q, args, "READ")) as any[];
    return (result ?? []).map(x => x);
  }

  public async allowedKeys(tableName: D, fromCachedKyes?: boolean, allKeys?: boolean) {
    if (fromCachedKyes === true && !allKeys && this.mappedKeys.has(tableName))
      return this.mappedKeys.get(tableName) as string[];

    try {
      let result = await this.getAllAsync(`PRAGMA table_info(${tableName})`);
      const table = this.tables.find(
        x => x.tableName === tableName
      );
      var keys = [] as string[];

      for (let row of result) {
        if ((table === undefined && row.name != "id") || (table && (table.props.find(x => x.columnName == row.name && !x.isAutoIncrement) || allKeys)))
          keys.push(row.name);
      }

      if (!allKeys)
        this.mappedKeys.set(tableName, keys);
      return keys;
    } catch (e) {
      this.error(e);
      throw e;
    }
  };

  public watch<T extends IId<D>>(tableName: D) {
    var watcher = new Watcher<T, D>(tableName) as IWatcher<T, D>;
    watchers.push(watcher);
    return watcher;
  }

  public async asQueryable<T extends IId<D>>(item: IId<D>, tableName?: D) {
    Functions.validateTableName(item, tableName);
    var db = this as IDatabase<D>;
    return await createQueryResultType<T, D>(item as any, db as IDataBaseExtender<D>);
  }

  public querySelector<T extends IId<D>>(tableName: D) {
    return new QuerySelector<T, D>(tableName, this) as IQuerySelector<T, D>;
  }

  public async save<T extends IId<D>>(
    items: (T & T) | (T & T)[],
    insertOnly?: Boolean,
    tableName?: D,
    saveAndForget?: boolean
  ) {
    try {
      var returnItem: T[] = [];
      for (var item of Functions.toArray<IId<D>>(items)) {
        returnItem.push((await this.localSave(
          item,
          insertOnly,
          tableName,
          saveAndForget
        )) ?? (item as any)
        );
      }
      return returnItem;
    } catch (e) {
      this.error(e);
      throw e;
    }
  }

  async delete(
    items: IId<D> | IId<D>[],
    tableName?: D
  ) {
    try {
      var tItems = Functions.toArray<IId<D>>(items).reduce((v, c) => {
        const x = Functions.validateTableName(c, tableName);
        if (v[x.tableName])
          v[x.tableName].push(c);
        else v[x.tableName] = [c];
        return v;
      }, {} as any);

      for (let key of Object.keys(tItems)) {
        await this.localDelete(tItems[key], key);
        await this.triggerWatch(tItems[key], "onDelete", undefined, tableName);
      }
    } catch (e) {
      this.error(e);
      throw e;
    }
  }

  async where<T extends IId<D>>(tableName: D, query?: any | T) {
    const q = Functions.translateSimpleSql(this as any as IDataBaseExtender<string>, tableName, query);
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
      this.info("executing find:", query);
      let result = await this.getAllAsync(query, ...(args ?? []));

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
          var columnName = column.columnName as string;
          if (item[columnName] != undefined && item[columnName] != null) {
            if (item[columnName] === 0 || item[columnName] === "0" || item[columnName] === false)
              item[columnName] = false;
            else item[columnName] = true;
          }
        });

        dateColumns?.forEach(column => {
          var columnName = column.columnName as string;
          if (
            item[columnName] != undefined &&
            item[columnName] != null &&
            item[columnName].length > 0
          ) {
            try {
              item[columnName] = new Date(item[columnName]);
            } catch {
              /// ignore
            }
          }
        });
        return item;
      };
      var items = [] as IId<D>[];

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
      this.error(e);
      throw e;
    }
  }

  async executeRawSql(queries: Query[]) {
    let result: any = undefined;
    try {
      this.timeStamp = new Date();
      let db = await this.dataBase();
      for (let sql of queries) {
        let operation: Operations = (sql.args ?? []).length <= 0 ? "Bulk" : "WRITE";
        sql.sql = (sql.sql.indexOf("\n") != -1 ? "PRAGMA journal_mode = WAL;\n" : "") + sql.sql;
        result = await db.executeSql(sql.sql, sql.args ?? [], operation);
      }
    } catch (e) {
      this.error(e);
      throw e;
    }
    return result;
  };

  async execute(query: string, args?: any[]) {
    try {
      this.info("Executing Query:\n" + query);
      let result = await this.executeRawSql([{ sql: query, args: args }]);
      this.info("Quary executed");
      return result;
    } catch (e) {
      this.error("Could not execute query:", query, args, e);
      throw e;
    }
  }


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
      await this.execute([...this.tables].reverse().map(x => `DROP TABLE if exists ${x.tableName};`).join("\n"));
      await this.setUpDataBase(true);
    } catch (e) {
      this.error(e);
    }
  };

  public async migrateNewChanges(): Promise<void> {
    let sqls: string[] = [];
    try {
      for (const table of this.tables) {
        this.info(`Checking migration for table: ${table.tableName}`);

        const existingColumns: string[] = await this.allowedKeys(table.tableName, false, true);

        const columnsToRemove = existingColumns.filter(col =>
          !table.props.some(prop => prop.columnName.toString() === col)
        );

        const columnsToAdd = table.props.filter(prop =>
          !existingColumns.includes(prop.columnName.toString())
        );

        if (columnsToRemove.length > 0) {
          sqls.push(...columnsToRemove.map(col => `ALTER TABLE ${table.tableName} DROP COLUMN ${col};`));
        }

        if (columnsToAdd.length > 0) {
          sqls.push(...columnsToAdd.map(col =>
            `ALTER TABLE ${table.tableName} ADD COLUMN ${col.columnName.toString()} ` +
            `${Functions.dbType(col.columnType)}${Functions.dbDefaultValue(col.columnType, col.defaultValue)};`
          ));
        }
      }

      if (sqls.length === 0) {
        this.log("The database is up to date, no migration needed.");
        return;
      }

      this.info(`Applying ${sqls.length} migration(s)...`);
      await this.runMigrations(sqls);

    } catch (error) {
      this.error("Migration process failed:", error);
      throw error;
    }
  }

  /**
   * Executes all migration queries in a single transaction
   */
  private async runMigrations(queries: string[]): Promise<void> {
    await this.beginTransaction();
    try {
      await this.execute("PRAGMA foreign_keys=OFF");
      await this.execute(queries.join("\n"))
      await this.execute("PRAGMA foreign_keys=ON");
      await this.commitTransaction();
      this.info("Migration completed successfully.");

    } catch (error) {
      await this.execute("PRAGMA foreign_keys=ON");
      await this.rollbackTransaction();
      this.error("Rolling back migration due to error:", error);
      throw error;
    }
  }


  setUpDataBase = async (
    forceCheck?: boolean
  ) => {
    try {
      if (!Database.dbIni || forceCheck) {
        await this.beginTransaction();
        this.log(`dbIni= ${Database.dbIni}`);
        this.log(`forceCheck= ${forceCheck}`);
        this.log("initilize database table setup");
        const quries: string[] = [];
        for (var table of this.tables) {
          var query = `CREATE TABLE if not exists ${table.tableName} (\n`;
          table.props.forEach((col, index) => {
            query += `${col.columnName.toString()} ${Functions.dbType(col.columnType)}${!col.isNullable ? " NOT NULL" : ""}${col.isPrimary ? " UNIQUE" : ""}${Functions.dbDefaultValue(col.columnType, col.defaultValue)},\n`;
          });
          table.props
            .filter(x => x.isPrimary === true)
            .forEach((col, index) => {
              query += `PRIMARY KEY(${col.columnName.toString()} ${col.isAutoIncrement === true
                ? "AUTOINCREMENT"
                : ""
                })` +
                (index < table.props.filter(x => x.isPrimary === true).length - 1
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
                query += `CONSTRAINT "fk_${col.columnName.toString()}" FOREIGN KEY(${col.columnName.toString()}) REFERENCES ${col.contraintTableName}(${col.contraintColumnName})` + (index < (table.constrains?.length ?? 0) - 1
                  ? ",\n"
                  : "\n");
              }
            );
          }
          query += ");";
          quries.push(query);

        }
        await this.execute(quries.join("\n\n"));
        await this.commitTransaction();
        this.mappedKeys.clear();
      }
    } catch (e) {
      this.error(e);
      await this.rollbackTransaction();
      throw e;
    }
  };

  //#endregion TableSetup
}
