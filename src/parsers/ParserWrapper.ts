import {
  Parser,
  SearchDetail,
  Value,
  DetailInfo,
  InfoGeneratorName
} from "../native";

import ReadNovelFull from "./ReadNovelFull";
import NovelFull from "./NovelFull";
import NovelFullCom from "./NovelFullCom";
import MangaBerri from "./MangaBerri";
import NovelBin from "./Novelbin";
import NovelBinCom from "./NovelBinCom";
import GogoAnime from "./GogoAnime";

import NovelUpdate from "./infos/NovelUpdates";
import MyAnimeList from "./infos/MyAnimeList";
import Memo from "../attr/Memo";
import { AlertDialog } from "styles";

const debugg = false;
export default class ParserWrapper extends Parser {
  parser: Parser;
  novelUpdate: NovelUpdate;
  animeInfo: MyAnimeList;
  infoGeneratorName: InfoGeneratorName = "NovelUpdate";
  infoEnabled: boolean = true;
  constructor(parser: Parser) {
    super(parser.url, parser.name, parser.icon, parser.type);
    this.parser = parser;
    this.settings = parser.settings;
    this.novelUpdate = new NovelUpdate();
    this.animeInfo = new MyAnimeList();
    this.protectedChapter = parser.protectedChapter;
    this.infoGeneratorName = parser.infoGeneratorName;
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
    if (this.getError())
      AlertDialog.toast({ title: "OFFLINE", message: this.getError()?.toString(), type: "Error" });

  }

  static getAllParsers(parserName?: string) {
    let prs = [ReadNovelFull, NovelFullCom, NovelFull, NovelBinCom, NovelBin, MangaBerri, GogoAnime].map(
      x => new ParserWrapper(new (x as any)())
    );
    if (parserName)
      return prs.find(x => x.name === parserName);
    return prs;
  }

  @Memo({
    daysToSave: 5,
    isDebug: debugg,
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
  async detail(url: string, alertOnError?: boolean, renewMemo?: "RenewMemo" | undefined) {
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
    daysToSave: 4,
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
    let novel = item;
    switch (this.infoGeneratorName) {
      case "NovelUpdate":
        novel = await this.novelUpdate.search(item);
        break;
      case "MyAnimeList":
        novel = await this.animeInfo.search(item);
        break;
      default:
        novel = null;
        break;
    }

    if (alertOnError) this.showError();
    return novel;
  }

  @Memo({
    daysToSave: 5,
    isDebug: debugg,
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data &&
      data.has() &&
      !data[0].name.empty() &&
      !data[0].url.empty()
  })
  async getByAuthor(url: string) {
    return await this.parser.getByAuthor(url)
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
    } catch (e) { }
    return "";
  }

  @Memo({
    daysToSave: 20,
    isDebug: debugg,
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data &&
      (data.status?.has() ||
        data.genre?.has() ||
        data.group?.has())
  })
  async load(renewMemo?: "RenewMemo" | undefined) {
    try {
      return await this.parser.load();
    } catch (e) {
      console.error("error", e);
    }
  }

  @Memo({
    daysToSave: 2,
    isDebug: debugg,
    keyModifier: (target, key) => `${key}${target.name}`,
    validator: (data: any) => data && data.has() && !data[0].name.empty() && !data[0].url.empty()
  })
  async group(
    value: Value,
    page: number,
    alertOnError?: boolean,
    renewMemo?: "RenewMemo" | undefined
  ) {
    try {
      let item = await this.parser.group(value, page);
      if (alertOnError) this.showError();
      return item;
    } catch (e) {
      console.error("group", value, e);
      if (alertOnError) this.showError();
      return [];
    }
  }

  async chapter(url: any, alertOnError?: boolean) {
    let item = await this.parser.chapter(url);
    if (alertOnError) this.showError();
    return item;
  }
}
