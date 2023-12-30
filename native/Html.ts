import cheerio from "react-native-cheerio";
class Html {
    el: any;
    uri: string;
    constructor(htext: any, url: string) {
        this.uri = url;
        if (typeof htext === "string") {
            this.el = cheerio.load(htext, {
                xml: {
                    normalizeWhitespace: true
                }
            });
        } else this.el = htext;
    }

    $(selector: string) {
        return new Html(this.el(selector), this.uri);
    }

    find(selector) {
        return new Html(this.el.find(selector), this.uri);
    }

    map(fn: (x: Html, index: number) => any) {
        return this.el.map((x,index)=>fn(new Html(x,this.uri)));
    }

    filter(fn: (x: Html, index: number) => boolean) {
        return new Html(this.el.filter(fn), this.uri);
    }

    forEach(fn: (x: Html, index: number) => void) {
        this.el.each((x, i) => {
            fn(new Html(x, this.uri), i);
        });
        return this;
    }

    get text() {
        return this.el.text();
    }
    val(v?: string) {
        return this.el.val(v);
    }
    data(key: string) {
        return this.el.data(key);
    }

    get html() {
        return this.el.html();
    }

    get outerHtml() {
        return this.el.outerHtml();
    }

    hasClass(cl: string) {
        return this.hasClass(cl);
    }

    get parent() {
        return new Html(this.el.parent(), this.uri);
    }

    get children() {
        return new Html(this.el.children(), this.uri);
    }

    closest(key: string) {
        return new Html(this.el.closest(key), this.uri);
    }

    attr(key: string) {
        let value = "";
        key.split("|").forEach(k => {
            if (value == "") {
                let v = this.el.attr(k);
                if (v && v.length > 0) {
                    value = v;
                }
            }
        });
        return value;
    }

    url(key: string) {
        let value = "";
        key.split("|").forEach(k => {
            if (!value || value == "") {
                value = this.el.attr(k);
                if (value && value.length > 0) {
                    if (
                        ["www", "http", "https"].filter(
                            x => value.indexOf(x) != -1
                        ).length <= 0
                    ) {
                        if (value.startsWith("/")) v = v.substring(1);
                        if (this.uri.endsWith("/"))
                            this.uri = this.uri.substring(
                                0,
                                this.uri.length - 1
                            );
                        value = `${this.uri}/${v}`;
                    }
                }
            }
        });
        return value;
    }
}
export default Html;
