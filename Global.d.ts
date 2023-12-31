declare global {
  interface String {
    join(...relative: String[]): String;
    empty(): String;
    query(item: any): String;
    trimEnd(...items): String;
    has(selector: string): boolean;
  }
}

interface Array<T> {
  mapAsync(
    fn: (item: T, index: number) => Promise<T[]>
  );
}

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

String.prototype.has = function (
  selector: string
) {
  return (
    selector != "" &&
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
    if (url.indexOf("?") === -1) url += "?";
    if (url.endsWith("&&")) url += `${x}=${v}`;
    else url += `&&${x}=${v}`;
  });

  return url;
};

String.prototype.join = function (
  this: string,
  ...relative: String[]
) {
  let url: string = new String(this).toString();
  relative.forEach(x => {
    if (
      x &&
      !x.empty() &&
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
