import {
  IBaseModule,
  TableBuilder,
  ColumnType,
  IQueryResultItem
} from "expo-sqlite-wrapper";
import TableNames from "./TableNames";
import { public_m } from "../Methods";
import Book from "./Book";
import {DBInit} from "../Types"

class Chapter extends DBInit {
  id: number = 0;
  url: string = "";
  name: string = "";
  scrollProgress: number = 0;
  audioProgress: number = 0;
  isFinished: boolean = false;
  parent_Id?: number;
  constructor() {
    super("Chapters");
  }

  static tb() {
    return TableBuilder<Chapter, TableNames>(
      "Chapters"
    )
      .column("id")
      .primary.autoIncrement.number.column("name")
      .column("url")
      .encrypt("novelo.enc")
      .column("parent_Id")
      .number.nullable.constrain<Book>(
        "parent_Id",
        "Books",
        "id"
      )
      .column("isFinished")
      .boolean.column("scrollProgress")
      .decimal.column("audioProgress")
      .decimal.objectPrototype(Chapter.prototype);
  }
}
public_m(Chapter);
export default Chapter;
