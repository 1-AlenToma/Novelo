import uuid from "react-native-uuid";
import { Styleable } from "./styles";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { useRef } from "react";

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
  invertColor: any
) => {
  const id = useRef(newId()).current;
  let globalData =
    require("./GlobalContext").default;
  let themeSettings = {
    ...(!invertColor
      ? globalData.theme.settings
      : globalData.theme.invertSettings())
  };
  if (invertColor === undefined)
    delete themeSettings.backgroundColor;

  let st =
    style && Array.isArray(style)
      ? [...style]
      : [style || {}];
  st = [themeSettings, ...st];
  if (css) st.push(css.css(id));
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
  getDirectoryPermissions
};
