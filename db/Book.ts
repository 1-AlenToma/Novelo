import {
  IBaseModule,
  TableBuilder,
  ColumnType,
  IQueryResultItem
} from "expo-sqlite-wrapper";
import TableNames from "./TableNames";
import { public_m } from "../Methods";
import Chapter from "./Chapter";

class Book extends IBaseModule<TableNames> {
  id?: number;
  url: string = "";
  name: string = "";
  parserName: string="";
  inlineStyle: string = "";
  selectedChapterIndex: number = 0;
  favorit: boolean = false;
  chapterSettings: IQueryResultItem<
    Chapter,
    TableNames
  >[];

  constructor() {
    super("Books");
  }

  static tb() {
    return TableBuilder<Book, TableNames>("Books")
      .column("id")
      .primary.autoIncrement.number.column("name")
      .column("url")
      .encrypt("novelo.enc")
      .column("inlineStyle")
      .column("favorit")
      .boolean
      .column("parserName")
      .column("selectedChapterIndex")
      .number.objectPrototype(Book.prototype);
  }
}

public_m(Book);
export default Book;
