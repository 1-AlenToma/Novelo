import {
  IBaseModule,
  SingleValue,
  ArrayValue,
  StringValue,
  NumberValue,
  IQuery,
  IQueryResultItem,
  IDatabase,
  IWatcher,
  ColumnType
} from "./expo.sql.wrapper.types";
import createDbContext from "./Database";
import TableBuilder from "./TableStructor";
import BulkSave from "./BulkSave";
import { Functions } from "./UsefullMethods";
import {
  IQuerySelector,
  IReturnMethods,
  IOrderBy,
  GenericQuery,
  IJoinOn,
  IWhere,
  IHaving,
  IQueryColumnSelector,
  IColumnSelector,
  ArrayIColumnSelector,
  ArrayAndAliasIColumnSelector
} from "./QuerySelector";

let encrypt = Functions.encrypt.bind(Functions);
let decrypt = Functions.decrypt.bind(Functions);
let oDecrypt = Functions.oDecrypt.bind(Functions);
let oEncypt = Functions.oEncypt.bind(Functions);
export {
  TableBuilder,
  IBaseModule,
  BulkSave,
  encrypt,
  decrypt,
  oDecrypt,
  oEncypt
};
export type {
  SingleValue,
  ArrayValue,
  NumberValue,
  StringValue,
  IQuery,
  IQueryResultItem,
  IDatabase,
  IWatcher,
  IQuerySelector,
  IReturnMethods,
  IOrderBy,
  GenericQuery,
  IJoinOn,
  IWhere,
  IHaving,
  IQueryColumnSelector,
  ColumnType,
  IColumnSelector,
  ArrayIColumnSelector,
  ArrayAndAliasIColumnSelector
};
export default createDbContext;
