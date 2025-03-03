import {
  NovelInfo,
  DetailInfo,
  LightInfo
} from "../../native";

class NovelUpdate extends NovelInfo {
  constructor() {
    super("https://www.novelupdates.com");
  }

  async search(item: DetailInfo) {
    try {
      //https://www.novelupdates.com/series-finder/?sf=1&sh=World+Defying+Dan+God&sort=sdate&order=desc
      let url = this.url.join("series-finder").query({
        sf: 1,
        sh: item.name.replace(/ /g, "+"),
        sort: "sdate",
        order: "desc"
      });

      let html_0 = (await this.http.get_html(url, this.url)).html.$("body");
      let serUrl = "";
      html_0
        .find(".search_title a")
        .forEach(x => {
          if (
            item.name == x.text ||
            (serUrl.empty() &&
              x.text.splitSearch(item.name))
          ) {
            serUrl = x.url("href");
          }
        });

      if (!serUrl.empty()) {
        item.novelUpdateUrl = serUrl;
        let html_1 = (
          await this.http.get_html(
            serUrl,
            this.url
          )
        ).html.$("body");
        if (!item.genre || !item.genre.has()) {
          item.genre = html_1
            .find("#seriesgenre .genre")
            .map(x => x.text);
        }

        if (!item.tags || !item.tags.has()) {
          item.tags = html_1
            .find("#showtags >a")
            .map(x => x.text);
        }

        if (!item.status || item.status.empty()) {
          item.status = html_1
            .find("#editstatus")
            .text.has("Completed")
            ? "Completed"
            : "Ongoing";
        }

        if (
          !item.alternativeNames ||
          item.alternativeNames.empty()
        ) {
          item.alternativeNames = html_1.find(
            "#editassociated"
          ).text;
        }

        if (!item.author || item.author.empty()) {
          item.author = html_1.find(
            "#showopublisher a"
          ).text;
        }

        if (
          !item.decription ||
          item.decription.empty()
        ) {
          item.decription = html_1.find(
            "#editdescription"
          ).text;
        }

        if (!item.image || item.image.empty()) {
          item.image = html_1
            .find(".seriesimg img")
            .url("src");
        }

        item.novelUpdateRating =
          html_1.find(".uvotes").text;



        item.novelUpdateRecommendations =
          item.novelUpdateRecommendations = html_1
            .find('.genre[title*="Recommended"]')
            .map(x =>
              LightInfo.n()
                .Name(x.text)
                .Url(x.url("href"))
            );
      }
    } catch (e) {
      console.error(e);
    }

    return item;
  }
}

export default NovelUpdate;
