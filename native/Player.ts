import g from "../GlobalContext";
import {
  DetailInfo,
  ChapterInfo
} from "./ParserItems";
import { Chapter, Book } from "../db";
import { joinKeys } from "../Methods";
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
  constructor(
    novel: DetailInfo,
    book: Book,
    loader: any
  ) {
    this.book = book;
    this.novel = novel;
    this.loader = loader;
    //this.jumpTo(book.selectedChapterIndex);
  }

  procent() {
    return `${this.currentChapterIndex + 1}/${
      this.novel.chapters.length
    }`;
  }

  async getChapterContent(url: string) {
    try {
      this.loader?.show();
      if (
        this.currentChapterSettings?.content?.has() ??
        false
      ) {
        this.chapterArray =
          this.currentChapterSettings.content.htmlArray();
        return (this.html =
          this.currentChapterSettings.content);
      }
      let parser = g.parser.find(
        this.book.parserName
      );
      let str =this.novel.epub ? this.currentChapter.content : await parser.chapter(url);
      this.chapterArray = str.htmlArray();
      this.html =
        this.currentChapterSettings.content = str;

      //console.warn(this.chapterArray[0]);
      return str;
    } catch (e) {
      console.error(e);
      return "could not connect";
    } finally {
      this.loader?.hide();
    }
  }

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

  next() {
    if (this.hasNext())
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

  stop() {
    g.speech.stop();
  }
}

export default Player;
