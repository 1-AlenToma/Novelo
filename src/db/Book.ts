import {
  IQueryResultItem
} from "../expo-sqlite-wrapper/src";
import TableNames from "./TableNames";
import { public_m } from "../Methods";
import Chapter from "./Chapter";
import { DBInit } from "../Types"

class Book extends DBInit {
  url: string = "";
  name: string = "";
  parserName: string = "";
  inlineStyle: string = "";
  selectedChapterIndex: number = 0;
  favorit: boolean = false;
  imageBase64: string = "";
  textReplacements: {
    edit: string;
    editWith: string;
    bgColor?: string;
    comments?: string;
  }[] = [] as any[];
  chapterSettings: IQueryResultItem<
    Chapter,
    TableNames
  >[];

  constructor() {
    super("Books");
  }

  config() {
    return this.TableBuilder<Book, TableNames>("Books")
      .column("name")
      .column("url").encrypt("novelo.enc")
      .column("imageBase64")
      .column("inlineStyle")
      .column("favorit").boolean
      .column("textReplacements").nullable.json
      .column("parserName")
      .column("selectedChapterIndex").number
      .hasMany<Chapter>("chapterSettings", "Chapters", "parent_Id").objectPrototype(Book.prototype);
  }
}

public_m(Book);
export default Book;
