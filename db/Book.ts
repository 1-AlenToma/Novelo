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
    rate: number = 1;
    pitch: number = 0.9;
    voice: string = "";
    fontSize: number = 22;
    textAlign: string = "left";
    backgroundColor: string = "#ffffff";
    inlineStyle: string = "";
    selectedChapterIndex: number = 0;
    isBold: boolean = false;
    chapterSettings:IQueryResultItem<Chapter,TableNames>[];
    constructor() {
        super("Books");
    }

    static tb() {
        return TableBuilder<Parent, TableNames>("Books")
            .column("id")
            .primary.autoIncrement.number.column("name")
            .column("url")
            .encrypt("novelo.enc")
            .column("rate")
            .decimal.column("pitch")
            .decimal.column("voice")
            .column("fontSize")
            .number.column("textAlign")
            .column("backgroundColor")
            .column("inlineStyle")
            .column("isBold")
            .boolean.column("selectedChapterIndex")
            .number.objectPrototype(Book.prototype);
    }
}
public_m(Book);
export default Book;
