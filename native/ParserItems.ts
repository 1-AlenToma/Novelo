import { public_m } from "..Methods";
class ChapterInfo {
    name: string = "";
    url: string = "";
}

public_m(ChapterInfo);

class LightInfo extends ChapterInfo {
    decription: string = "";
    image: string = "";
    info: string = "";
}
public_m(LightInfo);

class DetailInfo extends LightInfo {
    rating: string = "";
    alternativeNames: string[] = [];
    genre: string[] = [];
    author: string = "";
    status: string = "";
    chapters: ChapterInfo[] = [];
}
public_m(DetailInfo);

class Value {
    text: string = "";
    value: any = "";
}

public_m(Value);

class ParserDetail {
    genre: Value[] = [];
    status: Value[] = [];
    group: Value[] = [];
    searchEnabled: boolean = true;
}
public_m(ParserDetail);
class SearchDetail {
    text: string = "";
    page: number = 1;
    genre: string = "";
    status: string = "";
}

public_m(SearchDetail);

export {
    LightInfo,
    ChapterInfo,
    DetailInfo,
    Value,
    ParserDetail,
    SearchDetail
};
