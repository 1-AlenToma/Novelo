const {
  HttpHandler,
  html,
  Value,
  ChapterInfo,
  LightInfo,
  DetailInfo,
  ParserDetail,
  SearchDetail,
  Parser
} = require("../native");

export default class ReadNovelFull extends Parser {
  constructor() {
    super(
      "https://readnovelfull.com",
      "ReadNovelFull",
      "/img/favicon.ico"
    );
    this.settings.searchEnabled = true;
    this.settings.genreMultiSelection = false;
    this.settings.searchCombination = [
      "Genre",
      "Status"
    ];
  }

  async load() {
    let html = (
      await this.http.get_html(this.url)
    ).html;

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

  async search(options) {
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
          if (f.find(".cover").attr("src").has())
            return LightInfo.n()
              .Name(f.find(".novel-title").text)
              .Url(
                f
                  .find(".novel-title a")
                  .url("href")
              )
              .Image(
                f
                  .find(".cover")
                  .url("src")
                  .imageUrlSize("200x250")
              )
              .Info(f.find(".chr-text").text)
              .Decription(f.find(".author").text)
              .IsNew(
                f.find(".label-new").hasValue
              )
              .ParserName(this.name);
        });
      })
      .flatMap(x => x);
  }

  async group(value, page) {
    return await this.search(
      SearchDetail.n().Group([value]).Page(page)
    );
  }

  async getByAuthor(url) {
    let html = (
      await this.http.get_html(url, this.url)
    ).html;
    return html
      .$(".list-novel > .row")
      .map(x => {
        return x.map(f => {
          if (f.find(".cover").attr("src").has())
            return LightInfo.n()
              .Name(f.find(".novel-title").text)
              .Url(
                f
                  .find(".novel-title a")
                  .url("href")
              )
              .Image(
                f
                  .find(".cover")
                  .url("src")
                  .imageUrlSize("200x250")
              )
              .Info(f.find(".chr-text").text)
              .Decription(f.find(".author").text)
              .IsNew(
                f.find(".label-new").hasValue
              )
              .ParserName(this.name);
        });
      })
      .flatMap(x => x);
  }

  async chapter(url) {
    let html = (await this.http.get_html(url))
      .html;
    return html.$(".chr-c").html;
  }

  async detail(url) {
    let html = (
      await this.http.get_html(url, this.url)
    ).html;
    let body = html.$("body");

    let item = DetailInfo.n();
    item
      .Name(body.find(".books .title").text)
      .Url(url)
      .Image(
        body
          .find(".books img")
          .url("src")
          .imageUrlSize("200x250")
      )
      .Decription(body.find(".desc-text").text)
      .AlternativeNames(
        body
          .find(
            '.info-meta li h3:contains("Alternative")'
          )
          .parent.remove("h3").text
      )
      .Author(
        body.find('.info-meta a[href*="authors"]')
          .text
      )
      .AuthorUrl(
        body
          .find('.info-meta a[href*="authors"]')
          .url("href")
      )
      .Genre(
        body
          .find('.info-meta a[href*="genres"]')
          .map(x => x.text)
      )
      .Status(
        body
          .find(
            '.info-meta li h3:contains("Status")'
          )
          .parent.find("a").text
      )
      .Rating(
        body.find('span[itemprop="ratingValue"]')
          .text
      )
      .LastUpdated(
        body.find("div.item-time").text?.trim()
      )
      .ParserName(this.name);
    item.commentScript.Url(
      url + "#tab-comment-title"
    ).Script(`
      let scLoad = async function () {
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
            novelId: html
              .$("[data-novel-id]")
              .attr("data-novel-id")
          }),
        this.url
      )
    ).html;
    item.Chapters(
      cHhtml
        .$(".list-chapter")
        .map(x =>
          x
            .find("a")
            .map(a =>
              ChapterInfo.n()
                .Name(a.attr("title"))
                .Url(a.url("href"))
                .ParserName(this.name)
            )
        )
        .flatMap(x => x)
    );

    return item;
  }
}
