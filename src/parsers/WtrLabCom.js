const {
    HttpHandler,
    html,
    Value,
    ChapterInfo,
    LightInfo,
    DetailInfo,
    ParserDetail,
    SearchDetail,
    Parser
} = require("../native");


export default class WTRLabCom extends Parser {
    constructor() {
        super(
            "https://wtr-lab.com/en",
            "WTRLab.com",
            "/img/favicon.ico"
        );
        this.minVersion = 143;
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

        this.settings.Genre(
            html
                .$(".genre-filter > span")
                .map((x, index) =>
                    Value.n()
                        .Text(x.text)
                        .Value(this.url.join(index > 0 ? `novel-list?genre=${index}` : "novel-list"))
                )
        );

        this.settings.Group([
            Value.n()
                .Text("New")
                .Value("novel-list"),
            Value.n()
                .Text("Trending")
                .Value("trending")
        ]
        );

        return this.settings;
    }

    toList(html) {
        // console.warn(html.$(".series-list > div").length)
        return html
            .$(".series-list div[data-slot='card']").map(f => {
                if (f.find(".image-wrap img").attr("src").has())
                    return LightInfo.n()
                        .Name(f.find("a h3").remove(".rawtitle").text)
                        .Url(f.find("a h3").parent.url("href"))
                        .Image(f.find(".image-wrap img").url("src", { Referer: this.baseUrl + "/", webView: true }))
                        .Info(f.find(".items-center > span:contains('Chapters')").parent.text)
                        .Decription(f.find(".description").text)
                        .ParserName(this.name);
            }).filter(x => x != undefined);
    }

    async search(options) {
        let url = this.url.join(
            `novel-finder?text==${options.text.replace(/ /g, "+")}`
        );

        if (options.genre.has())
            url = this.baseUrl.join(
                options.genre.lastOrDefault("value")
            );
        else if (options.group.has())
            url = this.baseUrl.join(
                options.group.lastOrDefault("value")
            );
        url = url.query({
            page: (1).sureValue(options.page)
        });

        let html = (
            await this.http.web_view(url, this.baseUrl)
        ).html;

        return this.toList(html);

    }

    async group(value, page) {
        return await this.search(
            SearchDetail.n().Group([value]).Page(page)
        );
    }

    async getByAuthor(url) {
        let html = (
            await this.http.web_view(url, this.baseUrl)
        ).html;
        return this.toList(html);
    }

    async chapter(url) {
        url = url.query({
            service: "webplus"
        });
        let html = (await this.http.web_view(url, this.baseUrl, {
            props: {
                timer: 1500
            }
        })).html;
        return html.$(".chapter-tracker.active").find(".chapter-body").html.replace(/<div/gim, "<p").replace(/div>/gim, "p>");
    }

    async detail(url) {
        try {
            let html = (await this.http.web_view(url, this.baseUrl, {
                props: {
                    timer: 100
                }
            })).html;
            let body = html.$("body");

            let item = DetailInfo.n();
            item
                .Name(body.find("h1").text)
                .Url(url)
                .Image(
                    body
                        .find(".image-wrap img")
                        .url("src", { Referer: this.baseUrl + "/", webView: true })
                )
                .Decription(body.find(".description").text)
                .AlternativeNames(
                    body
                        .find(
                            'h1'
                        ).parent.find("p").text
                )
                .Author(
                    body.first('span:contains("Author")').parent.find("div a").map(x => x.text).join(",")
                )
                .AuthorUrl(body.first('span:contains("Author")').parent.first("div a").url("href"))
                .Genre(body.find('a[href*="genre"]').map(x => x.text))
                .Tags(body.find('a[href*="novel-finder?ti"]').map(x => x.text))
                .Status(body.find('span:contains("Status")').parent.find("span:last-child").text)
                .Rating(
                    body.first("span:contains('Rating')").parent.first("div").text
                )
                .LastUpdated(
                    body.find('span:contains("Date Added")').parent.first("div").text?.trim()
                )
                .ParserName(this.name);
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

            item.Chapters(
                cHhtml.chapters.map((a, index) =>
                    ChapterInfo.n()
                        .Name(a.title)
                        .Url(url.join(`chapter-${index + 1}`))
                        .ParserName(this.name)
                )
            );

            return item;
        } catch (e) {
            console.error(e)
            throw e;
        }
    }
}
