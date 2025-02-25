import {
  ColumnType,
  ITableBuilder,
  ColumnProps,
  NonFunctionPropertyNames,
  IId,
  IChildLoader,
  ObjectPropertyNamesNames
} from "./sql.wrapper.types";

export class TableBuilder<T, D extends string> implements ITableBuilder<T, D> {
  props: ColumnProps<T, D>[];
  constrains: {
    columnName: keyof T;
    contraintTableName: D;
    contraintColumnName: any;
  }[];
  tableName: D;
  itemCreate?: (item: T) => T;
  typeProptoType?: any;
  children: IChildLoader<D>[] = [];
  constructor(tableName: D) {
    this.props = [];
    this.tableName = tableName;
    this.constrains = [];
    // added default id column
    this.column("id" as any).number.primary.autoIncrement;
  }


  colType(colType: ColumnType) {
    if (colType !== "String" && this.getLastProp.encryptionKey) {
      const ms = `Error:Encryption can only be done to columns with String Types. (${this.tableName}.${this.getLastProp.columnName as string})`;
      console.error(ms);
      throw ms;
    }
    this.getLastProp.columnType = colType;
    return this as ITableBuilder<T, D>;
  }

  hasMany<C extends IId<D>>(prop: ObjectPropertyNamesNames<T>, tableName: D, foreignkey: NonFunctionPropertyNames<C>, idProp?: NonFunctionPropertyNames<T>) {
    this.children.push({
      parentTable: this.tableName,
      parentProperty: (idProp ?? "id") as string,
      childProperty: foreignkey as string,
      childTableName: tableName as string,
      isArray: true,
      assignTo: prop
    } as IChildLoader<D>);
    return this;
  }

  hasOne<C extends IId<D>>(prop: ObjectPropertyNamesNames<T>, tableName: D, foreignkey: NonFunctionPropertyNames<C>, idProp?: NonFunctionPropertyNames<T>) {
    this.children.push({
      parentTable: this.tableName,
      parentProperty: (idProp ?? "id") as string,
      childProperty: foreignkey as string,
      childTableName: tableName as string,
      isArray: false,
      assignTo: prop
    } as IChildLoader<D>);
    return this;
  }

  hasParent<P extends IId<D>>(prop: ObjectPropertyNamesNames<T>, tableName: D, foreignkey: NonFunctionPropertyNames<T>, parentIdKey?: NonFunctionPropertyNames<P>) {
    this.children.push({
      parentTable: this.tableName,
      parentProperty: foreignkey as string,
      childProperty:  (parentIdKey ?? "id"),
      childTableName: tableName,
      isArray: false,
      assignTo: prop
    } as IChildLoader<D>);
    return this;
  }

  defaultValue(defaultValue: string | boolean | number) {
    this.getLastProp.defaultValue = defaultValue;
    return this as ITableBuilder<T, D>;
  }

  get blob() {
    return this.colType("BLOB");
  }

  get json() {
    return this.colType("JSON");
  }

  get boolean() {
    return this.colType("Boolean");
  }

  get number() {
    return this.colType("Number");
  }

  get decimal() {
    return this.colType("Decimal");
  }

  get string() {
    return this.colType("String");
  }

  get dateTime() {
    return this.colType("DateTime");
  }

  get nullable() {
    this.getLastProp.isNullable = true;
    return this as ITableBuilder<T, D>;
  }

  get primary() {
    this.getLastProp.isPrimary = true;
    return this as ITableBuilder<T, D>;
  }

  get autoIncrement() {
    this.getLastProp.isAutoIncrement = true;
    return this as ITableBuilder<T, D>;
  }

  get unique() {
    this.getLastProp.isUnique = true;
    return this as ITableBuilder<T, D>;
  }

  get getLastProp() {
    if (this.props.length > 0)
      return this.props[this.props.length - 1];
    return {} as ColumnProps<T, D>;
  }

  objectPrototype(objectProptoType: any) {
    this.typeProptoType = objectProptoType;
    return this as ITableBuilder<T, D>;
  }

  encrypt(encryptionKey: string) {
    if (
      this.getLastProp.columnType !== "String"
    ) {
      const ms = `Error:Encryption can only be done to columns with String Types. (${this.tableName
        }.${this.getLastProp.columnName as string
        })`;
      console.error(ms);
      throw ms;
    }
    this.getLastProp.encryptionKey =
      encryptionKey;
    return this as ITableBuilder<T, D>;
  }

  onItemCreate(func: (item: T) => T) {
    this.itemCreate = func;
    return this as ITableBuilder<T, D>;
  }

  column(colName: keyof T) {
    const col = { columnName: colName, columnType: "String" } as ColumnProps<T, D>;
    if (this.props.find(x => x.columnName == colName))
      this.props[this.props.findIndex(x => x.columnName == colName)] = col;
    else
      this.props.push(col);
    return this as ITableBuilder<T, D>;
  }

  constrain<E extends object>(
    columnName: NonFunctionPropertyNames<T>,
    contraintTableName: D,
    contraintColumnName: NonFunctionPropertyNames<E>
  ) {
    this.constrains.push({
      columnName,
      contraintColumnName,
      contraintTableName
    });
    return this as ITableBuilder<T, D>;
  }
}

export default <T extends object, D extends string>(tableName: D) => {
  return new TableBuilder<T, D>(tableName) as ITableBuilder<T, D>;
};
