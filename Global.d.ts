declare global {
  interface String {
    join(...relative: String[]): String;
    empty(): String;
    query(item: any): string;
    trimEnd(...items): string;
  }

  interface Array < T > {
    async mapAsync(fn: (item: T, index: number) => Promise < T[] > );
  }

  Array.prototype.mapAsync = async function(fn: (item: any, index: number) => Promise < any[] > ) {
    let items = [];
    for (let index in this) {
      let t = await fn(this[index], index);
      if (t !== undefined && t !== null)
        items.push(t);
    }

    return items;
  }

  String.prototype.empty = function() {
    return !this || this.trim() == "";
  }

  String.prototype.trimEnd = function(...items) {
    let str = this.trim();
    items.forEach(x => {
      if (str.endsWith(x))
        str = str.substring(0, str.length - 1);
    })

    return str;
  }

  String.prototype.query = function(item: any) {
    let url = this;
    if (url.endsWith("/"))
      url = url.substring(0, url.length - 1);
    Object.keys(item).forEach(x => {
      let v = item[x];
      if (url.indexOf("?") !== -1)
        url += "?";
      if (url.endsWith("&&"))
        url += `${x}=${v}`;
      else url += `&&${x}=${v}`
    })


    return url;
  }


  String.prototype.join = function(...relative: String[]) {
    let url = this;
    relative.forEach(x => {
      if (x && !x.empty() && !(x.startsWith("http") || x.startsWith("https") || x.startsWith("www")))
      {
        if (x.startsWith("/"))
          x = x.substring(1);
        if (url.endsWith("/"))
          url = url.substring(1, url.length - 1);

        url = `${url}/${x}`;
      }
    });

    return url;
  }
}