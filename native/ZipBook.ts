import { Book, Chapter } from "../db";
import { newId, sleep } from "../Methods";
import * as FileSystem from "expo-file-system";
const JSZip = require("jszip");
class ZipFile {
  name: string;
  fileName:string;
  content: string;
  url: string = newId();
  type: "Image" | "CSS" | "HTML";
}
export default class ZipBook {
  files: ZipFile = [];
  chapters: ZipFile = [];
  name: string = "";
  url: string = newId();
  epub: boolean = true;
  static async load(uri: string, xname: string) {
    function isImage(url: string) {
      return (
        url.match(/\.(jpeg|jpg|gif|png)$/) !==
        null
      );
    }
    let cleanNames = (n: string) => {
      n = n.split("\\").reverse()[0];
      if (/\..*$/.test(n))
        n = n
          .split(".")
          .reverse()
          .skip(0)
          .reverse()
          .join(".");
      return n;
    };
    let book = new ZipBook();
    book.name = cleanNames(xname);
    try {
      let getContent = async (file: any) => {
        try {
          let cn = "";
          let type = "";
          let cleanName = cleanNames(file.name);
         // console.log(file.name, name);
          let name = cleanName;
          if (isImage(file.name)) {
            type = "Image";
            cn = `data:image/jpg;base64,${await file.async(
              "base64"
            )}`;
          } else if (
            file.name.endsWith(".ncx") ||
            file.name.indexOf("-toc.") !== -1
          ) {
            return undefined;
          } else if (file.name.endsWith(".css")) {
            type = "CSS";
            cn = await file.async("text");
          } else if (
            file.name.endsWith(".html") ||
            file.name.endsWith(".xhtml")
          ) {
            type = "HTML";
            cn = (await file.async("text"))
              .html()("body")
              ?.html();
            let title = cn.html()("title");
            if (
              title &&
              title.text().has() &&
              !/\..*$/.test(title.text())
            )
              name = cleanNames(title.text());
          }

          let f = new ZipFile();
          f.name = name;
          f.type = type;
          f.content = cn;
          f.fileName = file.name;
          return f;
        } catch (e) {
          console.error(e);
        }
      };
      let base64 =
        await FileSystem.readAsStringAsync(uri, {
          encoding: "base64"
        });

      var zip = new JSZip();
      let content = await zip.loadAsync(base64, {
        base64: true
      });

      let keys = Object.keys(content.files);
      let opf = keys.find(x =>
        x.endsWith(".opf")
      );
      let $ = (
        await content.file(opf).async("text")
      ).html();
      let items = [];
      $("manifest")
        .find("item")
        .each((i, x) => items.push(x));
      for (let item of items) {
        item = $(item);
        let href = item.attr("href");
        let k = keys.find(
          x => x.indexOf(href) !== -1
        );
        if (!k) continue;
        //console.log(href, k);
        let file = content.file(k);
        if (!file) continue;
        let file_content = await getContent(file);

        if (!file_content) continue;
        book.files.push(file_content);
        if (file_content.type === "HTML")
          book.chapters.push(file_content);
      }
      //  console.log([book].niceJson("content"));
      return book;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
