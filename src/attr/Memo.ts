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
    args = option.argsOverride(args); 
  let key = JSON.stringify(args);
  if (!option.argsOverride)
    key += propertyName;

  if (option.keyModifier !== undefined)
    key += option.keyModifier(target, key);
  key = "memoizing." + key.replace(/(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\%|\’|\+|\?|\!)/gim, "").toLowerCase();
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
    descriptor.value = async function (...args: any[]) {
      let RenewMemo = args.some(x => x == "RenewMemo");
      args = args.filter(x => x != "RenewMemo" && x !== undefined && x !== null);
      const folder = option.folder ? option.folder(this) : undefined;
      let key = getKey(
        option,
        propertyKey,
        this,
        ...args
      );

      if (folder && folder.has())
        key = folder.path(key);
      while (callingFun.has(key)) await sleep(100);
      let data = null as DataCache | null;
      callingFun.set(key, true);
      try {
        if (option.storage) {
          if ((await option.storage.has(key)) && !option.isDebug) {
            data = await option.storage.get(key);
          }

          if (data && typeof data.date === "string")
            data.date = new Date(data.date);
          const dayesToSave = typeof option.daysToSave == "function" ? option.daysToSave() : option.daysToSave;

          if (!data || RenewMemo || (dayesToSave != undefined && days_between(data.date) >= dayesToSave) || (option.updateIfTrue && option.updateIfTrue(data.data))) {
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
                      await option.storage.set(key, data); // extend the date
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
              console.error("MemoizingError", e, propertyKey, descriptor);
            }
          }
        }
        return data?.data;
      } catch (e) {
        console.error("MemoizingError", e, propertyKey, descriptor);
      } finally {
        callingFun.delete(key);
      }
    };
  } as any
}
