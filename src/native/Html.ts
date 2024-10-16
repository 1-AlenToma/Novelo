const cheerio = require("react-native-cheerio");
class Html {
  io: any;
  uurl: string;
  p: Function;
  rType: string = "HTML";
  constructor(
    htext: any,
    uurl?: string,
    parent?: any
  ) {
    this.uurl = uurl ?? "";
    this.p = parent;
    if (typeof htext === "string") {
      this.p = cheerio.load(htext, {
        xml: {
          normalizeWhitespace: true,
          decodeEntities: false
        }
      });
    } else {
      //console.error(htext);
      this.io =
        htext && htext.find
          ? htext
          : this.p
          ? this.p(htext)
          : htext;
    }
  }

  log(...name: any[]) {
    console.log(...name);
  }

  $(selector: any) {
    return new Html(
      this.p(selector),
      this.uurl,
      this.p
    );
  }

  find(selector) {
    return new Html(
      this.io && this.io.find
        ? this.io.find(selector)
        : this.$(selector),
      this.uurl,
      this.p
    );
  }

  map(fn: (x: Html, index: number) => any) {
    let items : any[] = [];
    this.io.each((index, x) => {
      let item = fn(
        new Html(
          x.io ? x.io : x,
          this.uurl,
          this.p
        ),
        index
      );
      if (item !== undefined && item !== null)
        items.push(item);
    });
    return items;
  }

  eq(index:number){
     let item = this.filter((x,i)=> i == index);
     return item;
  }

  filter(
    fn: (x: Html, index: number) => boolean
  ) {
    return new Html(
      this.io.filter((i, x) =>
        fn(new Html(x, this.uurl, this.p), i)
      ),
      this.uurl,
      this.p
    );
  }

  get length() {
    return this.io?.length ?? 0;
  }
  
  get hasValue (){
    return this.length >0;
  }

  forEach(fn: (x: Html, index: number) => void) {
    this.io.each((i, x) => {
      fn(new Html(x, this.uurl, this.p), i);
    });
    return this;
  }

  get text() {
    return this.io.text();
  }

  val(v?: string) {
    return this.io.val(v);
  }

  data(key: string) {
    return this.io.data(key);
  }

  remove(selector: string) {
    this.find(selector).forEach(x =>
      x.io.remove()
    );
    return this;
  }

  get html() {
    return this.io.html();
  }

  get outerHtml() {
    return this.io.prop("outerHTML");
  }

  hasClass(cl: string) {
    return this.io.hasClass(cl);
  }

  get parent() {
    return new Html(
      this.io.parent(),
      this.uurl,
      this.p
    );
  }

  get children() {
    return new Html(
      this.io.children(),
      this.uurl,
      this.p
    );
  }

  closest(key: string) {
    return new Html(
      this.io.closest(key),
      this.uurl,
      this.p
    );
  }

  attr(key: string) {
    let value = "";
    key.split("|").forEach(k => {
      if (value == "") {
        let v = this.io.attr(k);
        if (v && v.length > 0) {
          value = v;
        }
      }
    });
    return value || "";
  }

  url(key: string) {
    let value : any= "";
    key.split("|").forEach(k => {
      if (!value || value.empty()) {
        value = this.io.attr(k);
        if (
          value &&
          !value.empty() &&
          this.uurl
        ) {
          value = this.uurl.join(value) ?? value;
        }
      }
    });
    return value || "";
  }
}
export default Html;
