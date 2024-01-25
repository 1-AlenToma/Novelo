import {
  IBaseModule,
  TableBuilder,
  ColumnType,
  IQueryResultItem
} from "expo-sqlite-wrapper";
import TableNames from "./TableNames";
import { public_m } from "../Methods";

class AppSettings extends IBaseModule<TableNames> {
  id?: number;
  rate: number = 1;
  pitch: number = 0.9;
  voice: string = "";
  fontSize: number = 22;
  textAlign: string = "left";
  backgroundColor: string = "#ffffff";
  isBold: boolean = false;
  lockScreen: boolean = false;
  lastRead?: number = null;
  constructor() {
    super("AppSettings");
  }

  static tb() {
    return TableBuilder<AppSettings, TableNames>(
      "AppSettings"
    )
      .column("id")
      .primary.autoIncrement.number.column("rate")
      .decimal.column("pitch")
      .decimal.column("voice")
      .column("fontSize")
      .number.column("textAlign")
      .column("backgroundColor")
      .column("isBold")
      .boolean
      .column("lockScreen").boolean.objectPrototype(
        AppSettings.prototype
      );
  }
}
public_m(AppSettings);
export default AppSettings;
