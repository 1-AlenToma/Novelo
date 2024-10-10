import useUpdate from "./UseUpdate";

export default (
  tbName: string,
  validator: (item: any) => boolean,
  currentItem: () => any,
  ...keys: string[]
) => {
  const updater = useUpdate();
  let currentValues = useRef({}).current;
  const on = useRef();
  let setValues = (item: any) => {
    if (!item) return;
    for (let k of keys) {
      if (k == "*") return;
      currentValues[k] = item[k];
    }
    if (on.current) on.current();
  };

  let hasChange = (item: any) => {
    if (validator(item)) {
      for (let k of keys) {
        if (k == "*") return true;
        let a = currentValues[k];
        let b = item[k];
        if (a !== b) {
          return true;
        }
      }
    }
  };

  useEffect(() => {
    setValues(currentItem());
    var watcher = context.db().watch<any>(tbName);
    watcher.onSave = async (items, operation) => {
      for (let item of items) {
        if (hasChange(item)) {
          setValues(item);
          updater();
        }
      }
    };
    return () => watcher.removeWatch();
  }, []);

  return (fn: any) => (on.current = fn);
};
