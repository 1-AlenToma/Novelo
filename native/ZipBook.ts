import { Book, Chapter } from "../db";
import { newId, sleep } from "../Methods";
import * as FileSystem from "expo-file-system";
const JSZip = require("jszip");
class ZipFile {
  name: string;
  fileName: string;
  content: string;
  url: string = newId();
  type: "Image" | "CSS" | "HTML";
}
export default class ZipBook {
  files: ZipFile = [];
  chapters: ZipFile = [];
  name: string = "";
  url: string = newId();
  fileName?: string; // used only in dbContext
  epub: boolean = true;
  isChapter: boolean = false;
  playOrder: number = 0;

  static createImageChapter(images: ZipFile[]) {
    if (images.length == 0) return undefined;
    let ch = new ZipFile();
    ch.type = "HTML";
    ch.fileName = "ImagesInto.html";
    ch.name = "Images Intro";
    ch.content = `
    <div>
    <h1>Images Intro</h1>
    ${images
      .map(x => `<img src="${x.fileName}" />`)
      .join("\n")}
    </div>
    `;

    return ch;
  }
  static async load(
    uri: string,
    xname: string,
    onChange: Function,
    skipImages?: boolean
  ) {
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
    let g = require("../GlobalContext").default;
    book.name = cleanNames(xname);
    try {
      let getContent = async (
        file: any,
        navMap: []
      ) => {
        try {
          let cn = "";
          let type = "";
          let cleanName = cleanNames(file.name);
          let name = cleanName;
          let fileName = file.name.toString();
          let ext = fileName
            .safeSplit(".", -1)
            .toString();

          let chapter = navMap.find(
            x =>
              fileName.indexOf(x.name) != -1 ||
              x.name.indexOf(fileName) != -1
          );

          if (isImage(fileName)) {
            if(skipImages)
               return undefined;
            type = "Image";
            cn = `data:image/jpg;base64,${await file.async(
              "base64"
            )}`;
          } else if (
            ext == "ncx" ||
            fileName.has("-toc.")
          ) {
            return undefined;
          } else if (ext == "css") {
            type = "CSS";
            cn = await file.async("text");
          } else if (
            ext == "html" ||
            ext == "xhtml"
          ) {
            type = "HTML";
            let filecontent =
              await file.async("text");
            cn =
              filecontent
                .html()("body")
                ?.html() ?? filecontent;
            let title =
              filecontent.html()("title");
            if (
              title &&
              title.text().has() &&
              !/\..*$/.test(title.text())
            ) {
              name = cleanNames(title.text());
            }
          }

          let zipFile = new ZipFile();
          zipFile.name = chapter?.text ?? name;
          zipFile.type = type;
          zipFile.content = cn;
          zipFile.fileName = file.name;
          zipFile.isChapter =
            chapter != undefined;
          zipFile.playOrder = parseInt(
            chapter?.playOrder ??
              book.chapters.length.toString()
          );

          return zipFile;
        } catch (e) {
          console.error(file.name, e);
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

      let navMap = [];
      const renderNavMap = async () => {
        let ncxs = keys.filter(x =>
          x.has(".ncx")
        );
        for (let item of ncxs) {
          let $ = (
            await content.file(item).async("text")
          ).html();
          $("navMap")
            .find("navPoint")
            .each((i, x) =>
              navMap.push({
                id: $(x).attr("id"),
                text: $(x).find("text").text(),
                playOrder:
                  $(x).attr("playOrder") ??
                  i.toString(),
                name: $(x)
                  .find("content")
                  .attr("src")
              })
            );
        }
      };
      await renderNavMap();
      let $ = (
        await content.file(opf).async("text")
      ).html();

      let items = [];
      $("manifest")
        .find("item")
        .each((i, x) => items.push(x));
      let total = items.length;
      let count = 0;
      const calc = async () => {
        count++;
        onChange?.((100 * count) / total);
        if (count == 1 || count % 50 == 0)
          await sleep(10);
      };

      for (let item of items) {
        item = $(item);
        let href = item.attr("href");
        let k = keys.find(
          x => x.indexOf(href) !== -1
        );

        if (!k) {
          await calc();
          continue;
        }

        let file = content.file(k);
        if (!file) {
          await calc();
          continue;
        }

        let file_content = await getContent(
          file,
          navMap
        );

        if (!file_content) {
          await calc();
          continue;
        }
        book.files.push(file_content);
        if (
          file_content.type === "HTML" &&
          (file_content.isChapter ||
            navMap.length == 0)
        ) {
          book.chapters.push(file_content);
        }
        await calc();
      }
      book.chapters = book.chapters.sort(
        (a, b) => a.playOrder - b.playOrder
      );
      return book;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
