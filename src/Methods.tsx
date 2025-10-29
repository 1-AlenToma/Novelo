import uuid from "react-native-uuid";
import IDOMParser from "advanced-html-parser";
import { Functions } from "react-native-ts-sqlite-orm/src/UsefullMethods";

/**
 * Converts a file size in bytes into a human-readable string.
 * @param bytes - The file size in bytes.
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns A formatted string like "10.25 MB", "500 KB", or "1.2 GB".
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
  return `${value} ${sizes[i]}`;
}


/**
 * Run asynchronous tasks in parallel with limited concurrency.
 *
 * @param items - The array of items to process.
 * @param worker - Async function to handle each item.
 * @param options - Optional config for concurrency, progress, etc.
 * @returns Promise of results in the same order as input.
 */
export async function parallelRun<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  options?: {
    concurrency?: number; // Default 8
    onProgress?: (progress: number, index: number, item: T) => void;
    stopOnError?: boolean; // Default false
  }
): Promise<R[]> {
  const {
    concurrency = 8,
    onProgress,
    stopOnError = false,
  } = options || {};

  const results: R[] = new Array(items.length);
  let index = 0;
  let completed = 0;
  let active = 0;
  let error: any = null;

  async function runWorker() {
    while (index < items.length && (!stopOnError || !error)) {
      const currentIndex = index++;
      const item = items[currentIndex];
      active++;

      try {
        const result = await worker(item, currentIndex);
        results[currentIndex] = result;
      } catch (err) {
        if (stopOnError) {
          error = err;
          break;
        } else {
          console.warn(`parallelRun: item[${currentIndex}] failed`, err);
        }
      } finally {
        completed++;
        active--;
        if (onProgress && (currentIndex == 1 || currentIndex % (concurrency * 2) == 0 || currentIndex == items.length - 1)) {
          onProgress(completed / items.length, currentIndex, item);
        }
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => runWorker());
  await Promise.all(workers);

  if (error && stopOnError) throw error;
  return results;
}


const locks = new Map<string, Promise<any>>();

export const withLock = async function <T>(fileUri: string, fn: () => Promise<any>) {
  const prev = locks.get(fileUri) ?? Promise.resolve();
  const next = prev.then(fn).finally(() => {
    if (locks.get(fileUri) === next) locks.delete(fileUri);
  });
  locks.set(fileUri, next);
  return next as Promise<T>;
}

function generateText(html, minLength) {
  try {
    html = html.replace(/<( )?(\/)?strong( )?>/gim, "");
    const doc = IDOMParser.parse(`<div>${html}</div>`).documentElement;
    while (true) {
      let breakIt = true;
      let headers = [
        ...doc.querySelectorAll(
          "h1,h2,h3,h4,h5,h6"
        )
      ];

      for (let h of headers) {
        if (
          h.textContent.indexOf("#{h0}") == -1
        ) {
          h.textContent = `#{h0}${h.textContent
            }#{h${h.tagName
              .replace(/([^1-6])/g, "")
              .trim()}}`;
          breakIt = false;
          break;
        }
      }
      if (breakIt) break;
    }

    const text = doc.text().replace(/\;/gim, ",");
    // console.warn(text);
    let charMap = [];

    const nextNewLine = "[(“‘".split("");
    const prevNewLine = "])”’".split("");
    const specChars = `",:?.';!()[]{}…_-`.split(
      ""
    );
    const possibleNewLine = [
      "level",
      " hp",
      "chapter",
      ...":-*+/%".split("")
    ];
    const meningEnd = ".!".split("");
    const invertChar = char => {
      if (nextNewLine.includes(char)) {
        return prevNewLine[
          nextNewLine.indexOf(char)
        ];
      }
      if (prevNewLine.includes(char)) {
        return nextNewLine[
          prevNewLine.indexOf(char)
        ];
      }
      return "";
    };
    const createMap = () => {
      for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let next = text[i + 1];
        let token = invertChar(char);
        if (nextNewLine.includes(char)) {
          charMap.push({
            start: i,
            charStart: char,
            charEnd: token
          });
        } else if (
          prevNewLine.includes(char) &&
          (specChars.includes(next) || [
            " ",
            "",
            "\n",
            "\r",
            "\n\r"
          ].includes(next))
        ) {
          let item = charMap.find(
            x =>
              x.charEnd === char &&
              x.end === undefined &&
              i - x.start <= 310 &&
              i - x.start >= 5
          );

          if (item) {
            item.end = i;
            item.content = text.substring(
              item.start,
              item.end + 1
            );
          }
        }
      }

      charMap = charMap.filter(
        x =>
          x.start != undefined &&
          x.end != undefined
      );
    };

    createMap();
    let result = [];
    let current = "";
    let index = -1;
    let currentChar = "";
    let nextChar = "";
    let prevChar = "";
    let charMapValue = [];
    let hStart = false;
    const getNextChar = () => {
      index++;
      let start = index + 1;
      let end = index;
      if (charMap.find(x => start == x.start)) {
        charMapValue = [
          ...charMapValue,
          ...charMap.filter(x => start == x.start)
        ];
      } else {
        charMapValue = charMapValue.filter(
          x => x.end != end
        );
      }
      prevChar = text[index - 1];
      nextChar = text[index + 1];
      return (currentChar = text[index]);
    };

    const isName = () => {
      let t = '';
      for (var i = index - 5; i <= text.length; i++) {
        if (text.charAt(i)?.trim().length <= 0) continue;
        t += text.charAt(i);
        if (t.length >= 5) break;
      }
      const r = /((mr|Mrs|Ms|Miss|dr)+( \.|\.)).*/gim.test(t);
      return r;
    }

    const isNumber = () => {
      if (
        ["."].includes(currentChar) &&
        prevChar != undefined &&
        nextChar != undefined
      ) {
        let nr = prevChar + "." + nextChar;
        return /[\w]\.( )?[\w]/gim.test(nr);
      }
      return false;
    };

    const isNewLine = () => {
      let start = [index + 1];
      let end = [index, index + 1];
      if (
        charMapValue.find(x =>
          start.includes(x.start)
        ) ||
        (current.length > 2 &&
          charMapValue.find(x =>
            end.includes(x.end)
          )) ||
        (meningEnd.includes(currentChar) &&
          current.length >= minLength &&
          !isNumber() && !isName()) ||
        (possibleNewLine.find(
          x =>
            current
              .toLowerCase()
              .indexOf(x.toLowerCase()) != -1
        ) &&
          (currentChar == "\r" ||
            currentChar == "\n"))
      ) {
        if (
          charMapValue.length <= 0 ||
          (charMapValue.length == 1 &&
            charMapValue.filter(
              x =>
                start.includes(x.start) ||
                end.includes(x.end)
            ).length == 1)
        ) {
          return true;
        }
      }
      return false;
    };

    const repeatedChar = () => {
      while (
        meningEnd.includes(nextChar) ||
        prevNewLine.includes(nextChar)
      ) {
        current += getNextChar();
      }
    };

    let addLine = () => {
      if (!hStart)
        repeatedChar();
      result.push(current.trim());
      current = "";
      hStart = false;
      // charMapValue = [];
    };

    const isHeader = () => {
      let length = "#{h0}".length;
      if (index + length >= text.length)
        return;
      let h = text.substring(
        index,
        index + length
      );

      if (h == "#{h0}" && !hStart) {
        hStart = true;
      } else if (
        hStart &&
        /\#\{h([1-6])\}/gim.test(h)
      ) {
        index += length;

        current = current.trimEnd("#") + h;

        addLine();
      }
    };
    //console.warn(text)
    while (text.length - 1 !== index) {
      isHeader();
      getNextChar();

      if (
        currentChar !== "\n" &&
        currentChar !== "\r" &&
        currentChar !== "\r\n" &&
        (current.trim().length > 0 ||
          !".,!?…"
            .split("")
            .includes(currentChar))
      ) {
        if (meningEnd.includes(currentChar))
          current = current.trim() + currentChar;
        else if (
          currentChar != " " ||
          !current.endsWith(" ")
        ) {
          current += currentChar;
        }
      } else if (
        ["\n", "\r"].includes(currentChar) &&
        current.trim().length > 0
      ) {
        current = current.trim() + " ";
      }

      if (!hStart && isNewLine()) addLine();
    }

    result.push(current);

    result = result
      .filter(x =>
        /\w/gim.test(
          x
            .replace(/\#\{h([0-6])\}/gim, "")
            .replace(/\_/gim, "")
        )
      )
      .map(x => {
        if (!/\#\{h([0-6])\}/gim.test(x)) {
          let addClass =
            nextNewLine.find(f => f == x[0]) &&
            prevNewLine.find(
              f => f == x[x.length - 1]
            );
          let className = addClass ?
            ` class="italic"` :
            "";

          return `<p${className}>${x}</p>`;
        } else {
          let tag = `h${x
            .match(/\#\{h([1-6])\}/gim)[0]
            .replace(/([^1-6])/g, "")
            .trim()}`;
          return `<${tag}>${x.replace(
            /\#\{h([0-6])\}/gim,
            ""
          )}</${tag}>`;
        }
      });
    let item = "";
    index = 0;
    while (result[index]) {

      let c = result[index];

      let cleaned = c.replace(
        /(\<p.*?\>)|(\<\/p\>)/gim,
        ""
      );
      let isItali = /class\=\"italic\"/gim.test(
        c
      );
      let length = c.length - 20;
      let n = result[index + 1];
      let prev = (item.split("\n").lastOrDefault() ?? "") as string;

      let pIsItali = /class\=\"italic\"/gim.test(
        prev
      );

      if (
        !isItali ||
        pIsItali ||
        !/\<p/gim.test(c) ||
        !/\<p/gim.test(prev) ||
        length <= 1 ||
        index < 2 ||
        possibleNewLine.find(
          x =>
            x
              .toLowerCase()
              .indexOf(prev.toLowerCase()) != -1
        )
      ) {
        item += `\n${c}`;
      } else if (isItali && length < 60) {
        item = `${item.substring(
          0,
          item.length - 4
        )} ${c
          .replace(/\<p /gim, "<span ")
          .replace(/\<\/p\>/gim, "</span>")}</p>`;
      } else item += `\n${c}`;
      index++;
    }

    return item;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const public_m = (...Items: any[]) => {
  try {
    Items.forEach(Item => {
      let instance = Functions.createSqlInstaceOfType(Item.prototype);
      let keys = (instance?.config?.().props ?? Object.keys(new Item())).map(x => x.columnName || x);
      Item["n"] = (...args: any[]) =>
        new Item(...args);
      Item.prototype.clone = function () {
        let item = Item.n();
        for (let k in this) item[k] = this[k];
        return item;
      };
      keys.forEach(x => {
        let n =
          x[0].toUpperCase() + x.substring(1);
        if (!Item.prototype[n])
          Item.prototype[n] = function (v: any) {
            if (!this)
              throw "this is null " + Item;
            if (v && typeof v == "object" && Array.isArray(v)) {
              v = v.reduce((arr, c) => {
                if (arr.indexOf(c) === -1)
                  arr.push(c);
                return arr;
              }, [])
            }
            this[x] = v;
            return this;
          };
      });
    });
  } catch (e) {
    console.error(e, Items);
  }
};

const newId = () => {
  return uuid.v4() as string;
};

const sleep = (ms: number) => {
  return new Promise(r => setTimeout(r, ms));
};

function proc(partialValue, totalValue) {
  return (partialValue / 100) * totalValue;
}

const removeProps = (
  item: any,
  ...keys: string[]
) => {
  if (!item) return item;

  if (Array.isArray(item))
    item = item.map(x => removeProps(x, ...keys));
  else {
    item = { ...item };
    for (let k in item) {
      if (keys.includes(k)) {
        if (item[k]) delete item[k];
        continue;
      }
      if (
        item[k] &&
        typeof item[k] === "object"
      ) {
        item[k] = removeProps(item[k], ...keys);
      }
    }
  }

  return item;
};

const joinKeys = (
  a: any,
  b: any,
  ...ignoreKeys: string[]
) => {
  let keys = Object.keys(a);
  for (let k in b) {
    if (ignoreKeys.includes(k)) continue;
    if (
      keys.find(f => f === k) &&
      (k != "id" || b[k] != undefined)
    ) {
      a[k] = b[k];
    }
  }
  return a;
};

const days_between = function (date: Date) {
  // The number of milliseconds in one day
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  let firstDate = date as any;
  let secondDate = new Date() as any;

  // Convert back to days and return
  const diffDays = Math.round(
    Math.abs((firstDate - secondDate) / oneDay)
  );

  return diffDays;
};

const arrayBuffer = (arr: any[]) => {
  let str = "";
  for (let a of arr) {
    str += String.fromCharCode(a);
  }
  return str;
};

function invertColor(hexcolor) {
  try {
    if (!hexcolor || hexcolor.length < 2)
      return hexcolor;
    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === "#") {
      hexcolor = hexcolor.slice(1);
    }

    // If a three-character hexcode, make six-character
    if (hexcolor.length === 3) {
      hexcolor = hexcolor
        .split("")
        .map(function (hex) {
          return hex + hex;
        })
        .join("");
    }

    // Convert to RGB value
    let r = parseInt(hexcolor.substr(0, 2), 16);
    let g = parseInt(hexcolor.substr(2, 2), 16);
    let b = parseInt(hexcolor.substr(4, 2), 16);

    // Get YIQ ratio
    let yiq =
      (r * 299 + g * 587 + b * 114) / 1000;

    // Check contrast
    return yiq >= 128 ? "black" : "white";
  } catch (e) {
    return "black";
  }
}

const ifSelector = (
  value?: Function | boolean
) => {
  if (value !== undefined && typeof value == "function")
    return value() ? true : false;
  return value;
};

const injectCSS = (css: string) => {
  let js = `
    try{
    const style = document.createElement("style");
    style.appendChild(document.createTextNode("${css.replace(/(\r\n|\n|\r)/gm, "")}"));
    document.body.appendChild(style);
  }catch(e){alert(e)}
  true;
  `;
  return js;
}

async function fetchWithTimeout(resource: string, options = {}, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    throw new Error(`Fetch failed or timed out: ${error.message}`);
  } finally {
    clearTimeout(id);
  }
}

export {
  public_m,
  sleep,
  days_between,
  newId,
  proc,
  removeProps,
  joinKeys,
  arrayBuffer,
  invertColor,
  ifSelector,
  generateText,
  injectCSS,
  fetchWithTimeout
};
