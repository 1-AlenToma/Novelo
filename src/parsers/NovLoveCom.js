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

export default class NovLoveCom extends Parser {
    constructor() {
        super(
            "https://novlove.com",
            "NovLove.com",
            "/img/favicon.ico"
        );
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];
    }

    async load() {
        let html = (
            await this.http.web_view(this.url, this.url)
        ).html;

        this.settings.Genre(
            html
                .$(".dropdown-menu a")
                .filter(x =>
                    x.attr("href").has("genres/")
                )
                .map(x =>
                    Value.n()
                        .Text(x.text)
                        .Value(x.attr("href"))
                )
        );

        this.settings.Group(
            html
                .first(".dropdown-menu a[href*='nov-love-hot']").parent.parent
                .find("a")
                .map(x =>
                    Value.n()
                        .Text(x.text)
                        .Value(x.attr("href"))
                )
        );

        return this.settings;
    }

    toList(html) {
        return html
            .$(".list-novel > .row")
            .map(x => {

                return x.map(f => {
                    if (f.find(".cover").attr("src|data-src").has()) {
                        return LightInfo.n()
                            .Name(f.find(".novel-title").text)
                            .Url(
                                f.find(".novel-title a").url("href")
                            )
                            .Image(
                                f.find(".cover").attr("data-src|src")
                            )
                            .Info(f.find(".text-info").text)
                            .Decription(f.find(".author").text)
                            .IsNew(
                                f.find(".label-new, label-hot").hasValue
                            )
                            .ParserName(this.name);

                    }
                });
            })
            .flatMap(x => x);
    }

    async search(options) {
        let url = this.url.join(
            `/search?keyword=${options.text.replace(/ /g, "+")}`
        );

        if (options.genre.has())
            url = this.url.join(
                options.genre.lastOrDefault("value")
            );
        else if (options.group.has())
            url = this.url.join(
                options.group.lastOrDefault("value")
            );
        url = url.query({
            page: (1).sureValue(options.page)
        });

        let html = (
            await this.http.web_view(url, this.url, {
                props: {
                    imageSelector: {
                        selector: ".cover",
                        attr: "data-src|src",
                        referer:this.url,
                        regexp:["/novel_\\d*_\\d*/gi", "novel"]
                    }
                }
            })
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
            await this.http.web_view(url, this.url, {
                props: {
                    imageSelector: {
                        selector: ".cover",
                        attr: "data-src|src",
                        referer:this.url,
                        regexp:["/novel_\\d*_\\d*/gi", "novel"]
                    }
                }
            })
        ).html;
        return this.toList(html);
    }

    async chapter(url) {
        let html = (await this.http.web_view(url)).html;
        return html.$(".chr-c").html;
    }

    async detail(url) {
        let html = (await this.http.web_view(url, this.url, {
            props: {
                imageSelector: {
                    selector: ".book img, .cover",
                    attr: "data-src|src",
                    referer:this.url,
                    regexp:["/novel_\\d*_\\d*/gi", "novel"]
                }
            }
        })).html;
        let body = html.$("body");

        let item = DetailInfo.n();
        item
            .Name(body.find(".books .title").text)
            .Url(url)
            .Image(
                body
                    .find(".books img")
                    .attr("data-src|src")
            )
            .Decription(body.find(".desc-text").text)
            .AlternativeNames(
                body
                    .find(
                        '.info h3:contains("Alternative")'
                    )
                    .parent.remove("h3").text
            )
            .Author(
                body.first('.info a[href*="author"]')
                    .text
            )
            .AuthorUrl(body.first('.info a[href*="author"]').url("href"))
            .Genre(
                body
                    .find('.info a[href*="genre"]')
                    .map(x => x.text)
            )
            .Status(
                body
                    .find(
                        '.info h3:contains("Status")'
                    )
                    .parent.find("a").text
            )
            .Rating(
                body.first(".desc-text").parent.first("em").text
            )
            .LastUpdated(
                body.find("div.item-time").text?.trim()
            )
            .ParserName(this.name);
        //https://novlove.com/ajax/chapter-option?novelId=hitman-with-a-badass-system&currentChapterId=chapter-1
        let cHhtml = (
            await this.http.web_view(
                this.url
                    .join("ajax", "chapter-option")
                    .query({
                        novelId: html.find("[data-novel-id!=''][data-novel-id]").attr("data-novel-id")
                    }),
                this.url
            )
        ).html;
        item.Chapters(
            cHhtml
                .$("option")
                .map(a =>
                    ChapterInfo.n()
                        .Name(a.text)
                        .Url(a.url("value"))
                        .ParserName(this.name)
                )
        );

        return item;
    }
}
