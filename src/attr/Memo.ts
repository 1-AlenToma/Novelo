import { DataCache, MemorizeOptions } from "../Types";
import { days_between } from "../Methods";
import Storage from "./Storage";

const inFlightRequests = new Map<string, Promise<any>>();

const getKey = (
  option: MemorizeOptions,
  propertyName: string,
  target: any,
  ...args: any[]
): string => {
  const effectiveArgs = option.argsOverride ? option.argsOverride(args) : args;
  let key = JSON.stringify(effectiveArgs) ?? "";

  if (!option.argsOverride) {
    key += propertyName;
  }

  if (option.keyModifier !== undefined) {
    key += option.keyModifier(target, key);
  }

  key =
    "memoizing." +
    key
      .replace(/(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\%|\’|\+|\?|\!)/gim, "")
      .toLowerCase();

  return key.toLowerCase() + ".json";
};

export default function Memo(option: MemorizeOptions) {
  if (!option.storage) {
    option.storage = new Storage();
  }
  if (!option.storage) {
    throw new Error("storage cannot be null");
  }

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const currentFn = descriptor.value as (...args: any[]) => Promise<any>;

    descriptor.value = async function (...args: any[]) {
      const renewMemo = args.some((x) => x === "RenewMemo");
      const cleanArgs = args.filter((x) => x !== "RenewMemo");

      const folder = option.folder ? option.folder(this) : undefined;
      let key = getKey(option, propertyKey, this, ...cleanArgs);

      if (folder && folder.has()) {
        key = folder.path(key);
      }

      // Coalesce concurrent requests instead of polling with while/sleep
      const existingRequest = inFlightRequests.get(key);
      if (existingRequest) {
        return existingRequest;
      }

      const requestPromise = (async () => {
        let data: DataCache | null = null;
        const isDebug =
          typeof option.isDebug === "function"
            ? option.isDebug()
            : Boolean(option.isDebug);

        try {
          if (option.storage) {
            if (!isDebug && (await option.storage.has(key))) {
              data = await option.storage.get(key);
            }

            if (data && typeof data.date === "string") {
              data.date = new Date(data.date);
            }

            const daysToSave =
              typeof option.daysToSave === "function"
                ? option.daysToSave()
                : option.daysToSave;

            const shouldFetch =
              !data ||
              renewMemo || (daysToSave !== undefined && days_between(data.date) >= daysToSave) || 
              (option.updateIfTrue && option.updateIfTrue(data.data));

            if (shouldFetch) {
              try {
                const freshData = await currentFn.apply(this, cleanArgs);

                if (isDebug) {
                  return freshData;
                }

                if (freshData !== undefined && freshData !== null) {
                  if (!option.validator || option.validator(freshData)) {
                    await option.storage.set(key, {
                      date: new Date(),
                      data: freshData,
                    });
                    return freshData;
                  } else {
                    if (data) {
                      data.date = new Date();
                      await option.storage.set(key, data);
                    }
                    return data?.data ?? freshData;
                  }
                }
              } catch (e) {
                console.error("MemoizingError", e, propertyKey);
              }
            }
          }

          return data?.data;
        } catch (e) {
          console.error("MemoizingError", e, propertyKey);
          return data?.data;
        }
      })();

      inFlightRequests.set(key, requestPromise);

      try {
        return await requestPromise;
      } finally {
        inFlightRequests.delete(key);
      }
    };

    return descriptor;
  };
}
