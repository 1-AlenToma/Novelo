import {
  IDatabase,
  IDataBaseExtender,
  IQueryResultItem,
  IId,
  IBaseModule,
  IChildLoader,
  NonFunctionPropertyNames
} from "./expo.sql.wrapper.types";
import QuerySelectorTranslator from "./QuerySelectorTranslator";
import * as SqlLite from "expo-sqlite";
import {
  Errors,
  createQueryResultType,
  Functions,
  QValue
} from "./UsefullMethods";

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

export enum Param {
  StartParameter = "#(",
  EqualTo = "#=",
  EndParameter = "#)",
  OR = "#OR",
  AND = "#AND",
  LessThan = "#<",
  GreaterThan = "#>",
  IN = "#IN(",
  Not = "#NOT",
  NULL = "#IS NULL",
  NotNULL = "#IS NOT NULL",
  NotEqualTo = "#!=",
  Contains = "C#like",
  StartWith = "S#like",
  EndWith = "E#like",
  EqualAndGreaterThen = "#>=",
  EqualAndLessThen = "#<=",
  OrderByDesc = "#Order By #C DESC",
  OrderByAsc = "#Order By #C ASC",
  Limit = "#Limit #Counter",
  GroupBy = "#GROUP BY",
  InnerJoin = "#INNER JOIN",
  LeftJoin = "#LEFT JOIN",
  RightJoin = "#RIGHT JOIN",
  CrossJoin = "#CROSS JOIN",
  Join = "#JOIN",
  Max = "#MAX",
  Min = "#MIN",
  Count = "#COUNT",
  Sum = "#SUM",
  Total = "#Total",
  GroupConcat = "#GroupConcat",
  Avg = "#AVG",
  Between = "#BETWEEN",
  Value = "#Value",
  Concat = "#Concat",
  Union = "#UNION",
  UnionAll = "#UNION ALL",
  Case = "#CASE",
  When = "#WHEN",
  Then = "#THEN",
  Else = "#ELSE",
  EndCase = "#END"
}

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

export type GlobalIQuerySelector<
  T,
  D extends string
> = {
  /**
   * get the translated sql
   */
  getSql: (
    sqlType: "DELETE" | "SELECT"
  ) => SqlLite.Query;

  getInnerSelectSql: () => string;
};

export interface IReturnMethods<
  T,
  D extends string
> extends GlobalIQuerySelector<T, D> {
  firstOrDefault: () => Promise<
    IQueryResultItem<T, D> | undefined
  >;
  toList: () => Promise<IQueryResultItem<T, D>[]>;
  findOrSave: (
    item: T & IBaseModule<D>
  ) => Promise<IQueryResultItem<T, D>>;
  /**
   * delete based on Query above.
   */
  delete: () => Promise<void>;
}

export interface IOrderBy<T, ReturnType> {
  /**
   * OrderByDesc COLUMN OR COLUMNS
   */
  OrderByDesc: (
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) => ReturnType;
  /**
   * OrderByAsc COLUMN OR COLUMNS
   */
  OrderByAsc: (
    columnName:
      | IColumnSelector<T>
      | ArrayIColumnSelector<T>
  ) => ReturnType;
  /**
   * Limit the rows
   */
  Limit: (value: number) => ReturnType;
  /**
   * GroupBy column or columns
   */
  GroupBy: (
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
  Column: (
    column: IColumnSelector<T>
  ) => ReturnType;
  /**
   * Bring togather columns and values, seperated by ConcatSeperatorChar
   */
  Concat: (
    collectCharacters_type: ConcatSeperatorChar,
    ...columnOrValues: (
      | IColumnSelector<T>
      | string
    )[]
  ) => ReturnType;
  /**
   * Add BETWEEN
   */
  Between(
    value1: SingleValue | IColumnSelector<T>,
    value2: SingleValue | IColumnSelector<T>
  ): ReturnType;
  /**
   * EqualTo based on value or column from a table
   */
  EqualTo: (
    value:
      | SingleValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * Contains based on value or column from a table
   */
  Contains: (
    value: StringValue | IColumnSelector<T>
  ) => ReturnType;
  /**
   * StartsWith based on value or column from a table
   */
  StartsWith: (
    value: StringValue | IColumnSelector<T>
  ) => ReturnType;
  /**
   * EndsWith based on value or column from a table
   */
  EndsWith: (
    value: StringValue | IColumnSelector<T>
  ) => ReturnType;
  /**
   * NotEqualTo based on value or column from a table
   */
  NotEqualTo: (
    value:
      | SingleValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * EqualAndGreaterThen based on value or column from a table
   */
  EqualAndGreaterThen: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * EqualAndLessThen based on value or column from a table
   */
  EqualAndLessThen: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * Add (
   */
  Start: ReturnType;
  /**
   * Add )
   */
  End: ReturnType;
  /**
   * Add OR
   */
  OR: ReturnType;
  /**
   * Add AND
   */
  AND: ReturnType;
  /**
   * GreaterThan based on value or column from a table
   */
  GreaterThan: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * LessThan based on value or column from a table
   */
  LessThan: (
    value:
      | NumberValue
      | StringValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * IN based on array Value or column from a table
   */
  IN: (
    value:
      | ArrayValue
      | IColumnSelector<T>
      | InnerSelect
  ) => ReturnType;
  /**
   * Add NOT
   */
  Not: ReturnType;
  /**
   * Add IS NULL
   */
  Null: ReturnType;
  /**
   * Add IS NOT NULL
   */
  NotNull: ReturnType;
  /**
   * select columns and aggregators
   */
  Select: IQueryColumnSelector<T, ParentType, D>;
  /**
   * Add Union Select
   */
  Union: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => ReturnType;
  /**
   * Add UnionAll Select
   */
  UnionAll: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => ReturnType;
  /**
   * start case
   */
  Case: GenericQueryWithValue<ReturnType> &
    ReturnType;
  /**
   * add When, work with case
   */
  When: GenericQueryWithValue<ReturnType> &
    ReturnType;
  /**
   * add Then, work with case
   */
  Then: GenericQueryWithValue<ReturnType> &
    ReturnType;
  /**
   * add Else, work with case
   */
  Else: GenericQueryWithValue<ReturnType> &
    ReturnType;
  /**
   * end case, work with case
   */
  EndCase: GenericQueryWithValue<ReturnType> &
    ReturnType;
  /**
   * Load Child or children
   */
  LoadChildren: <B extends IId<D>>(
    child: D,
    childColumn: NonFunctionPropertyNames<B>,
    parentColumn: NonFunctionPropertyNames<ParentType>,
    assignTo: NonFunctionPropertyNames<ParentType>,
    isArray?: boolean
  ) => ReturnType;
}

export type GenericQueryWithValue<ReturnType> = {
  /**
   * Add simple Value, work best with case and else
   */
  Value: (value: SingleValue) => ReturnType;
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
    | "EndCase"
    | "getSql"
    | "getInnerSelectSql"
    | "Select"
    | "OrderByDesc"
    | "OrderByAsc"
    | "Limit"
    | "Union"
    | "UnionAll"
    | "GroupBy"
    | "Select"
    | "toList"
    | "firstOrDefault"
    | "findOrSave"
    | "delete"
  > {
  EndCase: IQueryColumnSelector<T, ParentType, D>;
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
    | "GroupBy"
    | "Select"
    | "toList"
    | "firstOrDefault"
    | "findOrSave"
    | "delete"
  > {
  /**
   * Inner join a table
   * eg InnerJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   */
  InnerJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * left join a table
   * eg LeftJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   */
  LeftJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * join a table
   * eg Join<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by Join method instead
   */
  Join: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * CrossJoin a table
   * eg CrossJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by CrossJoin method instead
   */
  CrossJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<T & R<B, S>, ParentType, D>;
  /**
   * right join a table
   * eg RightJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * sqlite dose not currently support this
   */
  //RightJoin: <B, S extends string>(tableName: D, alias: S) => JoinOn<T & R<B, S>, ParentType, D>;
  Where: IWhere<T, ParentType, D>;
}

export type IWhere<
  T,
  ParentType,
  D extends string
> = {
  /**
   * incase you join data, then you will need to cast or convert the result to other type
   */
  Cast: <B>(
    converter?: (x: ParentType | unknown) => B
  ) => IReturnMethods<B, D>;
} & GenericQuery<
  T,
  ParentType,
  D,
  IWhere<T, ParentType, D>
>;

export interface IHaving<
  T,
  ParentType,
  D extends string
> extends Omit<
    GenericQuery<
      T,
      ParentType,
      D,
      IHaving<T, ParentType, D>
    >,
    "Select" | "Column"
  > {
  Column: (
    columnOrAlias: IColumnSelector<T> | string
  ) => IHaving<T, ParentType, D>;
  /**
   * incase you join data, then you will need to cast or convert the result to other type
   */
  Cast: <B>(
    converter?: (x: ParentType | unknown) => B
  ) => IReturnMethods<B, D>;
}

export interface IQuerySelector<
  T,
  D extends string
> extends IReturnMethods<T, D>,
    Omit<
      IOrderBy<T, IQuerySelector<T, D>>,
      "GroupBy"
    > {
  /**
   * Inner join a table
   * eg InnerJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   */
  Where: IWhere<T, T, D>;
  /**
   * Inner join a table
   * eg InnerJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by InnerJoin method instead
   */
  InnerJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * left join a table
   * eg LeftJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by LeftJoin method instead
   */
  LeftJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * join a table
   * eg Join<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by Join method instead
   */
  Join: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * CrossJoin a table
   * eg CrossJoin<TableB, "b">("TableB", "b").Column(x=> x.a.id).EqualTo(x=> x.b.parentId)...
   * This will overwrite the above where, so use the Where that is returned by CrossJoin method instead
   */
  CrossJoin: <B, S extends string>(
    tableName: D,
    alias: S
  ) => IJoinOn<R<T, "a"> & R<B, S>, T, D>;
  /**
   * Add Union Select
   */
  Union: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => IQuerySelector<T, D>;
  /**
   * Add UnionAll Select
   */
  UnionAll: <B extends IId<D>>(
    ...queryselectors: IUnionSelector<B, D>[]
  ) => IQuerySelector<T, D>;
  /**
   * Load Child or children
   */
  LoadChildren: <B extends IId<D>>(
    child: D,
    childColumn: NonFunctionPropertyNames<B>,
    parentColumn: NonFunctionPropertyNames<T>,
    assignTo: NonFunctionPropertyNames<T>,
    isArray?: boolean
  ) => IQuerySelector<T, D>;
  Select: IQueryColumnSelector<T, T, D>;
}

export interface IQueryColumnSelector<
  T,
  ParentType,
  D extends string
> extends IReturnMethods<ParentType, D> {
  /**
   * start a case, and end it with CaseEnd()
   */
  Case: (
    alias: string
  ) => ISelectCase<T, ParentType, D>;
  /**
   * Default is select * from
   * you can specify the columns here
   */
  Columns: (
    columns: ArrayAndAliasIColumnSelector<T>
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Max
   */
  Max: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Min
   */
  Min: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Count
   */
  Count: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Sum
   */
  Sum: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Total
   */
  Total: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite concat columns and values eg lastname || ' ' || firstName as FullName;
   */
  Concat: (
    alias: string,
    collectCharacters_type: ConcatSeperatorChar,
    ...columnOrValues: (
      | IColumnSelector<T>
      | string
    )[]
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from group_concat
   */
  GroupConcat: (
    columns: IColumnSelector<T>,
    alias: string,
    seperator?: string
  ) => IQueryColumnSelector<T, ParentType, D>;
  /**
   * sqlite aggrigator from Avg
   */
  Avg: (
    columns: IColumnSelector<T>,
    alias: string
  ) => IQueryColumnSelector<T, ParentType, D>;

  /**
   * incase you join data, then you will need to cast or convert the result to other type
   */
  Cast: <B>(
    converter?: (x: T | unknown) => B
  ) => IReturnMethods<B, D>;
  /**
   * add having search
   */
  Having: IHaving<T, ParentType, D>;
}

class ReturnMethods<
  T,
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
    item: ParentType & IBaseModule<D>
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
  columns: QValue[];
  cases: ISelectCase<T, ParentType, D>[];
  constructor(parent: QuerySelector<any, D>) {
    super(parent);
    this.columns = [];
    this.cases = [];
  }

  Case(alias: string) {
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

  Cast<B>(
    converter: (x: ParentType | unknown) => B
  ) {
    this.parent.converter = converter;
    return this as IReturnMethods<ParentType, D>;
  }

  Columns(
    columns: ArrayAndAliasIColumnSelector<T>
  ) {
    this.parent.clear();
    this.columns.push(QValue.Q.Value(columns));
    return this;
  }

  Concat(
    alias: string,
    collectCharacters_type: ConcatSeperatorChar,
    ...columnOrValues: (
      | IColumnSelector<T>
      | string
    )[]
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columnOrValues)
        .Args(Param.Concat)
        .Value2(collectCharacters_type)
        .Alias(alias)
    );
    return this;
  }

  Max(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Max)
        .Alias(alias)
    );
    return this;
  }

  Min(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Min)
        .Alias(alias)
    );
    return this;
  }

  Count(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Count)
        .Alias(alias)
    );
    return this;
  }

  Sum(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Sum)
        .Alias(alias)
    );
    return this;
  }

  Total(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Total)
        .Alias(alias)
    );
    return this;
  }

  GroupConcat(
    columns: IColumnSelector<T>,
    alias: string,
    seperator?: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.GroupConcat)
        .Alias(alias)
        .Value2(seperator)
    );
    return this;
  }

  Avg(
    columns: IColumnSelector<T>,
    alias: string
  ) {
    this.parent.clear();
    this.columns.push(
      QValue.Q.Value(columns)
        .Args(Param.Avg)
        .Alias(alias)
    );
    return this;
  }

  get Having() {
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

export class Where<
  T,
  ParentType extends IId<D>,
  D extends string
> extends ReturnMethods<T, ParentType, D> {
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

  LoadChildren<B extends IId<D>>(
    child: D,
    childColumn: NonFunctionPropertyNames<B>,
    parentColumn: NonFunctionPropertyNames<ParentType>,
    assignTo: NonFunctionPropertyNames<ParentType>,
    isArray?: boolean
  ) {
    this.parent.children.push({
      parentProperty: parentColumn as string,
      parentTable: this.parent.tableName,
      childProperty: childColumn as string,
      childTableName: child,
      assignTo: assignTo as string,
      isArray: isArray ?? false
    });
    return this;
  }

  get Case() {
    this.Queries.push(QValue.Q.Args(Param.Case));
    return this;
  }

  get When() {
    this.Queries.push(QValue.Q.Args(Param.When));
    return this;
  }

  get Then() {
    this.Queries.push(QValue.Q.Args(Param.Then));
    return this;
  }

  get EndCase() {
    this.Queries.push(
      QValue.Q.Args(Param.EndCase)
    );
    return this;
  }

  get Else() {
    this.Queries.push(QValue.Q.Args(Param.Else));
    return this;
  }

  Value(value: SingleValue) {
    this.Queries.push(
      QValue.Q.Args(Param.Value).Value(value)
    );
    return this;
  }

  Between(
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
      this.AND;
      this.Queries.push(
        QValue.Q.Args(Param.Value).Value(value2)
      );
    }
    return this;
  }

  Cast<B>(
    converter: (x: ParentType | unknown) => B
  ) {
    this.parent.converter = converter;
    return this as IReturnMethods<ParentType, D>;
  }

  get Select() {
    this.parent.queryColumnSelector =
      new QueryColumnSelector<T, ParentType, D>(
        this.parent
      );
    return this.parent.queryColumnSelector;
  }

  Column(column: IColumnSelector<T> | string) {
    this.parent.clear();
    this.Queries.push(
      QValue.Q.Value(column).IsColumn(true)
    );
    return this;
  }

  Concat(
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

  EqualTo(
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

  NotEqualTo(
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

  EqualAndGreaterThen(
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

  EqualAndLessThen(
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

  get Start() {
    this.parent.clear();
    this.Queries.push(
      QValue.Q.Args(Param.StartParameter)
    );
    return this;
  }

  get End() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Args(Param.EndParameter)
      );
    return this;
  }

  get OR() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(QValue.Q.Args(Param.OR));
    return this;
  }

  get AND() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(QValue.Q.Args(Param.AND));
    return this;
  }

  GreaterThan(
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

  LessThan(
    value:
      | NumberValue
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

  IN(
    value:
      | ArrayValue
      | IColumnSelector<T>
      | InnerSelect
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.IN)
      );
    return this;
  }

  get Not() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(QValue.Q.Args(Param.Not));
    return this;
  }

  get Null() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Args(Param.NULL)
      );
    return this;
  }

  get NotNull() {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Args(Param.NotNULL)
      );
    return this;
  }

  Contains(
    value: StringValue | IColumnSelector<T>
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.Contains)
      );
    return this;
  }

  StartsWith(
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

  EndsWith(
    value: StringValue | IColumnSelector<T>
  ) {
    this.parent.clear();
    if (this.Queries.length > 0)
      this.Queries.push(
        QValue.Q.Value(value).Args(Param.EndWith)
      );
    return this;
  }

  OrderByAsc(
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

  OrderByDesc(
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

  Limit(value: number) {
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

  GroupBy(
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

  InnerJoin<B, S extends string>(
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
      Param.InnerJoin
    ) as any as IJoinOn<T & R<B, S>, T, D>;
    this.parent.joins.push(join as any);
    return join;
  }

  CrossJoin<B, S extends string>(
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

  LeftJoin<B, S extends string>(
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

  Join<B, S extends string>(
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

  RightJoin<B, S extends string>(
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

  Union<B extends IId<D>>(
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

  UnionAll<B extends IId<D>>(
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

  get Where() {
    this.parent.clear();
    this.parent.where = new Where<
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
  where?: Where<any, any, D>;
  having?: Where<any, any, D>;
  joins: Where<any, any, D>[];
  unions: {
    type: Param.Union | Param.UnionAll;
    value: GlobalIQuerySelector<T, D>;
  }[];
  tableName: D;
  alias: string;
  queryColumnSelector?: QueryColumnSelector<
    any,
    any,
    D
  >;
  database: IDataBaseExtender<D>;
  jsonExpression: any;
  others: QValue[];
  type = "QuerySelector";
  translator?: QuerySelectorTranslator;
  children: IChildLoader<D>[];
  converter?: (x) => any;
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
        this.database,
        tableName,
        alias,
        isInit
      );
  }

  get Select() {
    this.queryColumnSelector =
      new QueryColumnSelector<T, T, D>(this);
    return this.queryColumnSelector;
  }

  Union<B extends IId<D>>(
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

  UnionAll<B extends IId<D>>(
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

  InnerJoin<B, S extends string>(
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

  CrossJoin<B, S extends string>(
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

  LeftJoin<B, S extends string>(
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

  Join<B, S extends string>(
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

  RightJoin<B, S extends string>(
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
      Param.RightJoin
    ) as any as IJoinOn<
      R<T, "a"> & R<B, S>,
      T,
      D
    >;
    this.joins.push(join as any);
    return join;
  }

  LoadChildren<B extends IId<D>>(
    child: D,
    childColumn: NonFunctionPropertyNames<B>,
    parentColumn: NonFunctionPropertyNames<T>,
    assignTo: NonFunctionPropertyNames<T>,
    isArray?: boolean
  ) {
    this.children.push({
      parentProperty: parentColumn as string,
      parentTable: this.tableName,
      childProperty: childColumn as string,
      childTableName: child,
      assignTo: assignTo as string,
      isArray: isArray ?? false
    });
    return this;
  }

  async delete() {
    var item = this.getSql("DELETE");
    console.log("Execute delete:" + item.sql);
    await this.database.execute(
      item.sql,
      item.args
    );
    await (this.database as any).triggerWatch(
      [],
      "onDelete",
      undefined,
      this.tableName
    );
  }

  async findOrSave(item: T & IBaseModule<D>) {
    const sql = this.getSql("SELECT");
    (item as any).tableName = this.tableName;
    var dbItem = Functions.single<any>(
      await this.database.find(
        sql.sql,
        sql.args,
        this.tableName
      )
    );
    if (!dbItem) {
      dbItem = Functions.single<any>(
        await this.database.save<T>(
          item,
          false,
          this.tableName
        )
      );
    }
    (dbItem as any).tableName = this.tableName;
    if (dbItem && this.converter)
      dbItem = this.converter(dbItem);
    return await createQueryResultType<T, D>(
      dbItem,
      this.database,
      this.children
    );
  }

  async firstOrDefault() {
    var item = this.getSql("SELECT");
    let tItem = Functions.single<any>(
      await this.database.find(
        item.sql,
        item.args,
        this.tableName
      )
    );
    if (tItem && this.converter)
      tItem = this.converter(tItem);
    return tItem
      ? await createQueryResultType<T, D>(
          tItem,
          this.database,
          this.children
        )
      : undefined;
  }

  async toList() {
    const sql = this.getSql("SELECT");
    var result = [] as IQueryResultItem<T, D>[];
    for (var x of await this.database.find(
      sql.sql,
      sql.args,
      this.tableName
    )) {
      x.tableName = this.tableName;
      if (this.converter) x = this.converter(x);
      result.push(
        await createQueryResultType<T, D>(
          x,
          this.database,
          this.children
        )
      );
    }
    return result;
  }

  getSql(sqlType: "SELECT" | "DELETE") {
    return (this.translator = this.translator
      ? this.translator
      : new QuerySelectorTranslator(
          this
        )).translate(sqlType);
  }

  getInnerSelectSql() {
    return (this.translator = this.translator
      ? this.translator
      : new QuerySelectorTranslator(
          this
        )).translateToInnerSelectSql();
  }

  OrderByAsc(
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

  OrderByDesc(
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

  Limit(value: number) {
    this.clear();
    this.others = this.others.filter(
      x => x.args !== Param.Limit
    );
    this.others.push(
      QValue.Q.Value(value).Args(Param.Limit)
    );
    return this;
  }

  GroupBy(
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

  get Where() {
    this.where = new Where<T, T, D>(
      this.tableName,
      this,
      this.alias
    );
    return this.where;
  }
}
