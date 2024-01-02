import {
  Parser,
  SearchDetail,
  Value
} from "../native";
import ReadNovelFull from "./ReadNovelFull";
import Memo from "../attr/Memo";
export default class ParserWrapper extends Parser {
  parser: Parser;
  constructor(parser: Parser) {
    super(parser.url, parser.name, parser.icon);
    this.parser = parser;
    this.settings = parser.settings;
  }

  static getAllParsers() {
    return [ReadNovelFull].map(
      x => new ParserWrapper(new x())
    );
  }

  @Memo({
    daysToSave: 5,
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
    return await this.parser.detail(url);
  }

  async search(options: SearchDetail) {
    return await this.parser.search(options);
  }
  @Memo({
    daysToSave: 20,
    keyModifier: (target, key) =>
      `${key}${target.name}`,
    validator: (data: any) =>
      data && (
      data.status?.has() ||
      data.genre?.has() ||
      data.group?.has()
      )
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
