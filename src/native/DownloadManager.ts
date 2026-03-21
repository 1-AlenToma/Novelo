import { newId, sleep } from "../Methods";
import { NovelFile } from "../Types";
import { Book } from "../db";
import ParserWrapper from "../parsers/ParserWrapper";
import EventTrigger from "./EventTrigger";
import HttpHandler from "./HttpHandler";
import { DetailInfo } from "./ParserItems";

export default class DownloadManager extends EventTrigger<any, "Prep" | "Progress"> {

  items: Map<string, number> = new Map();
  prepItems: Map<string, { url: string, parserName: string, protected?: boolean, startFromIndex: number }> = new Map();
  change(url: string, name: string) {
    if (context.appState.inBackground)
      return;
    let progress = this.items.get(url);
    context.bgService.updateProgressBar(name, progress);

    if (this.prepItems.has(url)) {
      this.prepItems.delete(url);
      this.trigger("Prep", url)
    }

    this.trigger("Progress", url, progress)

  }

  stop(url: string) {
    this.items.delete(url);
    this.prepItems.delete(url);
    return this;
  }

  prepLoading() {
    const [urls, setUrls] = useState<string[]>([]);
    useEffect(() => {
      return this.use((op, url: string) => {
        const keys = [...this.prepItems.keys()].filter(x => !this.items.has(x));
        setUrls(() => keys);
        if (keys.length !== urls.length || keys.some(x => !urls.includes(x)) || urls.some(x => !keys.includes(x))) {
          console.warn(keys)

        }
      }, "Prep")
    }, [])

    return urls;

  }

  useDownload(parentUrl: string) {
    let [infos, setInfos] = useState<number>(-1);
    useEffect(() => {
      const getData = (op, url: string, progress?: any) => {
        try {
          if (!url.has(parentUrl)) {
            // console.warn("url not found", url, parentUrl)
            return;
          }
          let item = this.items.get(url);
          if (item === undefined) {
            let items = [...this.prepItems.values()];
            items.forEach(x => {
              if (!parentUrl || x.url.has(parentUrl))
                item = this.items.get(x.url) ?? 0.1;
            });
          }

          //  console.log("UUR", url, op, item, "orgProgress", progress)
          if (item == undefined)
            setInfos(() => 0)
          else
            setInfos(() => item);
        } catch (e) {
          console.error(e);
        }

      }
      let off = this.use(getData, "Progress")

      if (infos == -1)
        getData("", parentUrl);
      return off;
    }, []);

    return infos;
  }

  private async downloadImages(html: string, parser: ParserWrapper) {
    let images = html.htmlImagesSources().filter(x => x != null && x != undefined);
    let htmlImages = [] as NovelFile[];
    for (let img of images) {
      try {

        while (true) {
          let src = await parser.http.imageUrlToBase64(img);
          if (src && typeof src == "string") {
            htmlImages.push({
              type: "Image",
              content: src,
              fileName: img
            });
            await sleep(1); // try later until success

            break;
          } else if (src && (src as any).isNetwork?.()) {
            await sleep(10000); // try later until success
          } else break; // other issue, Image not found etc

        }

      } catch (e) {

      }
    }

    return htmlImages;

  }

  async prepDownload(url: string, parserName: string, _protected: boolean, startFromIndex: number = 0) {
    this.prepItems.set(url, { url, parserName, protected: _protected, startFromIndex });
    if (_protected)
      this.download(url, parserName, startFromIndex);
    this.trigger("Prep", url, parserName);
  }

  async download(
    url: string,
    parserName: string,
    startFromIndex?: number
  ) {
    try {
      if (this.items.has(url)) return;
      this.items.set(url, 0.1);

      let parser = context.parser.clone(parserName);
      parser.http = new HttpHandler(true); // to ignore alert
      let novel = await parser.detail(url);
      let book = await context.db.Books.query
        .where.column(x => x.url)
        .equalTo(url)
        .and.column(x => x.parserName)
        .equalTo(parserName)
        .findOrSave(
          Book.n()
            .Url(novel.url)
            .Name(novel.name)
            .ParserName(parserName)
            .ImageBase64(
              await context.http().imageUrlToBase64(novel.image)
            )
        );
      let key = "".fileName(novel.name, parserName);
      let file = await context.files.read(key);
      let savedItem = (file && file.has("{") ? JSON.parse(file) : { ...novel, chapters: [], startFromIndex }) as DetailInfo;
      savedItem.files = savedItem.files ?? []; // as temp for now
      savedItem.startFromIndex = startFromIndex ?? savedItem.startFromIndex ?? 0;
      let index = savedItem.chapters.length;
      let tries = 0;
      if (!file)
        await context.files.write(key, await JSON.stringify(savedItem).encodeAsync());
      this.change(url, novel.name);
      for (let i = 0; i < novel.chapters.length; i++) {

        try {

          let ch = novel.chapters[i];
          let savedChapter = savedItem.chapters.find(x => x.url == ch.url);
          index++;
          if (savedItem.startFromIndex > i) {
            if (!savedChapter) {
              console.info("Skip downloading chapter at index ", i);
              ch.content = "Not Downloaded";
              ch.empty = true;
              savedItem.chapters.push(ch);
            }
            continue;
          }
          if (savedChapter) {
            if (savedChapter.empty) {
              ch = savedChapter;
              ch.empty = false;
              ch.content = undefined;
            } else continue;
          }
          let chapterIndex = i.toString();
          let cn = ch.content;
          if (cn === undefined) {
            cn = (await parser.chapter(ch.url)) as string
            while (parser.getError() && parser.getError()?.isNetwork()) {
              await sleep(10000);
              cn = (await parser.chapter(ch.url)) as string;
            }
          }

          if (!cn || !cn.has()) {
            tries++;
            if (tries >= 5) break;
            continue;
          }
          tries = 0; // reset it as it is not a network issue
          ch.content = cn;
          let images: NovelFile[] = [];
          if (cn && !cn.empty() && savedItem.type && savedItem.type.isManga()) {
            savedItem.imagePath = folderValidName(savedItem.name);
            images = await this.downloadImages(cn, parser);
            savedItem.files = [...savedItem.files, ...images.map(x => {
              let src = getFileInfoFromUrl(x.fileName);
              if (ch?.content)
                ch.content = ch.content.replace(new RegExp(x.fileName.escapeRegExp(), "gim"), src);
              if (savedItem.imagePath)
                x.fileName = savedItem.imagePath.path(chapterIndex, src).trimEnd("/")
              return x;
            })]
          }

          if (savedChapter == undefined)
            savedItem.chapters.push(ch);
          if (index % 10 === 0 || savedItem.chapters.length == 1 || !this.items.has(savedItem.url)) {
            if (savedItem.files.length > 0) {
              for (let image of savedItem.files) {
                await context.imageCache.write(image.fileName, image.content);
              }
            }
            savedItem.files = [];
            await context.files.write(key, await JSON.stringify(savedItem).encodeAsync());
          }
          if (!this.items.has(savedItem.url))
            break; // stop btn pressed
          this.items.set(url, novel.chapters.length.downloadPercent(savedItem.chapters.length));
          this.change(url, novel.name);
          // so that it gets not to heavy on the website
          await sleep(2000);
        } catch (e) {
          console.error(e);
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }

    this.stop(url);

    this.change(url, "");
  }
}
