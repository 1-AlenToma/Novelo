import {
  IBaseModule,
  TableBuilder,
  ColumnType,
  IQueryResultItem
} from "expo-sqlite-wrapper";
import TableNames from "./TableNames";
import { public_m } from "../Methods";

class Session extends IBaseModule<TableNames> {
  id?: number;
  data: string = "";
  date: Date = new Date();
  file: string;

  constructor() {
    super("Sessions");
  }

  static tb() {
    return TableBuilder<Session, TableNames>(
      "Sessions"
    )
      .column("id")
      .primary.autoIncrement.number.column("data")
      .encrypt("novelo.enc")
      .column("file")
      .encrypt("novelo.enc")
      .column("date")
      .dateTime.objectPrototype(
        Session.prototype
      );
  }
}
public_m(Session);
export default Session;
