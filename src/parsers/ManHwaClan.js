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

export default class ManHwaClan extends Parser {
    constructor() {
        super(
            "https://manhwaclan.com",
            "ManHwaClan",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "AnimePlanet";
        this.settings.searchEnabled = false;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];
        this.minVersion = 122;
        this.protected = true;

    }

    async load() {
        let html = (
            await this.http.web_view(this.url, this.url)
        ).html;

        this.settings.Genre(
            html.$(".sub-nav_list a").filter(x => x.attr("href").has("genre/")).map(x =>
                Value.n()
                    .Text(x.text)
                    .Value(x.attr("href").split("/").filter(x => x.has()).lastOrDefault())
            )
        );

        this.settings.Group(
            [
                Value.n()
                    .Text("Latest Manga")
                    .Value("trending"),
                Value.n()
                    .Text("Most View")
                    .Value("views"),
                Value.n()
                    .Text("New Manga")
                    .Value("new-manga")
            ]
        );
        return this.settings;
    }



    parse(html) {

        let items = html.$(".page-item-detail, .search-wrap .tab-content-wrap .row")
            .map(f => {
                // console.log(f.html)
                let name = f.find(".img-responsive").parent
                let title = f.find(".post-title").text;
                return LightInfo.n()
                    .Name(title)
                    .Url(name.url("href"))
                    .Type("Manga")
                    .Image(name.find("img").url("src|srcset", { Referer: this.url + "/", webView: true }))
                    .Info(f.first(".list-chapter span:first-child, .latest-chap .chapter a").text)
                    .ParserName(this.name);
            });
        return items;

    }

    async search(options) {
        let url = this.url.join("page", "#page").query({
            s: options.text.replace(/ /g, "+"),
            post_type: "wp-manga",
            op: "",
            author: "",
            artist: "",
            release: "",
            adult: "",
        });



        if (options.group?.has()) {
            url += `&m_orderby=` + options.group.lastOrDefault("value");
        }

        if (options.genre?.has()) {
            url += "&" + options.genre.map(x => `genre%5B%5D=${x.value}`).join("&");
        }

        url = url.replace("#page", options.page.toString() + "/");

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

    async getByAuthor(url) {
        let html = (
            await this.http.web_view(url, this.url)
        ).html;

        return this.parse(html);
    }

    async chapter(url) {
        let html = (
            await this.http.web_view(url, this.url, {
                props: {
                    imageSelector: {
                        selector: ".reading-content img",
                        attr: "src"
                    }
                }
            })
        ).html;
        let imgs = html.findAll(".reading-content img")
            .map(x => `<img id="${methods.newId()}" src='${x.attr("src")}'  />`)
            .join("\n");
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
                .Name(a.chapter_name)
                .Url(uurl.join(a.chapter_slug))
                .ParserName(this.name)).reverse();

        } catch (e) {
            console.error(e)
            return [];
        }
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
            .Image(body.find('.summary_image img').url("src", { Referer: this.url + "/", webView: true }))
            .Decription(body.find(".description-summary").text)
            .Author(body.first('.author-content a').text)
            .AuthorUrl(body.first('.author-content a').url("href"))
            .Genre(body.find('.genres-content a').map(x => x.text))
            .Status(body.first('.post-status .post-content_item .summary-content').text.replace(/Status|[ ]/gi, ""))
            .Rating(body.first('.total_votes').text)
            .ParserName(this.name);

        item.Chapters(body.findAll(".listing-chapters_wrap a").map(a => ChapterInfo.n()
            .Name(a.text)
            .Url(this.url.join(a.url("href")))
            .ParserName(this.name)).reverse());

        // item.Chapters(await this.getChapters(url))

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
