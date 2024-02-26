import { newId, sleep } from "../Methods";
import { Book } from "../db";
import {
  useState,
  useEffect,
  useRef
} from "react";
import HttpHandler from "./HttpHandler";

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
    let [infos, setInfos] = useState([]);
    let id = useRef(newId()).current;
    this.events[id] = () => {
      let tms = [];
      this.items.forEach((p, url) => {
        tms.push({ url, p });
      });
      setInfos(tms);
    };

    useEffect(() => {
      return () => delete this.events[id];
    }, []);

    return infos;
  }
  async download(
    url: string,
    parserName: string
  ) {
    try {
      if (this.items.has(url)) return;
      this.items.set(url, 0.1);
      this.change();
      let key = `${(url + parserName)
        .replace(
          /(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\’)/gim,
          ""
        )
        .toLowerCase()}.json`;
      const g =
        require("../GlobalContext").default;
      const ParserWrapper = require("../parsers/ParserWrapper").default;
      let file = await g.files.read(key);
      let parser =
        ParserWrapper.getAllParsers(parserName);
      parser.http = new HttpHandler(true); // to ignore alert
      let novel = await parser.detail(url);
      let book = await g
        .db()
        .querySelector<Book>("Books")
        .Where.Column(x => x.url)
        .EqualTo(url)
        .AND.Column(x => x.parserName)
        .EqualTo(parserName)
        .findOrSave(
          Book.n()
            .Url(novel.url)
            .Name(novel.name)
            .ParserName(parserName)
            .ImageBase64(
              await g
                .http()
                .imageUrlToBase64(novel.image)
            )
        );
      let savedItem =
        file && file.has("{")
          ? JSON.parse(file)
          : { ...novel, chapters: [] };
      let index = savedItem.chapters.length;
      let tries = 0;
      for (let ch of novel.chapters.filter(
        x =>
          !savedItem.chapters.find(
            a => a.url == x.url
          )
      )) {
        try {
          index++;
          let cn = ch.content;
          if (cn === undefined) {
            cn = await parser.chapter(ch.url);
          }

          if (!cn || !cn.has()) {
            tries++;
            if (tries >= 5) break;
            continue;
          }
          tries = 0; // reset it as it is not a network issue
          ch.content = cn;
          if (
            !savedItem.chapters.find(
              x => x.url == ch.url
            )
          )
            savedItem.chapters.push(ch);
          if (
            index % 50 === 0 ||
            savedItem.chapters.length == 1 ||
            !this.items.has(savedItem.url)
          ) {
            await g.files.write(
              key,
              JSON.stringify(savedItem)
            );
          }
          if (!this.items.has(savedItem.url))
            break; // stop btn pressed
          this.items.set(
            url,
            (100 * savedItem.chapters.length +
              1) /
              novel.chapters.length
          );
          this.change();
          await sleep(1000);
        } catch (e) {
          console.error(e);
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }
    this.change();
    this.items.delete(url);
  }
}
