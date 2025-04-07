import { AlertDialog, newId } from "components";
import { Book } from "../db";
import { DetailInfo } from "./ParserItems";
import RNFS from 'react-native-fs';
import IDOMParser from "advanced-html-parser";
import Player from "./Player";
import { FilesPath, ZipFileItem } from "../Types";
import { unzip, zip as ZipFile } from 'react-native-zip-archive';
import FileHandler from "./FileHandler";

export const createEpub = async (novel: DetailInfo, book: Book, path: string, onUpdate: (item: {
  percent: number;
  currentFile: string | null;
}) => void) => {
  try {
    const zip = {
      files: {} as {
        [key: string]: ZipFileItem
      },
      file: (path: string, content: string, base64: boolean = false) => {
        zip.files[path] = {
          path,
          content,
          base64
        } as ZipFileItem;
      }
    }
    let player = new Player(novel, book, {}, true);
    let cover = novel.image ? (await player.getImage({ src: novel.image, id: "" })).firstOrDefault("cn") : undefined;
    function extractBase64(rawDataUrl: string): string {
      const match = rawDataUrl.match(/^data:image\/[^;]+;base64,(.*)$/);
      if (!match) throw new Error("Invalid base64 image string");
      return match[1];
    }
    // Step 1: Add mimetype (must be first, uncompressed)
    zip.file("mimetype", "application/epub+zip");
    if (cover) {
      zip.file("OEBPS/images/cover.jpg", extractBase64(cover), true);
      const coverPage = `
    <?xml version="1.0" encoding="utf-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head><title>${novel.decription} Cover</title></head>
      <body style="margin: 0; padding: 0;">
        <div style="text-align: center;">
          <img src="../images/cover.jpg" alt="Cover" style="max-width: 100%; height: auto;"/>
        </div>
        <div>
        <h2>Description</h2>
           ${novel.decription}
        </div>
      </body>
    </html>
    `.trim();

      zip.file("OEBPS/chapters/cover.xhtml", coverPage);

    }
    const cssContent = `
  body {
    font-family: serif;
    margin: 1em;
    line-height: 1.5;
    color: #333;
  }
  h1 {
    font-size: 2em;
    color: #4A90E2;
  }
  p {
    font-size: 1em;
  }

  body img {
     max-width: 98%;
  }

  .Manga img {
          margin: auto;
          margin-bottom: 5px;
          display: block;
        }

       br{
          display:none;
        }

        strong{
           font-weight:bold !important;
         }
         .italic, i {
           display:inline !important;
           font-style: italic !important;
           font-size: ${context.appSettings.fontSize - 4}px !important;
         }
`.trim();

    zip.file("OEBPS/style.css", cssContent);

    // Step 2: Add META-INF/container.xml
    zip.file("META-INF/container.xml", `
    <?xml version="1.0"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
      </rootfiles>
    </container>
  `.trim());

    function createTocNcx(title: string, chapters: { title: string, filename: string }[]) {
      return `
  <?xml version="1.0" encoding="utf-8"?>
  <!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
    "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
  <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
      <meta name="dtb:uid" content="book-id"/>
      <meta name="dtb:depth" content="1"/>
      <meta name="dtb:totalPageCount" content="0"/>
      <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle><text>${title}</text></docTitle>
    <navMap>
      ${chapters.map((ch, i) => `
      <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
        <navLabel><text>${ch.title}</text></navLabel>
        <content src="${ch.filename}"/>
      </navPoint>`).join("")}
    </navMap>
  </ncx>
  `.trim();
    }

    let tocContent = createTocNcx(novel.name, [
      ...[cover ? { title: "cover_page", filename: "chapters/cover.xhtml" } : undefined],
      ...novel.chapters.map((x, index) => ({ title: x.name, filename: `chapters/${index}.xhtml` }))
    ].filter(x => x))
    zip.file("OEBPS/toc.ncx", tocContent);

    // Step 3: Add OEBPS files
    zip.file("OEBPS/content.opf", `
    <?xml version="1.0" encoding="utf-8"?>
    <package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${novel.name}</dc:title>
        <dc:language>en</dc:language>
        <dc:identifier id="BookId">${novel.url}</dc:identifier>
        <dc:description>${novel.decription}</dc:description>
        <meta name="cover" content="cover-image"/>
      </metadata>
      <manifest>
       <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
       <item id="style" href="style.css" media-type="text/css"/>
      ${cover ? `<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg"/>` : ""}
       ${cover ? `<item id="cover-page" href="chapters/cover.xhtml" />` : ""}
      ${novel.chapters.map((x, index) => `<item id="chapter${index}" href="chapters/${index}.xhtml" media-type="application/xhtml+xml"/>`).join("\n")}
      </manifest>
      <spine toc="ncx">
       ${cover ? `<itemref idref="cover-page" />` : ""}
       ${novel.chapters.map((x, index) => `<itemref idref="chapter${index}" />`).join("\n")}
      </spine>
    </package>
  `.trim());
    let chapterIndex = 0;
    let imageIndex = 0;
    const validateContent = async (content: string) => {
      if (!content || content.empty())
        return "";
      const doc = IDOMParser.parse(`<div>${content}</div>`, {
        errorHandler: {
          error: (e: string) => { },
          warning: (e: string) => { },
          fatalError: console.error
        }

      }).documentElement;



      for (let item of [...doc.querySelectorAll("img")]) {
        try {
          const filename = `image_${imageIndex++}.jpg`;
          let src = item.getAttribute("src");
          if (src && src.isLocalPath()) {
            let img: string = (await player.getImage({
              chapterIndex,
              id: "",
              src
            })).firstOrDefault("cn");
            if (img) {
              zip.file(`OEBPS/images/${filename}`, extractBase64(img), true);
              item.setAttribute("src", `../images/${filename}`);
            }
          }
        } catch (e) {
          console.log(e)
        }
      }
      return doc.innerHTML;
    }


    for (let chapter of novel.chapters) {
      zip.file(`OEBPS/chapters/${chapterIndex}.xhtml`, `
    <?xml version="1.0" encoding="utf-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <title>${novel.name}</title>
      <link href="../style.css" rel="stylesheet" type="text/css"/>
      </head>
      <body class="${novel.type}">
        ${await validateContent(chapter.content)}
      </body>
    </html>
  `.trim());
      onUpdate({
        percent: novel.chapters.length.procent(chapterIndex),
        currentFile: `Parsing Chapter (${chapter.name})`
      });
      chapterIndex++;
    }

    // Step 4: Generate ZIP as base64
    console.log("Generating Zip");

    const folder = RNFS.CachesDirectoryPath.path(newId());
    let fileHandler = new FileHandler(folder);

    path = path.path(`${novel.name}.epub`);
    let writeFile = true;
    console.log("Saving ", path)
    if (await RNFS.exists(path)) {
      writeFile = await AlertDialog.confirm({ message: "A file with the same name already exist, should I overwrite it", title: "Attention" });
      if (writeFile) {
        await RNFS.unlink(path);
      }
    }

    async function writeBufferToFile() {
      let fileIndex = 0;
      let length = Object.keys(zip.files).length;
      for (let key in zip.files) {
        let file = zip.files[key];
        if (file) {
          await fileHandler.write(folder.path(file.path), file.content, file.base64 ? "base64" : undefined);
        }
        onUpdate({
          percent: length.procent(fileIndex),
          currentFile: `Genereting Files`
        });
        fileIndex++;
      }

      onUpdate({
        percent: 0.9,
        currentFile: `Genereting Epub`
      });
      await ZipFile(folder, path);
      await fileHandler.deleteDir();

    }

    if (writeFile) {
      await writeBufferToFile();
      onUpdate({
        percent: 1,
        currentFile: `Genereting Epub`
      });
      AlertDialog.alert({ message: "File create at " + path, title: "epub Download" });

    }
    console.log('EPUB saved at:', path.path(`${novel.name}.epub`));
  } catch (e) {
    console.error(e)
  }
};
