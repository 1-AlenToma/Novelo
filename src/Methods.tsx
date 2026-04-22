import uuid from "react-native-uuid";
import { Functions } from "react-native-ts-sqlite-orm";
export * from "./localModules/NativeEpubZipper";
export * from "./native/SentencesSplitter"

export const baseUrl = (url: string) => {
  if (!url)
    return "";
  var pathArray = url.split('/');
  let hasProtocol = /(http)(s)?/gim.test(url);
  var protocol = hasProtocol ? pathArray[0] : "";
  var host = hasProtocol ? pathArray[2] : pathArray[0];
  if (host.indexOf("?") != -1)
    host = host.substring(0, host.indexOf("?"))
  return protocol + (hasProtocol ? '//' : "") + host;
}

export const formatDateMMDDYY = (time: number | Date) => {
  if (time == undefined || time == null)
    return "";
  if (time instanceof Date)
    return time.formatDateMMDDYY();
  if (typeof time == "number")
    return new Date(time * 1000).formatDateMMDDYY();
  return time;
}

/**
 * Converts a file size in bytes into a human-readable string.
 * @param bytes - The file size in bytes.
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns A formatted string like "10.25 MB", "500 KB", or "1.2 GB".
 */
export function formatFileSize(byte: number | string, decimals: number = 2): string {
  let bytes = typeof byte == "string" ? parseFloat(byte) : byte;


  if (isNaN(bytes) || bytes === 0) return "0 Bytes";

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
  const next = prev.then(fn).catch(e => {
    console.error('withLock previous promise failed', e);
    return fn(); // still run fn even if prev fails
  }).finally(() => {
    if (locks.get(fileUri) === next) locks.delete(fileUri);
  });
  locks.set(fileUri, next);
  return next as Promise<T>;
}



const public_m = (...Items: any[]) => {
  try {
    Items.forEach(Item => {
      let instance = Functions.createSqlInstaceOfType(Item.prototype);
      let keys = (instance?.config?.().props ?? Object.keys(new Item())).map(x => x.columnName || x);
      Item["n"] = (...args: any[]) => new Item(...args);
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
  return ("id" + uuid.v4() as string).replace(/-/g, "");
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

const joinKeys = function <T>(
  a: T,
  b: any,
  ...ignoreKeys: (keyof T)[]
) {
  let keys = Object.keys(a);
  for (let k in b) {
    if (ignoreKeys.includes(k as any)) continue;
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
  injectCSS,
  fetchWithTimeout
};
