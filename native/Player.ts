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
type ViewState =
  | "Default"
  | "Folded"
  | "Unfolded";
class Player {
  book: Book;
  novel: DetailInfo;
  currentChapterIndex: number = 0;
  currentChapter: ChapterInfo = {};
  currentChapterSettings: Chapter = {};
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
  constructor(
    novel: DetailInfo,
    book: Book,
    loader: any,
    isEpup
  ) {
    this.book = book;
    this.novel = novel;
    this.loader = loader;
    this.isEpup = isEpup;
  }

  procent(tempValue?: number) {
    return `${
      tempValue ?? this.currentChapterIndex + 1
    }/${this.novel.chapters.length}`;
  }

  async clean(html?: string) {
    let txt =
      html ??
      this.currentChapter.content ??
      this.html;
      txt=txt.html().html()
    try {
      for (let t of this.book.textReplacements) {
        let rg = new RegExp(
          t.edit.escapeRegExp(),
          "gim"
        );
        
        let className = t.comments?.has()
          ? "comments"
          : "";
        let click = className.has()
          ? `window.postmsg('Comments', ${this.book.textReplacements.findIndex(
              x => x == t
            )})`
          : "";
        let spn = `<span onclick="${click}" class="custom ${className}" style="background-color:${
          t.bgColor
        }; color:${invertColor(t.bgColor)}">${
          t.editWith
        }</span>`;
        txt = txt.replace(rg, spn);
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
      this.loader?.show();
      if (!this.currentChapterSettings) return;
      if (
        this.currentChapter.content?.length >= 10
      ) {
        return await this.clean(
          this.currentChapter.content
        );
      }
      let parser = context.parser.find(
        this.book.parserName
      );
      parser.clearError();
      let str =
        this.novel.epub ||
        this.currentChapter.content?.length >= 10
          ? this.currentChapter.content
          : await parser.chapter(url);

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
      this.loader?.hide();
    }
  }

  getImage = async (...href: string[]) => {
    let imgs = [];
    if (this.novel.files && href.length > 0) {
      for (let h of href) {
        let img = this.novel.files.find(
          x =>
            x.fileName.indexOf(h) !== -1 &&
            x.type === "Image"
        );
        if (img) {
          let imageData = img.content.startsWith(
            "file"
          )
            ? await context
                .imageCache()
                .read(img.content)
            : img.content;
          imgs.push({ h, cn: imageData });
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
    if (
      this.showPlayer ||
      context.appSettings.navigationType !==
        "Scroll"
    )
      return 2;
    return this.currentChapterIndex > 0
      ? 100
      : 10;
  }

  async jumpTo(index?: number | string) {
    if (index === undefined)
      index = this.book.selectedChapterIndex;
    if (
      !context.appSettings.currentNovel ||
      context.appSettings.currentNovel.url !=
        this.book.url ||
      context.appSettings.currentNovel
        .parserName != this.book.parserName ||
      context.appSettings.currentNovel.isEpub !=
        this.isEpub
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
    this.loader?.show();
    this.currentChapterIndex = index;
    this.book.selectedChapterIndex = index;
    this.currentChapter =
      this.novel.chapters[index];
    if (
      this.book.chapterSettings.find(
        x => x.name === this.currentChapter.name
      )
    ) {
      this.currentChapterSettings =
        this.book.chapterSettings.find(
          x => x.name === this.currentChapter.name
        );
    } else {
      let chSettings = Chapter.n()
        .Url(this.currentChapter.url)
        .Name(this.currentChapter.name)
        .ScrollProgress(
          this.currentChapterIndex > 0 &&
            context.appSettings.navigationType ===
              "Scroll"
            ? 100
            : 10
        )
        .Parent_Id(this.book.id);
      await context
        .db()
        .save<Chapter>(chSettings);
      this.currentChapterSettings = await context.db()
        .asQueryable<Chapter>(chSettings);
      this.book.chapterSettings.push(
        this.currentChapterSettings
      );
    }

    await this.book.saveChanges();
    await this.getChapterContent(
      this.currentChapter.url
    );
    if (this.playing()) this.speak();
    this.loader?.hide();
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
        this.currentChapterSettings.isFinished =
          finished;
        await this.currentChapterSettings.saveChanges();
      }
    this.jumpTo(this.currentChapterIndex + 1);
  }

  prev() {
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
    this.testVoice =
      this.testVoice === voice ? "" : voice;
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
    if (
      this.currentChapterSettings.audioProgress -
        1 >=
      0
    ) {
      this.currentChapterSettings.audioProgress--;
      await this.currentChapterSettings.saveChanges();
      if (this.playing()) this.speak();
    }
  }

  async playNext() {
    if (
      this.currentChapterSettings.audioProgress +
        1 >=
      this.chapterArray.length
    ) {
      this.next();
      return;
    } else {
      this.currentChapterSettings.audioProgress++;
      await this.currentChapterSettings.saveChanges();
      if (this.playing()) this.speak();
    }
  }

  speak() {
    this.stop();
    let text =
      this.currentPlaying()?.cleanText() ?? "";
    context.speech.speak(text, {
      language: undefined,
      pitch: context.appSettings.pitch,
      rate: context.appSettings.rate,
      voice: context.appSettings.voice,
      onDone: async () => {
        if (this.playing()) this.playNext();
      }
    });
  }

  async testPlay(voice: string) {
    context.speech.speak(
      `There are a number of ways to identify a hearing loss.`,
      {
        language: undefined,
        pitch: context.appSettings.pitch,
        rate: context.appSettings.rate,
        voice: voice,
        onDone: async () => {
          this.testVoice = "";
        }
      }
    );
  }

  stop() {
    context.speech.stop();
  }
}

export default Player;
