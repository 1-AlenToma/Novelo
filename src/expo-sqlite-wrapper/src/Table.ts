import { IId, IQueryResultItem, ITableBuilder, NonFunctionPropertyNames, ObjectPropertyNamesNames } from "./sql.wrapper.types";
import TableBuilder from "./TableStructor";

export default abstract class Table<D extends string> extends IId<D> implements IQueryResultItem<any, D> {
    constructor(tableName: D, id?: number) {
        super(tableName, id);
    }

    saveChanges: () => Promise<IQueryResultItem<this, D>>;
    delete: () => Promise<void>;
    update: (...keys: NonFunctionPropertyNames<this>[]) => Promise<void>;
    load: (...props: ObjectPropertyNamesNames<this>[]) => Promise<void>;

    abstract config(): ITableBuilder<any, D>;

    TableBuilder<T extends object, D extends string>(tableName: D) {
        return TableBuilder<T, D>(tableName) as ITableBuilder<T, D>;
    }
}
