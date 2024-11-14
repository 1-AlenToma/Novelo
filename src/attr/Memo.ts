import {
  DataCache,
  MemorizeOptions
} from "../Types";
import { sleep, days_between } from "../Methods";
import Storage from "./Storage";

const getKey = (
  option: MemorizeOptions,
  propertyName: string,
  target: any,
  ...args: any[]
) => {
  if (option.argsOverride)
    args = option.argsOverride(...args);
  let key = JSON.stringify(args);
  if(!option.argsOverride)
    key+= propertyName;
  key =
    "memoizing." +
    key
      .replace(
        /(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\%|\’|\+|\?|\!)/gim,
        ""
      )
      .toLowerCase();
  if (option.keyModifier !== undefined)
    key += option.keyModifier(target, key);
  return key.toLowerCase() + ".json";
};

const callingFun = new Map<string, boolean>();

export default function Memorize(
  option: MemorizeOptions
) {
  if (!option.storage)
    option.storage = new Storage();
  if (!option.storage) {
    console.error("storage cannnot be null");
    throw "storage cannnot be null";
  }

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const currentFn = descriptor.value as (
      ...args: any[]
    ) => Promise<any>;
    descriptor.value = async function (
      ...args: any[]
    ) {
      const key = getKey(
        option,
        propertyKey,
        this,
        args
      );
      while (callingFun.has(key)) await sleep(100);
      let data = null as DataCache | null;
      callingFun.set(key, true);
      try {
        if (option.storage) {
          if (
            (await option.storage.has(key)) &&
            !option.isDebug
          ) {
            data = await option.storage.get(key);
          }

          if (data && typeof data.date === "string")
            data.date = new Date(data.date);

          if (!data || days_between(data.date) >= option.daysToSave || (option.updateIfTrue && option.updateIfTrue(data.data))) {
            try {
              let data2 = await currentFn.bind(this)(...args);
              if (!option.isDebug) {
                if (data2) {
                  if (!option.validator || option.validator(data2)) {
                    await option.storage.set(key,
                      {
                        date: new Date(),
                        data: data2
                      }
                    );
                    return data2;
                  } else {
                    if (data) {
                      data.date = new Date();
                      await option.storage.set(key,data); // extend the date
                    }
                    return data?.data ?? data2;
                  }
                }
              } else
                data = {
                  data: data2,
                  date: new Date()
                };
            } catch (e) {
              console.error("MemoizingError", e);
            }
          }
        }
        return data?.data;
      } catch (e) {
        console.error("MemoizingError", e);
      } finally {
        callingFun.delete(key);
      }
    };
  } as any
}
