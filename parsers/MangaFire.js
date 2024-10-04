const {
  HttpHandler,
  Html,
  Value,
  ChapterInfo,
  LightInfo,
  DetailInfo,
  ParserDetail,
  SearchDetail,
  Parser
} = require("../native");

export default class MangaFire extends Parser {
  constructor() {
    super(
      "https://mangafire.to",
      "MangaFire",
      "/assets/sites/mangafire/favicon.png?v3"
    );
    this.protectedChapter = true;
    this.settings.searchEnabled = true;
    this.settings.genreMultiSelection = false;
    this.settings.searchCombination = [
      "Genre",
      "Status",
      "Group"
    ];
  }

  async load() {
    let html = (
      await this.http.get_html(this.url)
    ).html;

    this.settings.Genre(
      html
        .$(".lg a")
        .filter(x =>
          x.attr("href").has("genre/")
        )
        .map(x =>
          Value.n()
            .Text(x.text)
            .Value(x.attr("href").split("/").lastOrDefault())
        )
    );

    this.settings.Status([
      Value.n()
        .Text("Completed")
        .Value("completed")
    ]);

    this.settings.Group(
      html
        .$("#nav-menu a")
        .filter(x =>
          x.attr("href").has("type/")
        )
        .map(x =>
          Value.n()
            .Text(x.text)
            .Value(x.attr("href").split("/").lastOrDefault())
        )
    );
    //console.warn([this.settings].niceJson());
    return this.settings;
  }

  async search(options) {
    let url = this.url.join(
      `filter?keyword=${options.text}&sort=recently_updated&page=${options.page}`
    );
    
    if (options.genre.has())
      url = url.query({"genre%5B%5D":options.genre.lastOrDefault("value")
      });
   if (options.group.has())
      url = url.query({"type%5B%5D":options.group.lastOrDefault("value")
      });
    
    if (options.status.has())
      url = url.query({"status%5B%5D":options.status.lastOrDefault("value")
      });
    
    url = url.query({
      page: (1).sureValue(options.page)
    });

    let html = (
      await this.http.get_html(url, this.url)
    ).html;
    return html
      .$(".card-lg > .unit")
      .map(f => {
          if (f.find(".poster img").attr("src").has())
            return LightInfo.n()
              .Name(f.find(".info >a").text)
              .Url(
                f
                  .find(".info a")
                  .url("href")
              ).Type(f.find(".type").text)
              .Image(
                f
                  .find(".poster img")
                  .url("src")
                  .imageUrlSize("200x250")
              )
              .Info(f.find(".content li:first-child >a").text)
              .ParserName(this.name);
      }).filter(x=> x != undefined)
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
      .$(".card-lg > .unit")
      .map(f => {
          if (f.find(".poster img").attr("src").has())
            return LightInfo.n()
              .Name(f.find(".info >a").text)
              .Url(
                f
                  .find(".info a")
                  .url("href")
              ).Type(f.find(".type").text)
              .Image(
                f
                  .find(".poster img")
                  .url("src")
                  .imageUrlSize("200x250")
              )
              .Info(f.find(".content li:first-child >a").text)
              .ParserName(this.name);
      }).filter(x=> x != undefined)
  }

  async chapter(html) {
    
  
    let chContent=  html.$("body").find("main");
    if(chContent.find('img[data-number]').hasValue)
    {
      let items = chContent.find('img[data-number]').map(x=>{
        let src = x.attr("src");
        let img = `<img src="${x.url("src") || src}" />`
        return img;
      }).join("<br />");
      console.warn(items);
      if(items.indexOf(`src=""`)!=-1){
        return false;
      }
      return items
    }
    
    console.warn(html.$("body").html);
    return chContent.html;
  }

  async detail(url) {
    let html = (
      await this.http.get_html(url, this.url)
    ).html;
    let body = html.$("body");

    let item = DetailInfo.n();
    item
      .Name(body.find('[itemprop="name"]').text)
      .Url(url)
      .Type(body
          .find('.min-info a[href*="type"]')
          .text)
      .Image(
        body
          .find('[itemprop="image"]')
          .url("src")
          .imageUrlSize("200x250")
      )
      .Decription(body.find(".description").text)
      .AlternativeNames(
        body
          .find(
            '.info > h6'
          ).text
      )
      .Author(
        body.find('#info-rating .meta [itemprop="author"]')
          .text
      )
      .AuthorUrl(
        body.find('#info-rating .meta [itemprop="author"]').url("href")
      )
      .Genre(
        body
          .find('#info-rating a[href*="genre"]')
          .map(x => x.text)
      )
      .Status(
        body
          .find(
            '#info-rating span:contains("Published")'
          )
          .parent.text.indexOf("?") ==-1 ? "Completed" : "Ongoing"
      )
      .Rating(
        body.find('span[itemprop="ratingValue"]')
          .text
      )
      .LastUpdated(
        ""
      )
      .ParserName(this.name);
    item.commentScript.Url(
      url
    ).Script(`
      let scLoad = async function () {
        let st =document.createElement("style")
         st.appendChild(document.createTextNode("body>*:not(.default-style), #disqus_recommendations{ display:none !important;visibility: hidden;opacity:0;}"))
        document.head.appendChild(st);
        while(!document.getElementById("disqus_thread"))
         await window.sleep(100);
         let panel = document.getElementById("disqus_thread");
         document.body.appendChild(panel);
      }
      scLoad();
      `);
    
    item.Chapters(
      body.find(".list-body .item a")
        .map(a =>
          ChapterInfo.n()
                .Name(a.attr("title"))
                .Url(a.url("href"))
                .ParserName(this.name)
            ).reverse()
    );

    return item;
  }
}
