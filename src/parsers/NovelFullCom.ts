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


export default class NovelFullCom extends Parser {
    constructor() {
        super(
            "https://novelfull.com",
            "NovelFull.com",
            "/img/favicon.ico"
        );
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = false;
        this.settings.searchCombination = [];
        this.minVersion = 155;
    }

    async load() {
        let html = (
            await this.http.get_html(this.url)
        ).html;

        this.settings.set("genre",
            html
                .$(".dropdown-menu a")
                .filter(x => x.attr("href").has("genre/"))
                .map(x => Value.n().set("text", x.text, "value", x.attr("href")))
        );

        this.settings.set("group",
            html.run("first::.dropdown-menu a[href*='hot-novel'] -> parent -> parent -> find::a")
                .map(x => Value.n().set("text", x.text, "value", x.attr("href")))
        );

        return this.settings;
    }

    toList(html: Html) {
        return html.$(".list-truyen > .row")
            .map(f => {
                if (f.run(".cover -> attr::src").has())
                    return LightInfo.n()
                        .set("name", f.run(".truyen-title -> text"))
                        .set("url", f.run(".truyen-title a -> url::href"))
                        .set("image", f.run(".cover -> url::src"))
                        .set("info", f.run(".text-info -> text"))
                        .set("decription", f.run(".author -> text"))
                        .set("isNew", f.run(".label-new, label-hot -> hasValue"))
                        .set("parserName", this.name);
            });
    }

    async search(options: SearchDetail) {
        let url = this.url.join(`/search?keyword=${options.text.replace(/ /g, "+")}`);

        if (options.genre.has())
            url = this.url.join(options.genre.lastOrDefault("value"));
        else if (options.group.has())
            url = this.url.join(options.group.lastOrDefault("value"));

        url = url.query({ page: (1).sureValue(options.page) });

        let html = (await this.http.get_html(url, this.url)).html;

        return this.toList(html);

    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        let html = (await this.http.get_html(url, this.url)).html;
        return this.toList(html);
    }

    async chapter(url: string) {
        let html = (await this.http.get_html(url)).html;
        return html.$(".chapter-c").html;
    }

    async detail(url: string) {
        let html = (await this.http.get_html(url, this.url)).html;
        let body = html.$("body");

        let item = DetailInfo.n();
        item
            .set("name", body.run(".books .title -> text"))
            .set("url", url)
            .set("image", body.run(".books img -> url::src"))
            .set("decription", body.run(".desc-text -> text"))
            .set("alternativeNames", body.run('.info h3:contains("Alternative") -> parent -> remove::h3 -> text'))
            .set("author", body.run('first::.info a[href*="author"] -> text'))
            .set("authorUrl", body.run('first::.info a[href*="author"] -> url::href'))
            .set("genre", body.run('.info a[href*="genre"] -> map::text'))
            .set("status", body.run('.info h3:contains("Status") -> parent -> find::a -> text'))
            .set("rating", body.run("first::.desc-text -> parent -> first::em -> text"))
            .set("lastUpdated", body.run("div.item-time -> text")?.trim())
            .set("parserName", this.name);

        let cHhtml = (await this.http.get_html(
            this.url
                .join("ajax-chapter-option")
                .query({ novelId: html.run("[data-novel-id!=''][data-novel-id] -> attr::data-novel-id") }),
            this.url
        )
        ).html;

        item.set("chapters",
            cHhtml.$("option").map(a =>
                ChapterInfo.n()
                    .set("name", a.text)
                    .set("url", a.url("value"))
                    .set("parserName", this.name)
            )
        );

        return item;
    }
}
