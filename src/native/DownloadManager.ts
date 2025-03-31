import { newId, sleep } from "../Methods";
import { NovelFile } from "../Types";
import { Book } from "../db";
import ParserWrapper from "../parsers/ParserWrapper";
import HttpHandler from "./HttpHandler";
import { DetailInfo } from "./ParserItems";

export default class DownloadManager {
  events: any = {};
  items: Map<string, number> = new Map();
  change() {
    for (let k in this.events) {
      this.events[k]();
    }
  }

  stop(url: string) {
    this.items.delete(url);
    return this;
  }

  useDownload() {
    let [infos, setInfos] = useState<any[]>([]);
    let id = useRef(newId()).current;
    this.events[id] = () => {
      let tms: any[] = [];
      this.items.forEach((p, url) => {
        tms.push({ url, p });
      });
      setInfos(tms);
    };

    useEffect(() => {
      return () => { delete this.events[id] }
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

  async download(
    url: string,
    parserName: string
  ) {
    try {
      if (this.items.has(url)) return;
      this.items.set(url, 0.1);

      let parser = ParserWrapper.getAllParsers(parserName) as ParserWrapper;
      parser.http = new HttpHandler(true); // to ignore alert
      let novel = await parser.detail(url);
      let book = await context.db.Books.query
        .where.column(x => x.url)
        .equalTo(url)
        .and
        .column(x => x.parserName)
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
      let savedItem = (file && file.has("{") ? JSON.parse(file) : { ...novel, chapters: [] }) as DetailInfo;
      savedItem.files = savedItem.files ?? []; // as temp for now
      let index = savedItem.chapters.length;
      let tries = 0;
      if (!file)
        await context.files.write(key, JSON.stringify(savedItem));
      this.change();
      for (let ch of novel.chapters.filter(x => !savedItem.chapters.find(a => a.url == x.url))) {
        try {
          index++;
          let chapterIndex = novel.chapters.indexOf(ch).toString();
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

          if (!savedItem.chapters.find(x => x.url == ch.url))
            savedItem.chapters.push(ch);
          if (index % 10 === 0 || savedItem.chapters.length == 1 || !this.items.has(savedItem.url)) {
            if (savedItem.files.length > 0) {
              for (let image of savedItem.files) {
                await context.imageCache.write(image.fileName, image.content);
              }
            }
            savedItem.files = [];
            await context.files.write(key, JSON.stringify(savedItem));
          }
          if (!this.items.has(savedItem.url))
            break; // stop btn pressed
          this.items.set(url, (100 * savedItem.chapters.length + 1) / novel.chapters.length);
          this.change();
          // so that it gets not to heavy on the website
          await sleep(5000);
        } catch (e) {
          console.error(e);
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }

    this.items.delete(url);
    this.change();
  }
}
