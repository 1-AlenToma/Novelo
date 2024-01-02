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

    //  console.log(html.$(".dropdown-menu a").html);

    this.settings.Genre(
      html
        .$(".dropdown-menu a")
        .filter(x =>
          x.attr("href").has("genres/")
        )
        .map(x =>
          Value.n()
            .Text(x.text)
            .Value(x.attr("href"))
        )
    );

    this.settings.Status([
      Value.n()
        .Text("Complated")
        .Value("completed")
    ]);

    this.settings.Group(
      html
        .$(".dropdown-menu a")
        .filter(x =>
          x.attr("href").has("novel-list/")
        )
        .map(x =>
          Value.n()
            .Text(x.text)
            .Value(x.attr("href"))
        )
    );

    return this.settings;
  }

  async search(options: SearchDetail) {
    let url = this.url.join(
      `novel-list/search?keyword=${options.text}`
    );

    if (options.genre.has())
      url = this.url.join(
        options.genre.firstOrDefault("value"),
        options.status.firstOrDefault("value")
      );
    else if (options.group.has())
      url = this.url.join(
        options.group.firstOrDefault("value"),
        options.status.firstOrDefault("value")
      );
    url = url.query({
      page: (1).sureValue(options.page)
    });

    let html = (
      await this.http.get_html(url, this.url)
    ).html;
    return html
      .$(".list-novel > .row")
      .map(x => {
        return x.map(f => {
          if (f.find("img").attr("src").has())
            return LightInfo.n()
              .Name(f.find(".novel-title").text)
              .Url(
                f
                  .find(".novel-title a")
                  .url("href")
              )
              .Image(f.find("img").url("src"))
              .Info(f.find(".chr-text").text)
              .Decription(f.find(".author").text)
              .ParserName(this.name);
        });
      })
      .flatMap(x => x);
  }

  async group(value: Value, page: number) {
    return await this.search(
      SearchDetail.n().Group([value]).Page(page)
    );
  }

  async chapter(url: string) {
    let html = (await this.http.get_html(url))
      .html;
    return html.$(".chr-c").html;
  }

  async detail(url: string) {
    let html = (
      await this.http.get_html(url, this.url)
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
      )
      .ParserName(this.name);
    let cHhtml = (
      await this.http.get_html(
        url.trimEnd("/") + "#tab-chapters",
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
            .ParserName(this.name)
        )
    );

    return item;
  }
}
