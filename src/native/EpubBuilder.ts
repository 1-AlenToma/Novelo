import {
  Parameter,
  EpubChapter,
  File,
  EpubSettings
} from "../Types";
import Html from "./Html";

export type {
  Parameter,
  EpubChapter,
  File,
  EpubSettings
};

const createStyle = (style: any) => {
  if (!style) style = {};
  if (typeof style == "string") return style;
  const defaultStyle = {
    body: {
      "font-family": `"Helvetica Neue", "Helvetica", "Arial", sans-serif`,
      "font-size": "1.125em",
      "line-height": "1.6em",
      color: "#000"
    },

    "h1, h2, h3, h4, h5, h6": {
      "line-height": "1em"
    },
    h1: {
      "font-size": "3em"
    },

    h2: {
      "font-size": "2.5em"
    }
  } as any;

  Object.keys(style).forEach(x => {
    var current = style[x];
    var next = defaultStyle[x];
    if (next === undefined)
      defaultStyle[x] = current;
    else Object.assign(defaultStyle[x], current);
  });
  var result = "";
  Object.keys(defaultStyle).forEach(x => {
    var item = x + " {";
    Object.keys(defaultStyle[x]).forEach(a => {
      item += `\n ${a}: ${defaultStyle[x][a]};`;
    });
    item += "\n}\n";
    result += item;
  });
  return result;
};

const createFile = (
  path: string,
  content: string
) => {
  return {
    path,
    content
  } as File;
};

const isValid = (
  file: File[],
  content: string[]
) => {
  for (var i = 0; i < content.length; i++) {
    var item = file.find(
      x => x.path.indexOf(content[i]) != -1
    );
    if (!item) return false;
  }
  return true;
};

const sleep = (time: number, args?: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(args);
    }, time);
  }) as Promise<any>;
};

const single = (array: any) => {
  if (
    array &&
    array.length != undefined &&
    array.length > 0
  )
    return array[0];

  return undefined;
};

const parseJSon = (json: string) => {
  if (json === null || !json || json.length <= 4)
    return undefined;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

export const jsonExtractor = (
  content: string
) => {
  const jsonReg = new RegExp(
    /<JSON>(.|\n)*?<\/JSON>/,
    "mgi"
  );
  return (single(jsonReg.exec(content)) ?? "")
    .replace(/<JSON>/gim, "")
    .replace(/<\/JSON>/gim, "");
};

export const bodyExtrator = (content: string) => {
  const jsonReg = new RegExp(
    /<body>(.|\n)*?<\/body>/,
    "mgi"
  );
  return (single(jsonReg.exec(content)) ?? "")
    .replace(/<body>/gim, "")
    .replace(/<\/body>/gim, "");
};

export const EpubSettingsLoader = async (
  file: File[],
  localOnProgress?: (progress: number) => void
) => {
  try {
    var jsonSettingsFile = file.find(x =>
      x.path.endsWith(".json")
    );
    if (jsonSettingsFile)
      return parseJSon(
        jsonSettingsFile.content
      ) as EpubSettings;
    var dProgress = 0.01;
    localOnProgress?.(dProgress);
    var epubSettings = {
      chapters: [] as EpubChapter[]
    } as EpubSettings;
    if (
      !isValid(file, [
        "toc.ncx",
        "toc.html",
        ".opf",
        "styles.css"
      ])
    )
      throw "This is not a valid Epub file created by this library(epub-constructor)";
    var pageContent =
      file.find(x => x.path.indexOf(".opf") != -1)
        ?.content ?? "";
    var page = undefined as undefined | Html;
    var style =
      file.find(
        x => x.path.indexOf("styles.css") != -1
      )?.content ?? "";
    var chapters = [] as Html[];
    epubSettings.stylesheet = style;
    page = (pageContent as string).html();
    epubSettings.parameter = page.$("param").map(
      a => {
        return {
          name: a.attr("name"),
          value: a.attr("value")
        } as Parameter;
      }
    );
    epubSettings.title = page.find(".title").text;
    epubSettings.author = page.find(".rights").text;
    epubSettings.description = page.find(".description").text;
    epubSettings.language = page.find(".language").text;
    epubSettings.bookId = page.find(".identifier").text;
    epubSettings.source = page.find(".source").text;
    chapters = page.$("itemref").map(x => x);

    const len = chapters.length + 1;
    var index = 0;
    for (let x of chapters) {
      try {
        var content = "";
        var chItem = "" as string;
        var chId = x.attr("idref");
        chItem = page.find("item[id='" + chId + "']").attr("href") ?? "";
        content =file.find(x => x.path.indexOf(chItem) != -1)?.content ?? "";
        var chapter = content.html();
        epubSettings.chapters.push({
          parameter: chapter.$("param").map(
            (a: any) => {
              return {
                name: a.attr("name"),
                value: a.attr("value")
              } as Parameter;
            }
          ),
          title: chapter.find("title").text ?? "",
          htmlBody: chapter.find("body").html
        });
        dProgress =(index / parseFloat(len.toString())) * 100;
        localOnProgress?.(dProgress);
        index++;
        await sleep(0);
      } catch (error) {
        console.log(error);
      }
    }
    dProgress =
      (len / parseFloat(len.toString())) * 100;
    localOnProgress?.(dProgress);
    return epubSettings;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default class EpubFile {
  epubSettings: EpubSettings;

  constructor(epubSettings: EpubSettings) {
    this.epubSettings = epubSettings;
  }

  async constructEpub(
    localOnProgress?: (
      progress: number
    ) => Promise<void>
  ) {
    var files = [] as File[];
    files.push(
      createFile(
        "mimetype",
        "application/epub+zip"
      )
    );
    var metadata = [];
    var manifest = [];
    var spine = [];
    this.epubSettings.bookId =
      this.epubSettings.bookId ??
      new Date().getUTCMilliseconds().toString();
    const len = this.epubSettings.chapters.length;
    var dProgress = 0;
    this.epubSettings.fileName =
      this.epubSettings.fileName ??
      this.epubSettings.title;
    if (
      this.epubSettings.fileName.endsWith(
        ".epub"
      ) ||
      this.epubSettings.fileName.endsWith(".opf")
    )
      this.epubSettings.fileName =
        this.epubSettings.fileName
          .replace(".opf", "")
          .replace(".epub", "");
    files.push(
      createFile(
        "META-INF/container.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
      <rootfile full-path="OEBPS/${this.epubSettings.fileName}.opf" media-type="application/oebps-package+xml"/>
      </rootfiles>
      </container>`
      )
    );
    files.push(
      createFile(
        "OEBPS/styles.css",
        createStyle(this.epubSettings.stylesheet)
      )
    );

    var epub = `<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">{#metadata}</metadata>
    <manifest>{#manifest}</manifest>
    <spine toc="ncx">{#spine}</spine>
    </package>`;
    var ncxToc = `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en" dir="ltr">
        <head>
                <meta name="dtb:uid" content="http://digitalpublishingtoolkit.org/ExampleEPUB.html" />
                <meta name="dtb:depth" content="${this.epubSettings.chapters.length}" />
                <meta name="dtb:totalPageCount" content="${this.epubSettings.chapters.length}" />
                <meta name="dtb:maxPageNumber" content="0" />
        </head>
        <docTitle>
                <text>${this.epubSettings.title} EPUB</text>
        </docTitle>

        <docAuthor>
                <text>${this.epubSettings.author}</text>
        </docAuthor>

        <navMap>
  {#navMap}
        </navMap>
</ncx>
`;

    var htmlToc = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <title>${this.epubSettings.title} - TOC</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        {#ol}
      </ol>
    </nav>
  </body>
</html>`;
    metadata.push(
      `<dc:title class="title">${
        this.epubSettings.title ?? ""
      }</dc:title>`
    );
    metadata.push(
      `<dc:language class="language">${
        this.epubSettings.language ?? "en"
      }</dc:language>`
    );
    metadata.push(
      `<dc:identifier class="identifier" id="BookId">${this.epubSettings.bookId}</dc:identifier>`
    );
    metadata.push(
      `<dc:description class="description">${
        this.epubSettings.description ?? ""
      }</dc:description>`
    );
    metadata.push(
      `<dc:date>${new Date()}</dc:date>`
    );
    metadata.push(
      `<dc:rights class="rights">${
        this.epubSettings.author ?? ""
      }</dc:rights>`
    );
    metadata.push(
      `<dc:source class="source">${
        this.epubSettings.source ?? ""
      }</dc:source>`
    );
    metadata.push(
      `<item href="styles.css" id="css1" media-type="text/css"/>`
    );

    const getValidName = (x: EpubChapter) => {
      var fileName = `${x.title}.html`;
      var i = 1;
      while (
        this.epubSettings.chapters.find(
          a => a.fileName == fileName
        )
      ) {
        fileName = `${x.title + i}.html`;
        i++;
      }

      return fileName;
    };

    var index = 1;
    var navMap = [];
    var ol = [];

    for (var x of this.epubSettings.chapters) {
      dProgress =
        ((index - 1) /
          parseFloat(len.toString())) *
        100;
      x.fileName = x.fileName ?? getValidName(x);
      if (!x.fileName.endsWith(".html"))
        x.fileName += ".html";
      manifest.push(
        `<item id="${x.title + index}" href="${
          x.fileName
        }" media-type="application/xhtml+xml" />`
      );
      spine.push(
        `<itemref idref="${
          x.title + index
        }" ></itemref>`
      );
      var param = "";
      if (x.parameter && x.parameter.length > 0)
        param = x.parameter
          .map(
            a =>
              `<param name="${a.name}" value="${a.value}">${a.value}</param>`
          )
          .join("\n");
      files.push(
        createFile(
          `OEBPS/${x.fileName}`,
          `
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <link rel="stylesheet" type="text/css" href="styles.css"/>
    <title>${x.title}</title>
    <parameter>
        ${param}
    </parameter>
  </head>
  <body>
      ${x.htmlBody}
  </body>
</html>
      `
        )
      );
      ol.push(
        `<li><a href="${x.fileName}">${x.title}</a></li>`
      );
      navMap.push(
        `<navPoint id="${
          x.title + index
        }" playOrder="${index}"> <navLabel> <text>${
          x.title
        }</text> </navLabel> <content src="${
          x.fileName
        }" /></navPoint>`
      );
      index++;

      if (localOnProgress)
        await localOnProgress?.(dProgress);

      if (index % 300 === 0 && localOnProgress)
        await sleep(0);
    }

    manifest.push(
      `<item properties="nav" id="toc" href="toc.html" media-type="application/xhtml+xml" />`
    );
    manifest.push(
      `<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>`
    );
    epub = epub.replace(
      /{#manifest}/gi,
      manifest.join("\n")
    );
    epub = epub.replace(
      /{#spine}/gi,
      spine.join("\n")
    );
    epub = epub.replace(
      /{#metadata}/gi,
      metadata.join("\n")
    );
    ncxToc = ncxToc.replace(
      /{#navmap}/gi,
      navMap.join("\n")
    );
    htmlToc = htmlToc.replace(
      /{#ol}/gi,
      ol.join("\n")
    );
    files.push(
      createFile(
        `OEBPS/${this.epubSettings.fileName}.json`,
        JSON.stringify(this.epubSettings)
      )
    );
    files.push(
      createFile(
        `OEBPS/${this.epubSettings.fileName}.opf`,
        `<?xml version="1.0" encoding="utf-8"?>\n` +
          epub
      )
    );
    files.push(
      createFile(
        "OEBPS/toc.html",
        `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n` +
          htmlToc
      )
    );
    files.push(
      createFile("OEBPS/toc.ncx", ncxToc)
    );
    if (localOnProgress)
      await localOnProgress?.(
        (len / parseFloat(len.toString())) * 100
      );
    return files;
  }

  // extract EpubSettings from epub file.
  static async load(file: File[]) {
    return await EpubSettingsLoader(file);
  }
}
