import {
  HttpHandler,
  html,
  Value,
  ChapterInfo,
  LightInfo,
  DetailInfo,
  ParserDetail,
  SearchDetail,
  Parser
} from "../native";

export default class ReadNovelFull extends Parser {
  constructor() {
    super(
      "https://readnovelfull.com",
      "ReadNovelFull",
      "/img/favicon.ico"
    );
    this.settings.searchEnabled = true;
  }

  async load() {
    let html = (
      await this.http.get_html(this.url)
    ).html;

    this.settings.genre = html
      .$(".dropdown-menu a")
      .filter(x => x.attr("href").has("genres/"))
      .map(x =>
        Value.n()
          .Text(x.text)
          .Value(x.attr("href"))
      );

    this.settings.status = [
      Value.n()
        .Text("Complated")
        .Value("completed")
    ];

    this.settings.group = html
      .$(".dropdown-menu a")
      .filter(x =>
        x.attr("href").has("novel-list/")
      )
      .map(x =>
        Value.n()
          .Text(x.text)
          .Value(x.attr("href"))
      );
    return this.settings;
  }

  async search(options: SearchDetail) {
    let url = this.url.join(
      `novel-list/search?keyword=${options.text}`
    );

    if (!options.genre.empty())
      this.url = this.url.join(
        this.genre,
        options.status
      );
    else if (!options.group.empty())
      url = this.url.join(
        options.group,
        options.status
      );
    url = url.query({ page: options.page || 1 });

    let html = (
      await this.http.get_html(
        url,
        undefined,
        this.url
      )
    ).html;
    return html
      .$(".list-novel > .row")
      .map(x => {
        return x.map(f => {
          if (f.find("img").attr("src") !== "")
            return LightInfo.n()
              .Name(f.find(".novel-title").text)
              .Url(
                f
                  .find(".novel-title a")
                  .url("href")
              )
              .Image(f.find("img").url("src"))
              .Info(f.find(".chr-text").text)
              .Decription(f.find(".author").text);
        });
      })
      .flatMap(x => x);
  }

  async group(value: Value, page: number) {
    return await this.search(
      SearchDetail.n().group([value]).Page(page)
    );
  }

  async chapter(url: string) {
    let html = (await this.http.get_html(url))
      .html;
    return html.$(".chr-c").html;
  }

  async detail(url: string) {
    let html = (
      await this.http.get_html(
        url,
        undefined,
        this.url
      )
    ).html.$("body");
    let item = DetailInfo.n();
    item
      .Name(html.find(".books .title").text)
      .Url(url)
      .Image(html.find(".books img").url("src"))
      .Decription(html.find(".desc-text").text)
      .AlternativeNames(
        html
          .find(".info-meta li:first-child")
          .remove("h3").text
      )
      .Author(
        html.find(".info-meta li:nth-child(2) a")
          .text
      )
      .Genre(
        html
          .find(".info-meta li:nth-child(3) a")
          .map(x => x.text)
      )
      .Status(
        html.find(".info-meta li:nth-child(5) a")
          .text
      )
      .Rating(
        html.find('span[itemprop="ratingValue"]')
          .text
      );
    let cHhtml = (
      await this.http.get_html(
        url.trimEnd("/") + "#tab-chapters",
        undefined,
        this.url
      )
    ).html;
    item.Chapters(
      cHhtml
        .$(".list-chapter a")
        .map(x =>
          ChapterInfo.n()
            .Name(x.attr("title"))
            .Url(x.url("href"))
        )
    );

    return item;
  }
}
