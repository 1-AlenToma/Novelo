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


export default class NovelBinCom extends Parser {
  constructor() {
    super(
      "https://novelbin.com",
      "NovelBin.com",
      "/img/favicon.ico"
    );
    this.settings.searchEnabled = true;
    this.settings.genreMultiSelection = false;
    this.settings.searchCombination = ["Genre", "Status"];
  }

  async load() {
    let html = (
      await this.http.get_html(this.url)
    ).html;

    this.settings.Genre(
      html
        .$(".dropdown-menu a")
        .filter(x =>
          x.attr("href").has("genre/")
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
        .$(".navbar-nav .dropdown-menu a")
        .filter(x =>
          x.attr("href").has("sort/")
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
      `/search?keyword=${options.text}`
    );

    if (options.text.startsWith("#"))
      url = this.url.join("/tag", options.text.substring(1).toUpperCase())

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

    let html = (await this.http.get_html(url, this.url)).html;
    let data = html
      .$(".list-novel > .row")
      .map(x => {
        return x.map(f => {
          if (f.find(".cover").attr("src|data-src").has())
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
                  .url("src|data-src")
                  .replace(/(novel_)(\d+)_(\d+)/g, "novel")
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
    return data;
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
          if (f.find(".cover").attr("src|data-src").has())
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
                  .url("src|data-src").replace(/(novel_)(\d+)_(\d+)/g, "novel")
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
    return html.$(".chr-c").remove(".unlock-buttons").html;
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
          .url("src|data-src")
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
        body.find('.info-meta a[href*="/a/"]')
          .text
      )
      .AuthorUrl(
        body
          .find('.info-meta a[href*="/a/"]')
          .url("href")
      )
      .Genre(
        body
          .find('.info-meta a[href*="genre"]')
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
      .ParserName(this.name)
      .Tags(body.find(".tag-container a").map(x => x.text));
    item.commentScript.Url(
      url + "#tab-comment-title"
    ).Script(`
        let scLoad = async function () {
          let st =document.createElement("style")
           st.appendChild(document.createTextNode("body>*:not(.comment-box-novelbin), #disqus_recommendations{ display:none !important;visibility: hidden;opacity:0;}"))
          document.head.appendChild(st);
          while(!document.querySelector(".comment-box-novelbin"))
           await window.sleep(100);
           let panel = document.querySelector(".comment-box-novelbin");
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
        .$("li a")
        .map(a =>
          ChapterInfo.n()
            .Name(a.text)
            .Url(a.url("href"))
            .ParserName(this.name)
        )
    );
    return item;
  }
}
