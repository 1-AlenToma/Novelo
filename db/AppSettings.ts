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
    parsers?: { name: string; content: string }[] = [];
    rate: number = 1;
    pitch: number = 0.9;
    voice: string = "";
    fontSize: number = 22;
    lineHeight: number = 22 * 2;
    fontName: string = "SourceSans3-Black";
    textAlign: string = "left";
    backgroundColor: string = "#ffffff";
    isBold: boolean = false;
    lockScreen: boolean = false;
    margin?: number = 5;
    selectedParser: string = "";
    currentNovel?: {
        url: string;
        parserName: string;
        isEpub?: boolean;
    } = {} as any;
    navigationType?: "Scroll" | "Snap" = "Snap";
    use3D?: boolean = false;
    shadowLength?: number = 1;
    fontStyle?: string = "normal";
    theme?: string = "light";
    lang?: string = "English";
    useSentenceBuilder?: {
        enabled: boolean;
        minLength: number;
    } = { enabled: false, minLength: 100 };
    voiceWordSelectionsSettings?: {
        color?: string;
        appendSelection?: boolean;
    } = {};
    constructor() {
        super("AppSettings");
    }

    static tb() {
        return TableBuilder<AppSettings, TableNames>("AppSettings")
            .column("id")
            .primary.autoIncrement.number.column("rate")
            .decimal.column("parsers")
            .nullable.column("pitch")
            .decimal.column("voice")
            .column("fontSize")
            .number.column("lineHeight")
            .number.column("margin")
            .nullable.number.column("textAlign")
            .column("backgroundColor")
            .column("theme")
            .column("isBold")
            .boolean.column("fontName")
            .column("lockScreen")
            .boolean.column("currentNovel")
            .nullable.json.column("voiceWordSelectionsSettings")
            .nullable.json.column("navigationType")
            .nullable.column("use3D")
            .nullable.boolean.column("useSentenceBuilder")
            .nullable.json.column("fontStyle")
            .nullable.column("lang")
            .nullable.column("shadowLength")
            .nullable.number
            .column("selectedParser").objectPrototype(AppSettings.prototype);
    }
}
public_m(AppSettings);
export default AppSettings;
