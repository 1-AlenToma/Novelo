import g from "../GlobalContext";
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

  procent() {
    return `${this.currentChapterIndex + 1}/${
      this.novel.chapters.length
    }`;
  }

  async clean(html?: string) {
    let txt =
      html ??
      this.currentChapterSettings.content ??
      this.html;
    try {
      // if (!html) this.loader?.show();
      txt = txt.replace(
        /(background\-color|background|font\-family|color|font\-size|line\-height|text\-align|font\-weight)( ?: ?).*?(\;)/gi,
        ""
      );
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
        this.currentChapterSettings.content?.has() ??
        false
      ) {
        return await this.clean(
          this.currentChapterSettings.content
        );
      }
      let parser = g.parser.find(
        this.book.parserName
      );

      let str =
        this.novel.epub ||
        this.currentChapter.content
          ? this.currentChapter.content
          : await parser.chapter(url);

      return await this.clean(
        (this.currentChapterSettings.content =
          str)
      );
    } catch (e) {
      console.error(e);
      return "could not connect";
    } finally {
      this.loader?.hide();
    }
  }

  getImage = (...href: string[]) => {
    let imgs = [];
    if (this.novel.files && href.length > 0) {
      for (let h of href) {
        let img = this.novel.files.find(
          x =>
            x.fileName.indexOf(h) !== -1 &&
            x.type === "Image"
        );
        if (img)
          imgs.push({ h, cn: img.content });
      }
    }

    return imgs;
  };

  paddingBottom() {
    if (this.showPlayer) return 2;
    return this.currentChapterIndex <
      this.novel.chapters.length
      ? 250
      : 10;
  }

  paddingTop() {
    if (this.showPlayer) return 2;
    return this.currentChapterIndex > 0
      ? 100
      : 10;
  }

  async jumpTo(index?: number | string) {
    if (index === undefined)
      index = this.book.selectedChapterIndex;
    if (
      !g.appSettings.currentNovel ||
      g.appSettings.currentNovel.url !=
        this.book.url ||
      g.appSettings.currentNovel.parserName !=
        this.book.parserName
    ) {
      g.appSettings.currentNovel = {
        url: this.book.url,
        parserName: this.book.parserName
      };
      await g.appSettings.saveChanges();
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
      // alert(this.currentChapterSettings.scrollProgress);
    } else {
      let chSettings = Chapter.n()
        .Url(this.currentChapter.url)
        .Name(this.currentChapter.name)
        .ScrollProgress(
          this.currentChapterIndex > 0 ? 100 : 10
        )
        .Parent_Id(this.book.id);
      await g.db().save<Chapter>(chSettings);
      this.currentChapterSettings = await g
        .db()
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
    g.speech.speak(text, {
      language: undefined,
      pitch: g.appSettings.pitch,
      rate: g.appSettings.rate,
      voice: g.appSettings.voice,
      onDone: async () => {
        if (this.playing()) this.playNext();
      }
    });
  }

  async testPlay(voice: string) {
    g.speech.speak(
      `There are a number of ways to identify a hearing loss.`,
      {
        language: undefined,
        pitch: g.appSettings.pitch,
        rate: g.appSettings.rate,
        voice: voice,
        onDone: async () => {
          this.testVoice = "";
        }
      }
    );
  }

  stop() {
    g.speech.stop();
  }
}

export default Player;
