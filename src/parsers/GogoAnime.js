const {
    HttpHandler,
    Html,
    Value,
    ChapterInfo,
    LightInfo,
    DetailInfo,
    ParserDetail,
    SearchDetail,
    Parser,
    ChapterDetail
} = require("../native");


export default class GogoAnime extends Parser {
    constructor() {
        super(
            "https://gogoanime.by",
            "GoGoAnime.by",
            "/img/favicon.ico",
            "Anime"
        );
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = false;
        this.infoGeneratorName = "MyAnimeList";
        this.settings.searchCombination = ["Genre", "Status", "Group"];
    }

    async load() {
        let html = (
            await this.http.get_html(this.url)
        ).html;

        this.settings.Genre(
            html
                .$("input[name*='genre']")
                .map(x =>
                    Value.n()
                        .Text(x.attr("value"))
                        .Value(x.attr("value"))
                ).filter(x => x.text.length > 0)
        );

        this.settings.Status(html
            .$("input[name*='status']")
            .map(x =>
                Value.n()
                    .Text(x.attr("value"))
                    .Value(x.attr("value"))
            ).filter(x => x.text.length > 0));

        this.settings.Group(
            html
                .$("input[name*='type']")
                .map(x =>
                    Value.n()
                        .Text(x.attr("value"))
                        .Value(x.attr("value"))
                ).filter(x => x.text.length > 0)
        );



        return this.settings;
    }

    async search(options) {
        let url = this.url.join(`/?s=${options.text.replace(/ /gim, "+")}`);
        //series/?genre%5B%5D=action&status=&type=Movie&order=
        if (options.text.startsWith("#"))
            url = this.url.join("/tag", options.text.substring(1).toUpperCase())
        if (options.genre.has() || options.group.has() || options.status.has()) {
            url = this.url.join("/series/?")
        }

        let q = {};

        if (options.genre.has())
            options.genre.map((x, index) => q[`$${index}genre%5B%5D`] = x.value)

        if (options.status.has())
            q.status = options.status.lastOrDefault("value");

        if (options.group.has())
            q.type = options.group.lastOrDefault("value");

        url = url.query({ page: (1).sureValue(options.page), ...q });

        let html = (await this.http.get_html(url, this.url)).html;
        let data = html
            .$(".listupd a")
            .map(x => {
                return x.map(f => {
                    if (f.find("img").attr("src|data-src").has())
                        return LightInfo.n()
                            .Name(f.find("h2").text)
                            .Url(f.url("href"))
                            .Image(
                                f.find("img").url("src|data-src")
                            )
                            .Info(f.find(".typez").text)
                            .LangType(f.find(".sb").text)
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
        return [];
    }

    async chapter(html) {
        return {
            css: `
        body>*:not(.mvelement):not(video), .naveps{
            display:none !important;
            visibility:hidden !important;
        }
        
        `,
            script: `
          const loadData = async()=>{
                  while(document.querySelector(".mvelement") == null)
                    await window.sleep(100);
                const panel = document.querySelector(".mvelement");
                document.body.appendChild(panel); 
            }
            loadData();
        `,
            clickExceptions: [".servers", ".mvelement"]
        }
    }

    async detail(url) {
        let html = (await this.http.get_html(url, this.url)).html;
        let body = html.$("body");

        let item = DetailInfo.n();
        item
            .Name(body.find(".entry-title").text)
            .Url(url)
            .Image(body.find(".thumb img").url("src|data-src"))
            .Author(body.find('.author i').text)
            .Genre(body.find('.genxed a').map(x => x.text))
            .Status(body.find('.spe b:contains("Status")').parent.remove("b").text)
            .LastUpdated(body.find("time[itemprop='dateModified']").text?.trim())
            .Decription(body.find(".infox .ninfo").text)
            .ParserName(this.name)
            .Chapters(body.find(".episodes-container a").map(a => ChapterInfo.n()
                .Name(a.text)
                .Url(a.url("href"))
                .ParserName(this.name)).reverse()).set
        item.novelUpdateRecommendations =
            item.novelUpdateRecommendations = body
                .find('.listupd a')
                .map(f => LightInfo.n()
                    .Name(f.find("h2").text)
                    .Url(f.url("href"))
                    .Image(
                        f.find("img").url("src|data-src")
                    )
                    .Info(f.find(".typez").text)
                    .LangType(f.find(".sb").text)
                    .ParserName(this.name));

        item.commentScript.Url(
            url + "#tab-comment-title"
        ).Script(`
          let scLoad = async function () {
            let st =document.createElement("style")
             st.appendChild(document.createTextNode("body>*:not(.cmd_comment) { display:none !important;visibility: hidden;opacity:0;}"))
            document.head.appendChild(st);
            while(!document.querySelector(".commentx"))
             await window.sleep(100);
             let panel = document.querySelector(".commentx").parentElement;
             panel.classList.add("cmd_comment")
             document.body.appendChild(panel);
          }
          scLoad();
          `);
        return item;
    }
}
