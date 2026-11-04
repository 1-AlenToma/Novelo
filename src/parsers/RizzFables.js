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

export default class RizzFables extends Parser {
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
        this.minVersion = 139;
        this.protected = false;

    }

    async load() {
        let html = (
            await this.http.get_html(this.url.join("series"), this.url)
        ).html;

        this.settings.Genre(
            html.$("input[name='genre[]']").map(x =>
                Value.n()
                    .Text(x.parent.find("label").text.displayName())
                    .Value(x.attr("value"))
            )
        );

        this.settings.Status([
            Value.n()
                .Text("Completed")
                .Value("completed"),
            Value.n()
                .Text("OnGoing")
                .Value("ongoing")
        ]);

        this.settings.Group(
            [
                Value.n()
                    .Text("Latest")
                    .Value("latest"),
                Value.n()
                    .Text("Updated")
                    .Value("update"),
                Value.n()
                    .Text("Popular")
                    .Value("popular")
            ]
        );
        // console.warn([this.settings].niceJson());
        return this.settings;
    }



    parse(json) {

        let items = (json ?? []).map(f => {
            return LightInfo.n()
                .Name(f.title)
                .Url(this.url.join("series", `r2311170-` + f.title.toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")))
                .Type("Manga")
                .Image(this.url.join("assets/images", f.image_url))
                .Info("Chapter " + (f.latest_chapter_title || f.chapters_count || f.chapter_title || ""))
                .ParserName(this.name);
        });
        // console.warn("items", items,  html.html)
        return items;
    }

    async search(options) {


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

    async group(value, page) {
        return await this.search(
            SearchDetail.n().Group([value]).Page(page)
        );
    }

    async chapter(url) {
        let html = (
            await this.http.get_html(url, this.url)
        ).html;
        let imgs = html.findAll("#readerarea img").map(x => `<img id="${methods.newId()}" src='${x.url("src", { Referer: this.url + "/" }, x => x.trimStr(" ", "_").trim())}'  />`).join("\n");
        return imgs;
    }


    async detail(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        let body = html.find("body");

        let item = DetailInfo.n();
        const imptd = body.findAll(".imptdt");
        item
            .Name(body.find('.entry-title').text)
            .AlternativeNames(body.find(".alternative").text)
            .Url(url)
            .Type(imptd.find(x => x.text.has("type") && x.text.has("Novel")).hasValue ? "Novel" : "Manga")
            .Image(
                body
                    .find('.thumb > img')
                    .url("src", { Referer: this.url + "/" })
            )
            .Decription(body.find("#description-container").text)
            .Author(imptd.find(x => x.text.has("Author")).find("i").text)
            .AuthorUrl(
                undefined
            )
            .Genre(
                body.findAll('.mgen a[href*="genre"]').map(x => x.text)
            )
            .Status(
                imptd.find(x => x.text.has("Status")).find("i").text
            )
            .Rating(
                ""
            )
            .LastUpdated(
                imptd.find(x => x.text.has("Updated On")).find("i").text
            ).ParserName(this.name);



        item.Chapters(
            body.findAll("#chapterlist li")
                .map(a => {
                    const dNmum = a.attr("data-num")
                    return ChapterInfo.n()
                        .Name(dNmum.has() ? `Chapter ${dNmum}` : a.find("a span:first-child").remove("i").text.replace(/\r?\n|\r/g, ""))
                        .Url(a.find("a").url("href"))
                        .ParserName(this.name)
                }).reverse()
        );
        return item;
    }
}
