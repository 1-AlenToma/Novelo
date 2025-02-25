import TableBuilder from '../TableStructor'
export type TableNames = 'DetaliItems' | 'Chapters';

export interface DetaliItems {
    tableName: TableNames;
    id: number;
    title: string;
    image: string;
    description?: string;
    novel: string;
    parserName: string;
    chapterIndex: number;
    isFavorit?: boolean;
    children?: Chapters[]
}

export interface Chapters {
    tableName: TableNames;
    id: number;
    chapterUrl: number;
    isViewed?: boolean;
    currentProgress: number;
    audioProgress: number;
    finished?: boolean;
    detaliItem_Id: number;
    unlocked?: boolean;
}




export const tables = [
    TableBuilder<DetaliItems, TableNames>("DetaliItems")
        .column("title")
        .column("image").encrypt("testEncryptions")
        .column("description").nullable
        .column("novel").encrypt("testEncryptions")
        .column("parserName")
        .column("chapterIndex").number
        .column("isFavorit").boolean,

    TableBuilder<Chapters, TableNames>("Chapters")
        .column("chapterUrl").encrypt("testEncryptions")
        .column("isViewed").boolean.nullable
        .column("currentProgress").number.nullable
        .column("audioProgress").number
        .column("finished").boolean.nullable
        .column("detaliItem_Id").number
        .column("unlocked").boolean.nullable
        .constrain<DetaliItems>("detaliItem_Id", "DetaliItems", "id")
]