import {
    NovelInfo,
    DetailInfo,
    LightInfo
} from "../../native";

class MyAnimeList extends NovelInfo {
    constructor() {
        super("https://myanimelist.net");
    }

    async search(item: DetailInfo) {
        try {
            let url = this.url.join("search/prefix.json?").query({
                type: "anime",
                keyword: item.name,
                v: 1
            });

            let debugg = false;


            let data = (await this.http.get_html(url, this.url)).json;
            if (!data || !data.categories || !data.categories.has())
                return item;
            data = data.categories.firstOrDefault("items");
            if (!data || !data.has())
                return item;
            let anime = data.find(x => x.name.toLowerCase() == item.name.toLowerCase());
            if (!anime)
                anime = data.find(x => x.name.has(item.name.toLowerCase()));
            if (!anime)
                return item;

            item.novelUpdateUrl = anime.url;
            let html = (await this.http.get_html(anime.url, this.url)).html.$("body");
            if (!item.genre || !item.genre.has() || debugg) {
                item.genre = html
                    .find("span[itemprop='genre']")
                    .map(x => x.text);
            }

            /* if (!item.tags || !item.tags.has()) {
                 item.tags = html_1
                     .find("#showtags >a")
                     .map(x => x.text);
             }*/

            if (!item.status || item.status.empty() || debugg) {
                item.status = html.find('span:contains("Status")').parent.remove("span").text;
            }

            /* if (
                 !item.alternativeNames ||
                 item.alternativeNames.empty()
             ) {
                 item.alternativeNames = html_1.find(
                     "#editassociated"
                 ).text;
             }*/

            if (!item.author || item.author.empty() || debugg) {
                item.author = html.find('span:contains("Studios")').parent.find("a").text;
            }

            if (!item.decription || item.decription.empty() || debugg) {
                item.decription = html.find('p[itemprop="description"]').text;
            }

            if (!item.image || item.image.empty() || debugg) {
                item.image = html.find('img[itemprop="image"]').url("data-src|src");
            }

            item.novelUpdateRating = anime.payload.score;

            // html = (await this.http.get_html(anime.url.join("userrecs"), this.url)).html.$("body");
            if (!item.novelUpdateRecommendations || !item.novelUpdateRecommendations.has())
                item.novelUpdateRecommendations =
                    item.novelUpdateRecommendations = html.find('#anime_recommendation a[href*="recommendations"]')
                        .map(x => new LightInfo().set("name", x.find(".title").text).set("image", x.find("img").attr("data-src|src"))
                            .set("url", x.url("href")));

        } catch (e) {
            console.error(e);
        }

        return item;
    }
}

export default MyAnimeList;
