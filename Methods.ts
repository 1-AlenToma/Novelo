import uuid from "react-native-uuid";
import { Styleable } from "./styles";

const StyledView = function <T>(
  View: T,
  name: string
) {
  const Style =
    require("./components/CStyle").default;
  return Styleable(View, name, Style);
};
const public_m = (...Items: any[]) => {
  try{
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
      let n = x[0].toUpperCase() + x.substring(1);
      if (!Item.prototype[n])
        Item.prototype[n] = function (v: any) {
          if (!this) throw "this is null " + Item;
          this[x] = v;
          return this;
        };
    });
  });
  }catch(e){
    console.error(e,Items);
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
  if (css) st.push(css.css());
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
    keys.forEach(k => {
      if (item[k] !== undefined) delete item[k];
    });
  }

  return item;
};

const joinKeys = (a: any, b: any) => {
  let keys = Object.keys(a);
  for (let k in b) {
    if (keys.find(f => f === k) && (k!="id" || b[k]!= undefined)) a[k] = b[k];
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

const arrayBuffer = (arr:any[])=>{
  let str = "";
  for(let a of arr){
    str += String.fromCharCode(a);
  }
  return str;
}

function invertColor(hexcolor) {
    try {
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
  invertColor
};
