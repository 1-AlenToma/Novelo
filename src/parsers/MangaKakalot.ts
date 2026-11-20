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
            "https://www.katamanga.com",
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
        let html = (await this.http.web_view(this.url.join("genre/all"), this.url)).html;

        this.settings.set("genre",
            html.$("div a").filter(x => x.attr("href").has("genre/"))
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

        let items = html.$(".grid .group")
            .map(f => {
                let name = f.find("h3 a").hasValue ? f.find("h3 a") : f.first("a").parent;
                let title = name.attr("title").has() ? name.attr("title") : name.text;
                return LightInfo.n()
                    .set("name", title)
                    .set("url", name.url("href"))
                    .set("type", "Manga")
                    .set("image", f.find("img").url("src", { Referer: this.url + "/" }))
                    .set("info", f.run(".absolute.bottom-1.5 -> text"))
                    .set("parserName", this.name);
            });
        // console.warn("items", items,  html.html)
        return items;
    }

    async search(options: SearchDetail) {
        let url = this.url.join("search/");
        if (options.group?.has()) {
            url = this.url.join(options.group.lastOrDefault("value"));
        }

        if (options.genre?.has()) {
            url = this.url.join(options.genre.lastOrDefault("value"));
        }

        url = url.query({
            page: options.page,
            q: options.text.replace(/ /g, "_")
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
            await this.http.web_view(url, this.url, {
                props: {
                    timer: 2000,
                    selector: "div[data-reader-column='true']",
                    imageSelector: {
                        selector: "div[data-reader-column='true'] img",
                        attr: "src",
                        parserName: this.name
                    }
                }
            })
        ).removeScripts().html;
        let imgs = html.findAll("div[data-reader-column='true'] img")
            .map(x => `<img id="$id" src='$src' />`.formatString(methods.newId(), x.attr("src")))
        return imgs.join("\n");
    }

    async getChapters(uurl) {
        try {
            const url = `https://www.mangakakalot.gg/api/manga/$url/chapters?limit=90000&offset=0`.formatString(uurl.safeSplit("/", -1));
            const data = await this.http.get_html(url, this.url);
            const json = data.json;
            if (json.data.chapters.length <= 0)
                return [];
            return json.data.chapters.map(a => ChapterInfo.n()
                .set("name", a.chapter_name)
                .set("url", uurl.join(a.chapter_slug))
                .set("parserName", this.name)).reverse();

        } catch (e) {
            console.error("getChapters", e)
            return [];
        }
    }

    async detail(url: string) {
        let html = (await this.http.web_view(url, this.url)).removeScripts().html;
        let body = html.find("body");
        let item = DetailInfo.n()
            .set("name", body.run('.container h1 -> text'))
            .set("url", url)
            .set("type", "Manga")
            .set("image", body.find('img.object-cover, img').url("src", { Referer: this.url + "/" }))
            .set("decription", body.run(".prose-summary -> text"))
            //.set("author", body.run('.manga-info-text a[href*="author"] -> text'))
            //.set("authorUrl", body.run('.manga-info-text a[href*="author"] -> url::href'))
            .set("genre", body.run('.container a[href*="genre"] -> map::text'))
            .set("status", body.find('span:contains("Ongoing")').hasValue ? "Ongoing" : "Completed")
            //.set("rating", body.run('#rate_row_cmd -> text'))
            // .set("lastUpdated", body.run('first::.manga-info-text li:contains("Last updated") -> text').safeSplit(":", 1))
            .set("parserName", this.name);
        item.set("chapters", await this.getChapters(url))

        return item;
    }
}
