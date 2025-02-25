import { IChildLoader, IId, IQueryResultItem, IDataBaseExtender } from "../sql.wrapper.types";

const createQueryResultType = async function <T extends IId<D>, D extends string>(item: any, database: IDataBaseExtender<D>, children?: IChildLoader<D>[]): Promise<IQueryResultItem<T, D>> {
    var result = (item as any) as IQueryResultItem<T, D> & [key: string];
    result.saveChanges = async () => { return createQueryResultType<T, D>((await database.save<T>(result as any, false, undefined, true))[0], database) };
    result.update = async (...keys: any[]) => {
        if (!keys || keys.length <= 0)
            return;
        const kItem: any = { tableName: result.tableName, id: (result as any).id } as IId<any>;
        keys.forEach(k => {
            kItem[k] = result[k];
        });
        await database.save<T>(kItem as any, false, undefined, true);
        if (result.id == 0 || (result as any).id === undefined)
            result.id = kItem.id;
    }

    result.load = async (...props: any) => {
        try {
            let childrens: IChildLoader<D>[] = []
            for (let prop of props) {
                let table = database.tables.find(x => x.tableName == result.tableName);
                let child = table?.children.find(x => x.assignTo == prop);
                if (!child)
                    throw `loading ${prop as string} is not possible as it is not included in TableBuilder hasMany or has Parent`;
                childrens.push(child);
            }
            await createQueryResultType(result, database, childrens);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    result.delete = async () => await database.delete(result as any);
    if (children && children.length > 0) {
        for (var x of children) {
            if (x.childTableName.length > 0 && x.childProperty.length > 0 && x.parentProperty.length > 0 && x.parentTable.length > 0 && x.assignTo.length > 0) {
                if (item[x.parentProperty] === undefined) {
                    if (x.isArray)
                        item[x.assignTo] = [];
                    continue;
                }
                var filter = {} as any
                filter[x.childProperty] = item[x.parentProperty];
                var items = await database.where(x.childTableName as D, filter);
                if (x.isArray) {
                    var r = [];
                    for (var m of items)
                        r.push(await createQueryResultType(m, database))
                    item[x.assignTo] = r;
                }
                else {
                    if (items.length > 0) {
                        item[x.assignTo] = await createQueryResultType<T, D>(items[0], database);
                    }
                }
            }
        }
    }
    return result;
}

export default createQueryResultType;