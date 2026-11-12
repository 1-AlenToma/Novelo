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

export default class GogoAnime extends Parser {
    constructor() {
        super(
            "https://gogoanime.by",
            "GoGoAnime.by",
            "/img/favicon.ico",
            "Anime"
        );
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = false;
        this.infoGeneratorName = "MyAnimeList";
        this.settings.searchCombination = ["Genre", "Status", "Group"];
        this.minVersion = 155;
    }

    async load() {
        let html = (
            await this.http.get_html(this.url.join("series"))
        ).html;

        this.settings.set("genre",
            html
                .$("input[name*='genre']")
                .map(x => Value.n().set("text", x.attr("value"), "value", x.attr("value")))
                .filter((x, index, array) => x.text.length > 0 && array.findIndex(f => f.text == x.text) === index)
        );

        this.settings.set("status", html
            .$("input[name*='status']")
            .map(x => Value.n().set("text", x.attr("value"), "value", x.attr("value")))
            .filter((x, index, array) => x.text.length > 0 && array.findIndex(f => f.text == x.text) === index))

        this.settings.set("group",
            html
                .$("input[name*='type']")
                .map(x => Value.n().set("text", x.attr("value"), "value", x.attr("value")))
                .filter((x, index, array) => x.text.length > 0 && array.findIndex(f => f.text == x.text) === index)
        );

        this.settings.group.unshift(Value.n().set("text", "Latest Release", "value", '{"order":"update"}'));



        return this.settings;
    }

    async search(options: SearchDetail) {
        let url = this.url.join(`/?s=${options.text.replace(/ /gim, "+")}`);
        //series/?genre%5B%5D=action&status=&type=Movie&order=
        if (options.text.startsWith("#"))
            url = this.url.join("/tag", options.text.substring(1).toUpperCase())
        if (options.genre.has() || options.group.has() || options.status.has()) {
            url = this.url.join("/series/?")
        }

        let q: any = {};

        if (options.genre.has())
            options.genre.map((x, index) => q[`$${index}genre%5B%5D`] = x.value)

        if (options.status.has())
            q.status = options.status.lastOrDefault("value");

        if (options.group.has()) {
            let v = options.group.lastOrDefault("value");
            if (v.has("{")) {
                v = JSON.parse(v);
                q = { ...q, ...v };
            } else
                q.type = options.group.lastOrDefault("value");
        }

        url = url.query({ page: (1).sureValue(options.page), ...q });

        let html = (await this.http.get_html(url, this.url)).html;
        let data = html
            .$(".listupd a")
            .map(x => {
                return x.map(f => {
                    if (f.run<string>("img -> attr::src|data-src").has())
                        return LightInfo.n()
                            .set("name", f.run("h2 -> text"))
                            .set("url", f.url("href"))
                            .set("image", f.run("img -> url::src|data-src"))
                            .set("info", f.find(".typez").text)
                            .set("langType", f.find(".sb").text as any)
                            .set("parserName", this.name);
                });
            })
            .flatMap(x => x);
        return data;
    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        return [];
    }

    async chapter(html: any) {
        return {
            css: `
        body>*:not(.mvelement):not(video), .naveps{
            display:none !important;
            visibility:hidden !important;
        }
        
        `,
            script: `
          const loadData = async()=>{
                  while(document.querySelector(".mvelement") == null)
                    await window.sleep(100);
                const panel = document.querySelector(".mvelement");
                document.body.appendChild(panel); 
            }
            loadData();
        `,
            clickExceptions: [".servers", ".mvelement"]
        }
    }

    async detail(url: string) {
        let html = (await this.http.get_html(url, this.url)).html;
        let body = html.$("body");

        let item = DetailInfo.n();
        item
            .set("name", body.run(".entry-title -> text"))
            .set("url", url)
            .set("image", body.run(".thumb img -> url::src|data-src"))
            .set("author", body.run('.author i -> text'))
            .set("genre", body.run('.genxed a -> map::text'))
            .set("status", body.run('.spe b:contains("Status") -> parent -> remove::b -> text'))
            .set("lastUpdated", body.run("time[itemprop='dateModified'] -> text")?.trim())
            .set("decription", body.run(".infox .ninfo -> text"))
            .set("parserName", this.name)
            .set("chapters", (body.find(".episodes-container a")
                .map(a => ChapterInfo.n().set("name", a.text, "url", a.url("href"), "parserName", this.name)).reverse()));

        item.novelUpdateRecommendations =
            item.novelUpdateRecommendations = body
                .find('.listupd a')
                .map(f => LightInfo.n()
                    .set("name", f.run("h2 -> text"))
                    .set("url", f.url("href"))
                    .set("image", f.run("img -> url::src|data-src"))
                    .set("info", f.run(".typez -> text"))
                    .set("langType", f.run(".sb -> text"))
                    .set("parserName", this.name));

        item.commentScript.set("url", url + "#tab-comment-title", "script", `
          let scLoad = async function () {
            let st =document.createElement("style")
             st.appendChild(document.createTextNode("body>*:not(.cmd_comment) { display:none !important;visibility: hidden;opacity:0;}"))
            document.head.appendChild(st);
            while(!document.querySelector(".commentx"))
             await window.sleep(100);
             let panel = document.querySelector(".commentx").parentElement;
             panel.classList.add("cmd_comment")
             document.body.appendChild(panel);
          }
          scLoad();
          `);
        return item;
    }
}
