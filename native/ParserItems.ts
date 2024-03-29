import { public_m } from "../Methods";
import HttpHandler from "./HttpHandler";

class ChapterInfo {
  name: string = "";
  url: string = "";
  parserName: string = "";
}

class LightInfo extends ChapterInfo {
  decription: string = "";
  image: string = "";
  info: string = "";
  isNew: boolean = false;
}

class CommentScript {
  script: string = "";
  url: string = "";
}

public_m(CommentScript);

class DetailInfo extends LightInfo {
  rating: string = "";
  novelUpdateRating = "";
  novelUpdateUrl = "";
  novelUpdateRecommendations: LightInfo[] = [];
  alternativeNames: string[] = [];
  genre: string[] = [];
  tags: string[] = [];
  author: string = "";
  status: string = "";
  chapters: ChapterInfo[] = [];
  lastUpdated: string = "";
  commentScript: CommentScript =
    new CommentScript();
}

class Value {
  text: string = "";
  value: any = "";
}
type SearchCombination =
  | "Genre"
  | "Status"
  | "Group";
class ParserDetail {
  genre: Value[] = [];
  status: Value[] = [];
  group: Value[] = [];
  searchCombination: SearchCombination[] = [];
  searchEnabled: boolean = true;
}

class SearchDetail {
  text: string = "";
  page: number = 1;
  genre: Value[] = [];
  status: Value[] = [];
  group: Value[] = [];
  genreMultiSelection: boolean = false;
  constructor(txt?: string) {
    this.text = txt ?? "";
  }
}

abstract class NovelInfo {
  url: string;
  http: HttpHandler;
  type: string = "NovelInfos";
  constructor(url: string) {
    this.url = url;
    this.http = new HttpHandler();
  }

  abstract async search(
    item: DetailInfo
  ): Promise<DetailInfo>;
}

abstract class Parser {
  url: string;
  http: HttpHandler;
  name: string;
  icon: string;
  settings: ParserDetail;
  constructor(
    url: string,
    name: string,
    icon: string
  ) {
    this.url = url;
    this.http = new HttpHandler();
    this.name = name;
    this.icon = url?.join(icon) ?? "";
    this.settings = new ParserDetail();
  }

  abstract async search(
    options: SearchDetail
  ): Promise<LightInfo[]>;

  abstract async detail(
    url: string
  ): Promise<DetailInfo>;

  abstract async load(): Promise<ParserDetail>;

  abstract async group(
    value: Value,
    page: number
  ): Promise<LightInfo[]>;

  abstract async chapter(
    url: string
  ): Promise<string>;
}
public_m(
  DetailInfo,
  Value,
  ChapterInfo,
  ParserDetail,
  LightInfo,
  SearchDetail
);
export {
  LightInfo,
  ChapterInfo,
  DetailInfo,
  Value,
  ParserDetail,
  SearchDetail,
  Parser,
  NovelInfo
};
