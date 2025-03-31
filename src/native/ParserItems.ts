import { public_m } from "../Methods";
import HttpHandler from "./HttpHandler";
import { GenericType, ISize, NovelFile, OmitType } from "../Types"

class ChapterInfo extends GenericType {
  name: string = "";
  url: string = "";
  parserName: string = "";
  content?: string; // only used in player
}

type ParserType = "Novel" | "Manga" | "Anime";
type LangType = "" | "Sub" | "Dub" | "Raw";

class LightInfo extends ChapterInfo {
  decription: string = "";
  image: string = "";
  info: string = "";
  isNew: boolean = false;
  langType: LangType = "";
  type: ParserType = "Novel";
}

class CommentScript {
  script: string = "";
  url: string = "";
}

public_m(CommentScript);

class DetailInfo extends LightInfo {
  epub?: any; // temp
  files?: NovelFile[]; // temp
  imagePath?: string; // this is used for downloaded images start path
  rating: string = "";
  novelUpdateRating = "";
  novelUpdateUrl = "";
  novelUpdateRecommendations: LightInfo[] = [];
  alternativeNames: string = "";
  genre: string[] = [];
  tags: string[] = [];
  author: string = "";
  authorUrl: string = "";
  status: string = "";
  chapters: ChapterInfo[] = [];
  lastUpdated: string = "";
  commentScript: CommentScript = new CommentScript();
}

class Value {
  text: string = "";
  value: any = "";
}
type SearchCombination =
  | "Genre"
  | "Status"
  | "Group";


interface ChapterDetail {
  css: string;
  script: string;
  clickExceptions: string[];
}

class SearchDetail extends GenericType {
  text: string = "";
  page: number = 1;
  genre: Value[] = [];
  status: Value[] = [];
  group: Value[] = [];
  genreMultiSelection: boolean = false;
  constructor(txt?: string) {
    super();
    this.text = txt ?? "";
  }
}




abstract class NovelInfo {
  url: string;
  http: HttpHandler;
  type: string = "Novel";
  constructor(url: string) {
    this.url = url;
    this.http = new HttpHandler();
  }

  abstract search(
    item: DetailInfo
  ): Promise<DetailInfo>;
}

export type InfoGeneratorName = "" | "NovelUpdate" | "MyAnimeList";

class ParserDetail extends OmitType(SearchDetail, "text", "page") {
  searchCombination: SearchCombination[] = [];
  searchEnabled: boolean = true;
  imagesSize?: ISize;
}

abstract class Parser {
  url: string;
  http: HttpHandler;
  name: string;
  icon: string;
  settings: ParserDetail;
  infoGeneratorName: InfoGeneratorName = "NovelUpdate";
  type: ParserType = "Novel";
  constructor(
    url: string,
    name: string,
    icon: string,
    type?: ParserType
  ) {
    this.url = url;
    this.http = new HttpHandler();
    this.name = name;
    this.icon = (url?.join(icon) ?? "") as string;
    this.settings = new ParserDetail();
    this.type = type ?? "Novel";
  }

  abstract search(
    options: SearchDetail
  ): Promise<LightInfo[]>;

  abstract detail(
    url: string
  ): Promise<DetailInfo>;

  abstract load(): Promise<ParserDetail>;

  abstract group(
    value: Value,
    page: number
  ): Promise<LightInfo[]>;

  abstract getByAuthor(
    url: string
  ): Promise<LightInfo[]>;

  abstract chapter(url: string): Promise<string | ChapterDetail>;
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
  NovelInfo,
  ChapterDetail
};
