import TableNames from "./TableNames";
import Book from "./Book";
import Chapter from "./Chapter";
import Session from "./Session";
import dbContext from "./dbContext";
import {
  IDatabase,
  IQueryResultItem,
} from "expo-sqlite-wrapper";

const Tables = [
  Book.tb(),
  Chapter.tb(),
  Session.tb()
];

export {
  TableNames,
  Book,
  Chapter,
  Session,
  Tables,
  dbContext,
  IDatabase,
  IQueryResultItem
};
