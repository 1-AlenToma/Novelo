import {
  IDatabase,
  IDataBaseExtender,
  IQueryResultItem,
  IId,
  GlobalIQuerySelector,
  IChildLoader,
  NonFunctionPropertyNames,
  ObjectPropertyNamesNames
} from "./sql.wrapper.types";
import QuerySelectorTranslator from "./QuerySelectorTranslator";
import {
  createQueryResultType,
  Functions,
  QValue
} from "./UsefullMethods";
import { Param } from "./QuerySelectorProps"

export type IColumnSelector<T> = (x: T) => any;
export type ArrayIColumnSelector<T> = (
  x: T
) => any[];
export type ArrayAndAliasIColumnSelector<T> = (
  x: T,
  as: <B>(column: B, alias: string) => B
) => any[];
export type InnerSelect = {
  getInnerSelectSql: () => string;
};
export type IUnionSelectorParameter<
  T extends IId<D>,
  D extends string
> = {
  querySelector: <T extends IId<D>>(
    tabelName: D
  ) => IQuerySelector<T, D>;
};
export type IUnionSelector<
  T extends IId<D>,
  D extends string
> = (
  x: IUnionSelectorParameter<T, D>
) => GlobalIQuerySelector<T, D>;

export type R<T, S extends string> = Record<S, T>;

export type ConcatSeperatorChar =
  | "||"
  | "+"
  | "-";

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

export type IInclude<T, B, D extends string> = {
  /**
   * columns to join
   * @param ca Parent Column
   * @param cb ChildColumn
   * @returns 
   */
  column: (ca: NonFunctionPropertyNames<T>, cb: NonFunctionPropertyNames<B>) => IInclude<T, B, D>;
  /**
   * load the items as a list
   * @param assignTo Parent prob that the result will be assigned to 
   * @returns 
   */
  toList: (assignTo: ObjectPropertyNamesNames<T>) => IQuerySelector<T, D>;
  /**
 * load the items as a single item
 * @param assignTo Parent prob that the result will be assigned to 
 * @returns 
 */
  firstOrDefault: (assignTo: ObjectPropertyNamesNames<T>) => IQuerySelector<T, D>;
}


export interface IReturnMethods<T, D extends string> extends GlobalIQuerySelector<T, D> {
  firstOrDefault: () => Promise<IQueryResultItem<T, D> | undefined>;
  toList: () => Promise<IQueryResultItem<T, D>[]>;
  findOrSave: (item: T & IId<D>) => Promise<IQueryResultItem<T, D>>;
  /**
  * delete based on Query above.
  */
  delete: () => Promise<void>;
}

export interface IOrderBy<T, ReturnType> {
  /**
   * OrderByDesc COLUMN OR COLUMNS
   */
  orderByDesc: (
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) => ReturnType;
  /**
   * OrderByAsc COLUMN OR COLUMNS
   */
  orderByAsc: (
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) => ReturnType;
  /**
   * Limit the rows
   */
  limit: (value: number) => ReturnType;
  /**
   * GroupBy column or columns
   */
  groupBy: (
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) => ReturnType;
}

export interface GenericQuery<
  T,
  ParentType,
  D extends string,
  ReturnType
> extends IReturnMethods<ParentType, D>,
  IOrderBy<T, ReturnType> {
  /**
   * Select based on Column
   */
  column: (
    column: IColumnSelector<T>
  ) => ReturnType;
  /**
   * Bring togather columns and values, seperated by ConcatSeperatorChar
   */
  concat: (
    collectCharacters_type: ConcatSeperatorChar,
    ...columnOrValues: (
      | IColumnSelector<T>
      | string
    )[]
  ) => ReturnType;
  /**
   * Add BETWEEN
   */
  between(
    value1: SingleValue | IColumnSelector<T>,
    value2: SingleValue | IColumnSelector<T>
  ): ReturnType;
  /**
   * EqualTo based on value or column from a table
   */
  equalTo: (
    value:
      | SingleValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * Contains based on value or column from a table
   */
  contains: (
    value: StringValue | IColumnSelector<T>
  ) => ReturnType;
  /**
   * StartsWith based on value or column from a table
   */
  startsWith: (
    value: StringValue | IColumnSelector<T>
  ) => ReturnType;
  /**
   * EndsWith based on value or column from a table
   */
  endsWith: (
    value: StringValue | IColumnSelector<T>
  ) => ReturnType;
  /**
   * NotEqualTo based on value or column from a table
   */
  notEqualTo: (
    value:
      | SingleValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * EqualAndGreaterThen based on value or column from a table
   */
  equalAndGreaterThen: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * EqualAndLessThen based on value or column from a table
   */
  equalAndLessThen: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * Add (
   */
  start: ReturnType;
  /**
   * Add )
   */
  end: ReturnType;
  /**
   * Add OR
   */
  or: ReturnType;
  /**
   * Add AND
   */
  and: ReturnType;
  /**
   * GreaterThan based on value or column from a table
   */
  greaterThan: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * LessThan based on value or column from a table
   */
  lessThan: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * IN based on array Value or column from a table
   */
  in: (
    value:
      | ArrayValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * Add NOT
   */
  not: ReturnType;
  /**
   * Add IS NULL
   */
  null: ReturnType;
  /**
   * Add IS NOT NULL
   */
  notNull: ReturnType;
  /**
   * select columns and aggregators
   */
  select: IQueryColumnSelector<T, ParentType, D>;
  /**
   * Add Union Select
   */
  union: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => ReturnType;
  /**
   * Add UnionAll Select
   */
  unionAll: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => ReturnType;
  /**
   * start case
   */
  case: GenericQueryWithValue<ReturnType> &
  ReturnType;
  /**
   * add When, work with case
   */
  when: GenericQueryWithValue<ReturnType> &
  ReturnType;
  /**
   * add Then, work with case
   */
  then: GenericQueryWithValue<ReturnType> & ReturnType;
  /**
   * add Else, work with case
   */
  else: GenericQueryWithValue<ReturnType> &
  ReturnType;
  /**
   * end case, work with case
   */
  endCase: GenericQueryWithValue<ReturnType> &
  ReturnType;
}

export type GenericQueryWithValue<ReturnType> = {
  /**
   * Add simple Value, work best with case and else
   */
  value: (value: SingleValue) => ReturnType;
};

export interface ISelectCase<
  T,
  ParentType,
  D extends string
> extends Omit<
  GenericQuery<
    T,
    ParentType,
    D,
    ISelectCase<T, ParentType, D>
  >,
  | "endCase"
  | "getSql"
  | "getInnerSelectSql"
  | "select"
  | "orderByDesc"
  | "orderByAsc"
  | "limit"
  | "union"
  | "unionAll"
  | "groupBy"
  | "toList"
  | "firstOrDefault"
  | "findOrSave"
  | "delete"
> {
  endCase: IQueryColumnSelector<T, ParentType, D>;
}

export interface IJoinOn<
  T,
  ParentType,
  D extends string
> extends Omit<
  GenericQuery<
    T,
    ParentType,
    D,
    IJoinOn<T, ParentType, D>
  >,
  | "groupBy"
  | "select"
  | "toList"
  | "firstOrDefault"
  | "findOrSave"
  | "delete"
> {
  /**
   * Inner join a table
   * eg InnerJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   */
  innerJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * left join a table
   * eg LeftJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   */
  leftJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * join a table
   * eg Join<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by Join method instead
   */
  join: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * CrossJoin a table
   * eg CrossJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by CrossJoin method instead
   */
  crossJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * right join a table
   * eg RightJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * sqlite dose not currently support this
   */
  //RightJoin: <B, S extends string>(tableName: D, alias: S) => JoinOn<T & R<B, S>, ParentType, D>;
  where: IWhere<T, ParentType, D>;
}



export type IWhere<T, ParentType, D extends string> = {
  /**
   * incase you join data, then you will need to cast or convert the result to other type
   */
  cast: <B>(converter?: (x: ParentType | unknown) => B) => IReturnMethods<B, D>;
} & GenericQuery<T, ParentType, D, IWhere<T, ParentType, D>>;


export interface IHaving<T, ParentType, D extends string> extends Omit<GenericQuery<T, ParentType, D, IHaving<T, ParentType, D>>, "select" | "column"> {
  column: (columnOrAlias: IColumnSelector<T> | string) => IHaving<T, ParentType, D>;
  /**
   * incase you join data, then you will need to cast or convert the result to other type
   */
  cast: <B>(converter?: (x: ParentType | unknown) => B) => IReturnMethods<B, D>;
}

export interface IQuerySelector<T, D extends string> extends IReturnMethods<T, D>, Omit<IOrderBy<T, IQuerySelector<T, D>>, "groupBy"> {
  /**
   * Inner join a table
   * eg InnerJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   */
  where: IWhere<T, T, D>;
  /**
   * Inner join a table
   * eg InnerJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by InnerJoin method instead
   */
  innerJoin: <B, S extends string>(tableName: D, alias: S) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * left join a table
   * eg LeftJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by LeftJoin method instead
   */
  leftJoin: <B, S extends string>(tableName: D, alias: S) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * join a table
   * eg Join<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by Join method instead
   */
  join: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * CrossJoin a table
   * eg CrossJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by CrossJoin method instead
   */
  crossJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * Add Union Select
   */
  union: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => IQuerySelector<T, D>;
  /**
   * Add UnionAll Select
   */
  unionAll: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => IQuerySelector<T, D>;
  /**
   * Load Child or children
   */
  include: <B extends IId<D>>(childTable: D) => IInclude<T, B, D>;

  /**
   * load children or parent, see TableBuilder.hasMany and hasParent as the prop must be included there for it to work
   * @param prop 
   * @returns 
   */
  load: (...props: ObjectPropertyNamesNames<T>[]) => IQuerySelector<T, D>;

  select: IQueryColumnSelector<T, T, D>;

}

export interface IQueryColumnSelector<T, ParentType, D extends string> extends IReturnMethods<ParentType, D> {
  /**
   * start a case, and end it with CaseEnd()
   */
  case: (alias: string) => ISelectCase<T, ParentType, D>;
  /**
   * Default is select * from
   * you can specify the columns here
   */
  columns: (columns: ArrayAndAliasIColumnSelector<T>) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Max
   */
  max: (columns: IColumnSelector<T>, alias: string) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Min
   */
  min: (columns: IColumnSelector<T>, alias: string) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Count
   */
  count: (columns: IColumnSelector<T>, alias: string) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Sum
   */
  sum: (columns: IColumnSelector<T>, alias: string) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Total
   */
  total: (columns: IColumnSelector<T>, alias: string) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite concat columns and values eg lastname || ' ' || firstName as FullName;
   */
  concat: (alias: string, collectCharacters_type: ConcatSeperatorChar, ...columnOrValues: (IColumnSelector<T> | string)[]) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from group_concat
   */
  groupConcat: (
    columns: IColumnSelector<T>,
    alias: string,
    seperator?: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Avg
   */
  avg: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;

  /**
   * incase you join data, then you will need to cast or convert the result to other type
   */
  cast: <B>(
    converter?: (x: T | unknown) => B
  ) => IReturnMethods<B, D>;
  /**
   * add having search
   */
  having: IHaving<T, ParentType, D>;
}

class ReturnMethods<T,
  ParentType extends IId<D>,
  D extends string
> {
  parent: QuerySelector<ParentType, D>;
  constructor(parent: QuerySelector<any, D>) {
    this.parent = parent;
  }

  async firstOrDefault() {
    return await this.parent.firstOrDefault();
  }

  async toList() {
    return await this.parent.toList();
  }

  async findOrSave(
    item: ParentType & IId<D>
  ) {
    return await this.parent.findOrSave(item);
  }

  async delete() {
    await this.parent.delete();
  }

  /**
   * get the translated sqlQuery
   */
  getSql(sqlType: "DELETE" | "SELECT") {
    return this.parent.getSql(sqlType);
  }

  /**
   * get a simple sql
   * @returns sql string
   */
  getInnerSelectSql() {
    return this.parent.getInnerSelectSql();
  }
}

class QueryColumnSelector<
  T,
  ParentType extends IId<D>,
  D extends string
> extends ReturnMethods<T, ParentType, D> {
  _columns: QValue[];
  cases: ISelectCase<T, ParentType, D>[];
  constructor(parent: QuerySelector<any, D>) {
    super(parent);
    this._columns = [];
    this.cases = [];
  }

  case(alias: string) {
    const caseItems = new Where<T, ParentType, D>(
      this.parent.tableName,
      this.parent,
      alias,
      Param.Case
    );
    Object.defineProperty(caseItems, "EndCase", {
      get: () => {
        caseItems.Queries.push(
          QValue.Q.Args(Param.EndCase)
        );
        return this;
      }
    });
    this.cases.push(caseItems as any);
    return caseItems as any as ISelectCase<
      T,
      ParentType,
      D
    >;
  }

  cast<B>(
    converter: (x: ParentType | unknown) => B
  ) {
    this.parent.converter = converter;
    return this as IReturnMethods<ParentType, D>;
  }

  columns(
    columns: ArrayAndAliasIColumnSelector<T>
  ) {
    this.parent.clear();
    this._columns.push(QValue.Q.Value(columns));
    return this;
  }

  concat(
    alias: string,
    collectCharacters_type: ConcatSeperatorChar,
    ...columnOrValues: (
      | IColumnSelector<T>
      | string
    )[]
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columnOrValues)
        .Args(Param.Concat)
        .Value2(collectCharacters_type)
        .Alias(alias)
    );
    return this;
  }

  max(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Max)
        .Alias(alias)
    );
    return this;
  }

  min(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Min)
        .Alias(alias)
    );
    return this;
  }

  count(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Count)
        .Alias(alias)
    );
    return this;
  }

  sum(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Sum)
        .Alias(alias)
    );
    return this;
  }

  total(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Total)
        .Alias(alias)
    );
    return this;
  }

  groupConcat(
    columns: IColumnSelector<T>,
    alias: string,
    seperator?: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.GroupConcat)
        .Alias(alias)
        .Value2(seperator)
    );
    return this;
  }

  avg(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this._columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Avg)
        .Alias(alias)
    );
    return this;
  }

  get having() {
    this.parent.clear();
    this.parent.having = new Where<
      T,
      ParentType,
      D
    >(this.parent.tableName, this.parent);
    return this.parent.having as any as IHaving<
      T,
      ParentType,
      D
    >;
  }
}


export class Include<ParentType extends IId<D>, B, D extends string> implements IInclude<ParentType, B, D> {
  private tableName: D;
  private parent: QuerySelector<ParentType, D>;
  private item: IChildLoader<D> = {} as any;
  constructor(tableName: D, parent: QuerySelector<ParentType, D>) {
    this.tableName = tableName;
    this.parent = parent;
  }
  column(ca: NonFunctionPropertyNames<ParentType>, cb: NonFunctionPropertyNames<B>) {
    this.item.parentProperty = ca as string;
    this.item.parentTable = this.parent.tableName;
    this.item.childProperty = cb as string;
    this.item.childTableName = this.tableName;
    return this;
  }
  toList(assignTo: ObjectPropertyNamesNames<ParentType>) {
    if (!this.item.childProperty)
      throw "Please select the columns for Include"
    this.item.assignTo = assignTo as string;
    this.item.isArray = true;
    this.parent.children.push(this.item);
    return this.parent as any as IQuerySelector<ParentType, D>;
  };
  firstOrDefault(assignTo: ObjectPropertyNamesNames<ParentType>) {
    if (!this.item.childProperty)
      throw "Please select the columns for Include"
    this.item.assignTo = assignTo as string;
    this.item.isArray = false;
    this.parent.children.push(this.item);
    return this.parent as any as IQuerySelector<ParentType, D>;
  };

}

export class Where<T, ParentType extends IId<D>, D extends string> extends ReturnMethods<T, ParentType, D> {
  tableName: D;
  alias?: string;
  Queries: QValue[];
  type = "QuerySelector";
  constructor(
    tableName: D,
    parent: QuerySelector<any, D>,
    alias?: string,
    ...queries: (Param | QValue)[]
  ) {
    super(parent);
    this.Queries = queries.map((x: any) =>
      x.type != "QValue" ? QValue.Q.Args(x) : x
    );
    this.tableName = tableName;
    this.alias = alias;
  }

  get case() {
    this.Queries.push(QValue.Q.Args(Param.Case));
    return this;
  }

  get when() {
    this.Queries.push(QValue.Q.Args(Param.When));
    return this;
  }

  get then() {
    this.Queries.push(QValue.Q.Args(Param.Then));
    return this;
  }

  get endCase() {
    this.Queries.push(
      QValue.Q.Args(Param.EndCase)
    );
    return this;
  }

  get else() {
    this.Queries.push(QValue.Q.Args(Param.Else));
    return this;
  }

  value(value: SingleValue) {
    this.Queries.push(
      QValue.Q.Args(Param.Value).Value(value)
    );
    return this;
  }

  between(
    value1: SingleValue | IColumnSelector<T>,
    value2: SingleValue | IColumnSelector<T>
  ) {
    this.parent.clear();
    if (this.Queries.length > 0) {
      this.Queries.push(
        QValue.Q.Args(Param.Between)
      );
      this.Queries.push(
        QValue.Q.Args(Param.Value).Value(value1)
      );
      this.and;
      this.Queries.push(
        QValue.Q.Args(Param.Value).Value(value2)
      );
    }
    return this;
  }

  cast<B>(
    converter: (x: ParentType | unknown) => B
  ) {
    this.parent.converter = converter;
    return this as IReturnMethods<ParentType, D>;
  }

  get select() {
    this.parent.queryColumnSelector =
      new QueryColumnSelector<T, ParentType, D>(
        this.parent
      );
    return this.parent.queryColumnSelector;
  }

  column(column: IColumnSelector<T> | string) {
    this.parent.clear();
    this.Queries.push(
      QValue.Q.Value(column).IsColumn(true)
    );
    return this;
  }

  concat(
    collectCharacters_type: ConcatSeperatorChar,
    ...columnOrValues: (
      | IColumnSelector<T>
      | string
    )[]
  ) {
    this.parent.clear();
    this.Queries.push(
      QValue.Q.Value(columnOrValues)
        .Args(Param.Concat)
        .Value2(collectCharacters_type)
    );
    return this;
  }

  equalTo(
    value:
      | SingleValue
      | IColumnSelector<T>
      | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.EqualTo)
      );
    return this;
  }

  notEqualTo(
    value:
      | SingleValue
      | IColumnSelector<T>
      | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(
          Param.NotEqualTo
        )
      );
    return this;
  }

  equalAndGreaterThen(
    value: NumberValue | StringValue | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(
          Param.EqualAndGreaterThen
        )
      );

    return this;
  }

  equalAndLessThen(
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(
          Param.EqualAndLessThen
        )
      );
    return this;
  }

  get start() {
    this.parent.clear();
    this.Queries.push(
      QValue.Q.Args(Param.StartParameter)
    );
    return this;
  }

  get end() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Args(Param.EndParameter)
      );
    return this;
  }

  get or() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(QValue.Q.Args(Param.OR));
    return this;
  }

  get and() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(QValue.Q.Args(Param.AND));
    return this;
  }

  greaterThan(
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(
          Param.GreaterThan
        )
      );
    return this;
  }

  lessThan(
    value:
      NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.LessThan)
      );
    return this;
  }

  in(value: ArrayValue | IColumnSelector<T> | InnerSelect) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.IN)
      );
    return this;
  }

  get not() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(QValue.Q.Args(Param.Not));
    return this;
  }

  get null() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Args(Param.NULL)
      );
    return this;
  }

  get notNull() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Args(Param.NotNULL)
      );
    return this;
  }

  contains(
    value: StringValue | IColumnSelector<T>
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.Contains)
      );
    return this;
  }

  startsWith(
    value: StringValue | IColumnSelector<T>
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(
          Param.StartWith
        )
      );
    return this;
  }

  endsWith(
    value: StringValue | IColumnSelector<T>
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.EndWith)
      );
    return this;
  }

  orderByAsc(
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) {
    this.parent.clear();
    this.parent.others.push(
      QValue.Q.Value(columnName).Args(
        Param.OrderByAsc
      )
    );
    return this;
  }

  orderByDesc(
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) {
    this.parent.clear();
    this.parent.others.push(
      QValue.Q.Value(columnName).Args(
        Param.OrderByDesc
      )
    );
    return this;
  }

  limit(value: number) {
    this.parent.clear();
    this.parent.others =
      this.parent.others.filter(
        x => x.args !== Param.Limit
      );
    this.parent.others.push(
      QValue.Q.Value(value).Args(Param.Limit)
    );
    return this;
  }

  groupBy(
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) {
    this.parent.clear();
    this.parent.others.push(
      QValue.Q.Value(columnName).Args(
        Param.GroupBy
      )
    );
    return this;
  }

  innerJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    this.parent.clear();
    if (
      this.alias == alias ||
      this.parent.joins.find(
        x => x.alias == alias
      )
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.parent.buildJsonExpression(
      tableName,
      alias
    );
    const join = new Where<T & R<B, S>, ParentType, D>(
      tableName,
      this.parent,
      alias,
      Param.InnerJoin
    ) as any as IJoinOn<T & R<B, S>, T, D>;
    this.parent.joins.push(join as any);
    return join;
  }

  crossJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    this.parent.clear();
    if (
      this.alias == alias ||
      this.parent.joins.find(
        x => x.alias == alias
      )
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.parent.buildJsonExpression(
      tableName,
      alias
    );
    const join = new Where<
      T & R<B, S>,
      ParentType,
      D
    >(
      tableName,
      this.parent,
      alias,
      Param.CrossJoin
    ) as any as IJoinOn<T & R<B, S>, T, D>;
    this.parent.joins.push(join as any);
    return join;
  }

  leftJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    this.parent.clear();
    if (
      this.alias == alias ||
      this.parent.joins.find(
        x => x.alias == alias
      )
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.parent.buildJsonExpression(
      tableName,
      alias
    );
    const join = new Where<
      T & R<B, S>,
      ParentType,
      D
    >(
      tableName,
      this.parent,
      alias,
      Param.LeftJoin
    ) as any as IJoinOn<T & R<B, S>, T, D>;
    this.parent.joins.push(join as any);
    return join;
  }

  join<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    this.parent.clear();
    if (
      this.alias == alias ||
      this.parent.joins.find(
        x => x.alias == alias
      )
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.parent.buildJsonExpression(
      tableName,
      alias
    );
    const join = new Where<
      T & R<B, S>,
      ParentType,
      D
    >(
      tableName,
      this.parent,
      alias,
      Param.Join
    ) as any as IJoinOn<T & R<B, S>, T, D>;
    this.parent.joins.push(join as any);
    return join;
  }

  rightJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    this.parent.clear();
    if (
      this.alias == alias ||
      this.parent.joins.find(
        x => x.alias == alias
      )
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.parent.buildJsonExpression(
      tableName,
      alias
    );
    const join = new Where<
      T & R<B, S>,
      ParentType,
      D
    >(
      tableName,
      this.parent,
      alias,
      Param.RightJoin
    ) as any as IJoinOn<T & R<B, S>, T, D>;
    this.parent.joins.push(join as any);
    return join;
  }

  union<B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) {
    queryselectors.forEach(x =>
      this.parent.unions.push({
        type: Param.Union,
        value: x(this.parent.database)
      })
    );
    return this;
  }

  unionAll<B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) {
    queryselectors.forEach(x =>
      this.parent.unions.push({
        type: Param.UnionAll,
        value: x(this.parent.database)
      })
    );
    return this;
  }

  get where() {
    this.parent.clear();
    this.parent._where = new Where<
      T,
      ParentType,
      D
    >(this.tableName, this.parent, undefined);
    return this.parent.where as any as IWhere<
      T,
      T,
      D
    >;
  }
}

export default class QuerySelector<
  T extends IId<D>,
  D extends string
> {
  _where?: Where<any, any, D>;
  having?: Where<any, any, D>;
  joins: Where<any, any, D>[];
  unions: {
    type: Param.Union | Param.UnionAll;
    value: GlobalIQuerySelector<T, D>;
  }[];
  tableName: D;
  alias: string = "";
  queryColumnSelector?: QueryColumnSelector<any, any, D>;
  database: IDataBaseExtender<D>;
  jsonExpression: any;
  others: QValue[];
  type = "QuerySelector";
  translator?: QuerySelectorTranslator;
  children: IChildLoader<D>[];
  converter?: (x: any) => any;
  constructor(
    tableName: D,
    database: IDatabase<D>
  ) {
    this.tableName = tableName;
    this.joins = [];
    this.database =
      database as IDataBaseExtender<D>;
    this.jsonExpression = {};
    this.buildJsonExpression(
      tableName,
      tableName,
      true
    );
    this.buildJsonExpression(tableName, "a");
    this.others = [];
    this.children = [];
    this.unions = [];
  }

  clear() {
    this.translator = undefined;
  }

  buildJsonExpression(
    tableName: D,
    alias: string,
    isInit?: boolean
  ) {
    this.queryColumnSelector = undefined;
    this.jsonExpression =
      Functions.buildJsonExpression(
        this.jsonExpression,
        this.database as any,
        tableName,
        alias,
        isInit
      );
  }

  get select() {
    this.queryColumnSelector =
      new QueryColumnSelector<T, T, D>(this);
    return this.queryColumnSelector;
  }

  union<B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) {
    queryselectors.forEach(x =>
      this.unions.push({
        type: Param.Union,
        value: x(this.database)
      })
    );
    return this;
  }

  unionAll<B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) {
    queryselectors.forEach(x =>
      this.unions.push({
        type: Param.UnionAll,
        value: x(this.database)
      })
    );
    return this;
  }

  innerJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    if (
      this.alias == alias ||
      this.joins.find(x => x.alias == alias)
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.alias = "a";
    this.buildJsonExpression(tableName, alias);
    this.others = [];
    const join = new Where<T & R<B, S>, T, D>(
      tableName,
      this,
      alias as any,
      Param.InnerJoin
    ) as any as IJoinOn<
      R<T, "a"> & R<B, S>,
      T,
      D
    >;
    this.joins.push(join as any);
    return join;
  }

  crossJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    if (
      this.alias == alias ||
      this.joins.find(x => x.alias == alias)
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.alias = "a";
    this.buildJsonExpression(tableName, alias);
    this.others = [];
    const join = new Where<T & R<B, S>, T, D>(
      tableName,
      this,
      alias as any,
      Param.CrossJoin
    ) as any as IJoinOn<
      R<T, "a"> & R<B, S>,
      T,
      D
    >;
    this.joins.push(join as any);
    return join;
  }

  leftJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    if (
      this.alias == alias ||
      this.joins.find(x => x.alias == alias)
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.alias = "a";
    this.buildJsonExpression(tableName, alias);
    this.others = [];
    const join = new Where<T & R<B, S>, T, D>(
      tableName,
      this,
      alias,
      Param.LeftJoin
    ) as any as IJoinOn<
      R<T, "a"> & R<B, S>,
      T,
      D
    >;
    this.joins.push(join as any);
    return join;
  }

  join<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    if (
      this.alias == alias ||
      this.joins.find(x => x.alias == alias)
    )
      throw `alias can not be ${alias}, it is already in use`;
    this.alias = "a";
    this.buildJsonExpression(tableName, alias);
    this.others = [];
    const join = new Where<T & R<B, S>, T, D>(
      tableName,
      this,
      alias,
      Param.Join
    ) as any as IJoinOn<
      R<T, "a"> & R<B, S>,
      T,
      D
    >;
    this.joins.push(join as any);
    return join;
  }

  rightJoin<B, S extends string>(
    tableName: D,
    alias: S
  ) {
    if (this.alias == alias || this.joins.find(x => x.alias == alias))
      throw `alias can not be ${alias}, it is already in use`;
    this.alias = "a";
    this.buildJsonExpression(tableName, alias);
    this.others = [];
    const join = new Where<T & R<B, S>, T, D>(
      tableName,
      this,
      alias,
      Param.RightJoin
    ) as any as IJoinOn<
      R<T, "a"> & R<B, S>,
      T,
      D
    >;
    this.joins.push(join as any);
    return join;
  }


  include<B extends IId<D>>(childTable: D) {
    return new Include<T, B, D>(childTable, this);
  }

  load(...props: ObjectPropertyNamesNames<T>[]) {
    for (let prop of props) {
      let table = this.database.tables.find(x => x.tableName == this.tableName);
      let child = table?.children.find(x => x.assignTo == prop);
      if (child)
        this.children.push({ ...child });
      else throw `loading ${prop as string} is not possible as it is not included in TableBuilder hasMany or has Parent`;
    }
    return this;
  }

  async delete() {
    var item = this.getSql("DELETE");
    let where = item.sql.replace(/(delete from)(\s)[a-zA-Z]+(\s)/gim, "").trim();
    await Functions.executeContraineDelete(this.tableName, this.database, where, item.args);
    await this.database.execute(item.sql, item.args);
    await (this.database as any).triggerWatch([], "onDelete", undefined, this.tableName);
  }

  async findOrSave(item: T & IId<D>) {
    const sql = this.getSql("SELECT");
    item.tableName = this.tableName;
    var dbItem = Functions.single<IId<D>>(await this.database.find(sql.sql, sql.args, this.tableName));
    
    if (!dbItem) {
      dbItem = Functions.single<any>(await this.database.save<T>(item, false, this.tableName));
    }

    dbItem.tableName = this.tableName;
    if (dbItem && this.converter)
      dbItem = this.converter(dbItem);
    return await createQueryResultType<T, D>(dbItem, this.database, this.children);
  }

  async firstOrDefault() {
    var item = this.getSql("SELECT");
    let tItem = Functions.single<any>(await this.database.find(item.sql, item.args, this.tableName));
    if (tItem && this.converter)
      tItem = this.converter(tItem);
    return tItem ? await createQueryResultType<T, D>(tItem, this.database, this.children) : undefined;
  }

  async toList() {
    const sql = this.getSql("SELECT");
    var result = [] as IQueryResultItem<T, D>[];
    for (var x of await this.database.find(sql.sql, sql.args, this.tableName)) {
      x.tableName = this.tableName;
      if (this.converter) x = this.converter(x);
      result.push(await createQueryResultType<T, D>(x, this.database, this.children));
    }
    return result;
  }

  getSql(sqlType: "SELECT" | "DELETE") {
    return (this.translator = this.translator ? this.translator : new QuerySelectorTranslator(this)).translate(sqlType);
  }

  getInnerSelectSql() {
    return (this.translator = this.translator
      ? this.translator
      : new QuerySelectorTranslator(
        this
      )).translateToInnerSelectSql();
  }

  orderByAsc(
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) {
    this.clear();
    this.others.push(
      QValue.Q.Value(columnName).Args(
        Param.OrderByAsc
      )
    );
    return this;
  }

  orderByDesc(
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) {
    this.clear();
    this.others.push(
      QValue.Q.Value(columnName).Args(
        Param.OrderByDesc
      )
    );
    return this;
  }

  limit(value: number) {
    this.clear();
    this.others = this.others.filter(
      x => x.args !== Param.Limit
    );
    this.others.push(
      QValue.Q.Value(value).Args(Param.Limit)
    );
    return this;
  }

  groupBy(
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) {
    this.clear();
    this.others.push(
      QValue.Q.Value(columnName).Args(
        Param.GroupBy
      )
    );
  }

  get where() {
    this._where = new Where<T, T, D>(
      this.tableName,
      this,
      this.alias
    );
    return this._where;
  }
}
