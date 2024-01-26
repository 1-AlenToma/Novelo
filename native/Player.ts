import g from "../GlobalContext";
import {
  DetailInfo,
  ChapterInfo
} from "./ParserItems";
import { Chapter, Book } from "../db";
import { joinKeys } from "../Methods";

class Player {
  book: Book;
  novel: DetailInfo;
  currentChapterIndex: number = 0;
  currentChapter: ChapterInfo;
  currentChapterSettings: Chapter;
  loader: any;
  showController: boolean = true;
  constructor(
    novel: DetailInfo,
    book: Book,
    loader: any
  ) {
    this.book = book;
    this.novel = novel;
    this.loader = loader;
    this.jumpTo(book.selectedChapterIndex);
  }

  get procent() {
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
      )
        return this.currentChapterSettings
          .content;
      let parser = g.parser.find(
        this.book.parserName
      );
      let str = await parser.chapter(url);
      this.currentChapterSettings.content = str;
      return str;
    } catch (e) {
      console.error(e);
      return "could not connect";
    } finally {
      this.loader?.hide();
    }
  }

  get paddingBottom() {
    return this.currentChapterIndex <
      this.novel.chapters.length
      ? 150
      : 10;
  }

  get paddingTop() {
    return this.currentChapterIndex > 0
      ? 100
      : 10;
  }

  async jumpTo(index: number | string) {
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
      this.currentChapterSettings = Chapter.n()
        .Url(this.currentChapter.url)
        .Name(this.currentChapter.name)
        .Parent_Id(this.book.id);
      this.currentChapterSettings = await g
        .db()
        .save<Chapter>(
          this.currentChapterSettings
        );
      this.book.chapterSettings.push(
        this.currentChapterSettings
      );
    }

    await g.db().save(this.book);
    await this.getChapterContent(
      this.currentChapter.url
    );
    this.loader?.hide();
  }

  get hasPrev() {
    return this.currentChapterIndex - 1 >= 0;
  }

  get hasNext() {
    return (
      this.novel.chapters.length >
      this.currentChapterIndex + 1
    );
  }

  get next() {
    if (this.hasNext)
      this.jumpTo(this.currentChapterIndex + 1);
  }

  get prev() {
    if (this.hasPrev)
      this.jumpTo(this.currentChapterIndex - 1);
  }

  speak(text: string) {
    g.speech.speak(item.data);
  }

  stop() {
    g.speech.stop();
  }
}

export default Player;
