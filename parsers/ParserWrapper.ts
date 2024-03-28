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

  getContext() {
    return context;
  }

  getError() {
    return this.parser.http.httpError;
  }

  clearError() {
    this.parser.http.httpError = undefined;
    return this;
  }

  showError() {
    if (this.getError()) {
      context
        .alert(
          this.getError().toString(),
          "Error"
        )
        .toast();
    }
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
  async detail(
    url: string,
    alertOnError?: boolean
  ) {
    let item = await this.parser.detail(url);
    if (alertOnError) this.showError();
    return item;
  }

  async search(
    options: SearchDetail,
    alertOnError?: boolean
  ) {
    let item = await this.parser.search(options);
    if (alertOnError) this.showError();
    return item;
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
  async novelInfo(
    item: DetailInfo,
    alertOnError?: boolean
  ) {
    let novel =
      await this.novelUpdate.search(item);
    if (alertOnError) this.showError();
    return novel;
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
  async group(
    value: Value,
    page: number,
    alertOnError?: boolean
  ) {
    try {
      let item = await this.parser.group(
        value,
        page
      );
      if (alertOnError) this.showError();
      return item;
    } catch (e) {
      console.error("group", value, e);
      if (alertOnError) this.showError();
      return [];
    }
  }

  async chapter(
    url: string,
    alertOnError?: boolean
  ) {
    let item = await this.parser.chapter(url);
    if (alertOnError) this.showError();
    return item;
  }
}
