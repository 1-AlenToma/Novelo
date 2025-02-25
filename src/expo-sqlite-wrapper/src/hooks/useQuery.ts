import {
  IDatabase,
  IId,
  IQueryResultItem,
  Query
} from "../sql.wrapper.types";
import { IReturnMethods } from "../QuerySelector";
import {
  createQueryResultType,
  Functions
} from "../UsefullMethods";
import {
  useState,
  useEffect,
  useRef
} from "react";

const UseQuery = <
  T extends IId<D>,
  D extends string
>(
  query:
    | Query
    | IReturnMethods<T, D>
    | (() => Promise<T[]>),
  dbContext: IDatabase<D>,
  tableName: D,
  onItemChange?: (items: T[]) => T[],
  updateIf?: (
    items: T[],
    operation: string
  ) => boolean
) => {
  const [_, setUpdater] = useState<
    undefined | number
  >();
  const [isLoading, setIsLoading] =
    useState(true);
  const dataRef = useRef<
    IQueryResultItem<T, D>[]
  >([]);
  const refTimer = useRef<any>();
  const refWatcher = useRef(
    dbContext.watch<T>(tableName)
  );
  const refMounted = useRef(false);

  const refreshData = async () => {
    if (!refMounted.current) return;
    clearTimeout(refTimer.current);
    refTimer.current = setTimeout(async () => {
      try {
        if (!refMounted.current) return;
        setIsLoading(true);
        const sQuery = query as Query;
        const iQuery = query as IReturnMethods<T, D>;
        const fn = query as () => Promise<T[]>;
        if (iQuery.toList !== undefined) {
          dataRef.current = await iQuery.toList();
        } else if (!Functions.isFunc(query)) {
          const r = [] as IQueryResultItem<
            T,
            D
          >[];
          for (const x of await dbContext.find(
            sQuery.sql,
            sQuery.args,
            tableName
          )) {
            r.push(
              await createQueryResultType<T, D>(x, dbContext as any)
            );
          }
          dataRef.current = r;
        } else {
          const r = [] as IQueryResultItem<
            T,
            D
          >[];
          for (const x of await fn()) {
            r.push(
              await createQueryResultType<T, D>(x, dbContext as any)
            );
          }
          dataRef.current = r;
        }
        update();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  const update = () => {
    if (!refMounted.current) return;
    setUpdater(
      x => ((x ?? 0) > 100 ? 0 : x ?? 0) + 1
    );
  };

  const onSave = async (
    items: T[],
    operation: string
  ) => {
    try {
      if (!refMounted.current) return;
      if (updateIf && !updateIf([...items], operation))
        return;
      if (onItemChange == undefined)
        await refreshData();
      else {
        setIsLoading(true);
        items = [
          ...items,
          ...dataRef.current.filter(
            x => !items.find(a => a.id == x.id)
          )
        ];
        const itemsAdded = onItemChange(items);
        const r = [] as IQueryResultItem<T, D>[];
        for (const x of itemsAdded) {
          r.push(
            await createQueryResultType(
              x,
              dbContext as any
            )
          );
        }
        dataRef.current = r;
        update();
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const onDelete = async (items: T[]) => {
    try {
      if (!refMounted.current) return;
      let updateList = false;
      const r = [...dataRef.current];
      items.forEach(a => {
        if (r.find(x => a.id == x.id)) {
          r.splice(
            r.findIndex(x => a.id == x.id),
            1
          );
          updateList = true;
        }
      });

      if (updateList) {
        dataRef.current = r;
        update();
      } else if (items.length <= 0)
        await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const onBulkSave = async () => {
    if (!refMounted.current) return;
    await refreshData();
  };

  refWatcher.current.identifier = "Hook";
  refWatcher.current.onSave = async (
    items,
    operation
  ) => await onSave(items, operation);
  refWatcher.current.onBulkSave = async () =>
    await onBulkSave();
  refWatcher.current.onDelete = async items =>
    await onDelete(items);

  useEffect(() => {
    refMounted.current = true;
    refreshData();
    return () => {
      clearTimeout(refTimer.current);
      refWatcher.current.removeWatch();
      refMounted.current = false;
    };
  }, []);

  return [
    dataRef.current,
    isLoading,
    refreshData,
    dbContext
  ] as const;
};

export default UseQuery;
