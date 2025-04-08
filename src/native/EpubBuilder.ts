import { AlertDialog, newId } from "components";
import { Book } from "../db";
import { DetailInfo } from "./ParserItems";
import RNFS from 'react-native-fs';
import IDOMParser from "advanced-html-parser";
import Player from "./Player";
import { FilesPath, ZipFileItem, OPFContent } from "../Types";
import { unzip, subscribe } from 'react-native-zip-archive';
import FileHandler from "./FileHandler";
import { NativeModules } from 'react-native';
const { EpubZipper } = NativeModules;

class ZipBase {
  name: string = "";
  url: string = newId();
  fileName?: string; // used only in dbContext
  epub: boolean = true;
  playOrder: number = 0;
  id?: string;
  text?: string;
}
class ZipFile extends ZipBase {
  content: string;
  type: "Image" | "CSS" | "HTML" | "None"
}
export class ZipBook extends ZipBase {
  chapters: ZipFile[] = [];
  epub: boolean = true;
  imagePath?: string;
  type: string;

}

export const readEpub = async (uri: string, onUpdate: (item: {
  percent: number;
  currentFile: string | null;
}) => void) => {
  const event = subscribe(({ progress, filePath }) => {
    onUpdate({
      percent: progress * 100,
      currentFile: "Parsing the epub File"
    })
  });

  const tempPath = RNFS.CachesDirectoryPath.join(FilesPath.Temp, newId());
  const fileHandler = new FileHandler(tempPath);
  const book = new ZipBook();
  try {
    await context.db.disableHooks();
    await context.db.disableWatchers();
    context.files.disable();

    const zip = {
      files: {} as {
        [key: string]: ZipFileItem
      },
      file: (filePath: string, content: string, base64: boolean = false) => {
        const type = filePath.isImage() ? "base64" : undefined;
        zip.files[filePath] = {
          path: filePath,
          content,
          base64,
          load: async () => await fileHandler.read(filePath, type),
          write: async () => {
            let content = await zip.files[filePath].load();
            if (filePath.isImage() && book.imagePath) {
              await context.imageCache.write(book.imagePath.path(filePath.safeSplit("/", -1)), content)
            }
          }
        } as ZipFileItem;
      }
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

    const search = (name: string) => {
      let item = Object.keys(zip.files).find(x => x.toLowerCase().endsWith(name.trimStr("..", "../").toLowerCase()));
      if (item) {
        return zip.files[item];
      }

      console.warn(name, "could not be found");
      return undefined;
    }

    await fileHandler.checkDir();
    await unzip(uri, tempPath);
    for (let file of await fileHandler.allFilesInfos(true)) {
      zip.file(file.path, "");
    }

    let opfFile = search(".opf");
    if (!opfFile) {
      return undefined;

    }
    const opfHtml = (await opfFile.load()).html();
    let oPFContent = { manifest: {}, spine: {} } as OPFContent;
    oPFContent.title = opfHtml.find("metadata").byTag("dc:title").text;
    oPFContent.creator = opfHtml.find("metadata").byTag("dc:creator").text;
    oPFContent.description = opfHtml.find("metadata").byTag("dc:description").text;
    oPFContent.identifier = opfHtml.find("metadata").byTag("dc:identifier").text;
    oPFContent.novelType = opfHtml.find("metadata").byTag("dc:noveltype").text;
    oPFContent.manifest.item = opfHtml.find("manifest item").map(x => ({
      id: x.attr("id"),
      href: x.attr("href"),
      mediaType: x.attr("media-type")
    }));
    oPFContent.spine.itemref = opfHtml.find("spine itemref").map(x => ({
      idref: x.attr("idref")
    }));
    oPFContent.coverImage = oPFContent.manifest.item.find(x => opfHtml.find('meta[name="cover"]').attr("content").has(x.id))?.href;
    let cover = "";
    if (oPFContent.coverImage) {
      let coverFile = search(oPFContent.coverImage);
      if (coverFile && coverFile.path.isImage())
        cover = (await coverFile.load()).toBase64Url();
    }
    if (!cover || !cover.has()) { // Find any image and set it as cover.
      let coverFile = Object.keys(zip.files).map(x => zip.files[x]).find(x => x.path.isImage());
      if (coverFile)
        cover = (await coverFile.load()).toBase64Url();
    }
    const length = Object.keys(zip.files).length * 2;
    let index = 0;
    book.type = oPFContent.novelType && oPFContent.novelType.has() ? oPFContent.novelType : "Unknown";
    book.name = oPFContent.title && oPFContent.title.has() ? oPFContent.title : cleanNames(uri);
    book.fileName = "".fileName(book.name, "epub");
    if (await context.files.exists(book.fileName))
      throw "The current Epub Already exists, please remove the existing one to upload the current one";
    book.imagePath = folderValidName(book.name);
    for (let ch of oPFContent.spine.itemref) {
      let href = oPFContent.manifest.item.find(x => x.id == ch.idref);
      if (href) {
        if (href.href.toLowerCase().endsWith("xhtml") || href.href.toLowerCase().endsWith("html")) {
          let file = search(href.href);
          if (!file) {
            console.warn(href, "Could not be found, will skip it");
            continue;
          }
          let zipFile = new ZipFile();
          zipFile.type = "HTML";
          zipFile.content = (await file.load()).html().find("body").html
          zipFile.name = href.href.trimStr("..", "../").split("/").lastOrDefault()?.toString().split(".").reverse().filter((_, i) => i > 0).reverse().join(".")
          book.chapters.push(zipFile);
        }
      }
      onUpdate({
        percent: length.procent(index),
        currentFile: "Reading Chapter"
      });
      index++;
    }

    for (let key in zip.files) {
      let file = zip.files[key];
      await file.write();
      onUpdate({
        percent: length.procent(index),
        currentFile: "Wring Images"
      });
      index++;
    }

    await context.files.write(book.fileName, JSON.stringify(book));

    let dbBook = Book.n()
      .Name(book.name)
      .Url(book.url)
      .Favorit(false)
      .InlineStyle("").ImageBase64(cover)
      .ParserName("epub");
    await context.db.Books.save(dbBook);

  } catch (e) {
    if (book.imagePath) {
      await context.imageCache.deleteDir(book.imagePath);
    }

    if (book.fileName)
      await context.files.delete(book.fileName);
    if (book.url) {
      await context.db.Books.query.where.column(x => x.url).equalTo(book.url).delete();
    }
    console.error(e);
  } finally {
    await fileHandler.deleteDir();
    event?.remove();
    context.db.enableWatchers();
    context.db.enableHooks();
    context.files.enable();
    onUpdate({
      percent: 100,
      currentFile: "Wring Images"
    });
  }
}

export const createEpub = async (novel: DetailInfo, book: Book, path: string, onUpdate: (item: {
  percent: number;
  currentFile: string | null;
}) => void) => {

  const folder = RNFS.CachesDirectoryPath.path(newId());
  let fileHandler = new FileHandler(folder);
  try {
    const zip = {
      files: {} as {
        [key: string]: ZipFileItem
      },
      file: (path: string, content: string, base64: boolean = false) => {
        zip.files[path] = {
          path,
          content,
          base64,
          load: async () => content
        } as ZipFileItem;
      }
    }
    let player = new Player(novel, book, {}, true);
    let cover = book.imageBase64 ? book.imageBase64 : undefined;
    function extractBase64(rawDataUrl: string): string {
      if (rawDataUrl.isBase64String()) {
        const match = rawDataUrl.match(/^data:image\/[^;]+;base64,(.*)$/);
        if (!match) return rawDataUrl;
        return match[1];
      }
      return rawDataUrl;
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
        <dc:noveltype>${novel.type}</dc:noveltype>
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
          await fileHandler.write(folder.path(file.path), file.content as string, file.base64 ? "base64" : undefined);
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
      //  await ZipFile(folder, path);
      const result = await EpubZipper.zipEpubFolder(folder, path);
      console.log(result);
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
    await fileHandler.deleteDir();
    console.error(e)
  }
};
