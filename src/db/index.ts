import TableNames from "./TableNames";
import Book from "./Book";
import Chapter from "./Chapter";
import Session from "./Session";
import dbContext from "./dbContext";
import AppSettings from "./AppSettings";

import {
  IDatabase,
  IQueryResultItem
} from "expo-sqlite-wrapper";

const Tables = [
  Book.tb(),
  Chapter.tb(),
  Session.tb(),
  AppSettings.tb()
] as any[];

export {
  TableNames,
  AppSettings,
  Book,
  Chapter,
  Session,
  Tables,
  dbContext,
  IDatabase,
  IQueryResultItem
};
