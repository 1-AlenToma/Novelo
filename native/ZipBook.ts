import { Book, Chapter } from "../db";
import { newId, sleep } from "../Methods";
import * as FileSystem from "expo-file-system";
const JSZip = require("jszip");
class ZipFile {
  name: string;
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
  static async load(uri: string, name: string) {
    let book = new ZipBook();
    book.name = name;
    try {
      function isImage(url: string) {
        return (
          url.match(/\.(jpeg|jpg|gif|png)$/) !=
          null
        );
      }
      let getContent = async (file: any) => {
        try {
          let cn = "";
          let type = "";
          let name = file.name.replace(
            /.*\//g,
            ""
          );
          if (isImage(name)) {
            type = "Image";
            cn = `data:image/jpg;base64,${await file.async(
              "base64"
            )}`;
          } else if (
            name.endsWith(".ncx") ||
            name.indexOf("-toc.") !== -1
          ) {
            return undefined;
          } else if (name.endsWith(".css")) {
            type = "CSS";
            cn = await file.async("text");
          } else if (
            name.endsWith(".html") ||
            name.endsWith(".xhtml")
          ) {
            type = "HTML";

            cn = await file.async("text");
            let title = cn.html()("title");
            if (title) name = title.text();
          }

          let f = new ZipFile();
          f.name = name;
          f.type = type;
          f.content = cn;
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
        if(!k) continue;
        let file = content.file(k);
        /*console.log(
            [file_content].niceJson(
              "compressedContent"
            )
          );*/
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
