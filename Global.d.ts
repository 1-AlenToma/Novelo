import CStyle from "./components/CStyle";
import { cssTranslator } from "./styles";
import IDOMParser from "advanced-html-parser";
const cheerio = require("react-native-cheerio");
declare global {
  interface Array<T> {
    mapAsync(
      fn: (item: T, index: number) => Promise<T[]>
    );
    distinct: (key: keyof T, itemsB: T[]) => T[];
    firstOrDefault: (
      key?: keyof T
    ) => T | undefined;
    lastOrDefault: (
      key?: keyof T
    ) => T | undefined;
    clear: () => T[];
    has: (item?: any) => boolean;
    niceJson: (
      ...keyToRemove: (keyof T)[]
    ) => string;
    skip: (
      index: number,
      handler: Function
    ) => string;
  }
  interface String {
    join(...relative: String[]): String;
    empty(): String;
    query(item: any): String;
    trimEnd(...items): String;
    has(selector: string): boolean;
    imageUrlSize: () => string;
    css(): any;
    sSpace(total?: number): string;
    eSpace(total?: number): string;
    cleanHtml(): string;
    cleanText(): string;
    htmlArray(): string[];
    html(): any;
    splitSearch(searchFor: string): boolean;
    imageFetchBuilder(
      selector: string,
      baseUrl: string,
      attr?: string
    ): string;
    safeSplit: (
      c: string,
      index: number
    ) => string;
  }

  interface Number {
    sureValue: (a: number) => number;
    readAble: () => any;
  }
}

Number.prototype.readAble = function () {
  let nr = this.toString();
  let nrs = nr.split(".");
  if (nrs.length <= 1) return nr;
  if (/[1-9]/g.test(nrs[1]))
    return `${nrs[0]}.${nrs[1].substring(0, 2)}`;
  return nr;
};

Number.prototype.sureValue = function (
  a: number
) {
  if (a === undefined || a === null || isNaN(a))
    return this;
  return a;
};

Array.prototype.skip = function (
  index: number,
  handler?: Function
) {
  if (!handler)
    return this.filter((x, i) => i > index);
  return this.filter(
    (x, i) => !handler(x, i) || i > index
  );
};

Array.prototype.lastOrDefault = function (
  key: string
) {
  let item =
    this.length > 0
      ? this[this.length - 1]
      : undefined;
  return item ? item[key] : undefined;
};

Array.prototype.clear = function () {
  while (this.length > 0) this.shift();

  return this;
};

Array.prototype.has = function (item?: any) {
  return (
    this.filter(
      x =>
        x !== undefined &&
        x !== null &&
        (item === undefined || x == item)
    ).length > 0
  );
};

Array.prototype.firstOrDefault = function (
  key: string
) {
  let item = undefined;
  let items = this.filter(
    x => x !== undefined && x !== null
  );
  if (items.length <= 0) return undefined;
  item = items[0];
  if (key) item = item[key];
  return item;
};

Array.prototype.distinct = function (
  key: string,
  itemsB: any[]
) {
  let items = this;
  if (itemsB)
    for (let value of itemsB) {
      if (
        value &&
        !items.find(x => x[key] === value[key])
      )
        items.push(value);
    }

  return items;
};

Array.prototype.niceJson = function (
  ...keyToRemove: string[]
) {
  function replacer(key, value) {
    if (keyToRemove.find(x => x == key))
      return undefined;
    return value;
  }
  if (!keyToRemove.has())
    return JSON.stringify(this, undefined, 4);

  return JSON.stringify(this, replacer, 4);
};

Array.prototype.mapAsync = async function (
  fn: (item: any, index: number) => Promise<any[]>
) {
  let items = [] as any[];
  for (let index in this) {
    let t = await fn(this[index], index);
    if (t !== undefined && t !== null)
      items.push(t);
  }
  return items;
};

String.prototype.imageFetchBuilder = function (
  selector: string,
  baseUrl: string,
  attr?: string
) {
  let url = new String(this).toString();
  attr = attr || "src";
  return `[${baseUrl}][${url}][${selector}][${attr}]`;
};

String.prototype.splitSearch = function (
  searchFor: string
) {
  if (!this) return false;
  let str = new String(this).toString().trim();
  if (str.empty()) return false;
  if (!searchFor || searchFor.empty())
    return false;
  for (let s of searchFor.split(" ")) {
    if (!str.has(s) && !s.empty()) return false;
  }
  return true;
};

String.prototype.cleanHtml = function () {
  let str = new String(this).toString();
  let html = cheerio.load(str).text();
  return html;
};

String.prototype.html = function () {
  let str = new String(this).toString();
  let html = cheerio.load(str);
  return html;
};

String.prototype.cleanText = function () {
  let str = new String(this).toString();
  const doc = IDOMParser.parse(
    `<div>${str}</div>`
  );
  str = doc.documentElement
    .text()
    .replace(/\<\/( )?br>|\<br( )?(\/)?>/gim, "");
  const clean = (char: string) => {
    char.split("").forEach(c => {
      let reg = new RegExp(`(\\${c})\\1+`, "gmi");
      str = str.replace(reg, c);
    });
    return str;
  };

  return clean(
    `@#$_&-+()/*"':;!?~|•√π÷×§∆£¢€¥^°=%©®™✓[]{}<>,.`
  );
};

String.prototype.htmlArray = function () {
  let str = new String(this).toString();
  const doc = IDOMParser.parse(
    `<div>${str}</div>`
  );
  let elems = [
    ...doc.documentElement.querySelectorAll(
      "p,h1,h2,h3,h4,h5"
    )
  ];
  return elems.map(x => x.outerHTML);
};

String.prototype.sSpace = function (
  total?: number
) {
  total = (1).sureValue(total);
  let str = new String(this || "").toString();
  while (total > 0) {
    str = " " + str;
    total--;
  }
  return str;
};

String.prototype.eSpace = function (
  total?: number
) {
  total = (1).sureValue(total);
  let str = new String(this || "").toString();
  while (total > 0) {
    str += " ";
    total--;
  }
  return str;
};

String.prototype.safeSplit = function (
  c: string,
  index: number
) {
  let ar = new String(this).toString().split(c);
  if (index === -1) return ar[ar.length - 1];
  return ar[index] || "";
};
let styleShortKeys = [];

String.prototype.css = function () {
  let styleText = String(this).toString();
  return cssTranslator(styleText, CStyle);
};

String.prototype.imageUrlSize = function (
  size: string
) {
  let url = new String(this).toString();
  return url.replace(/\d+[x]\d+/gim, size);
};

String.prototype.has = function (
  selector: string
) {
  if (!selector)
    return !new String(this).toString().empty();
  return (
    selector &&
    !selector.empty() &&
    new String(this)
      .toString()
      .toLowerCase()
      .indexOf(
        selector.toString().toLowerCase()
      ) !== -1
  );
};

String.prototype.empty = function () {
  let text = new String(this).toString();
  return !text || text.trim() == "";
};

String.prototype.trimEnd = function (...items) {
  let str = new String(this).toString().trim();
  items.forEach(x => {
    if (str.endsWith(x))
      str = str.substring(0, str.length - 1);
  });

  return str;
};

String.prototype.query = function (item: any) {
  let url = new String(this).toString();
  if (url.endsWith("/"))
    url = url.substring(0, url.length - 1);
  Object.keys(item).forEach(x => {
    let v = item[x];
    if (!url.has("?")) url += "?";
    if (
      url.endsWith("&") ||
      url.endsWith("&&") ||
      url.endsWith("?")
    )
      url += `${x}=${v}`;
    else url += `&&${x}=${v}`;
  });

  return url;
};

String.prototype.join = function (
  this: string,
  ...relative: String[]
) {
  let url = new String(this).toString();

  relative
    .filter(x => x && x.has())
    .forEach(x => {
      if (
        !(
          x.startsWith("http") ||
          x.startsWith("https") ||
          x.startsWith("www")
        )
      ) {
        if (x.startsWith("/")) x = x.substring(1);
        if (url.endsWith("/"))
          url = url.substring(1, url.length - 1);

        url = `${url}/${x}`;
      } else url = x;
    });

  return url;
};
