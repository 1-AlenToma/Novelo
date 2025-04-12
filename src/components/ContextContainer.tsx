import * as React from "react";

export const ContextContainer = ({ children, keys, contexts }: { children: any, keys: string, contexts?: any[] }) => {
    contexts = contexts ?? [context];

    function containsKey(obj, path) {
        const keys = path.split(".");
        let current = obj;

        for (const key of keys) {
            if (typeof current !== 'object' || current === null || !(key in current)) {
                return false;
            }
            current = current[key];
        }
        return true;
    }
    let items = keys.split(" ").filter(x => x.has()).reduce((arr, x) => {
        const cn = contexts.find(c => containsKey(c, x));
        if (cn) {
            if (arr.has(cn))
                arr.get(cn)?.push(x);
            else arr.set(cn, [x]);
        }
        return arr;

    }, new Map<any, string[]>);

    items.forEach((value, item) => item.hook(...value));

    return children;
}