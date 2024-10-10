import CStyle from "./components/CStyle";
import { cssTranslator, clearStyles } from "./styles";
import IDOMParser from "advanced-html-parser";
import * as Methods from "./Methods";
import StateBuilder from "react-smart-state";
import { IGlobalState } from "./Types";
import * as React from "react";
const cheerio = require("react-native-cheerio");

declare global {
    var useState: typeof React.useState;
    var useEffect: typeof React.useEffect;
    var useRef: <T = any>(item?: T) => { current: T };
    var context: IGlobalState;
    var methods: typeof Methods;
    var buildState: typeof StateBuilder;
    var getFileName: (file: string, dir: string) => string;
    interface Date {
        getMinDiff: (date: Date) => number;
    }
    interface Array<T> {
        mapAsync(fn: (item: T, index: number) => Promise<T[]>);
        distinct: (key: keyof T, itemsB: T[]) => T[];
        at: (index: number) => T | undefined;
        firstOrDefault: (key?: keyof T) => T | T[keyof T] | undefined;
        lastOrDefault: (key?: keyof T) => T | T[keyof T] | undefined;
        clear: () => T[];
        has: (item?: any) => boolean;
        niceJson: (...keyToRemove: (keyof T)[]) => string;
        skip: (index: number, handler: Function) => string;
    }

    interface String {
        isManga(): boolean;
        fileName(...url: string[]): string;
        escapeRegExp(): string;
        join(...relative: String[]): string;
        path(...relative: string[]): string;
        empty(): boolean;
        onEmpty(defaultValue: string): string;
        query(item: any): String;
        trimEnd(...items): String;
        has(selector?: string): boolean;
        count(count: number): boolean;
        imageUrlSize: (size: string) => string;
        css(): any;
        sSpace(total?: number): string;
        eSpace(total?: number): string;
        cleanHtml(): string;
        cleanText(): string;
        htmlArray(): string[];
        html(): any;
        splitSearch(searchFor: string): boolean;
        displayName(): string;
        imageFetchBuilder(
            selector: string,
            baseUrl: string,
            attr?: string
        ): string;
        safeSplit(c: string, index: number): string;
    }

    interface Number {
        sureValue: (a?: number, isInt?: boolean) => number;
        readAble: () => any;
        procent: (index:number)=> number;
    }
}

String.prototype.onEmpty = function (defaultValue: string) {
    
    let str = new String(this).toString();
    return !str.empty() ? str : defaultValue;
}

String.prototype.isManga = function () {
    let mng = ["manhwa", "manga", "manhua"];
    let str = new String(this).toString();
    return mng.find(x => str.toLowerCase() == x) != undefined;
}

String.prototype.fileName = function (...url: string[]) {
    return `${url
        .join("")
        .replace(/(\/|\.|:|"|'|\{|\}|\[|\]|\,| |\’)/gim, "")
        .toLowerCase()}.json`;
};
String.prototype.displayName = function () {
    let str = new String(this).toString();
    return str[0].toUpperCase() + str.substring(1);
};

String.prototype.escapeRegExp = function () {
    let str = new String(this).toString();
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

Date.prototype.getMinDiff = function (date: Date) {
    var today = new Date() as any;
    var diffMs = this - today;
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    return diffMins;
};

Number.prototype.readAble = function () {
    let nr = this.toString();
    let nrs = nr.split(".");
    if (nrs.length <= 1) return nr;
    if (/[1-9]/g.test(nrs[1])) return `${nrs[0]}.${nrs[1].substring(0, 2)}`;
    return nr;
};

Number.prototype.procent = function(index:number){
    let p = (100 * index + 1) / this;
    return p;
}

Number.prototype.sureValue = function (a?: number, isInt?: boolean) {
    if (a === undefined || a === null || isNaN(a))
        return isInt ? parseInt(this.toString()) : this;
    return isInt ? parseInt(a.toString()) : a;
};

Array.prototype.skip = function (index: number, handler?: Function) {
    if (!handler) return this.filter((x, i) => i > index);
    return this.filter((x, i) => !handler(x, i) || i > index);
};

Array.prototype.at = function (index: number) {
    if (index === undefined) return undefined;
    return this.length > index ? this[index] : undefined;
};

Array.prototype.lastOrDefault = function (key?: any) {
    let item = this.length > 0 ? this[this.length - 1] : undefined;
    return (item && key ? item[key] : item);
};

Array.prototype.clear = function () {
    while (this.length > 0) this.shift();

    return this;
};

Array.prototype.has = function (item?: any) {
    return (
        this.filter(
            x =>
                x !== undefined &&
                x !== null &&
                (item === undefined || x == item)
        ).length > 0
    );
};

Array.prototype.firstOrDefault = function (key?: any) {
    let item = undefined;
    let items = this.filter(x => x !== undefined && x !== null);
    if (items.length <= 0) return undefined;
    item = items[0];
    if (key && item) item = item[key];
    return item;
};

Array.prototype.distinct = function (key: any, itemsB: any[]) {
    let items = this;
    if (itemsB)
        for (let value of itemsB) {
            if (value && !items.find(x => x[key] === value[key]))
                items.push(value);
        }

    return items;
};

Array.prototype.niceJson = function (...keyToRemove: any[]) {
    function replacer(key, value) {
        if (keyToRemove.find(x => x == key)) return undefined;
        return value;
    }
    if (!keyToRemove.has()) return JSON.stringify(this, undefined, 4);

    return JSON.stringify(this, replacer, 4);
};

Array.prototype.mapAsync = async function (
    fn: (item: any, index: any) => Promise<any[]>
) {
    let items = [] as any[];
    for (let index in this) {
        let t = await fn(this[index], index);
        if (t !== undefined && t !== null) items.push(t);
    }
    return items;
};

String.prototype.imageFetchBuilder = function (
    selector: string,
    baseUrl: string,
    attr?: string
) {
    let url = new String(this).toString();
    attr = attr || "src";
    return `[${baseUrl}][${url}][${selector}][${attr}]`;
};

String.prototype.splitSearch = function (searchFor: string) {
    if (!this) return false;
    let str = new String(this).toString().trim();
    if (str.empty()) return false;
    if (!searchFor || searchFor.empty()) return false;
    for (let s of searchFor.split(" ")) {
        if (!str.has(s) && !s.empty()) return false;
    }
    return true;
};

String.prototype.cleanHtml = function () {
    let str = new String(this).toString();
    let html = cheerio.load(str).text();
    return html;
};

String.prototype.html = function () {
    let str = new String(this).toString();
    let html = cheerio.load(str, {
        decodeEntities: false
    });
    return html;
};

String.prototype.cleanText = function () {
    let str = new String(this).toString();
    const doc = IDOMParser.parse(`<div>${str}</div>`);
    str = doc.documentElement
        .text()
        .replace(/\<\/( )?br>|\<br( )?(\/)?>/gim, "");
    const clean = (char: string) => {
        char.split("").forEach(c => {
            let reg = new RegExp(`(\\${c})\\1+`, "gmi");
            str = str.replace(reg, c);
        });
        return str;
    };

    return clean(`@#$_&-+()/*"':;!?~|•√π÷×§∆£¢€¥^°=%©®™✓[]{}<>,.`);
};

String.prototype.htmlArray = function () {
    let str = new String(this).toString();
    const doc = IDOMParser.parse(`<div>${str}</div>`);
    let elems = [...doc.documentElement.querySelectorAll("p,h1,h2,h3,h4,h5")];
    return elems.map(x => x.outerHTML);
};

String.prototype.sSpace = function (total?: number) {
    total = (1).sureValue(total);
    let str = new String(this || "").toString();
    while (total > 0) {
        str = " " + str;
        total--;
    }
    return str;
};

String.prototype.eSpace = function (total?: number) {
    total = (1).sureValue(total);
    let str = new String(this || "").toString();
    while (total > 0) {
        str += " ";
        total--;
    }
    return str;
};

String.prototype.safeSplit = function (c: string, index: number) {

    let ar = new String(this).toString().split(c);
    if (index === -1) return (ar.lastOrDefault() ?? "") as string;
    return ar[index] ?? "";
};
let styleShortKeys = [];

String.prototype.css = function (id?: string) {
    let styleText = String(this).toString();
    return cssTranslator(styleText, CStyle, undefined, id ?? styleText);
};

String.prototype.imageUrlSize = function (size: string) {
    let url = new String(this).toString();
    return url.replace(/\d+[x]\d+/gim, size);
};

String.prototype.count = function (nr: number) {
    let str = new String(this).toString();
    return str.length >= nr;
};

String.prototype.has = function (selector: any) {
    if (!selector) return !(new String(this).toString().empty());
    return (
        selector &&
        !selector.empty() &&
        new String(this)
            .toString()
            .toLowerCase()
            .indexOf(selector.toString().toLowerCase()) !== -1
    );
};

String.prototype.empty = function () {
    let str = new String(this).toString();
    return str === null || str.match(/^ *$/) !== null;
};

String.prototype.trimEnd = function (...items) {
    let str = new String(this).toString().trim();
    items.forEach(x => {
        if (str.endsWith(x)) str = str.substring(0, str.length - 1);
    });

    return str;
};

String.prototype.query = function (item: any) {
    let url = new String(this).toString();
    if (url.endsWith("/")) url = url.substring(0, url.length - 1);
    Object.keys(item).forEach(x => {
        let v = item[x];
        if (!url.has("?")) url += "?";
        if (url.endsWith("&") || url.endsWith("&&") || url.endsWith("?"))
            url += `${x}=${v}`;
        else url += `&&${x}=${v}`;
    });

    return url;
};

String.prototype.path = function (...relative: string[]) {
    let url = new String(this).toString().trim();
    relative
        .filter(x => x && x.has())
        .forEach(x => {
            if (url.endsWith("/")) url = url.substring(0, url.length - 1);
            if (x.startsWith("/")) x = x.substring(1);
            url = `${url}/${x}`;
        });
    if (!url.endsWith("/")) url += "/";
    return url;
};

String.prototype.join = function (this: string, ...relative: String[]) {
    let url = new String(this).toString();

    relative
        .filter(x => x && x.has())
        .forEach(x => {
            if (
                !(
                    x.startsWith("http") ||
                    x.startsWith("https") ||
                    x.startsWith("www")
                )
            ) {
                if (x.startsWith("/")) x = x.substring(1);
                if (url.endsWith("/")) url = url.substring(0, url.length - 1);

                url = `${url}/${x}`;
            } else url = x as string;
        });

    return url;
}

const GlobalContext = require("./GlobalContext").default;
global.context = GlobalContext;
global.methods = Methods;
global.buildState = StateBuilder;
global.useEffect = React.useEffect;
global.useState = React.useState;
global.useRef = React.useRef;
global.getFileName = (file: string, dir: string) => {
    // its full path
    let types = [".json", ".html", ".epub"];
    if (
        file &&
        file.has() &&
        !types.find(x => file.has(x))
    )
        file += ".json";
    if (file.startsWith("/")) return file;
       file = dir + file;
   /* if (file.startsWith("/"))
        file = `file://${file}`;
    else if (!file.startsWith("file"))
        file = `file:///${file}`;*/
    return file;
}
