import {
    IBaseModule,
    TableBuilder,
    ColumnType,
    IQueryResultItem
} from "expo-sqlite-wrapper";
import TableNames from "./TableNames";
import { public_m } from "../Methods";
import Book from "./Book";

class Chapter extends IBaseModule<TableNames> {
    id?: number;
    url: string = "";
    name: string = "";
    scrollProgress: number = 0;
    audioProgress: number = 0;
    isFinished: boolean = false;
    content: string;
    parent_Id?: number;
    constructor() {
        super("Chapters");
    }

    static tb() {
        return TableBuilder<Parent, TableNames>("Chapters")
            .column("id")
            .primary.autoIncrement.number.column("name")
            .column("url")
            .encrypt("novelo.enc")
        .column("parentId")
            .number.nullable.constrain<Book>("parent_Id", "Books", "id")
            .column("content")
            .nullable.encrypt("novelo.enc")
            .column("isFinished")
            .boolean.column("scrollProgress")
            .decimal.column("audioProgress")
            .decimal.objectPrototype(Chapter.prototype);
    }
}
public_m(Chapter);
export default Chapter;
