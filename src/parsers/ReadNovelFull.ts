import {
  HttpHandler,
  Html,
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
    this.settings.genreMultiSelection = false;
    this.settings.searchCombination = ["Genre", "Status"];
    this.minVersion = 155;
  }

  async load() {
    let html = (
      await this.http.get_html(this.url)
    ).html;



    this.settings.set("genre",
      html.$(".dropdown-menu a")
        .filter(x => x.attr("href").has("genres/"))
        .map(x => Value.n().set("text", x.text, "value", x.attr("href"))));

    this.settings.set("status", [Value.n().set("text", "Complated", "value", "completed")]);

    this.settings.set("group",
      html
        .$(".dropdown-menu a")
        .filter(x => x.attr("href").has("novel-list/"))
        .map(x => Value.n().set("text", x.text, "value", x.attr("href")))
    );
    return this.settings;
  }

  async search(options: SearchDetail) {
    let url = this.url.join(
      `novel-list/search?keyword=${options.text}`
    );

    if (options.genre.has())
      url = this.url.join(
        options.genre.lastOrDefault("value"),
        options.status.lastOrDefault("value")
      );
    else if (options.group.has())
      url = this.url.join(
        options.group.lastOrDefault("value"),
        options.status.lastOrDefault("value")
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
          if (f.run(".cover -> attr::src").has())
            return LightInfo.n()
              .set("name", f.run(".novel-title -> text"))
              .set("url", f.run(".novel-title a -> url::href"))
              .set("image", f.run(".cover -> url::src").imageUrlSize("200x250"))
              .set("info", f.run(".chr-text -> text"))
              .set("decription", f.run(".author -> text"))
              .set("isNew", f.run(".label-new -> hasValue"))
              .set("parserName", this.name);
        });
      }).flatMap(x => x);
  }

  async group(value: Value, page: number) {
    return await this.search(SearchDetail.n().set("group", [value], "page", page));
  }

  async getByAuthor(url: string) {
    let html = (await this.http.get_html(url, this.url)).html;

    return html
      .$(".list-novel > .row")
      .map(x => {
        return x.map(f => {
          if (f.run(".cover -> attr::src").has())
            return LightInfo.n()
              .set("name", f.run(".novel-title -> text"))
              .set("url", f.run(".novel-title a -> url::href"))
              .set("image", f.run(".cover -> url::src").imageUrlSize("200x250"))
              .set("info", f.run(".chr-text -> text"))
              .set("decription", f.run(".author -> text"))
              .set("isNew", f.run(".label-new -> hasValue"))
              .set("parserName", this.name);
        });
      })
      .flatMap(x => x);
  }

  async chapter(url: string) {
    let html = (await this.http.get_html(url)).html;
    return html.$(".chr-c").html;
  }

  async detail(url: string) {
    let html = (await this.http.get_html(url, this.url)).html;
    let body = html.$("body");

    let item = DetailInfo.n();
    item
      .set("name", body.run(".books .title -> text"))
      .set("url", url)
      .set("image", body.run(".books img -> url::src").imageUrlSize("200x250"))
      .set("decription", body.run(".desc-text -> text"))
      .set("alternativeNames", body.run('.info-meta li h3:contains("Alternative") -> parent -> remove::h3 -> text'))
      .set("author", body.run('first::.info-meta a[href*="authors"] -> text'))
      .set("authorUrl", body.run('first::.info-meta a[href*="authors"] -> url::href'))
      .set("genre", body.run('.info-meta a[href*="genres"] -> map::text'))
      .set("status", body.run('.info-meta li h3:contains("Status") -> parent -> find::a -> text'))
      .set("rating", body.run('span[itemprop="ratingValue"] -> text'))
      .set("lastUpdated", body.run("div.item-time -> text")?.trim())
      .set("parserName", this.name);
      
    item.commentScript.set("url", url + "#tab-comment-title", "script",
      `let scLoad = async function () {
        let st =document.createElement("style")
         st.appendChild(document.createTextNode("body>*:not(#novel-comment), #disqus_recommendations{ display:none !important;visibility: hidden;opacity:0;}"))
        document.head.appendChild(st);
        while(!document.getElementById("novel-comment"))
         await window.sleep(100);
         let panel = document.getElementById("novel-comment");
         document.body.appendChild(panel);
      }
      scLoad();
      `);
    let cHhtml = (
      await this.http.get_html(
        this.url
          .join("ajax/chapter-archive")
          .query({
            novelId: html.run("[data-novel-id!=''][data-novel-id] -> attr::data-novel-id")
          }),
        this.url
      )
    ).html;
    item.set("chapters",
      cHhtml
        .$("li a")
        .map(a =>
          ChapterInfo.n().set("name", a.text, "url", a.url("href"), "parserName", this.name)
        )
    );

    return item;
  }
}
