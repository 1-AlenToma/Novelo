import {
  useRef,
  useState,
  useEffect
} from "react";
import { newId } from "../Methods";

const keys = (item: any) => {
  let prototype = Object.getPrototypeOf(item);
  let ks = [
    ...Object.keys(item),
    ...(prototype
      ? Object.getOwnPropertyNames(prototype)
      : [])
  ];
  let obp = Object.getOwnPropertyNames(
    Object.prototype
  );

  let cbp = Object.getOwnPropertyNames(
    Create.prototype
  );
  return ks.filter(
    x => !obp.includes(x) && !cbp.includes(x)
  );
};

const valid = (item: any) => {
  if (!item || item === null) return false;
  if (item instanceof Set) return false;
  if (item instanceof Map) return false;
  if (typeof item === "function") return false;
  if (typeof item === "string") return false;
  return typeof item === "object";
};

type NestedKeyOf<
  T extends object,
  D extends any[] = [0, 0, 0, 0, 0]
> = D extends [any, ...infer DD]
  ? {
      [K in keyof T &
        (string | number)]: T[K] extends object
        ? `${K}` | `${K}.${NestedKeyOf<T[K], DD>}`
        : `${K}`;
    }[keyof T & (string | number)]
  : never;

abstract class ICreate {
  abstract ___events: any;
}
class Create<T extends object> extends ICreate {
  ___onChange(key: string) {
    try {
      let global =
        key
          .split(".")
          .reverse()
          .filter((x, i) => i > 0)
          .join(".")

      for (let item in this.___events) {
        if (
          this.___events[item].keys.length == 0 ||
          this.___events[item].keys.includes(
            key
          ) ||
          this.___events[item].keys.includes(
            global
          )
        ) {
          this.___events[item].fn();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  hook(...keys: NestedKeyOf<T>) {
    let id = useRef(newId()).current;
    let [update, setUpdate] = useState();
    this.___events[id] = {
      fn: () => setUpdate(newId()),
      keys: keys
    };

    useEffect(() => {
      return () => delete this.___events[id];
    }, []);
  }

  subscribe(
    fn: Funtion,
    ...keys: NestedKeyOf<T>
  ) {
    let id = useRef(newId()).current;
    this.___events[id] = {
      fn: () => fn(this),
      keys: keys
    };

    useEffect(() => {
      return () => delete this.___events[id];
    }, []);
  }

  constructor(
    item: any,
    parent: any,
    parentItem: any,
    ...ignoreKeys: string[]
  ) {
    super();
    if (!parentItem) parentItem = this;
    Object.defineProperty(this, "___events", {
      value: {}
    });
    let parentKeys = (key: string) => {
      if (parent && parent.length > 0)
        return `${parent}.${key}`;
      return key;
    };

    const parse = (
      value: any,
      parentKey: string
    ) => {
      try {
        if (
          !ignoreKeys.includes(parentKey) &&
          valid(value) &&
          !Array.isArray(value)
        ) {
          return new Create(
            value,
            parentKey,
            parentItem,
            ...ignoreKeys
          );
        } else if (
          !ignoreKeys.includes(parentKey) &&
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
                ...ignoreKeys
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
            parentItem.___onChange(parentKey);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}

const UseState = function <T extends object>(
  item: T,
  ...ignoreKeys: NestedKeyOf<T>[]
) {
  let refItem = useRef();
  if (refItem.current === undefined)
    refItem.current = new Create(
      item,
      ...ignoreKeys
    ) as any as T;
  refItem.current.hook();
  return refItem.current;
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
    ...ignoreKeys
  ) as any as T;
};

export { UseState, GlobalState };
