import IDOMParser from "advanced-html-parser";
import { Document, Element } from "advanced-html-parser/types";
class Html {
  io: Element | Element[] | Html;
  uurl: string;
  rType: string = "HTML";
  constructor(htext: any, uurl?: string) {
    this.uurl = uurl ?? "";
    if (typeof htext === "string") {
      this.io = IDOMParser.parse(`<div class="tbhjhasd">${htext}</div>`, {
        errorHandler: {
          error: (e: string) => { },
          warning: (e: string) => { },
          fatalError: console.error
        }

      }).documentElement;
    } else {
      //console.error(htext);
      this.io = htext ?? [];
      //  this.io = htext && htext.find ? htext : this.p ? this.p(htext) : htext;
    }
  }

  /**
   * Evaluates a chained query DSL string against the current `Html` instance.
   *
   * ### Syntax Rules
   * Steps are separated by `->` and executed left-to-right:
   * 1. **CSS Selector (default)**: Any unrecognized step is passed to `.find(selector)`.
   * 2. **Method with Argument (`method::arg`)**: Calls a method on `Html` with the given argument
   *    (e.g. `attr::href`, `url::data-src|src`, `eq::0`, `closest::li`, `data::id`, `hasClass::active`).
   * 3. **Getter Property**: Accesses `Html` getters directly
   *    (`text`, `html`, `outerHtml`, `parent`, `children`, `length`, `hasValue`).
   *
   * @example
   * f.run('.info-meta li h3:contains("Alternative") -> parent -> url::src');
   *   const genres = body.run<string[]>('.info-meta a[href*="genres"] -> map::text');
   *  const genreLinks = body.run<string[]>('.info-meta a[href*="genres"] -> map::attr::href');
   */
  // Maps every matching genre link to its text -> string[]

  run<T = any>(query: string): T {
    return query.split("->").map(s => s.trim()).reduce((acc: any, step) => {
      if (acc == undefined || !step) return acc;

      const idx = step.indexOf("::");
      const fn = (idx !== -1 ? step.slice(0, idx) : step).trim();

      // 1. Special handling for map::subquery (e.g., "map::text" or "map::attr::href")
      if (fn === "map" && idx !== -1 && typeof acc.map === "function") {
        const subQuery = step.slice(idx + 2).trim();
        return acc.map((x: Html) => x.run(subQuery));
      }

      // 2. Method with argument (e.g., "attr::href", "first::.info-meta", "eq::0")
      if (idx !== -1 && typeof acc[fn] === "function") {
        const arg = step.slice(idx + 2).trim();
        return acc[fn](fn === "eq" ? Number(arg) : arg);
      }

      // 3. Getter property on Html (e.g., "text", "html", "parent", "hasValue")
      const descriptor = Object.getOwnPropertyDescriptor(Html.prototype, fn);
      if (descriptor && typeof descriptor.get === "function") {
        return acc[fn];
      }

      // 4. Fallback: treat the step as a CSS selector for find()
      return typeof acc.find === "function" ? acc.find(step) : undefined;
    }, this);
  }

  log(...name: any[]) {
    console.log(...name);
  }

  get elements(): Element[] {
    if ((this.io as Html).rType)
      return (this.io as Html).elements;
    return (Array.isArray(this.io) ? this.io : [this.io]) as Element[];
  }

  getItems(selector: string): Element[] {
    if ((this.io as Html).rType)
      return (this.io as Html).getItems(selector);

    if (Array.isArray(this.io))
      return (this.io as Element[]).map(x => [...x.querySelectorAll(selector)]).flatMap(x => x).filter((x, index, array) => x && x != null && array.indexOf(x) === index);
    return [...(this.io as Element).querySelectorAll(selector)];
  }

  $(selector: any) {
    return new Html(this.getItems(selector), this.uurl);
  }

  findAll(selector: any) {
    return new Html(this.getItems(selector), this.uurl);
  }

  first(selector) {
    return new Html(this.getItems(selector).firstOrDefault(), this.uurl);
  }

  find(selector: string | ((x: Html, index: number) => any)) {
    if (typeof selector == "string")
      return new Html(this.getItems(selector), this.uurl);
    if (selector) return this.one(selector)
  }

  // this method are for special tags like dc:identifier where it containe :
  byTag(tag: string) {
    return new Html(
      this.elements.map(x => [...x.children].filter(x => (x.tagName ?? "").has(tag))).flatMap(x => x),
      this.uurl
    );
  }

  map<T>(fn: (x: Html, index: number) => T) {
    let items: T[] = [];
    this.elements.forEach((x, index) => {
      let item = fn(new Html(x, this.uurl), index);
      if (item !== undefined && item !== null)
        items.push(item);
    });
    return items;
  }

  eq(index: number) {
    let item = this.filter((x, i) => i == index);
    return item;
  }

  one(fn: (x: Html, index: number) => boolean) {
    return new Html(
      this.elements.find((x, i) =>
        fn(new Html(x, this.uurl), i)
      ),
      this.uurl
    );
  }

  filter(fn: (x: Html, index: number) => boolean) {
    return new Html(
      this.elements.filter((x, i) =>
        fn(new Html(x, this.uurl), i)
      ),
      this.uurl
    );
  }

  get length() {
    return this.elements?.length ?? 0;
  }

  get hasValue() {
    return this.length > 0;
  }

  forEach(fn: (x: Html, index: number) => void) {
    this.elements.forEach((x, i) => {
      fn(new Html(x, this.uurl), i);
    });
    return this;
  }

  get text() {
    return this.elements.map(x => x.text()).join("");
  }

  val(v?: string) {
    if (v != undefined)
      this.elements.forEach(x => x.value = v);
    return this.elements.map(x => x.value).join("");
  }

  data(key: string) {
    return this.elements.map(x => x.getAttribute(key)).filter(x => x != undefined && x != "").join("");
  }

  remove(selector: string) {
    this.getItems(selector).forEach(x =>
      x.remove()
    );
    return this;
  }

  get html() {
    return this.elements.map(x => x.innerHTML).join("")
  }

  get outerHtml() {
    return this.elements.map(x => x.outerHTML).join("")
  }

  hasClass(cl: string) {
    return this.elements.find(x => x.getAttribute("class").indexOf(cl) != -1) != undefined;
  }

  get parent() {
    return new Html(
      this.elements.map(x => x.parentNode),
      this.uurl
    );
  }

  get children() {
    return new Html(
      this.elements.map(x => [...x.children]).flatMap(x => x),
      this.uurl
    );
  }

  closest(key: string) {
    return new Html(
      this.elements.map(x => x.closest(key)).filter(x => x),
      this.uurl
    );
  }

  attr(key: string) {
    let value = "";
    key.split("|").forEach(k => {
      if (value == "") {
        let v = this.elements.find(x => x.getAttribute(k) && x.getAttribute(k).length > 0)?.getAttribute(k);
        if (v && v.length > 0) {
          value = v;
        }
      }
    });
    return value || "";
  }

  url(key: string, header?: any, serilize?: (value: string) => string) {
    let value: any = "";
    key.split("|").forEach(k => {
      if (!value || value.empty()) {
        value = this.elements.find(x => x.getAttribute(k) && x.getAttribute(k).length > 0)?.getAttribute(k);
        if (value && !value.empty() && this.uurl) {
          value = serilize ? this.uurl.join(serilize(value)) : this.uurl.join(value);
        }
      }
    });
    if (value && value.length > 0 && serilize)
      value = serilize(value)
    if (header && value && value.length > 0)
      value += ` header=${JSON.stringify(header)}`
    return value || "";
  }
}
export default Html;
