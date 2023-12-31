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
          if (!this) throw "this is null" + Item;
          this[x] = v;
          return this;
        };
    });
  });
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

export {
  public_m,
  sleep,
  days_between,
  newId,
  proc,
  removeProps,
  parseThemeStyle,
  StyledView
};
