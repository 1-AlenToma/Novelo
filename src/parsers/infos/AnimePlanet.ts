import {
    NovelInfo,
    DetailInfo,
    LightInfo
} from "../../native";

class AnimePlanet extends NovelInfo {
    constructor() {
        super("https://www.anime-planet.com");
    }

    async search(item: DetailInfo, type: "manga" | "anime" = "manga") {
        try {
            let url = this.url.join(`/autocomplete`).query({
                type: type ?? "manga",
                show_slug: false,
                q: item.name.replace(/ /g, "+")
            });

            let json = (await this.http.get_html(url, this.url)).json
            if (!json || !json.data || json.data.length <= 0)
                return item;
            let serUrl = "";
            json.data.forEach(x => {
                if (item.name == x.name || (serUrl.empty() && x.name.splitSearch(item.name))) {
                    serUrl = this.url.join(x.url)
                }
            });

            if (!serUrl.empty()) {
                item.novelUpdateUrl = serUrl;
                let html_1 = (await this.http.web_view(serUrl, this.url)).html.$("body");
                if (!item.genre || !item.genre.has()) {
                    item.genre = html_1.find(".tags li a").map(x => x.text);
                }

                if (!item.tags || !item.tags.has()) {
                    item.tags = html_1
                        .find(".tags li a")
                        .map(x => x.text);
                }

                /*    if (!item.status || item.status.empty()) {
                        item.status = html_1
                            .find("#editstatus")
                            .text.has("Completed")
                            ? "Completed"
                            : "Ongoing";
                    }*/

                if (!item.alternativeNames || item.alternativeNames.empty()) {
                    item.alternativeNames = html_1.find("h2.aka").text;
                }

                /* if (!item.author || item.author.empty()) {
                     item.author = html_1.find(
                         "#showopublisher a"
                     ).text;
                 }*/

                if (
                    !item.decription ||
                    item.decription.empty()
                ) {
                    item.decription = html_1.find(
                        ".synopsisManga, synopsisAnime"
                    ).text;
                }

                if (!item.image || item.image.empty()) {
                    item.image = html_1
                        .find(".screenshots")
                        .url("src");
                }

                item.novelUpdateRating =
                    html_1.find(".avgRating").text;



                item.novelUpdateRecommendations =
                    item.novelUpdateRecommendations = html_1
                        .find('.recommendations ul li a .cardName')
                        .map(x => new LightInfo().set("name", x.text).set("url", x.url("href")));
            }
        } catch (e) {
            console.error(e);
        }

        return item;
    }
}

export default AnimePlanet;
