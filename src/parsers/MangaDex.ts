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

export default class MangaDex extends Parser {
    constructor() {
        super(
            "https://api.mangadex.org",
            "MangaDex",
            "https://mangadex.org",
            "Manga"
        );
        this.infoGeneratorName = "";
        this.settings.searchEnabled = true;
        this.settings.genreMultiSelection = true;
        this.settings.searchCombination = ["Genre", "Status", "Group"];
        this.minVersion = 156;
        this.http.baseHeader = {
            "User-Agent": "MangaReaderApp/1.0 (Android; https://github.com/1-AlenToma/Novelo)",
            "Accept": "application/json",
            "Cache-Control": "no-store",
        };
    }

    // Helper to safely parse JSON from your native HttpHandler
    private async fetchJson(url: string) {

        const text = await this.http.get_html(url, this.url);
        let data = text.json
        return data;
    }

    private getImage(img: string, cacheIt?: boolean) {
        let header: any = { "User-Agent": null, Accept: "*/*" };
        if (cacheIt) {
            header.cacheIt = cacheIt;
            delete header["User-Agent"];
        }
        img += ` header=${JSON.stringify(header)}`;
        return img;

    }

    // Helper to extract English or fallback localized title/description
    private getLocalizedText(obj: any): string {
        if (!obj) return "";
        if (obj.en) return obj.en;
        const keys = Object.keys(obj);
        return keys.length > 0 ? obj[keys[0]] : "";
    }

    async load() {
        // Fetch official MangaDex tags (genres/themes) dynamically
        const tagRes = await this.fetchJson(`${this.url}/manga/tag`);
        const tags = (tagRes?.data || []).map((t: any) =>
            Value.n()
                .set("text", this.getLocalizedText(t.attributes?.name))
                .set("value", t.id)
        );
        this.settings.set("genre", tags);

        this.settings.set("group", [
            Value.n().set("text", "Latest Updates").set("value", "latest"),
            Value.n().set("text", "Most Followed").set("value", "popular")
        ]);

        return this.settings;
    }

    async search(options: SearchDetail) {
        const limit = 24;
        const page = options.page || 1;
        const offset = (page - 1) * limit;

        const params: string[] = [
            `limit=${limit}`,
            `offset=${offset}`,
            `includes[]=cover_art`,
            `contentRating[]=safe`,
            `contentRating[]=suggestive`,
            `hasAvailableChapters=true`,
            `availableTranslatedLanguage[]=en`
        ];

        if (options.text && options.text.trim() !== "") {
            params.push(`title=${encodeURIComponent(options.text.trim())}`);
        }

        // Handle sorting/group selection
        const sortVal = options.group?.firstOrDefault("value") || "";
        if (sortVal === "popular") {
            params.push(`order[followedCount]=desc`);
        } else if (sortVal === "latest") {
            params.push(`order[latestUploadedChapter]=desc`);
        } else if (sortVal !== "") {
            params.push(`status[]=${encodeURIComponent(sortVal)}`);
            params.push(`order[latestUploadedChapter]=desc`);
        } else {
            params.push(`order[relevance]=desc`);
        }

        // Handle multi-select genre tags
        if (options.genre && options.genre.length > 0) {
            options.genre.forEach((g: any) => {
                const tagId = typeof g === "string" ? g : g.value;
                if (tagId) params.push(`includedTags[]=${encodeURIComponent(tagId)}`);
            });
        }

        const searchUrl = `${this.url}/manga?${params.join("&")}`;
        const res = await this.fetchJson(searchUrl);

        return (res?.data || []).map((manga: any) => {
            const id = manga.id;
            const attr = manga.attributes || {};
            const title = this.getLocalizedText(attr.title);

            // Extract cover filename from relationships
            const coverRel = (manga.relationships || []).find((r: any) => r.type === "cover_art");
            const fileName = coverRel?.attributes?.fileName;
            const coverUrl = fileName ? this.getImage(`https://uploads.mangadex.org/covers/${id}/${fileName}.256.jpg`) : "";

            return LightInfo.n()
                .set("name", title)
                .set("url", `${this.url}/manga/${id}`)
                .set("type", "Manga")
                .set("image", coverUrl)
                .set("info", (attr.status || "").toUpperCase())
                .set("parserName", this.name);
        });
    }

    async group(value: Value, page: number) {
        return await this.search(SearchDetail.n().set("group", [value], "page", page));
    }

    async getByAuthor(url: string) {
        // Expects author URL format: https://mangadex.org/author/{uuid}
        const authorId = url.split("/").pop();
        if (!authorId) return [];

        const res = await this.fetchJson(
            `${this.url}/manga?authors[]=${authorId}&limit=50&includes[]=cover_art&hasAvailableChapters=true&availableTranslatedLanguage[]=en`
        );

        return (res?.data || []).map((manga: any) => {
            const id = manga.id;
            const coverRel = (manga.relationships || []).find((r: any) => r.type === "cover_art");
            const fileName = coverRel?.attributes?.fileName;
            const coverUrl = fileName
                ? this.getImage(`https://uploads.mangadex.org/covers/${id}/${fileName}.256.jpg`)
                : "";

            return LightInfo.n()
                .set("name", this.getLocalizedText(manga.attributes?.title))
                .set("url", `${this.url}/manga/${id}`)
                .set("type", "Manga")
                .set("image", coverUrl)
                .set("info", (manga.attributes?.status || "").toUpperCase())
                .set("parserName", this.name);
        });
    }

    async chapter(url: string) {
        // Extract chapter UUID from URL
        const chapterId = url.split("/").pop();
        const atHomeRes = await this.fetchJson(`${this.url}/at-home/server/${chapterId}`);

        const baseUrl = atHomeRes?.baseUrl;
        const hash = atHomeRes?.chapter?.hash;
        // Use 'data' for original quality, or 'dataSaver' for compressed images
        const pages: string[] = atHomeRes?.chapter?.data || [];

        const data = pages
            .map((filename: string) => {
                const src = this.getImage(`${baseUrl}/data/${hash}/${filename}`, true);
                return `<img src='${src}' />`;
            })
            .join("\n");
        return data;
    }

    async detail(url: string) {
        // Strip trailing slashes or query params before extracting ID
        const mangaId = url.split("?")[0].replace(/\/$/, "").split("/").pop();

        // 1. Fetch Manga Details + Cover + Author
        const mangaRes = await this.fetchJson(
            `${this.url}/manga/${mangaId}?includes[]=cover_art&includes[]=author`
        );
        const data = mangaRes?.data || {};
        const attr = data.attributes || {};
        const rels = data.relationships || [];

        const coverRel = rels.find((r: any) => r.type === "cover_art");
        const coverFile = coverRel?.attributes?.fileName;
        const coverUrl = coverFile
            ? this.getImage(`https://uploads.mangadex.org/covers/${mangaId}/${coverFile}`)
            : "";

        const authorRel = rels.find((r: any) => r.type === "author");
        const authorName = authorRel?.attributes?.name || "";
        const authorUrl = authorRel?.id ? `${this.url}/author/${authorRel.id}` : "";

        const genres = (attr.tags || []).map((t: any) => this.getLocalizedText(t.attributes?.name));
        const statusRaw = attr.status || "ongoing";
        const statusFormatted = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);

        // 2. Fetch all valid English Chapters (paginated & filtered)
        const allChapters: any[] = [];
        let offset = 0;
        const limit = 500;
        let total = 1;

        while (offset < total) {
            const feedUrl =
                `${this.url}/manga/${mangaId}/feed` +
                `?translatedLanguage[]=en` +
                `&limit=${limit}` +
                `&offset=${offset}` +
                `&order[chapter]=asc` +
                `&includeExternalUrl=0` +
                `&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includeUnavailable=0`;

            const feedRes = await this.fetchJson(feedUrl);
            const batch = feedRes?.data || [];
            total = feedRes?.total ?? batch.length;

            allChapters.push(...batch);
            offset += limit;

            if (batch.length === 0) break;
        }

        const chapters = allChapters
            // Exclude unavailable/deleted chapters that have 0 pages
            .filter((ch: any) => (ch.attributes?.pages ?? 0) > 0)
            .map((ch: any) => {
                const cAttr = ch.attributes || {};
                const chNum = cAttr.chapter ? `Ch. ${cAttr.chapter}` : "Oneshot";
                const chTitle = cAttr.title ? ` - ${cAttr.title}` : "";

                return ChapterInfo.n()
                    .set("name", `${chNum}${chTitle}`)
                    .set("url", `${this.url}/chapter/${ch.id}`)
                    .set("parserName", this.name);
            });

        const item = DetailInfo.n();
        item
            .set("name", this.getLocalizedText(attr.title))
            .set("url", url)
            .set("type", "Manga")
            .set("image", coverUrl)
            .set("decription", this.getLocalizedText(attr.description))
            .set("author", authorName)
            .set("authorUrl", authorUrl)
            .set("genre", genres)
            .set("status", statusFormatted)
            .set("rating", "0.00")
            .set("lastUpdated", attr.updatedAt || "")
            .set("parserName", this.name)
            .set("chapters", chapters);

        return item;
    }
}
