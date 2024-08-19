import { useRef, useState, useEffect } from "react";
import { newId } from "../Methods";
import { useTimer } from "../hooks";

const globalKey = "allKeys";

const toObject = (...keys: string[]) => {
    if (keys.length == 0) return { AllKeys: true };

    return keys.reduce((c, v) => {
        c[v] = true;
        return c;
    }, {});
};

const keys = (item: any) => {
    let prototype = Object.getPrototypeOf(item);
    let ks = [
        ...Object.keys(item),
        ...(prototype ? Object.getOwnPropertyNames(prototype) : [])
    ];
    let obp = Object.getOwnPropertyNames(Object.prototype);

    let cbp = Object.getOwnPropertyNames(Create.prototype);
    return ks.filter(x => !obp.includes(x) && !cbp.includes(x));
};
const speed = 10;
const getValueByPath = (value: any, path: string) => {
    let current = value;
    for (let item of path.split(".")) {
        current = current[item];
    }

    return current;
};

const valid = (item: any, validArray?: boolean) => {
    if (!item || item === null) return false;
    if (item instanceof Set) return false;
    if (item instanceof Map) return false;
    if (typeof item === "function") return false;
    if (typeof item === "string") return false;
    if (validArray && Array.isArray(item) && item.length > 0)
        return valid(item[0]);
    return typeof item === "object";
};

type NestedKeyOf<
    T extends object,
    D extends any[] = [0, 0, 0, 0, 0]
> = D extends [any, ...infer DD]
    ? {
          [K in keyof T & (string | number)]: T[K] extends object
              ? `${K}` | `${K}.${NestedKeyOf<T[K], DD>}`
              : `${K}`;
      }[keyof T & (string | number)]
    : never;

type EventItem = {
    keys: any;
    fn?: Function;
    fs?: Function;
    item?: any;
};

class EventTrigger {
    ___events: any = {};
    ___timer: any = undefined;
    ___waitingEvents: any = {};
    ___addedPaths: string[] = [];
    speed: number = speed;

    add(id: string, item: EventItem) {
        this.___events[id] = item;
    }

    remove(id: string) {
        delete this.___events[id];
    }

    async ___onChange(key: string, parentItem: any) {
        try {
            clearTimeout(this.___timer);
            let global = key
                .split(".")
                .reverse()
                .filter((x, i) => i > 0)
                .join(".");

            for (let item in this.___events) {
                if (
                    this.___events[item].keys.AllKeys ||
                    this.___events[item].keys[key] ||
                    this.___events[item].keys[global]
                ) {
                    let k = this.___events[item].keys.AllKeys
                        ? "AllKeys"
                        : this.___events[item].keys[key]
                        ? key
                        : "AllKeys";
                    if (!this.___events[item].fs) {
                        if (!this.___waitingEvents[item]) {
                            this.___waitingEvents[item] = {
                                event: this.___events[item],
                                items: new Map()
                            };
                        }
                        this.___waitingEvents[item].items.set(key, {
                            key: key,
                            item: parentItem
                        });
                    } else this.___events[item].fs();
                }
            }

            this.___timer = setTimeout(() => {
                let items = { ...this.___waitingEvents };
                this.___waitingEvents = {};
                for (let item in items) {
                    items[item].event.fn(items[item].items);
                }
            }, speed);
        } catch (e) {
            console.error(e);
        }
    }
}

abstract class ICreate {
    abstract ___events: EventTrigger;
}
class Create<T extends object> extends ICreate {
    ___events: EventTrigger = new EventTrigger();

    hook(...keys: NestedKeyOf<T>[]) {
        let id = useRef(newId()).current;
        let ks = useRef();
        if (!ks.current) ks.current = toObject(...keys);
        let [update, setUpdate] = useState();
        this.___events.add(id, {
            fn: items => {
                
                if (!update) {
                    setUpdate(
                        Object.keys(ks.current).reduce((c, v) => {
                            c[v] = items.get(v)?.item;
                            return c;
                        }, {})
                    );
                } else {
                    let a = { ...update };
                    let refresh = false;
                    //console.log(items, update)
                    for (let item of [...items.values()]) {
                        if (a[item.key] !== item.item) {
                            refresh = true;
                            a[item.key] = item.item;
                        }
                    }
                    /* console.warn(
            [
              { ks: ks.current, a, update }
            ].niceJson()
          );*/
                    if (refresh) setUpdate(a);
                }
                //setUpdate(newId());
            },
            keys: ks.current
        });

        useEffect(() => {
            return () => this.___events.remove(id);
        }, []);
    }

    subscribe(fn: Function, ...keys: NestedKeyOf<T>[]) {
        let id = useRef(newId()).current;
        let ks = useRef();
        if (!ks.current) ks.current = toObject(...keys);
        this.___events.add(id, {
            fs: () => fn(this),
            keys: ks.current
        });

        useEffect(() => {
            return () => this.___events.remove(id);
        }, []);
    }

    addStaticPath(path: string) {
        if (this.___events.___addedPaths.includes(path)) return;
        this.___events.___addedPaths.push(path);
        let item = this;
        let key = path.split(".").reverse()[0];
        for (let p of path.split(".")) {
            if (typeof item[p] == "object") {
                item = item[p];
            } else break;
        }
        let v = item[key];
        Object.defineProperty(item, key, {
            enumerable: true,
            configurable: true,
            get: () => v,
            set: (value: any) => {
                if (value !== v) {
                    v = value;
                    this.___events.___onChange(path, v);
                }
            }
        });
    }

    constructor(item: any, parent: any, parentItem: any, ignoreKeys: any) {
        super();
        if (!parentItem) {
            parentItem = this;
        } else delete this.___events;
        let parentKeys = (key: string) => {
            if (parent && parent.length > 0) return `${parent}.${key}`;
            return key;
        };

        const parse = (value: any, parentKey: string) => {
            try {
                if (
                    !ignoreKeys[parentKey] &&
                    valid(value) &&
                    !Array.isArray(value)
                ) {
                    return new Create(value, parentKey, parentItem, ignoreKeys);
                } else if (
                    !ignoreKeys[parentKey] &&
                    value &&
                    Array.isArray(value) &&
                    value.length > 0
                ) {
                    return value.map(x => {
                        if (valid(x)) {
                            return new Create(
                                x,
                                parentKey,
                                parentItem,
                                ignoreKeys
                            );
                        } else return x;
                    });
                }
            } catch (e) {
                console.error(e);
            }
            return value;
        };
        try {
            for (let k of keys(item)) {
                let parentKey = parentKeys(k);
                item[k] = parse(item[k], parentKey);
                Object.defineProperty(this, k, {
                    enumerable: true,
                    configurable: true,
                    get: () => item[k],
                    set: (value: any) => {
                        item[k] = parse(value, parentKey);
                        parentItem.___events.___onChange(parentKey, item[k]);
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
}

const UseState = function <T>(item: T, ...ignoreKeys: NestedKeyOf<T>[]) {
    let refItem = useRef<any>();
    if (!valid(item, true)) return useState<any>(item);
    else if (refItem.current === undefined) {
        refItem.current = new Create(
            item,
            undefined,
            undefined,
            toObject(...ignoreKeys)
        );
    }
    refItem.current.hook();
    return refItem.current as any as T;
};

const GlobalState = function <T extends object>(
    item: T,
    ...ignoreKeys: NestedKeyOf<T>[]
) {
    let tm = item;
    return new Create(
        tm,
        undefined,
        undefined,
        toObject(...ignoreKeys)
    ) as any as T;
};

export { UseState, GlobalState };
