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
        this.minVersion = 155;

    }

    async load() {
        let html = (await this.http.get_html(this.url.join("browse"))).html;

        this.settings.set("genre",
            html
                .$("select[name='genre'] option").map(x =>
                    Value.n()
                        .set("text", x.text)
                        .set("value", encodeURIComponent(x.attr("value").has() ? x.attr("value") : x.text).replace(/%20/g, "+"))
                ));

        this.settings.set("group",
            [
                Value.n()
                    .set("text", "Latest")
                    .set("value", "latest"),
                Value.n()
                    .set("text", "Popular")
                    .set("value", "popular")
            ]
        );


        this.settings.set("status",
            html
                .$("select[name='status'] option").map(x =>
                    Value.n()
                        .set("text", x.text)
                        .set("value", encodeURIComponent(x.attr("value").has() ? x.attr("value") : x.text).replace(/%20/g, "+"))
                ));
        //console.warn([this.settings].niceJson());
        return this.settings;
    }

    async search(options: SearchDetail) {
        let url = this.url.join("browse").query({
            q: options.text.replace(/ /gmi, "+"),
            sort: options.genre?.firstOrDefault("value") ?? "Latest",
            status: options.status?.firstOrDefault("value") ?? "",
            genre: options.genre.firstOrDefault("value") ?? ""
        });

        let html = (
            await this.http.get_html(url, this.url)
        ).html;
        let data = html.$(".manga-card")
            .map(f => {
                let name = f.findAll("h3");
                if (f.run("img -> attr::src")?.has())
                    return LightInfo.n()
                        .set("name", f.run("h3 -> text"))
                        .set("url", f.run("a -> url::href"))
                        .set("type", "Manga")
                        .set("image", f.run("img -> url::src") || f.run("img -> attr::src"))
                        .set("info", f.run(".card-meta span:last-child -> text"))
                        .set("parserName", this.name);
            }).filter(x => x != undefined)
        //  console.warn(JSON.stringify(data, undefined, 4))
        return data;
    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        return []; // no data at the moment
    }

    async chapter(url: string) {
        let html = (await this.http.get_html(url, this.url)).html;

        let imgs = html.run("first::.reader-pages -> findAll::img").map(x => `<img src="${x.url("src") || x.attr("src")}"  />`).join("\n");
        return imgs;
    }

    async detail(url: string) {
        let html = (await this.http.get_html(url, this.url)).html;

        let body = html.find(".container");

        let item = DetailInfo.n();
        item
            .set("name", body.run('.detail h1 -> text'))
            .set("url", url)
            .set("type", "Manga")
            .set("image", body.run('.detail img -> url::src'))
            .set("decription", body.run(".detail .synopsis -> text"))
            .set("author", "")
            .set("authorUrl", "")
            .set("genre", body.run('.detail .tags a -> map::text'))
            .set("status", body.run('.detail div:contains("ongoing ") -> hasValue') ? "Ongoing" : "completed")
            .set("rating", body.run('.rating-summary -> text').replace("rating", "").trim().onEmpty("0.00"))
            .set("lastUpdated", "")
            .set("parserName", this.name);



        item.set("chapters",
            body.findAll(".chapter-list > a")
                .map(a =>
                    ChapterInfo.n()
                        .set("name", a.text)
                        .set("url", a.url("href"))
                        .set("parserName", this.name)
                ).reverse()
        );

        return item;
    }
}
