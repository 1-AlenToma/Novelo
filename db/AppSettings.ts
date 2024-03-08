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
  fontName: string = "SourceSans3-Black";
  textAlign: string = "left";
  backgroundColor: string = "#ffffff";
  isBold: boolean = false;
  lockScreen: boolean = false;
  margin?: number = 5;
  currentNovel?: { url:string; parserName:string, isEpub?:boolean } = {};
  navigationType?: "Scroll" | "Snap" = "Snap";
  use3D?: boolean = false;
  fontStyle?: string = "normal";
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
      .number.column("margin")
      .nullable.number.column("textAlign")
      .column("backgroundColor")
      .column("isBold")
      .boolean.column("fontName")
      .column("lockScreen")
      .boolean.column("currentNovel")
      .nullable.json.column("navigationType")
      .nullable.column("use3D")
      .nullable.boolean
      .column("fontStyle").nullable.objectPrototype(
        AppSettings.prototype
      );
  }
}
public_m(AppSettings);
export default AppSettings;
