import TableNames from "./TableNames";
import { public_m } from "../Methods";
import Book from "./Book";
import { DBInit } from "../Types"

class Chapter extends DBInit {
  url: string = "";
  name: string = "";
  scrollProgress: number = 0;
  audioProgress: number = 0;
  readPercent?: number = 0;
  isFinished: boolean = false;
  parent_Id?: number;
  constructor() {
    super("Chapters");
  }

  config() {
    return this.TableBuilder<Chapter, TableNames>("Chapters")
      .column("id").primary.autoIncrement.number.column("name")
      .column("url")
      .encrypt("novelo.enc")
      .column("parent_Id").number.nullable
      .constrain<Book>(
        "parent_Id",
        "Books",
        "id"
      )
      .column("isFinished")
      .boolean.column("scrollProgress")
      .decimal.column("audioProgress")
      .decimal.column("readPercent").decimal.nullable.objectPrototype(Chapter.prototype);
  }
}
public_m(Chapter);
export default Chapter;
