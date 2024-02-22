import { useRef, useState } from "react";
import { newId } from "../Methods";
class StateManager<T> {
  constructor(
    item: T,
    ...ignoreKeys: (keyof T)[]
  ) {
    const [d, setD] = useState(item);
    let keys = Object.keys(d);
    for (let key of keys) {
      Object.defineProperty(this, key, {
        enumerable: true,
        get: function () {
          return d[key];
        },
        set: function (x: any) {
          d[key] = x;
          if (
            ignoreKeys &&
            ignoreKeys.find(x => x == key)
          )
            return;
          setD({ ...d });
          //change();
        }
      });
    }
  }
}

export default <T>(
  item: T,
  ...ignoreKeys: (keyof T)[]
) => new StateManager<T>(item, ...ignoreKeys);
