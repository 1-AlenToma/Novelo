import 'react-native-get-random-values';
import Errors from "./Errors";
import { ColumnType, IDataBaseExtender, IId, ITableBuilder, Query } from '../sql.wrapper.types'
import crypto from 'crypto-js';
class Functions {

    reorderTables(jsonData: ITableBuilder<any, string>[]) {
        const tableMap = Object.fromEntries(jsonData.map(table => [table.tableName, table]));
        const dependencyGraph = Object.fromEntries(jsonData.map(table => [table.tableName, new Set()]))

        // Build dependency graph
        jsonData.forEach(table => {
            (table.constrains || []).forEach(constraint => {
                const parentTable = constraint.contraintTableName;
                dependencyGraph[table.tableName].add(parentTable);
            });
        });

        // Topological sorting using Kahn's Algorithm
        const sortedTables = [];
        const noDependencyTables = jsonData.filter(table => dependencyGraph[table.tableName].size === 0);

        while (noDependencyTables.length) {
            const table = noDependencyTables.shift();
            sortedTables.push(table);

            jsonData.forEach(otherTable => {
                if (dependencyGraph[otherTable.tableName].has(table.tableName)) {
                    dependencyGraph[otherTable.tableName].delete(table.tableName);
                    if (dependencyGraph[otherTable.tableName].size === 0) {
                        noDependencyTables.push(tableMap[otherTable.tableName]);
                    }
                }
            });
        }

        return sortedTables;
    }

    deleteWithContrains(tableName: string, db: IDataBaseExtender<string>, innerSelectSqlWhere: string, args: any[], sqls?: { constrain: any, sql: Query }[]) {
        sqls = sqls ?? [];

        let tableContrains = db.tables.find(x => x.constrains.find(c => c.contraintTableName == tableName && !sqls.find(e => e.constrain == c)));
        if (tableContrains) {
            let constrain = tableContrains.constrains.find(x => x.contraintTableName == tableName);
            sqls.push({ constrain: constrain, sql: { sql: `DELETE FROM ${tableContrains.tableName} where ${constrain.columnName as string} in (SELECT ${constrain.contraintColumnName} FROM ${constrain.contraintTableName} ${innerSelectSqlWhere})`, args } });
            this.deleteWithContrains(tableContrains.tableName, db, `WHERE ${constrain.columnName as string} in (SELECT ${constrain.contraintColumnName} FROM ${constrain.contraintTableName} ${innerSelectSqlWhere})`, args, sqls);
        }
        return sqls;
    }

    async executeContraineDelete(tableName: string, db: IDataBaseExtender<string>, innerSelectSqlWhere: string, args: any[]) {
        try {
            const sqls = this.deleteWithContrains(tableName, db, innerSelectSqlWhere, args);
            // db.info("removing contraines data for item in table ", tableName, "SQL", sqls.map(x => x.sql))
            for (let sql of sqls) {
                await db.execute(sql.sql.sql, sql.sql.args);
            }
        } catch (e) {
            db.error(e);
        }
    }

    dbType(columnType: ColumnType) {
        if (
            columnType == "Boolean" ||
            columnType == "Number"
        )
            return "INTEGER";
        if (columnType == "Decimal") return "REAL";
        if (columnType == "BLOB") return "BLOB";
        return "TEXT";
    };

    dbDefaultValue(columnType: ColumnType, value?: any) {
        if (value == undefined)
            return "";
        if (value === null)
            return ` DEFAULT NULL`;

        if (columnType == "JSON" && typeof value == "object")
            value = JSON.stringify(value);

        if (columnType == "String" || columnType == "JSON")
            return ` DEFAULT '${value}'`;

        return ` DEFAULT ${value}`;
    }


    encryptionsIdentifier = "#dbEncrypted&";
    buildJsonExpression(jsonExpression: any, database: IDataBaseExtender<string>, tableName: string, alias: string, isInit?: boolean) {
        const table = database.tables.find(x => x.tableName == tableName);
        if (!table)
            throw Errors.missingTableBuilder(tableName);
        let item = jsonExpression;
        if (!isInit) {
            item[alias] = {};
            item = item[alias];
        }
        table.props.forEach(x => {
            item[x.columnName] = isInit ? x.columnName : `${alias}.${x.columnName as string}`;
        });
        return jsonExpression;
    }

    aliasNameming(column: string, alias: string) {
        return `${column} as ${alias}`;
    }

    isPrimitive(v: any) {
        if (
            !this.isDefained(v) ||
            typeof v === 'string' ||
            typeof v === 'number' ||
            typeof v === 'function' ||
            Object.prototype.toString.call(v) === '[object Date]' ||
            typeof v === 'boolean' ||
            typeof v === 'bigint'
        )
            return true;
        return false;
    }

    isDefained(v: any) {
        return v !== null && v !== undefined;
    }

    isFunc(value: any) {
        if (value === null || value === undefined || value.toString === undefined)
            return false;
        if (typeof value === "function")
            return true;
        return value.toString().indexOf('function') !== -1;
    }

    isDate(v: any) {
        if (v === null || v === undefined)
            return false;
        if (Object.prototype.toString.call(v) === "[object Date]")
            return true;
        return false;
    }

    translateToSqliteValue(v: any) {
        if (v === null || v === undefined)
            return v;
        if (this.isDate(v))
            return (v as Date).toISOString();
        if (typeof v === "boolean")
            return v === true ? 1 : 0;
        return v;
    }

    translateAndEncrypt(v: any, database: IDataBaseExtender<string>, tableName: string, column?: string) {
        if (column && column.indexOf("."))
            column = this.last(column.split("."))
        const table = database.tables.find(x => x.tableName == tableName);
        const encryptValue = typeof v === "string" && column && table && table.props.find(f => f.columnName === column && f.encryptionKey) != undefined;
        v = this.translateToSqliteValue(v);
        if (encryptValue) {
            v = this.encrypt(v, table.props.find(x => x.columnName === column)?.encryptionKey ?? "");
        }

        return v;
    }

    encrypt(str: string, key: string) {
        if (!str || str == "" || str.startsWith(this.encryptionsIdentifier))
            return str; // already Encrypted
        const hash = crypto.SHA256(key);
        return this.encryptionsIdentifier + crypto.AES.encrypt(str, hash, { mode: crypto.mode.ECB }).toString();
    }


    decrypt(str: string, key: string) {
        if (!str || str == "" || !str.startsWith(this.encryptionsIdentifier))
            return str;
        const hash = crypto.SHA256(key);
        str = str.substring(this.encryptionsIdentifier.length)
        const bytes = crypto.AES.decrypt(str, hash, { mode: crypto.mode.ECB });
        const originalText = bytes.toString(crypto.enc.Utf8);
        return originalText;
    }

    oEncypt(item: any, tableBuilder?: ITableBuilder<any, string>) {
        if (!tableBuilder)
            return item;
        tableBuilder.props.filter(x => x.encryptionKey).forEach(x => {
            const v = item[x.columnName];
            if (v && x.encryptionKey)
                item[x.columnName] = this.encrypt(v, x.encryptionKey);
        });
        return item;
    }

    oDecrypt(item: any, tableBuilder?: ITableBuilder<any, any>) {
        if (!tableBuilder)
            return item;
        tableBuilder.props.filter(x => x.encryptionKey).forEach(x => {
            const v = item[x.columnName];
            if (v && x.encryptionKey)
                item[x.columnName] = this.decrypt(v, x.encryptionKey);
        });

        return item;
    }

    validateTableName<T extends IId<D>, D extends string>(item: T, tableName?: D) {
        if (!(item as any).tableName || (item as any).tableName.length <= 2)
            if (!tableName)
                throw "TableName cannot be null, This item could not be saved"
            else (item as any).tableName = tableName;

        return (item as any) as IId<D>;
    }


    translateSimpleSql(database: IDataBaseExtender<string>, tableName: string, query?: any) {
        var q = `SELECT * FROM ${tableName} ${query ? 'WHERE ' : ''}`;
        var values = [] as any[];
        if (query && Object.keys(query).length > 0) {
            const table = database.tables.find(x => x.tableName == tableName);
            const keys = Object.keys(query);
            keys.forEach((x, i) => {
                var start = x.startsWith('$') ? x.substring(0, x.indexOf('-')).replace('-', '') : undefined;
                const columnName = start ? x.replace("$in-", "").trim() : x.trim();
                const column = table ? table.props.find(f => f.columnName === columnName) : undefined;
                if (!start) {
                    q += x + '=? ' + (i < keys.length - 1 ? 'AND ' : '');
                    let v = query[x];
                    if (column)
                        v = this.translateAndEncrypt(v, database, tableName, columnName);
                    values.push(v);
                } else {
                    if (start == '$in') {
                        let v = query[x] as [];
                        q += x.replace("$in-", "") + ' IN (';
                        v.forEach((item: any, index) => {
                            q += '?' + (index < v.length - 1 ? ', ' : '');
                            if (column)
                                item = this.translateAndEncrypt(item, database, tableName, columnName);
                            values.push(item);
                        });
                    }
                    q += ') ' + (i < keys.length - 1 ? 'AND ' : '');
                }
            });
        }

        return { sql: q, args: values };
    }

    getAvailableKeys(dbKeys: string[], item: any) {
        return dbKeys.filter(x => Object.keys(item).includes(x));
    }

    createSqlInstaceOfType(prototype: any, item?: any) {
        if (!prototype)
            return item;
        const x = Object.create(prototype);
        if (item)
            for (const key in item)
                x[key] = item[key]
        return x;
    }

    counterSplit<T>(titems: T[], counter: number): T[][] {
        var items = [] as T[][];
        titems.forEach((x, index) => {
            if (items.length <= 0 || index % counter === 0) {
                items.push([]);
            }
            var current = this.last<T[]>(items) ?? [];
            current.push(x);
        })

        return items;
    }

    findAt<T>(titems: Array<T> | undefined, index: number): T | undefined {
        if (!titems)
            return undefined;
        if (index < 0 || index >= titems.length)
            return undefined;

        return (this as any)[index];
    }

    last<T>(titems: Array<T> | undefined): T | undefined {
        return titems && titems.length > 0 ? titems[titems.length - 1] : undefined;
    }

    toType<T>(titems: Array<T> | undefined): Array<T> | T[] {
        return titems ?? [];
    }

    single<T>(titems: Array<T> | undefined): T | undefined {
        return titems && titems.length > 0 ? titems[0] : undefined;
    }

    toArray<T>(item: any) {
        const items = Array.isArray(item) ? item : [item];
        return items as T[];
    }
}

const functions = new Functions();
export default functions;