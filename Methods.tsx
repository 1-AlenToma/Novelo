import uuid from "react-native-uuid";
import { Styleable, clearStyles } from "./styles";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { useRef, useEffect } from "react";
import IDOMParser from "advanced-html-parser";

function generateText(html, minLength) {
  try {
    html = html.replace(
      /\<( )?(\/)?strong( )?>/gim,
      ""
    );
    //console.warn(html)
    const doc = IDOMParser.parse(
      `<div>${html}</div>`
    ).documentElement;
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
          h.textContent = `#{h0}${
            h.textContent
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
          (specChars.includes(next) ||
            [
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
    // console.warn(charMap.niceJson());
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

    const isNumber = () => {
      if (
        ["."].includes(currentChar) &&
        prevChar != undefined &&
        nextChar != undefined
      ) {
        let nr = prevChar + "." + nextChar;
        return /[\w]\.[\w]/gim.test(nr);
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
          !isNumber()) ||
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
      repeatedChar();
      result.push(current.trim());
      current = "";
      hStart = false;
      // charMapValue = [];
    };

    const isHeader = () => {
      let length = 4;
      if (index + length >= text.length)
        return false;
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
        current += h;
        addLine();
      }
    };

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
          let className = addClass
            ? ` class="italic"`
            : "";

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
        /(\<p.*?>)|(<\/p>)/gim,
        ""
      );
      let isItali = /class\=\"italic\"/gim.test(
        c
      );
      let length = c.length - 20;
      let n = result[index + 1];
      let prev = item.split("\n").lastOrDefault();

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

let downloadsFolder = null;
const getDirectoryPermissions = async () => {
  if (downloadsFolder !== null)
    return downloadsFolder;
  try {
    const initial =
      FileSystem.StorageAccessFramework.getUriForDirectoryInRoot();

    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        initial
      );
    downloadsFolder = permissions.granted
      ? permissions.directoryUri
      : null;

    // Unfortunately, StorageAccessFramework has no way to read a previously specified folder without popping up a selector.
    // Save the address to avoid asking for the download folder every time
  } catch (e) {
    console.log(
      "Error in getDirectoryPermissions",
      e
    );
  }

  return downloadsFolder;
};

const writeFile = async (
  text: string,
  name: string,
  string?: encoding
) => {
  let { status } =
    await MediaLibrary.requestPermissionsAsync();
  const androidSDK = Platform.constants.Version;

  if (
    Platform.OS === "android" &&
    androidSDK == 30 &&
    !downloadsFolder
  ) {
    //Except for Android 11, using the media library works stably
    downloadsFolder =
      await getDirectoryPermissions();
    //if (settings) downloadsFolder = settings;
    //if (settings) downloadsFolder = settings + "/";
    // console.log(settings);
  }
  if (
    Platform.OS === "android" &&
    downloadsFolder
  ) {
    // Creating files using SAF
    // I think this code should be in the documentation as an example
    const newFile =
      await FileSystem.StorageAccessFramework.createFileAsync(
        downloadsFolder,
        name,
        name.endsWith("json")
          ? "application/json"
          : "text/x-json"
      );
    await FileSystem.writeAsStringAsync(
      newFile,
      text,
      {
        encoding: FileSystem.EncodingType.UTF8
      }
    );
  } else {
    let fileUri =
      FileSystem.documentDirectory.path(name);
    await FileSystem.writeAsStringAsync(
      fileUri,
      text,
      {
        encoding: FileSystem.EncodingType.UTF8
      }
    );
    // Creating files using MediaLibrary
    const asset =
      await MediaLibrary.createAssetAsync(
        fileUri
      );
  }
};

const StyledView = function <T>(
  View: T,
  StyledXName: string
) {
  const Style =
    require("./components/CStyle").default;
  return Styleable(View, StyledXName, Style);
};
const public_m = (...Items: any[]) => {
  try {
    Items.forEach(Item => {
      let keys = (
        Item.tb
          ? Item.tb().props
          : Object.keys(new Item())
      ).map(x => x.columnName || x);
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
  return uuid.v4();
};

const sleep = (ms: number) => {
  return new Promise(r => setTimeout(r, ms));
};

function proc(partialValue, totalValue) {
  return (partialValue / 100) * totalValue;
}

const parseThemeStyle = (
  style: any,
  css: any,
  invertColor: any,
  isRootView?: boolean
) => {
  const id = useRef(newId());

  let themeSettings = {
    ...(!(invertColor ?? false)
      ? context.theme.settings
      : context.theme.invertSettings())
  };
  if (invertColor === undefined) {
    delete themeSettings.backgroundColor;
    delete themeSettings.color;
  }

  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];

  st = [themeSettings, ...st];

  if (css) st.push(css.css(id));
  if (isRootView)
    st = [...st, context.theme.getRootTheme()];
  useEffect(() => {
    return () => clearStyles(id);
  }, []);
  return st;
};

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
      return hexcode;
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
  value?: Funtion | boolean
) => {
  if (value && typeof value == "function")
    return value() ? true : false;
  return value;
};

export {
  public_m,
  sleep,
  days_between,
  newId,
  proc,
  removeProps,
  parseThemeStyle,
  StyledView,
  joinKeys,
  arrayBuffer,
  invertColor,
  ifSelector,
  writeFile,
  getDirectoryPermissions,
  generateText
};
