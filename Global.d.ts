import CStyle from "./components/CStyle";
import { cssTranslator } from "./styles";
const cheerio = require("react-native-cheerio");
declare global {
  interface Array<T> {
    mapAsync(
      fn: (item: T, index: number) => Promise<T[]>
    );
    distinct: (key: keyof T, itemsB: T[]) => T[];
    firstOrDefault: (key?: keyof T) => T[];
    has: () => boolean;
    niceJson: (
      ...keyToRemove: (keyof T)[]
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
  }
}

Number.prototype.sureValue = function (
  a: number
) {
  if (a === undefined || a === null || isNaN(a))
    return this;
  return a;
};

Array.prototype.has = function () {
  return (
    this.filter(
      x => x !== undefined && x !== null
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
  let items = [];
  if (!keyToRemove.has())
    return JSON.stringify(this, undefined, 4);
  for (let item of this) {
    let t = { ...item };
    keyToRemove.forEach(x => delete t[x]);
    items.push(t);
  }
  return JSON.stringify(items, undefined, 4);
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
    .filter(x => x && !x.empty())
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
