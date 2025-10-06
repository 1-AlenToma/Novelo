import {
    NovelInfo,
    DetailInfo,
    LightInfo
} from "../../native";

class WebNovel extends NovelInfo {
    constructor() {
        super("https://www.webnovel.com");
    }

    async search(item: DetailInfo) {
        try {
            //https://www.novelupdates.com/series-finder/?sf=1&sh=World+Defying+Dan+God&sort=sdate&order=desc
            let url = this.url.join("search").query({
                keywords: item.name.replace(/ /g, "+")
            });

            let html_0 = (await this.http.web_view(url, this.url)).html.$("body");
            let serUrl = "";
            // console.warn("hml", html_0.remove("script,style, input,svg").outerHtml)
            html_0
                .find(".infinite-scroll-component li > div > a")
                .forEach(x => {
                    let txt = x.attr("title");
                    if (txt?.empty())
                        txt = x.text;
                    if (item.name == txt || (serUrl.empty() && txt.splitSearch(item.name))) {
                        serUrl = x.url("href");
                    }
                });

            if (!serUrl.empty()) {
                item.novelUpdateUrl = serUrl;
                let html_1 = (
                    await this.http.web_view(
                        serUrl,
                        this.url,
                        { props: { timer: 800 } }
                    )
                ).html.$("body");
              //  console.warn("hml", html_1.remove("script,style, input,svg").outerHtml)
                if (!item.genre || !item.genre.has()) {
                    item.genre = html_1
                        .find("a[href*=stories]")
                        .map(x => x.text);
                }

                if (!item.tags || !item.tags.has()) {
                    item.tags = html_1
                        .find("[data-report-uiname='tag']")
                        .map(x => x.text.replace(/#\s/g, ""));
                }

                /*  if (!item.status || item.status.empty()) {
                    item.status = html_1
                      .find("#editstatus")
                      .text.has("Completed")
                      ? "Completed"
                      : "Ongoing";
                  }*/

                /* if (
                   !item.alternativeNames ||
                   item.alternativeNames.empty()
                 ) {
                   item.alternativeNames = html_1.find(
                     "#editassociated"
                   ).text;
                 }*/

                if (!item.author || item.author.empty()) {
                    item.author = html_1.find(
                        "a:[href*='profile']"
                    ).text;
                }

                if (
                    !item.decription ||
                    item.decription.empty()
                ) {
                    item.decription = html_1.find(
                        "p:contains(Synopsis)"
                    ).parent.first("div").text;
                }

                if (!item.image || item.image.empty()) {
                    item.image = html_1
                        .find(".g_thumb img")
                        .url("src");
                }

                /*  item.novelUpdateRating =
                      html_1.first("a[href*=stories]").text;
                */


                item.novelUpdateRecommendations =
                    item.novelUpdateRecommendations = html_1
                        .find('section:contains("You May Also Like") a:not([data-report-bid=""])')
                        .map(x => new LightInfo().set("name", x.attr("title")).set("url", x.url("href")));
            }
        } catch (e) {
            console.error(e);
        }

        return item;
    }
}

export default WebNovel;
