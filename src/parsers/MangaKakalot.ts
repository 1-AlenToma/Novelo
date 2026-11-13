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

export default class MangaKakalot extends Parser {
    constructor() {
        super(
            "https://www.mangakakalot.gg",
            "MangaKakalot",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "AnimePlanet";
        this.settings.searchEnabled = false;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];
        this.minVersion = 155;
        this.protected = true;

    }

    async load() {
        let html = (await this.http.web_view(this.url, this.url)).html;

        this.settings.set("genre",
            html.$(".panel-category table td a").filter(x => x.attr("href").has("genre/"))
                .map(x => Value.n()
                    .set("text", x.text)
                    .set("value", x.attr("href")))
        );

        this.settings.set("group",
            [
                Value.n()
                    .set("text", "Latest Manga")
                    .set("value", "/manga-list/latest-manga"),
                Value.n()
                    .set("text", "Hot Manga")
                    .set("value", "/manga-list/hot-manga"),
                Value.n()
                    .set("text", "New Manga")
                    .set("value", "/manga-list/new-manga")
            ]
        );
        //console.warn([this.settings].niceJson());
        return this.settings;
    }



    parse(html: Html) {

        let items = html.$(".panel_story_list .story_item,.truyen-list .list-truyen-item-wrap,.list-comic-item-wrap")
            .map(f => {
                let name = f.find(".story_name a").hasValue ? f.find(".story_name a") : f.first("img").parent;
                let title = name.attr("title").has() ? name.attr("title") : name.text;
                return LightInfo.n()
                    .set("name", title)
                    .set("url", name.url("href"))
                    .set("type", "Manga")
                    .set("image", f.find("img").url("src", { Referer: this.url + "/" }))
                    .set("info", f.run("first::.story_item_right .story_chapter, .list-story-item-wrap-chapter -> text"))
                    .set("parserName", this.name);
            });
        // console.warn("items", items,  html.html)
        return items;
    }

    async search(options: SearchDetail) {
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

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;

        return this.parse(html);
    }

    async chapter(url: string) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        let imgs = html.findAll(".container-chapter-reader img").map(x => `<img id="${methods.newId()}" src='${x.url("src", { Referer: this.url + "/", webView: true })}'  />`).join("\n");
        return imgs;
    }

    async getChapters(uurl) {
        try {
            const url = `https://www.mangakakalot.gg/api/manga/${uurl.safeSplit("/", -1)}/chapters?limit=90000&offset=0`;
            const data = await this.http.get_html(url, this.url);
            const json = data.json;
            if (json.data.chapters.length <= 0)
                return [];
            return json.data.chapters.map(a => ChapterInfo.n()
                .set("name", a.chapter_name)
                .set("url", uurl.join(a.chapter_slug))
                .set("parserName", this.name)).reverse();

        } catch (e) {
            console.error(e)
            return [];
        }
    }

    async detail(url: string) {
        let html = (await this.http.web_view(url, this.url)).removeScripts().html;
        let body = html.find("body");
        let item = DetailInfo.n();
        item
            .set("name", body.run('.manga-info-text h1 -> text'))
            .set("url", url)
            .set("type", "Manga")
            .set("image", body.find('.manga-info-pic img').url("src", { Referer: this.url + "/" }))
            .set("decription", body.run("#contentBox -> text"))
            .set("author", body.run('.manga-info-text a[href*="author"] -> text'))
            .set("authorUrl", body.run('.manga-info-text a[href*="author"] -> url::href'))
            .set("genre", body.run('.manga-info-text[href*="genre"] -> map::text'))
            .set("status", body.run('.manga-info-text li:contains("Status") -> text').safeSplit(":", 1))
            .set("rating", body.run('#rate_row_cmd -> text'))
            .set("lastUpdated", body.run('first::.manga-info-text li:contains("Last updated")').safeSplit(":", 1))
            .set("parserName", this.name);

        item.set("chapters", await this.getChapters(url))

        /*  item.Chapters(
              body.findAll(".manga-info-chapter .chapter-list a")
                  .map(a =>
                      ChapterInfo.n()
                          .Name(a.text)
                          .Url(a.url("href"))
                          .ParserName(this.name)
                  ).reverse()
          );*/
        return item;
    }
}
