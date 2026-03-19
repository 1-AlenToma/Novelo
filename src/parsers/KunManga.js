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

export default class KunManga extends Parser {
    constructor() {
        super(
            "https://kunmanga.com",
            "KunManga",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "AnimePlanet";
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = true;
        this.settings.searchCombination = ["Genre", "Status", "Group"];
        this.minVersion = 139;
        this.protected = true;

    }

    async load() {
        let html = (
            await this.http.web_view(this.url.join("?s=&post_type=wp-manga"), this.url)
        ).html;

        this.settings.Genre(
            html.$("input[name='genre[]']").map(x =>
                Value.n()
                    .Text(x.attr("value").displayName())
                    .Value(x.attr("value"))
            )
        );

        this.settings.Status([
            Value.n()
                .Text("Completed")
                .Value("end"),
            Value.n()
                .Text("OnGoing")
                .Value("on-going")
        ]);

        this.settings.Group(
            [
                Value.n()
                    .Text("Latest")
                    .Value(this.url),
                Value.n()
                    .Text("New")
                    .Value("new-manga"),
                Value.n()
                    .Text("Most Views")
                    .Value("views"),
                Value.n()
                    .Text("Trending")
                    .Value("trending"),
                Value.n()
                    .Text("Rating")
                    .Value("rating"),

            ]
        );
        // console.warn([this.settings].niceJson());
        return this.settings;
    }



    parse(html) {

        let items = html.$(".page-content-listing > .row, .page-content-listing .page-listing-item .page-item-detail")
            .map(f => {
                let name = f.find(".post-title a").hasValue ? f.find(".post-title a") : f.find("div > a");
                let title = name.text;

                return LightInfo.n()
                    .Name(title)
                    .Url(name.url("href"))
                    .Type("Manga")
                    .Image(f.find(".img-responsive").url("src", { Referer: this.url + "/", webView: true }))
                    .Info(f.first(".font-meta.chapter, .list-chapter .chapter-item:first-child a").text)
                    .ParserName(this.name);
            });
        // console.warn("items", items,  html.html)
        return items;
    }

    async search(options) {

        let gr = options.group?.has() ? options.group?.lastOrDefault("value") : "";
        let url = this.url.join("https://kunmanga.com/page/", options.page.toString(), "?").query({
            s: options.text.replace(/ /g, "+"),
            post_type: "wp-manga",
            author: "",
            op: 1,
            artist: "",
            release: "",
            m_orderby: gr,
            adult: "",
        });

        options.genre?.forEach(x => url = url.query({
            "genre%5B%5D": x.value
        }))

        if (gr == this.url) // latest
            url = this.url.join("page", options.page.toString())

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

    async chapter(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        let imgs = html.findAll(".reading-content img").map(x => `<img id="${methods.newId()}" src='${x.url("src", { Referer: this.url + "/", webView: true }, x => x.trimStr(" ", "_").trim())}'  />`).join("\n");
        return imgs;
    }


    async detail(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;
        let body = html.find("body");

        let item = DetailInfo.n();
        item
            .Name(body.find('.post-title').text)
            .Url(url)
            .Type("Manga")
            .Image(
                body
                    .find('.summary_image img')
                    .url("src", { Referer: this.url + "/", webView: true })
            )
            .Decription(body.find(".description-summary > .summary__content").text)
            .Author("_")
            .AuthorUrl(
                undefined
            )
            .Genre(
                body
                    .find('.genres-content a')
                    .map(x => x.text)
            )
            .Status(
                body
                    .find(
                        '.post-status .post-content_item .summary__content'
                    ).text
            )
            .Rating(
                body
                    .find('.vote-details').text
            )
            .LastUpdated(
                undefined
            )
            .AlternativeNames(body.find('.post-content_item:contains("Alternative")').find(".summary-content").text)
            .NovelUpdateRecommendations(body.findAll(".related-reading-wrap").map(x => (
                LightInfo.n()
                    .Name(x.find("a").text)
                    .Url(x.find("a").url("href"))
                    .Type("Manga")
                    .Image(x.find(".img-responsive").url("src", { Referer: this.url + "/", webView: true }))
                    .ParserName(this.name)
            )))
            .Tags(body.findAll(".wp-manga-tags-list a").map(x => x.text))
            .ParserName(this.name);



        item.Chapters(
            body.findAll(".page-content-listing .listing-chapters_wrap .wp-manga-chapter a")
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
