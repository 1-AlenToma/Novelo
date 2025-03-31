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
            "https://mangaberri.com",
            "MangaBerri",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "";
        this.settings.searchEnabled = false;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];

    }

    async load() {
        let html = (
            await this.http.get_html(this.url)
        ).html;

        this.settings.Genre(
            html
                .$(".category-popover a").map(x =>
                    Value.n()
                        .Text(x.text)
                        .Value(x.attr("href"))
                )
        );

        this.settings.Group(
            [
                Value.n()
                    .Text("Top Weekly Manga")
                    .Value("/weekly-manga.php"),
                Value.n()
                    .Text("New Manga")
                    .Value("/new-manga.php")
            ]
        );
        //console.warn([this.settings].niceJson());
        return this.settings;
    }

    async search(options) {
        let url = this.url.join("search.php").query({ keyword: options.text.replace(/ /gmi, "+") });
        if (options.group?.has()) {
            url = this.url.join(options.group.firstOrDefault("value"));
        }

        if (options.genre?.has()) {
            url = this.url.join(options.genre.firstOrDefault("value"));
        }

        let html = (
            await this.http.get_html(url, this.url)
        ).html;
        let data = html.$(".manga-item")
            .map(f => {
                let name = f.findAll(".link").eq(1);
                if (f.find("img").attr("src")?.has())
                    return LightInfo.n()
                        .Name(name.text)
                        .Url(name.url("href"))
                        .Type("Manga")
                        .Image(
                            f.find("img").url("src") || f.find("img").attr("src")
                        )
                        .Info(f.findAll(".link").eq(2).text)
                        .ParserName(this.name);
            }).filter(x => x != undefined)
        // console.warn(JSON.stringify(data, undefined, 4))
        return data;
    }

    async group(value, page) {
        return await this.search(
            SearchDetail.n().Group([value]).Page(page)
        );
    }

    async getByAuthor(url) {
        return []; // no data at the moment
    }

    async chapter(url) {
        let html = (
            await this.http.get_html(url, this.url)
        ).html;
        let imgs = html.first(".reading-container").findAll("img").map(x => `<img src="${x.url("src") || x.attr("src")}"  />`).join("\n");
        return imgs;
    }

    async detail(url) {
        let html = (
            await this.http.get_html(url, this.url)
        ).html;
        let body = html.find(".content-container");

        let item = DetailInfo.n();
        item
            .Name(body.find('.story-name').text)
            .Url(url)
            .Type("Manga")
            .Image(
                body
                    .find('.comic-img')
                    .url("src")
            )
            .Decription(body.find(".story-desc").text)
            .Author(
                body.find('.comic-info-link[href*="author"]')
                    .text
            )
            .AuthorUrl(
                body.find('.comic-info-link[href*="author"]').url("href")
            )
            .Genre(
                body
                    .find('.comic-info-link[href*="genre"]')
                    .map(x => x.text)
            )
            .Status(
                body
                    .find(
                        '.section-status span:contains("Status")'
                    )
                    .parent.find("span:last-child").text
            )
            .Rating(
                body
                    .find(
                        '.section-status span:contains("rating")'
                    )
                    .parent.find("span:last-child").text.replace("rating", "").trim().onEmpty("0.00")
            )
            .LastUpdated(
                body.first('.text:contains("Updated On")').parent.find("span:last-child").text
            )
            .ParserName(this.name);

        const css = `
         body>*:not(#tbl_comments_wrapper){
          display:none !important;
          visibility: hidden;
          opacity:0;
          }

          #tbl_comments_wrapper {
            overflow:none;
            height:100vh !important;
            overflow-y:auto !important;
            -webkit-overflow-scrolling: touch !important;
            display:block !important;
          }
        `.replace(/(\r\n|\n|\r)/gm, "");
        item.commentScript.Url(
            url
        ).Script(`
        let scLoad = async function () {
          let st =document.createElement("style")
           st.appendChild(document.createTextNode("${css}"))
          document.head.appendChild(st);
          while(!document.getElementById("tbl_comments_wrapper"))
           await window.sleep(100);
           let panel = document.getElementById("tbl_comments_wrapper");
           document.body.appendChild(panel);
        }
        scLoad();
        `);

        item.Chapters(
            body.findAll(".chapters-container > a")
                .map(a =>
                    ChapterInfo.n()
                        .Name(a.text)
                        .Url(a.url("href"))
                        .ParserName(this.name)
                ).reverse()
        );

        return item;
    }
}
