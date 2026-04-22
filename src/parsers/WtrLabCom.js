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

        this.baseUrl = "https://wtr-lab.com";
    }

    async load() {
        let html = (
            await this.http.web_view(this.url.join("novel-list"))
        ).html;

        this.settings.Genre(
            html
                .$(".genre-item")
                .map(x =>
                    Value.n()
                        .Text(x.text)
                        .Value(x.attr("href"))
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
        return html
            .$(".series-list > .card")
            .map(x => {
                return x.map(f => {
                    if (f.find(".image-section img").attr("src").has())
                        return LightInfo.n()
                            .Name(f.find(".title").remove(".rawtitle").text)
                            .Url(
                                f.find(".title").url("href")
                            )
                            .Image(
                                f
                                    .find(".image-section img")
                                    .url("src", { Referer: this.baseUrl + "/", webView: true })
                            )
                            .Info(f.find(".detail-buttons > div").eq(1).text)
                            .Decription(f.find(".detail-buttons > div").eq(0).text)
                            .ParserName(this.name);
                });
            })
            .flatMap(x => x);
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
                .Name(body.find(".title-wrap h1").text)
                .Url(url)
                .Image(
                    body
                        .find(".image-section img")
                        .url("src", { Referer: this.baseUrl + "/", webView: true })
                )
                .Decription(body.find(".description").text)
                .AlternativeNames(
                    body
                        .find(
                            '.title-list:last-child'
                        ).text
                )
                .Author(
                    body.first('.sig-author a')
                        .text
                )
                .AuthorUrl(body.first('.sig-author a:first-child').url("href"))
                .Genre(
                    body
                        .find('.genres .genre')
                        .map(x => x.text)
                )
                .Tags(body
                    .find('.tag-category-tags a:not(.genre)')
                    .map(x => x.text))
                .Status(
                    body
                        .find(
                            '.sig-row:contains("Status") .sig-value'
                        )
                        .text
                )
                .Rating(
                    body.first(".sig-rank-val").text
                )
                .LastUpdated(
                    body.find('.sig-row:contains("Date Added") .sig-value').text?.trim()
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
