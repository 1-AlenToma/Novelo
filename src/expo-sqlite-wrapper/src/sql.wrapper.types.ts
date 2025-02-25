import BulkSave from "./BulkSave";
import {
  IReturnMethods,
  IQuerySelector
} from "./QuerySelector";

export type Query = { sql: string, args: any[] };

export type Operations = "READ" | "WRITE" | "Bulk";

export type DatabaseDrive = {
  /**
   * 
   * @param operation READ FOR READING DATA, WITE FOR INSERTING , UPDATING AND DELETING ETC..
   * @param sql 
   * @param args 
   * @returns 
   */
  executeSql: (sql: string, args: any[], operation: Operations) => Promise<any[] | number | undefined>;
  close(): Promise<void>;
}

export type IWhereProp<D extends string> = {
  tableName: D;
  alias?: string;
  Queries: any[];
  assignChildrenType?: "List" | "Item";
}

export type GlobalIQuerySelector<T, D extends string> = {
  /**
   * get the translated sql
   */
  getSql: (sqlType: "DELETE" | "SELECT") => Query;

  getInnerSelectSql: () => string;
};

export type IChildrenLoader = {
  query: Query;
  assignedTo: string;
}

export type IQuerySelectorProps<D extends string> = {
  _where?: IWhereProp<D>;
  having?: IWhereProp<D>;
  joins: IWhereProp<D>[];
  others: any[];
  tableName: D;
  alias: string;
  children: IChildLoader<D>[];
  converter?: (x: any) => any;
  database: IDataBaseExtender<D>;
  jsonExpression: any;
  queryColumnSelector?: any;
  unions: any[];
}

export type ColumnType =
  | "Number"
  | "String"
  | "Decimal"
  | "Boolean"
  | "DateTime"
  | "JSON"
  | "BLOB";

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function
  ? never
  : T[K] extends object ? never : K
}[keyof T];

export type ObjectPropertyNamesNames<T> = {
  [K in keyof T]: T[K] extends (object)
  ? T[K] extends Function ? never : K
  : never;
}[keyof T];

export interface ColumnProps<T, D extends string> {
  columnType: ColumnType;
  isNullable?: boolean;
  columnName: keyof T;
  isPrimary?: boolean;
  isAutoIncrement?: boolean;
  isUnique?: boolean;
  encryptionKey?: string;
  defaultValue?: string | boolean | number;
}

export type ITableBuilder<T, D extends string> = {
  readonly props: ReadonlyArray<ColumnProps<T, D>>;
  readonly tableName: D;
  readonly children: ReadonlyArray<IChildLoader<D>>;
  readonly constrains: ReadonlyArray<{
    columnName: keyof T;
    contraintTableName: D;
    contraintColumnName: any;
  }>;

  /**
   * add the prop so you could load it in querySelector or item load method
   * @param prop 
   * @param tableName 
   * @param foreignkey 
   * @param parentIdKey 
   */
  hasMany<C extends IId<D>>(prop: ObjectPropertyNamesNames<T>, tableName: D, foreignkey: NonFunctionPropertyNames<C>, idProp?: NonFunctionPropertyNames<T>): ITableBuilder<T, D>;


  /**
   * add the prop so you could load it in querySelector or item load method
   * @param prop 
   * @param tableName 
   * @param foreignkey 
   * @param parentIdKey 
   */
  hasOne<C extends IId<D>>(prop: ObjectPropertyNamesNames<T>, tableName: D, foreignkey: NonFunctionPropertyNames<C>, idProp?: NonFunctionPropertyNames<T>): ITableBuilder<T, D>;



  /**
   * add the prop so you could load it in querySelector or item load method
   * @param prop 
   * @param tableName 
   * @param foreignkey 
   * @param parentIdKey 
   */
  hasParent<P extends IId<D>>(prop: ObjectPropertyNamesNames<T>, tableName: D, foreignkey: NonFunctionPropertyNames<T>, parentIdKey?: NonFunctionPropertyNames<P>): ITableBuilder<T, D>;

  /**
   * column can contain nullable value
   */
  nullable: ITableBuilder<T, D>;

  /**
   * column of type blob
   */
  blob: ITableBuilder<T, D>;

  /**Save the object as json in th db, when read it will be converted to object */
  json: ITableBuilder<T, D>;
  /**
   * isPrimary key
   */
  primary: ITableBuilder<T, D>;
  /**
   * work togather with isPrimary, autoIncrement value on insert
   */
  autoIncrement: ITableBuilder<T, D>;
  /**
   * save method will check if this column value exist in the table, if it dose then it will update insted.
   * this will only be check if id is not set
   */
  unique: ITableBuilder<T, D>;
  /**
   * column of type boolean
   */
  boolean: ITableBuilder<T, D>;
  /**
   * column of type integer
   */
  number: ITableBuilder<T, D>;
  /**
   * column of type decimal
   */
  decimal: ITableBuilder<T, D>;
  /**
   * column of type string
   */
  string: ITableBuilder<T, D>;
  /**
   * column of type datetime
   */
  dateTime: ITableBuilder<T, D>;
  /**
   * encrypt the column
   */
  encrypt: (encryptionKey: string) => ITableBuilder<T, D>;
  /**
   * add column to table and specify its props there after, eg boolean, number etc
   */
  column: (colName: NonFunctionPropertyNames<T> | ObjectPropertyNamesNames<T>) => ITableBuilder<T, D>;
  /**
   * add a foreign key to the table
   */
  constrain: <E extends object>(
    columnName: NonFunctionPropertyNames<T>,
    contraintTableName: D,
    contraintColumnName: NonFunctionPropertyNames<E>
  ) => ITableBuilder<T, D>;
  /**
   * sqlite return json object, with this convert it to class object instead
   */
  onItemCreate: (
    func: (item: T) => T
  ) => ITableBuilder<T, D>;
  /**
     * if not using onItemCreate then use this to convert json item to class 
     * note: this will ignore the constructor
     * example 
class Test {
  name: String;
  passowrd: String;
  constructor(name: string, passowrd: string){
    this.name = name;
    this.passowrd = passowrd;
  }

  get getName(){
    return this.name;
  }
}
    .objectPrototype(Test.prototype)
     */
  objectPrototype: (
    objectProptoType: any
  ) => ITableBuilder<T, D>;
};

export abstract class IId<D extends string> {
  public id: number;
  public tableName: D;
  constructor(tableName: D, id?: number) {
    this.id = id ?? 0;
    this.tableName = tableName;
  }
}


export type Operation = "UPDATE" | "INSERT";
export type SOperation =
  | "onSave"
  | "onDelete"
  | "onBulkSave";
export declare type SingleValue =
  | string
  | number
  | boolean
  | Date
  | undefined
  | null;
export declare type ArrayValue =
  | any[]
  | undefined;
export declare type NumberValue =
  | number
  | undefined;
export declare type StringValue =
  | string
  | undefined;

export type IDataBaseExtender<D extends string> =
  {
    tables: ITableBuilder<any, D>[];
    dbTable: ITableBuilder<any, D>[];
    triggerWatch: <T extends IId<D>>(
      items: T | T[],
      operation: SOperation,
      subOperation?: Operation,
      tableName?: D
    ) => Promise<void>;
    log: (...items: any[]) => void;
    info: (...items: any[]) => void;
    error: (...items: any[]) => void;
  } & IDatabase<D>;


export type WatchIdentifier = "Hook" | "Other";

export type TempStore<D extends string> = {
  operation: SOperation;
  subOperation?: Operation;
  tableName: D;
  items: IId<D>[];
  identifier?: WatchIdentifier;
};

export interface IWatcher<T, D extends string> {
  onSave?: (
    item: T[],
    operation: Operation
  ) => Promise<void>;
  onDelete?: (item: T[]) => Promise<void>;
  onBulkSave?: () => Promise<void>;
  readonly removeWatch: () => void;
  identifier: WatchIdentifier;
}

export interface IChildLoader<D extends string> {
  parentProperty: string;
  parentTable: D;
  childProperty: string;
  childTableName: D;
  assignTo: string;
  isArray: boolean;
}

export enum Param {
  StartParameter = "#(",
  EqualTo = "#=",
  EndParameter = "#)",
  OR = "#OR",
  AND = "#AND",
  LessThan = "#<",
  GreaterThan = "#>",
  IN = "#IN",
  NotIn = "#NOT IN",
  NULL = "#IS NULL",
  NotNULL = "#IS NOT NULL",
  NotEqualTo = "#!=",
  Contains = "#like",
  StartWith = "S#like",
  EndWith = "E#like",
  EqualAndGreaterThen = "#>=",
  EqualAndLessThen = "#<=",
  OrderByDesc = "#Order By #C DESC",
  OrderByAsc = "#Order By #C ASC",
  Limit = "#Limit #Counter"
}

export interface IQuaryResult<D extends string> {
  sql: string;
  values: any[];
  children: IChildLoader<D>[];
}

export type IQueryResultItem<T, D extends string> = T & {
  readonly tableName: D;
  id: number;
  saveChanges: () => Promise<IQueryResultItem<T, D>>;
  delete: () => Promise<void>;
  update: (...keys: NonFunctionPropertyNames<T>[]) => Promise<void>;
  load: (prop: ObjectPropertyNamesNames<T>) => Promise<void>;
};

export interface IDbSet<T extends IId<D>, D extends string> {
  save: (...items: T[]) => Promise<void>;
  delete: (...items: T[]) => Promise<void>;
  query: IQuerySelector<T, D>;
  byId: (id: number) => Promise<IQueryResultItem<T, D> | undefined>;
  getAll: () => Promise<IQueryResultItem<T, D>[]>;
  bulkSave: () => Promise<BulkSave<T, D>>;
  watch: () => IWatcher<T, D>;
  useQuery: (query: | Query | IReturnMethods<T, D> | (() => Promise<T[]>), updateIf?: (items: T[], operation: string) => boolean) =>
    readonly [IQueryResultItem<T, D>[], boolean, () => Promise<void>, IDatabase<D>]
}


export interface IDatabase<D extends string> {

  /**
   * This is a hook you could use in a component
   */
  useQuery: <T extends IId<D>>(tableName: D, query: | Query | IReturnMethods<T, D> | (() => Promise<T[]>), onDbItemsChanged?: (items: T[]) => T[], updateIf?: (items: T[], operation: string) => boolean) => readonly [IQueryResultItem<T, D>[], boolean, () => Promise<void>, IDatabase<D>];

  /**
   * Freeze all watchers, this is usefull when for example doing many changes to the db
   * and you dont want the watchers to be triggerd many times
   */
  disableWatchers: () => IDatabase<D>;
  /**
   * enabling Watchers will call all the frozen watchers that has not been called when it was frozen
   */
  enableWatchers: () => Promise<void>;

  /**
   * Freeze all hooks, this is usefull when for example doing many changes to the db
   * and you dont want the hooks to be triggerd(rerender components) many times
   */
  disableHooks: () => IDatabase<D>;

  /**
   * enabling Hooks will call all the frozen hooks that has not been called when it was frozen
   */
  enableHooks: () => Promise<void>;

  /**
   * BulkSave object
   * This will only watchers.onBulkSave
   */
  bulkSave: <T extends IId<D>>(
    tabelName: D
  ) => Promise<BulkSave<T, D>>;

  isClosed?: boolean;
  /**
   * Its importend that,createDbContext return new database after this is triggered
   */
  tryToClose: () => Promise<boolean>;
  /**
   * Its importend that,createDbContext return new database after this is triggered
   */
  close: () => Promise<void>;
  /**
   * begin transaction
   */
  beginTransaction: () => Promise<void>;
  /**
   * comit the transaction
   */
  commitTransaction: () => Promise<void>;
  /**
   * rollback the transaction
   */
  rollbackTransaction: () => Promise<void>;
  /**
    Auto close the db after every ms.
    The db will be able to refresh only if there is no db operation is ongoing.
    This is useful, so that it will use less memory as SQlite tends to store transaction in memories which causes the increase in memory over time.
    its best to use ms:3600000
    the db has to be ideal for ms to be able to close it.
    */
  startRefresher: (ms: number) => void;
  /**
   * return column name for the specific table
   */
  allowedKeys: (
    tableName: D
  ) => Promise<string[]>;
  /**
   * convert json to IQueryResultItem object, this will add method as saveChanges, update and delete methods to an object
   */
  asQueryable: <T extends IId<D>>(
    item: IId<D>,
    tableName?: D
  ) => Promise<IQueryResultItem<T, D>>;
  watch: <T extends IId<D>>(
    tableName: D
  ) => IWatcher<T, D>;

  /**
   * More advanced queryBuilder
   * It include join and aggregators and better validations
   */
  querySelector: <T extends IId<D>>(
    tabelName: D
  ) => IQuerySelector<T, D>;
  /**
   * execute sql eg
   * query: select * from users where name = ?
   * args: ["test"]
   */
  find: (
    query: string,
    args?: any[],
    tableName?: D
  ) => Promise<IId<D>[]>;
  /**
   * trigger save, update will depend on id and unique columns
   */
  save: <T extends IId<D>>(
    item: T | T[],
    insertOnly?: Boolean,
    tableName?: D,
    saveAndForget?: boolean
  ) => Promise<T[]>;
  where: <T extends IId<D>>(
    tableName: D,
    query?: any | T
  ) => Promise<T[]>;
  /**
   * delete object based on Id
   */
  delete: (
    item: IId<D> | IId<D>[],
    tableName?: D
  ) => Promise<void>;
  /**
   * execute sql without returning anyting
   */
  execute: (query: string, args?: any[]) => Promise<any>;
  /**
   * Drop all tables
   */
  dropTables: () => Promise<void>;
  /**
   * Setup your table, this will only create a table if it dose not exist
   */
  setUpDataBase: (
    forceCheck?: boolean
  ) => Promise<void>;
  /**
   * find out if there some changes between object and db table
   */
  tableHasChanges: <T extends IId<D>>(item: ITableBuilder<T, D>) => Promise<boolean>;
  /**
   * execute an array of sql
   */
  executeRawSql: (queries: Query[]) => Promise<any>;

  /**
   * migrate new added or removed columns
   *  constrains is not supported to add
   */
  migrateNewChanges: () => Promise<void>;
}
