import { globalData } from "../theme/ThemeContext";

export const flatStyle = (style: any) => {
    if (style && Array.isArray(style) && typeof style == "object")
        style = style.reduce((a, v) => {
            if (v)
                a = { ...a, ...v };
            return a;
        }, {});

    return style ?? {};
}

export const parseKeys = (key: string) => {
    let t = "";
    let keys: string[] = [];
    for (let i = 0; i < key.length; i++) {
        let k = key[i];
        let nKey = key[i + 1];
        if (k != "$") {
            t += k;
            continue;
        }

        if (k == "$" && nKey != "$") {
            if (!keys.includes(t))
                keys.push(t); // 
            t += "."
            continue
        }

        if (k == "$" && nKey == "$") {
            if (!keys.includes(t))
                keys.push(t);
            t = keys[keys.length - 2] ?? t;
        }
    }

    keys.push(t);
    return keys.filter(x => x && x.length > 0)
}

export const extractProps = (css?: string) => {
    let result = { css, _hasValue: false };
    if (!css)
        return result
    if (/(props\:)( )?(\{)(.*)(\})/g.test(css)) {
        result._hasValue = true;
        let value = css.match(/((props\:)( )?(\{)(.*)(\}))/g);
        if (value && value.length > 0) {
            let items = [];
            for (let item of value) {
                let pItem = JSON.parse(item.replace(/(props:)/g, ""));
                if (pItem.css) {
                    css = css.replace(item, pItem.css);
                    delete pItem.css
                }
                else css = css.replace(item, "")
                items.push(pItem)
            }
            if (items.length > 0)
                result = { ...result, ...flatStyle(items) };
        }
    }

    result.css = css;
    return result;
}

let ids = new Map();
let lastDate = new Date();
export const newId = (inc?: string): string => {
    if (lastDate.getMinutes() - new Date().getMinutes() > 1) {
        ids = new Map();
        lastDate = new Date();
    }
    let id: string = (inc ?? "") + Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
    if (ids.has(id)) {
        return (newId(id) as string);
    }
    ids.set(id, id);
    return id;
}


export const ValueIdentity = {
    chars: [":", "-"] as const,
    has: (value: any) => {
        return value && typeof value == "string" && ValueIdentity.chars.find(x => value.indexOf(x) !== -1)
    },
    keyValue: (value: string) => {
        value = value.trim();
        let parts = value.split(":");
        if (parts.length < 2)
            parts = value.split("-");
        let item = { key: parts[0], value: parts.filter((_, i) => i > 0).join("-"), kvalue: value, isClassName: false };
        if (item.value.startsWith("$")) {
            item.isClassName = true;
            item.value = value.split("$")[1];
        }
        return item;
    },
    splitCss: (css: string) => {
        if (!css || typeof css !== "string")
            return [];
        let k = `${css}_splitCss_Result`;
        if (globalData.tStorage.has(k))
            return globalData.tStorage.get(k);
        let cssClean = css.replace(/( )?((\:)|(\-))( )?/gmi, "$2");
        let result = cssClean.trim().match(/((\(|\)).*?(\(|\))|[^(\(|\))\s]+)+(?=\s*|\s*$)/g) ?? [];

        globalData.tStorage.set(k, result);
        return result;
    },
    getClasses: (css: string, globalStyle: any, itemIndex?: number) => {
        let items = ValueIdentity.splitCss(css);
        let props: any = {};
        for (let item of items) {
            if (item && !ValueIdentity.has(item) && !(item in props) && item in globalStyle) {
                props[item] = item;
            }
            if (item && itemIndex != undefined) {
                item = `${item}_${itemIndex}`;
                if (item in globalStyle)
                    props[item] = item;
            }
        }
        return Object.keys(props)
    }
}