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
            const isManga = item.type?.toLowerCase() === "manga";
            const searchType = isManga ? "manga" : "anime";

            let url = this.url.join("search/prefix.json").query({
                type: searchType,
                keyword: item.name,
                v: 1
            });

            let debugg = false;

            let data = (await this.http.web_view(url, this.url)).json;
            if (!data || !data.categories || !data.categories.has())
                return item;

            data = data.categories.firstOrDefault("items");
            if (!data || !data.has())
                return item;

            const queryLower = item.name.toLowerCase();
            let entry = data.find(x => x.name.toLowerCase() == queryLower);
            if (!entry)
                entry = data.find(x => x.name.toLowerCase().has(queryLower));
            if (!entry)
                entry = data[0];

            item.novelUpdateUrl = entry.url;
            let html = (await this.http.get_html(entry.url, this.url)).html.$("body");

            if (!item.genre || !item.genre.has() || debugg) {
                item.genre = html
                    .find("span[itemprop='genre']")
                    .map(x => x.text.trim());
            }

            if (!item.status || item.status.empty() || debugg) {
                item.status = html.find('span:contains("Status:")').parent.remove("span").text.trim();
            }

            if (!item.author || item.author.empty() || debugg) {
                const label = isManga ? "Authors:" : "Studios:";
                item.author = html.find(`span:contains("${label}")`).parent.find("a").text.trim();
            }

            if (!item.decription || item.decription.empty() || debugg) {
                item.decription = html.find('p[itemprop="description"], span[itemprop="description"]').text.trim();
            }

            if (!item.image || item.image.empty() || debugg) {
                item.image = html.find('img[itemprop="image"]').url("data-src|src");
            }

            item.novelUpdateRating = entry.payload?.score || "0.00";

            if (!item.novelUpdateRecommendations || !item.novelUpdateRecommendations.has()) {
                item.novelUpdateRecommendations = html
                    .find('#manga_recommendation li.btn-anime a.link, #anime_recommendation li.btn-anime a.link')
                    .map(x =>
                        new LightInfo()
                            .set("name", x.find(".title").text.trim())
                            .set("image", x.find("img").url("data-src|src"))
                            .set("url", x.url("href"))
                            .set("type", item.type || "Manga")
                    );
            }

        } catch (e) {
            console.error(e);
        }

        return item;
    }
}

export default MyAnimeList;
