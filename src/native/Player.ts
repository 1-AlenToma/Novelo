import {
  DetailInfo,
  ChapterInfo
} from "./ParserItems";
import { Chapter, Book } from "../db";
import {
  joinKeys,
  invertColor,
  sleep
} from "../Methods";
import { IImage } from "../Types";
import Html from "./Html";
import { useLoader } from "components";
type ViewState =
  | "Default"
  | "Folded"
  | "Unfolded";

class Player {
  book: Book;
  novel: DetailInfo;
  currentChapterIndex: number = 0;
  currentChapter: ChapterInfo = {} as any;
  currentChapterSettings: Chapter = {} as any;
  loader: any;
  showController: boolean = true;
  chapterArray: string[] = [];
  html: string = "";
  _playing: boolean = false;
  showPlayer: boolean = false;
  viewState: ViewState = "Default";
  hooked: boolean = true;
  scrollProcent: any = 0;
  isEpup: boolean;
  testVoice: string = "";
  networkError: boolean = false;
  highlightedText?: {
    text: string;
    index: number;
    length: number;
  } = undefined;
  menuOptions = {
    textToTranslate: undefined,
    translationLanguage: "English",
    textEdit: undefined,
    comment: undefined,
    define: undefined
  };
  isloading: boolean = false;
  constructor(
    novel: DetailInfo,
    book: Book,
    isEpup
  ) {
    this.book = book;
    this.novel = novel;
    this.isEpup = isEpup;
  }

  usePlayerLoader = () => {
    const loader = useLoader(this.isloading);
    useEffect(() => {
      this.loader = {
        hide: () => {
          this.isloading = false;
          loader.hide();
        },
        show: () => {
          loader.show();
          this.isloading = true;
        }
      }

      return () => this.loader = undefined;
    }, [])

    return loader;
  }

  show() {
    this.isloading = true;
    this.loader?.show();
  }
  hide() {
    this.isloading = false;
    this.loader?.hide();
  }

  procent(tempValue?: number) {
    return `${tempValue ?? this.currentChapterIndex + 1}/${this.novel.chapters.length}`;
  }

  async clean(html?: string) {
    if (this.novel.type && this.novel.type.isManga()) {
      return (this.html = html ?? "");
    }
    let txt = html ?? this.currentChapter.content ?? this.html;

    txt = new Html(txt).remove("script, style, iframe").html;

    txt = context.appSettings.useSentenceBuilder?.enabled && this.book.parserName != "epub" ? methods.generateText(txt, context.appSettings.useSentenceBuilder?.minLength ?? 100) : txt.html().outerHtml;
    try {
      for (let t of this.book.textReplacements) {
        let rg = new RegExp(t.edit.escapeRegExp(), "gim");
        let className = t.comments?.has() ? "comments" : "";
        let click = className.has() ? `window.postmsg('Comments', ${this.book.textReplacements.findIndex(x => x == t)})` : "";
        let spn = `<span onclick="${click}" class="custom ${className}" {#style}>${t.editWith}</span>`;
        if (t.bgColor) {
          spn = spn.replace("{#style}", `style="background-color:${t.bgColor}; color:${invertColor(t.bgColor)}"`)
        } else spn = spn.replace("{#style}", "")
        txt = txt.replace(/<(\/)?(strong|i)>/gmi, "").replace(rg, spn);
      }
    } catch (e) {
      console.error(e);
    } finally {
    }

    this.chapterArray = txt.htmlArray();
    this.html = txt;
    return txt;
  }

  async getChapterContent(url: string) {
    try {
      this.show();
      if (!this.currentChapterSettings) return;
      if (this.currentChapter.content &&
        this.currentChapter.content.length >= 10
      ) {
        return await this.clean(
          this.currentChapter.content
        );
      }
      let parser = context.parser.find(
        this.book.parserName
      ) as any;
      parser?.clearError();

      let str =
        this.novel.epub ||
          (this.currentChapter.content?.count(10))
          ? this.currentChapter.content
          : await parser?.chapter(url);

      this.networkError =
        parser.getError() &&
        parser.getError().isNetwork();

      return await this.clean(
        (this.currentChapter.content = str)
      );
    } catch (e) {
      console.error(e);
      this.html = e.message;
      return "could not connect";
    } finally {
      this.hide();
    }
  }

  getImage = async (...href: IImage[]) => {
    let imgs: any[] = [];
    let path = this.novel.imagePath as string;
    if (path) {
      for (let image of href) {
        if (image.src && image.src?.has(" header")) {
          imgs.push({ ...image, cn: await context.parser.current.http.imageUrlToBase64(image.src) });
          continue;
        }
        if (image.src.isBase64String()) {
          imgs.push({ ...image, path, cn: image.src.toBase64Url() });
          continue;
        }
        const chapterIndex = image.chapterIndex == undefined ? this.currentChapterIndex.toString() : image.chapterIndex;
        let src = this.book.parserName != "epub" ? path.path(chapterIndex.toString(), image.src).trimEnd("/") : path.path(getFileInfoFromUrl(image.src)).trimEnd("/");
        let imageData = await context.imageCache.read(src);
        if (!imageData || imageData.empty())
          console.warn("could not find", src, "-", image.src)
        imgs.push({ ...image, path, cn: imageData });
      }
    } else {
      for (let image of href) {
        if (image.src && image.src?.has(" header")) {
          imgs.push({ ...image, cn: (await context.parser.current.http.imageUrlToBase64(image.src)) });
          continue;
        }
      }
    }
    return imgs;
  };

  paddingBottom() {
    if (this.showPlayer) return 2;
    return 250;
  }

  paddingTop() {
    if (this.showPlayer || context.appSettings.navigationType !== "Scroll")
      return 2;
    return this.currentChapterIndex > 0
      ? 100
      : 10;
  }

  async jumpTo(index?: number | string) {
    this.show();
    await this.stop();
    await context.dbBatch(async () => {
      if (index === undefined)
        index = this.book.selectedChapterIndex;
      if (
        !context.appSettings.currentNovel ||
        context.appSettings.currentNovel.url !=
        this.book.url ||
        context.appSettings.currentNovel.parserName != this.book.parserName ||
        context.appSettings.currentNovel.isEpub !=
        this.isEpup
      ) {
        context.appSettings.currentNovel = {
          url: this.book.url,
          parserName: this.book.parserName,
          isEpub:
            this.isEpup ||
            this.book.parserName === "epub"
        };
        await context.appSettings.saveChanges();
      }
      if (typeof index === "string")
        index = this.novel.chapters.findIndex(
          x => x.url === index
        );
      if (this.novel.chapters[index] == undefined)
        index = this.novel.chapters.length - 1; // outside array

      this.currentChapterIndex = index as number
      this.book.selectedChapterIndex = index;
      this.currentChapter = this.novel.chapters[index];
      if (
        this.book.chapterSettings.find(
          x => x.name === this.currentChapter.name
        )
      ) {
        let ch = this.book.chapterSettings.find(
          x => x.name === this.currentChapter.name
        );
        if (ch &&
          (ch.audioProgress === undefined ||
            ch.audioProgress === null)
        ) {
          ch.audioProgress = 0;

        }

        if (ch)
          this.currentChapterSettings = ch;
      } else {
        let chSettings = Chapter.n()
          .Url(this.currentChapter.url)
          .Name(this.currentChapter.name)
          .ScrollProgress(this.currentChapterIndex > 0 && context.appSettings.navigationType === "Scroll" ? 100 : 10)
          .AudioProgress(0)
          .Parent_Id(this.book.id);

        await context.db.save<Chapter>(chSettings);
        this.currentChapterSettings = await context.db.asQueryable<Chapter>(chSettings);
        this.book.chapterSettings.push(this.currentChapterSettings as any);
      }

      await this.book.saveChanges();
      await this.getChapterContent(
        this.currentChapter.url
      );
      if (this.playing()) this.speak();
    });
    this.hide();
  }

  hasPrev() {
    return this.currentChapterIndex - 1 >= 0;
  }

  hasNext() {
    return (
      this.novel.chapters.length >
      this.currentChapterIndex + 1
    );
  }

  async next(finished?: boolean) {
    if (this.hasNext())
      if (
        finished &&
        this.currentChapterSettings
      ) {
        this.show();
        this.currentChapterSettings.isFinished = finished;
        await this.currentChapterSettings.saveChanges();
      }
    this.jumpTo(this.currentChapterIndex + 1);
  }

  async prev() {

    if (this.hasPrev())
      this.jumpTo(this.currentChapterIndex - 1);
  }

  playing(v?: boolean) {
    if (v == undefined) return this._playing;

    this._playing = v;
    if (!v) this.stop();
    else this.speak();
    return this._playing;
  }

  testPlaying(voice?: string) {
    if (voice == undefined) return this.testVoice;
    this.stop();
    if (this.testVoice === voice) this.stop();
    else if (voice) this.testPlay(voice);
    this.testVoice = this.testVoice === voice ? "" : voice;
    return this.testVoice;
  }

  currentPlaying() {
    let txt =
      this.chapterArray[
      this.currentChapterSettings.audioProgress
      ];
    return txt;
  }

  async playPrev() {
    await this.stop();
    if (
      this.currentChapterSettings.audioProgress -
      1 >=
      0
    ) {
      this.currentChapterSettings.audioProgress--;
      await this.currentChapterSettings.saveChanges();
      if (this.playing()) await this.speak();
    }
  }

  async playNext() {
    await this.stop();
    if (
      this.currentChapterSettings.audioProgress +
      1 >=
      this.chapterArray.length
    ) {
      await this.next();
      return;
    } else {
      this.currentChapterSettings.audioProgress++;
      await this.currentChapterSettings.saveChanges();
      if (this.playing()) await this.speak();
    }
  }

  private currentTextSpeacking = "";
  async speak() {
    let text = this.currentPlaying()?.cleanText() ?? "";
    if (!/[a-zA-Z0-9]/gim.test(text)) {
      await this.playNext();
      return;
    }
    if (await context.speech.isSpeakingAsync() && this.currentTextSpeacking == text)
      return;
    //await this.stop();
    this.currentTextSpeacking = text;
    context.speech.speak(this.currentTextSpeacking, {
      onBoundary: boundaries => {
        let { charIndex, charLength } = boundaries;

        this.highlightedText = {
          text: text,
          index: charIndex,
          length: charLength
        };
      },
      language: undefined,
      pitch: context.appSettings.pitch,
      rate: context.appSettings.rate,
      voice: context.appSettings.voice,
      onDone: (async () => {
        await this.stop();
        if (this.playing()) await this.playNext();
      }) as any
    });
  }

  async testPlay(voice: string) {
    await this.stop();
    context.speech.speak(
      `There are a number of ways to identify a hearing loss.`,
      {
        language: undefined,
        pitch: context.appSettings.pitch,
        rate: context.appSettings.rate,
        voice: voice,
        onDone: (async () => {
          this.testVoice = "";
        }) as any
      }
    );
  }

  async stop() {
    if (await context.speech.isSpeakingAsync())
      await context.speech.stop();
  }
}

export default Player;
