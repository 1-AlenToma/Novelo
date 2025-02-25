import 'react-native-get-random-values';
export * from "./sql.wrapper.types";
import TableBuilder from "./TableStructor";
import BulkSave from "./BulkSave";
import { Functions } from "./UsefullMethods";
import Table from './Table';
import {ORMDataBase as Database} from "./Database";
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
  Table,
  BulkSave,
  encrypt,
  decrypt,
  oDecrypt,
  oEncypt,
  Database
};
export type {
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
};
