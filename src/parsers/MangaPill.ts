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

export default class MangaPill extends Parser {
    constructor() {
        super(
            "https://mangapill.com",
            "MangaPill",
            "/favicon.ico",
            "Manga"
        );
        this.infoGeneratorName = "AnimePlanet";
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = true;
        this.settings.searchCombination = ["Genre", "Status", "Group"];
        this.minVersion = 156;
    }

    private getImage(img: string, cacheIt?: boolean) {
        if (!img) return "";
        let header: any = {
            "Referer": "https://mangapill.com/",
            "Accept": "*/*"
        };
        if (cacheIt) {
            header.cacheIt = cacheIt;
        }
        return `${img} header=${JSON.stringify(header)}`;
    }

    async load() {
        let html = (await this.http.get_html(this.url.join("search"))).removeScripts().html;

        // MangaPill uses checkboxes for genres on /search
        const genres = html
            .$("input[name='genre']")
            .map(x => {
                const val = x.attr("value");
                return Value.n()
                    .set("text", val)
                    .set("value", encodeURIComponent(val).replace(/%20/g, "+"));
            });

        this.settings.set("genre", genres);

        this.settings.set("group", [
            Value.n().set("text", "Recent Chapters").set("value", "chapters"),
            Value.n().set("text", "New Mangas").set("value", "mangas/new")
        ]);

        return this.settings;
    }

    async search(options: SearchDetail) {
        const sortOrGroup = options.group?.firstOrDefault("value") ?? "";
        const page = options.page || 1;

        // Handle "Recent Chapters" and "New Mangas" tabs from group()
        if (sortOrGroup === "chapters" || sortOrGroup?.has("mangas")) {
            const feedUrl = this.url.join(sortOrGroup);
            const html = (await this.http.get_html(feedUrl, this.url)).removeScripts().html;
            return html.$("div.container figure")
                .map(fig => {
                    const f = fig.parent.parent;

                    const imgEl = f.find("img");
                    const rawImg = imgEl.url("data-src|src")
                    const linkEl = f.find("a[href*='/manga/']");
                    const title = f.first("a[href*='/manga/'] div:first-child");
                    if (linkEl.url("href").has()) {
                        return LightInfo.n()
                            .set("name", title.text.trim())
                            .set("url", linkEl.url("href"))
                            .set("type", "Manga")
                            .set("image", rawImg)
                            .set("info", f.find("a[href*='/chapters/']").text.trim())
                            .set("parserName", this.name);
                    }
                })
                .filter(x => x != undefined);
        }

        // Standard /search query with filters
        const genreParams = (options.genre || [])
            .map((g: any) => `genre=${typeof g === "string" ? g : g.value}`)
            .join("&");

        const queryStr =
            `q=${genreParams ? "" : encodeURIComponent(options.text || "").replace(/%20/g, "+")}` +
            `&status=${encodeURIComponent(sortOrGroup)}` +
            `&type=` +
            `&page=${page}` +
            (genreParams ? `&${genreParams}` : "");

        const searchUrl = `${this.url}/search?${queryStr}`;
        const html = (await this.http.get_html(searchUrl, this.url)).removeScripts().html;

        return html.$("div.my-3.grid > div")
            .map(f => {
                const imgEl = f.find("img");
                const rawImg = imgEl.url("data-src|src")
                const linkEl = f.find("a.mb-2");
                const title = linkEl.text || f.find("div.font-bold").text;

                if (title && linkEl.url("href").has()) {
                    return LightInfo.n()
                        .set("name", title.trim())
                        .set("url", linkEl.url("href"))
                        .set("type", "Manga")
                        .set("image", rawImg)
                        .set("info", f.find("div.text-xs").text.trim())
                        .set("parserName", this.name);
                }
            })
            .filter(x => x != undefined);
    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        return [];
    }

    async chapter(url: string) {
        const html = (await this.http.get_html(url, this.url)).removeScripts().html;

        // MangaPill lazy-loads chapter pages using data-src on chapter-page images

        const imgs = html
            .find("chapter-page img,chapter img, div.my-3 img")
            .map(x => {
                const rawSrc = x.url("data-src|src")
                if (!rawSrc) return "";
                const src = this.getImage(rawSrc, true);
                return `<img src='${src}' />`;
            })
            .filter(x => x !== "")
            .join("\n");

        return imgs;
    }

    async detail(url: string) {
        const html = (await this.http.get_html(url, this.url)).removeScripts().html;
        const body = html.find("body");

        const imgEl = body.find("div.container img");
        const rawCover = imgEl.url("data-src|src")

        const genres = body
            .$("a[href*='/search?genre=']")
            .map(a => a.text.trim())
            .filter(t => t !== "");

        const statusText = body.find("div.grid.grid-cols-1.md\\:grid-cols-3 div:contains('Status')").text.toLowerCase();
        const status = statusText.includes("publishing") ? "Ongoing" : "Completed";

        const item = DetailInfo.n();
        item
            .set("name", body.run("h1 -> text").trim())
            .set("url", url)
            .set("type", "Manga")
            .set("image", this.getImage(rawCover))
            .set("decription", body.run("p.text-sm.text--secondary -> text").trim())
            .set("author", "")
            .set("authorUrl", "")
            .set("genre", genres)
            .set("status", status)
            .set("rating", "0.00")
            .set("lastUpdated", "")
            .set("parserName", this.name);

        // MangaPill lists chapters newest-first inside #chapters a
        const chapters = body
            .$("#chapters a")
            .map(a =>
                ChapterInfo.n()
                    .set("name", a.text.trim())
                    .set("url", a.url("href"))
                    .set("parserName", this.name)
            )
            .reverse();

        item.set("chapters", chapters);
        return item;
    }
}
