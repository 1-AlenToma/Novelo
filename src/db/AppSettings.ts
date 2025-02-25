import TableNames from "./TableNames";
import { public_m } from "../Methods";
import { DBInit } from "../Types"


class AppSettings extends DBInit {
    filesDataLocation?: string = undefined;
    parsers?: { name: string; content: string }[] = [];
    rate: number = 1;
    pitch: number = 0.9;
    voice: string = "";
    fontSize: number = 12;
    lineHeight: number = 30;
    fontName: string = "SourceSans3-Black";
    textAlign: string = "left";
    backgroundColor: string = "#ffffff";
    isBold: boolean = false;
    lockScreen: boolean = false;
    margin?: number = 37;
    selectedParser: string = "";
    currentNovel?: {
        url: string;
        parserName: string;
        isEpub?: boolean;
    } = {} as any;
    navigationType?: "Scroll" | "Snap" | "ScrollSnap" = "Snap";
    use3D?: boolean = false;
    shadowLength?: number = 1;
    fontStyle?: string = "normal";
    selectedTheme: number;
    lang?: string = "English";
    sentenceMargin?: number = 15;
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

    config() {
        return this.TableBuilder<AppSettings, TableNames>("AppSettings")
            .column("rate").decimal
            .column("parsers").nullable
            .column("pitch").decimal
            .column("voice")
            .column("fontSize").number
            .column("lineHeight").number
            .column("margin").nullable.number
            .column("textAlign")
            .column("backgroundColor")
            .column("selectedTheme").number.nullable
            .column("isBold").boolean
            .column("fontName")
            .column("lockScreen").boolean
            .column("currentNovel").nullable.json
            .column("voiceWordSelectionsSettings").nullable.json
            .column("navigationType").nullable
            .column("use3D").nullable.boolean
            .column("useSentenceBuilder").nullable.json
            .column("fontStyle").nullable
            .column("lang").nullable
            .column("shadowLength").nullable.number
            .column("filesDataLocation").nullable
            .column("sentenceMargin").nullable.number
            .column("selectedParser").objectPrototype(AppSettings.prototype);
    }
}
public_m(AppSettings);
export default AppSettings;
