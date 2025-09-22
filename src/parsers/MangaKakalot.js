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

export default class MangaKakalot extends Parser {
    constructor() {
        super(
            "https://www.mangakakalot.gg",
            "MangaKakalot",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "";
        this.settings.searchEnabled = false;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];
        this.minVersion = 122;

    }

    async load() {
        let html = (
            await this.http.web_view(this.url)
        ).html;

        this.settings.Genre(
            html.$(".panel-category table td a").filter(x => x.attr("href").has("genre/")).map(x =>
                Value.n()
                    .Text(x.text)
                    .Value(x.attr("href"))
            )
        );

        this.settings.Group(
            [
                Value.n()
                    .Text("Latest Manga")
                    .Value("/manga-list/latest-manga"),
                Value.n()
                    .Text("Hot Manga")
                    .Value("/manga-list/hot-manga"),
                Value.n()
                    .Text("New Manga")
                    .Value("/manga-list/new-manga")
            ]
        );
        //console.warn([this.settings].niceJson());
        return this.settings;
    }



    parse(html) {

        let items = html.$(".panel_story_list .story_item, .truyen-list .list-truyen-item-wrap, .list-comic-item-wrap")
            .map(f => {
                let name = f.find(".story_name a").hasValue ? f.find(".story_name a") : f.first("img").parent;
                let title = name.attr("title").has() ? name.attr("title") : name.text;
                return LightInfo.n()
                    .Name(title)
                    .Url(name.url("href"))
                    .Type("Manga")
                    .Image(f.find("img").url("src", { Referer: this.url + "/" }))
                    .Info(f.first(".story_item_right .story_chapter, .list-story-item-wrap-chapter").text)
                    .ParserName(this.name);
            });

        return items;
    }

    async search(options) {
        let url = this.url.join("search/story/", options.text.replace(/ /g, "_"));
        if (options.group?.has()) {
            url = this.url.join(options.group.lastOrDefault("value"));
        }

        if (options.genre?.has()) {
            url = this.url.join(options.genre.lastOrDefault("value"));
        }

        url = url.query({
            page: options.page
        })

        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        return this.parse(html);
    }

    async group(value, page) {
        return await this.search(
            SearchDetail.n().Group([value]).Page(page)
        );
    }

    async getByAuthor(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;

        return this.parse(html);
    }

    async chapter(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        let imgs = html.findAll(".container-chapter-reader img").map(x => `<img id="${methods.newId()}" src='${x.url("src", { Referer: this.url + "/" })}'  />`).join("\n");
        return imgs; 
    }

    async detail(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        let body = html.find("body");

        let item = DetailInfo.n();
        item
            .Name(body.find('.manga-info-text h1').text)
            .Url(url)
            .Type("Manga")
            .Image(
                body
                    .find('.manga-info-pic img')
                    .url("src", { Referer: this.url + "/" })
            )
            .Decription(body.find("#contentBox").text)
            .Author(
                body.find('.manga-info-text a[href*="author"]')
                    .text
            )
            .AuthorUrl(
                body.find('.manga-info-text a[href*="author"]').url("href")
            )
            .Genre(
                body
                    .find('.manga-info-text[href*="genre"]')
                    .map(x => x.text)
            )
            .Status(
                body
                    .find(
                        '.manga-info-text li:contains("Status")'
                    ).text.safeSplit(":", 1)
            )
            .Rating(
                body
                    .find('#rate_row_cmd').text
            )
            .LastUpdated(
                body.first('.manga-info-text li:contains("Last updated")').text.safeSplit(":", 1)
            )
            .ParserName(this.name);

        item.Chapters(
            body.findAll(".manga-info-chapter .chapter-list a")
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
