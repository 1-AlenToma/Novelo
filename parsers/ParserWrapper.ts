import {
  Parser,
  SearchDetail,
  Value,
  DetailInfo
} from "../native";
import ReadNovelFull from "./ReadNovelFull";
import NovelUpdate from "./infos/NovelUpdates";
import Memo from "../attr/Memo";
import { sleep } from "../Methods";
export default class ParserWrapper extends Parser {
  parser: Parser;
  novelUpdate: NovelUpdate;
  infoEnabled: boolean = false;
  constructor(parser: Parser) {
    super(parser.url, parser.name, parser.icon);
    this.parser = parser;
    this.settings = parser.settings;
    this.novelUpdate = new NovelUpdate();
  }

  static getAllParsers(parserName?: string) {
    let prs = [ReadNovelFull].map(
      x => new ParserWrapper(new x())
    );
    if (parserName)
      return prs.find(x => x.name === parserName);
    return prs;
  }

  @Memo({
    daysToSave: 5,
    isDebug: false,
    argsOverride: (args: any[]) => {
      return args;
    },
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data &&
      !data.name.empty() &&
      !data.url.empty() &&
      data.chapters &&
      data.chapters.length > 0
  })
  async detail(url: string) {
    let item = await this.parser.detail(url);
    return item;
  }

  async search(options: SearchDetail) {
    return await this.parser.search(options);
  }

  @Memo({
    daysToSave: 5,
    isDebug: false,
    argsOverride: (args: any[]) => {
      return [args.firstOrDefault("url")];
    },
    updateIfTrue: (args: any) => {
      let url = args?.novelUpdateUrl;
      return !url || (url || "").empty();
    },
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data &&
      !data.name.empty() &&
      !data.url.empty() &&
      data.chapters &&
      data.chapters.length > 0
  })
  async novelInfo(item: DetailInfo) {
    return await this.novelUpdate.search(item);
  }

  async fetchSelectorImage(selector: string) {
    try {
      let baseUrl = selector
        .safeSplit("]", 0)
        .replace(/\[|\]/g, "");
      let url = selector
        .safeSplit("]", 1)
        .replace(/\[|\]/g, "");
      let path = selector
        .safeSplit("]", 2)
        .replace(/\[|\]/g, "");
      let attr = selector
        .safeSplit("]", 3)
        .replace(/\[|\]/g, "");
      let html = (
        await this.http.get_html(url, baseUrl)
      ).html;
      return html.$(path).url(attr);
    } catch (e) {}
    return "";
  }

  @Memo({
    daysToSave: 20,
    isDebug: false,
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data &&
      (data.status?.has() ||
        data.genre?.has() ||
        data.group?.has())
  })
  async load() {
    return await this.parser.load();
  }

  @Memo({
    daysToSave: 2,
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data &&
      data.has() &&
      !data[0].name.empty() &&
      !data[0].url.empty()
  })
  async group(value: Value, page: number) {
    try {
      return await this.parser.group(value, page);
    } catch (e) {
      console.error("group", value, e);
      return [];
    }
  }

  async chapter(url: string) {
    return await this.parser.chapter(url);
  }
}
