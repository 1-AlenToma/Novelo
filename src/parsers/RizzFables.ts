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


export default class RizzFables extends Parser {
    async getByAuthor(url: string) {
        return [] as LightInfo[]
    }
    constructor() {
        super(
            "https://rizzfables.com",
            "RizzFables",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "AnimePlanet";
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = true;
        this.settings.searchCombination = ["Genre", "Group", "Status"];
        this.minVersion = 155;
        this.protected = false;

    }

    async load() {
        let html = (
            await this.http.get_html(this.url.join("series"), this.url)
        ).html;

        this.settings.set("genre",
            html.$("input[name='genre[]']").map(x =>
                Value.n()
                    .set("text", x.parent.find("label").text.displayName())
                    .set("value", x.attr("value"))
            )
        );

        this.settings.set("status", [
            Value.n()
                .set("text", "Completed")
                .set("value", "completed"),
            Value.n()
                .set("text", "OnGoing")
                .set("value", "ongoing")
        ]);

        this.settings.set("group",
            [
                Value.n()
                    .set("text", "Latest")
                    .set("value", "latest"),
                Value.n()
                    .set("text", "Updated")
                    .set("value", "update"),
                Value.n()
                    .set("text", "Popular")
                    .set("value", "popular")
            ]
        );
        // console.warn([this.settings].niceJson());
        return this.settings;
    }



    parse(json?: any[]) {

        let items = (json ?? []).map(f => {
            return LightInfo.n()
                .set("name", f.title)
                .set("url", this.url.join("series", `r2311170-` + f.title.toLowerCase().trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")))
                .set("type", "Manga")
                .set("image", this.url.join("assets/images", f.image_url))
                .set("info", "Chapter " + (f.latest_chapter_title || f.chapters_count || f.chapter_title || ""))
                .set("parserName", this.name);
        });
        // console.warn("items", items,  html.html)
        return items;
    }

    async search(options: SearchDetail) {


        let url = "/Index/filter_series"
        let form = new FormData();
        if (options.text?.has() != true) {
            form.append("StatusValue", options.status?.lastOrDefault("value") || "all");
            form.append("TypeValue", "all");
            form.append("OrderValue", options.group?.lastOrDefault("value") || "all");
            options.genre?.forEach(x => form.append("genres_checked[]", x.value));
        } else {
            url = "/Index/live_search"
            form.append("search_value", options.text);
        }



        let html = (
            await this.http.encodedPostWeb_view(this.url, {
                url: url,
                query: form,
                type: "post",
                method: "formPost"
            })
        ).json;
        return this.parse(html);
    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async chapter(url: string) {
        let html = (await this.http.get_html(url, this.url)).html;

        let imgs = html.findAll("#readerarea img")
            .map(x => `<img id="${methods.newId()}" src='${x.url("src", { Referer: this.url + "/" }, x => x.trimStr(" ", "_").trim())}'  />`).join("\n");
        return imgs;
    }


    async detail(url: string) {
        let html = (await this.http.web_view(url, this.url)).html;
        let body = html.find("body");

        let item = DetailInfo.n();
        const imptd = body.findAll(".imptdt");
        item
            .set("name", body.run('.entry-title -> text'))
            .set("alternativeNames", body.run(".alternative -> text"))
            .set("url", url)
            .set("type", imptd.find(x => x.text.has("type") && x.text.has("Novel")).hasValue ? "Novel" : "Manga")
            .set("image", body.find('.thumb > img').url("src", { Referer: this.url + "/" }))
            .set("decription", body.run("#description-container -> text"))
            .set("author", imptd.find(x => x.text.has("Author")).run("i -> text"))
            .set("authorUrl", undefined)
            .set("genre", body.run('findAll::.mgen a[href*="genre"] -> map::text'))
            .set("status", imptd.find(x => x.text.has("Status")).run("i -> text"))
            .set("rating", "")
            .set("lastUpdated", imptd.find(x => x.text.has("Updated On")).run("i -> text"))
            .set("parserName", this.name);



        item.set("chapters",
            body.findAll("#chapterlist li")
                .map(a => {
                    const dNmum = a.attr("data-num")
                    return ChapterInfo.n()
                        .set("name", dNmum.has() ? `Chapter ${dNmum}` : a.run("a span:first-child -> remove::i -> text").replace(/\r?\n|\r/g, ""))
                        .set("url", a.run("a -> url::href"))
                        .set("parserName", this.name)
                }).reverse()
        );
        return item;
    }
}
