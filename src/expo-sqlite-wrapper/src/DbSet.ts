import { IDatabase, IDbSet, IId } from "./sql.wrapper.types";

export class DbSet<T extends IId<D>, D extends string> implements IDbSet<T, D> {
    private tableName: D;
    private db: IDatabase<D>;
    constructor(tableName: D, db: IDatabase<D>) {
        this.tableName = tableName;
        this.db = db;
    }

    async save(...items: T[]) {
        await this.db.save(items);
    }

    async delete(...items: T[]) {
        await this.db.delete(items);
    }

    async byId(id: number) {
        return await this.query.where.column(x => x.id).equalTo(id).firstOrDefault();
    }

    async getAll() {
        return await this.query.toList();
    }

    async bulkSave() {
        return await this.db.bulkSave<T>(this.tableName);
    }

    watch() {
        return this.db.watch<T>(this.tableName);
    }

    useQuery(query: any, updateIf?: (items: T[], operation: string) => boolean) {
        return this.db.useQuery<T>(this.tableName, query, undefined, updateIf);
    }

    get query() {
        return this.db.querySelector<T>(this.tableName);
    }
}