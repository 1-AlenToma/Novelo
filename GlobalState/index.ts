import {
  useRef,
  useState,
  useEffect
} from "react";
import { newId } from "../Methods";
import { useTimer } from "../hooks";

const toObject = (...keys: string[]) => {
  if (keys.length == 0) return { all: true };

  return keys.reduce((c, v) => {
    c[v] = true;
    return c;
  }, {});
};

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
const speed = 10;
const getValueByPath = (
  value: any,
  path: string
) => {
  let current = value;
  for (let item of path.split(".")) {
    current = current[item];
  }
  if (current == undefined || current == null)
    current = {};
  else if (
    typeof current !== "object" ||
    Array.isArray(current)
  ) {
    current = { item: current };
  }
  return current;
};

const valid = (
  item: any,
  validArray?: boolean
) => {
  if (!item || item === null) return false;
  if (item instanceof Set) return false;
  if (item instanceof Map) return false;
  if (typeof item === "function") return false;
  if (typeof item === "string") return false;
  if (
    validArray &&
    Array.isArray(item) &&
    item.length > 0
  )
    return valid(item[0]);
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
  ___events: any = {};
  ___onChange(key: string) {
    try {
      let global = key
        .split(".")
        .reverse()
        .filter((x, i) => i > 0)
        .join(".");

      for (let item in this.___events) {
        if (
          this.___events[item].keys.all ||
          this.___events[item].keys[key] ||
          this.___events[item].keys[global]
        ) {
          this.___events[item].fn();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  hook(...keys: NestedKeyOf<T>[]) {
    let id = useRef(newId()).current;
    let [update, setUpdate] = useState();
    const timer = useTimer(speed);
    this.___events[id] = {
      fn: async () =>
        timer(() => setUpdate(newId())),
      keys: toObject(...keys)
    };

    useEffect(() => {
      return () => delete this.___events[id];
    }, []);
  }

  subscribe(
    fn: Function,
    ...keys: NestedKeyOf<T>[]
  ) {
    let id = useRef(newId()).current;
    const timer = useTimer(speed);
    this.___events[id] = {
      fn: () => timer(() => fn(this)),
      keys: toObject(...keys)
    };

    useEffect(() => {
      return () => delete this.___events[id];
    }, []);
  }

  constructor(
    item: any,
    parent: any,
    parentItem: any,
    ignoreKeys: any
  ) {
    super();
    if (!parentItem) {
      parentItem = this;
    }else delete this.___events;
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
          !ignoreKeys[parentKey] &&
          valid(value) &&
          !Array.isArray(value)
        ) {
          return new Create(
            value,
            parentKey,
            parentItem,
            ignoreKeys
          );
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
            parentItem.___onChange(parentKey);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}

const UseState = function <T>(
  item: T,
  ...ignoreKeys: NestedKeyOf<T>[]
) {
  let refItem = useRef<any>();
  if (!valid(item, true))
    return useState<any>(item);
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
