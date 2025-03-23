import CStyle from "./components/CStyle";
import { cssTranslator } from "./styles";
import IDOMParser from "advanced-html-parser";
import { Element, Node } from "advanced-html-parser/types"
import * as Methods from "./Methods";
import StateBuilder from "react-smart-state";
import { IGlobalState, FileInfo } from "./Types";
import * as React from "react";
import TestRunner from "./tests/TestRunner";
import Html from "native/Html";

const fileTypesExt = [".json", ".html", ".epub", "zip", "rar", ".jpg", ".gif", ".png", ".jpeg", ".webp"];

declare global {
    var fileTypes: string[];
    var tests: TestRunner[];
    var useState: typeof React.useState;
    var useEffect: typeof React.useEffect;
    var useRef: <T = any>(item?: T) => { current: T };
    var context: IGlobalState;
    var methods: typeof Methods;
    var buildState: typeof StateBuilder;
    var getFileName: (file: string, dir?: string) => string;
    var getFileInfo: (path: string, dir?: string) => FileInfo;
    var getFileInfoFromUrl: (url: string) => string;
    var test: (name: string) => TestRunner;
    var folderValidName: (name: string) => string;
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
        skip: (index: number, handler?: Function) => string[];
    }

    interface String {
        isManga(): boolean;
        fileName(name: string, parserName: string): string;
        isLocalPath(incBase64?: boolean): boolean;
        escapeRegExp(): string;
        join(...relative: String[]): string;
        path(...relative: string[]): string;
        empty(): boolean;
        onEmpty(defaultValue: string): string;
        query(item: any): string;
        trimEnd(...items): string;
        trimStr(...items): string; // TrimStart
        has(selector?: string): boolean;
        count(count: number): boolean;
        imageUrlSize: (size: string) => string;
        css(): any;
        sSpace(total?: number): string;
        eSpace(total?: number): string;
        cleanHtml(): string;
        cleanText(): string;
        htmlArray(): string[];
        html(): Html;
        htmlImagesSources(): string[];
        normilzeStr(): string;
        splitSearch(searchFor: string): boolean;
        displayName(): string;
        imageFetchBuilder(
            selector: string,
            baseUrl: string,
            attr?: string
        ): string;
        safeSplit(c: string, index: number): string;
        toCode: () => number[];
    }

    interface Number {
        sureValue: (a?: number, isInt?: boolean) => number;
        readAble: () => any;
        procent: (index: number) => number;
    }
}

String.prototype.normilzeStr = function () {
    let str = new String(this).toString();
    let index = 0;
    let r = "";
    while (index < str.length) {
        let c = str.charAt(index);
        index++;

        if ((c.trim() == "" && r.endsWith(" ")))
            continue;
        else if (c == "\n" || c == "\r") {
            r = r.trim() + " ";
        } else
            r += c;

    }
    return r;
}

String.prototype.toCode = function () {
    let str = new String(this).toString();
    let code: number[] = [];
    for (let i = 0; i < str.length; i++) {
        code.push(str.charCodeAt(i))
    }

    return code;
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

String.prototype.fileName = function (name: string, parserName: string) {
    return parserName.path(name
        .replace(/(\/|\.|:|"|'|\{|\}|\[|\]|\,|\’)/gim, "")
        .toLowerCase() + ".json").trimEnd("/");
};

String.prototype.isLocalPath = function (base64?: boolean) {
    const str = new String(this).toString();
    let res = !/http(s)?:|www\./g.test(str);
    return !base64 ? res : res && !/data\:image/g.test(str);
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

Number.prototype.procent = function (index: number) {
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
    let html = IDOMParser.parse(`<div>${str}</div>`, {
        errorHandler: {
            error: (e: string) => { },
            warning: (e: string) => { },
            fatalError: console.error
        }

    }).documentElement.text();
    return html;
};

String.prototype.html = function () {
    let str = new String(this).toString();
    let html = new Html(`<div>${str}</div>`, "");
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
    let str = new String(this).toString().replace(/((<)(strong|i)(>))|((<\/)(strong|i)(>))/gim, "");
    const doc = IDOMParser.parse(`<div>${str}</div>`, {
        errorHandler: {
            error: () => { },
            warning: () => { },
            fatalError: () => { }
        }
    });

    return doc.documentElement.text().split(/\n/gim).filter(x => !x.empty()).map(x => `<p>${x}</p>`)
};

String.prototype.htmlImagesSources = function () {
    let str = new String(this).toString();
    const doc = IDOMParser.parse(`<div>${str}</div>`);
    let elems = [...doc.documentElement.querySelectorAll("img")];
    return elems.map(x => x.getAttribute("src"));
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

String.prototype.trimStr = function (...items) {
    let str = new String(this).toString().trim();
    items.forEach(x => {
        if (str.startsWith(x)) str = str.substring(1);
    });

    return str;
};

String.prototype.query = function (item: any) {
    let url = new String(this).toString();
    if (url.endsWith("/")) url = url.substring(0, url.length - 1);
    Object.keys(item).forEach(x => {
        let v = item[x];
        if (x.startsWith("$"))
            x = x.substring(2)
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
        .filter(x => x != undefined && x !== null && x.has())
        .map(x => x.toString())
        .forEach(x => {
            url = `${url.trimEnd("/")}/${x.trimStr("/")}`;
        });
    if (!url.endsWith("/")) url += "/";
    if (fileTypes.find(x => url.trimEnd("/").endsWith(x)))
        return url.trimEnd("/")
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


//declare var global: typeof globalThis;

global.fileTypes = fileTypesExt;
global.methods = Methods;
global.tests = [];
global.test = (desc: string) => {
    let item = new TestRunner(desc);
    global.tests.push(item);
    return item;
}
global.buildState = StateBuilder;
global.useEffect = React.useEffect;
global.useState = React.useState;
global.useRef = React.useRef;
global.folderValidName = (name: string) => {
    return (name ?? Methods.newId()).replace(/([\(\)\,\.\+\-\:\<\>\_\-])/gim, "")
}

global.getFileInfoFromUrl = (url: string) => {
    return url.trimEnd("/").split("/").pop() as string;
}

global.getFileInfo = (path: string, dir?: string) => {
    let item = {
        path,
        folders: [],
        folder: "",
        filePath: "",
    } as FileInfo;

    if (fileTypes.find(x => path.endsWith(x))) {
        item.name = path.split("/").pop();
    }

    if (dir && item.name)
        item.filePath = path.replace(dir, "").trimStr("/");
    else item.filePath = item.name;

    if (item.name)
        path = path.split("/").reverse().skip(0).reverse().join("/"); // execlude file

    if (dir)
        item.folder = path.replace(dir.split("/").reverse().skip(0).reverse().join("/"), "")
    else item.folder = path;


    path.split("/").filter(x => !x.empty()).forEach(x => {
        let lastItem = item.folders.lastOrDefault() as string | undefined;
        let p = lastItem ? lastItem.path(x) : x;
        // p = dir ? dir.path(p) : p;
        if (!p.startsWith("/"))
            p = "/" + p;
        if (!item.folders.find(x => x == p))
            item.folders.push(p);
    });
    if (dir)
        item.folders = item.folders.filter(x => (dir.length < x.length))

    return item;

}
global.getFileName = (file: string, dir?: string) => {
    // its full path 
    if (
        file &&
        file.has() &&
        !fileTypes.find(x => file.has(x))
    ) {
        file += ".json";
    }
    if (file.startsWith("/") || file.startsWith("file")) return file;

    if (dir)
        file = dir + file;
    /* if (file.startsWith("/"))
         file = `file://${file}`;
     else if (!file.startsWith("file"))
         file = `file:///${file}`;*/
    return file;
}

const GlobalContext = require("./GlobalContext").default;
global.context = GlobalContext;