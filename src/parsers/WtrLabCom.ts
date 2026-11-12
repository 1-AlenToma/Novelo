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


export default class WTRLabCom extends Parser {
    constructor() {
        super(
            "https://wtr-lab.com/en",
            "WTRLab.com",
            "/img/favicon.ico"
        );

        this.minVersion = 155;
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];
        this.protected = true;
        this.baseUrl = "https://wtr-lab.com";
    }

    async load() {
        let html = (
            await this.http.web_view(this.url.join("novel-list"))
        ).html;

        this.settings.set("genre",
            html
                .$(".genre-filter > span")
                .map((x, index) =>
                    Value.n()
                        .set("text", x.text)
                        .set("value", this.url.join(index > 0 ? `novel-list?genre=${index}` : "novel-list"))
                )
        );

        this.settings.set("group", [
            Value.n()
                .set("text", "New")
                .set("value", "novel-list"),
            Value.n()
                .set("text", "Trending")
                .set("value", "trending")
        ]
        );

        return this.settings;
    }

    toList(html: Html) {
        // console.warn(html.$(".series-list > div").length)
        return html
            .$(".series-list div[data-slot='card']").map(f => {
                if (f.run(".image-wrap img -> attr::src").has())
                    return LightInfo.n()
                        .set("name", f.run("a h3 -> remove::.rawtitle -> text"))
                        .set("url", f.run("a h3 -> parent -> url::href"))
                        .set("image", f.find(".image-wrap img").url("src", { Referer: this.baseUrl + "/", webView: true }))
                        .set("info", f.run(".items-center > span:contains('Chapters') -> parent -> text"))
                        .set("decription", f.run(".description -> text"))
                        .set("parserName", this.name);
            }).filter(x => x != undefined);
    }

    async search(options: SearchDetail) {
        let url = this.url.join(`novel-finder?text=${options.text.replace(/ /g, "+")}`);

        if (options.genre.has())
            url = this.baseUrl.join(options.genre.lastOrDefault("value"));
        else if (options.group.has())
            url = this.baseUrl.join(options.group.lastOrDefault("value"));
        url = url.query({ page: (1).sureValue(options.page) });

        let html = (await this.http.web_view(url, this.baseUrl)).html;

        return this.toList(html);

    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        let html = (await this.http.web_view(url, this.baseUrl)).html;
        return this.toList(html);
    }

    async chapter(url: string) {
        url = url.query({ service: "webplus" });
        let html = (await this.http.web_view(url, this.baseUrl, {
            props: {
                timer: 1500
            }
        })).html;
        return html.run(".chapter-tracker.active -> find::.chapter-body -> html").replace(/<div/gim, "<p").replace(/div>/gim, "p>");
    }

    async detail(url: string) {
        try {
            let html = (await this.http.web_view(url, this.baseUrl, {
                props: {
                    timer: 100
                }
            })).html;
            let body = html.$("body");

            let item = DetailInfo.n();
            item
                .set("name", body.run("h1 -> text"))
                .set("url", url)
                .set("image", body.first(".image-wrap img").url("src", { Referer: this.baseUrl + "/", webView: true }))
                .set("decription", body.run(".description -> text"))
                .set("alternativeNames", body.run('h1 -> parent -> find::p -> text'))
                .set("author", body.run<string[]>('first::span:contains("Author") -> parent -> find::div a -> map::text').join(","))
                .set("authorUrl", body.run('first::span:contains("Author") -> parent -> first::div a -> url::href'))
                .set("genre", body.run('a[href*="genre"] -> map::text'))
                .set("tags", body.run('a[href*="novel-finder?ti"] -> map::text'))
                .set("status", body.run('span:contains("Status") -> parent -> find::span:last-child -> text'))
                .set("rating", body.run("first::span:contains('Rating') -> parent -> first::div -> text"))
                .set("lastUpdated", body.run('span:contains("Date Added") -> parent -> first::div -> text')?.trim())
                .set("parserName", this.name);
            const id = url.split("/novel/")[1].split("/")[0];

            let cHhtml = (
                await this.http.web_view(
                    url,
                    this.baseUrl,
                    {
                        props: {
                            timer: 100,
                            ajax: {
                                url: this.baseUrl.join("api/chapters", id),
                                method: "formPost",
                                type: "get"
                            }
                        }
                    }
                )
            ).json;

            item.set("chapters",
                cHhtml.chapters.map((a, index) =>
                    ChapterInfo.n()
                        .set("name", a.title)
                        .set("url", url.join(`chapter-${index + 1}`))
                        .set("parserName", this.name)
                )
            );

            return item;
        } catch (e) {
            console.error(e)
            throw e;
        }
    }
}
