import {
  IDatabase,
  IDataBaseExtender,
  IId,
  Query
} from "./sql.wrapper.types";
import {
  Functions,
  StringBuilder
} from "./UsefullMethods";

export default class BulkSave<
  T,
  D extends string
> {
  quries: (Query & { parseble?: boolean })[];
  private dbContext: IDataBaseExtender<D>;
  private keys: string[];
  private tableName: D;
  constructor(
    dbContext: IDatabase<D>,
    keys: string[],
    tableName: D
  ) {
    this.dbContext = dbContext as any;
    this.keys = keys;
    this.tableName = tableName;
    this.quries = [];
  }

  insert(
    items: IId<D> | IId<D>[]
  ) {
    const itemArray = Array.isArray(items)
      ? items
      : [items];
    const table = this.dbContext.tables.find(
      x => x.tableName == this.tableName
    );
    itemArray.forEach(item => {
      const q = {
        sql: `INSERT INTO ${this.tableName} (`,
        args: [],
        parseble: true
      };
      const keys = Functions.getAvailableKeys(
        this.keys,
        item
      );
      keys.forEach((k, i) => {
        q.sql +=
          k + (i < keys.length - 1 ? "," : "");
      });
      q.sql += ") values(";
      keys.forEach((k, i) => {
        q.sql +=
          "?" + (i < keys.length - 1 ? "," : "");
      });
      q.sql += ")";

      keys.forEach((k: string, i) => {
        const column = table?.props.find(
          x =>
            x.columnName == k && x.encryptionKey
        );
        let v = (item as any)[k] ?? null;
        if (Functions.isDate(v))
          v = v.toISOString();
        else if (
          column &&
          column.columnType === "JSON" &&
          v
        )
          v = JSON.stringify(v);
        if (
          column &&
          column.columnType === "BLOB"
        )
          q.parseble = false;
        if (typeof v === "boolean")
          v = v === true ? 1 : 0;
        if (column)
          v = Functions.encrypt(
            v,
            column.encryptionKey
          );
        q.args.push(v);
      });

      this.quries.push(q);
    });
    return this;
  }

  update(
    items: IId<D> | IId<D>[]
  ) {
    const itemArray = Array.isArray(items)
      ? items
      : [items];
    const table = this.dbContext.tables.find(
      x => x.tableName == this.tableName
    );
    itemArray.forEach(item => {
      const q = {
        sql: `UPDATE ${this.tableName} SET `,
        args: [],
        parseble: true
      };
      const keys = Functions.getAvailableKeys(
        this.keys,
        item
      );
      keys.forEach((k, i) => {
        q.sql +=
          ` ${k}=? ` +
          (i < keys.length - 1 ? "," : "");
      });
      q.sql += " WHERE id=?";
      keys.forEach((k: string, i) => {
        const column = table?.props.find(
          x =>
            x.columnName == k && x.encryptionKey
        );
        let v = (item as any)[k] ?? null;
        if (Functions.isDate(v))
          v = v.toISOString();
        else if (
          column &&
          column.columnType === "JSON" &&
          v
        ) {
          v = JSON.stringify(v);
        }
        if (
          column &&
          column.columnType === "BLOB"
        )
          q.parseble = false;
        if (typeof v === "boolean")
          v = v === true ? 1 : 0;
        if (column)
          v = Functions.encrypt(
            v,
            column.encryptionKey
          );
        q.args.push(v);
      });
      q.args.push(item.id);
      this.quries.push(q);
    });
    return this;
  }

  delete(
    items: IId<D> | IId<D>[]
  ) {
    const itemArray = Array.isArray(items)
      ? items
      : [items];
    itemArray.forEach(item => {
      const q = {
        sql: `DELETE FROM ${this.tableName} WHERE id = ?`,
        args: [item.id],
        parseble: true
      };
      this.quries.push(q);
    });
    return this;
  }

  async execute() {
    if (this.quries.length > 0) {
      let qs = [
        ...this.quries.filter(x => !x.parseble)
      ];
      let sql = [];
      let c = "?";
      const tempQuestionMark = "#questionMark";
      for (let q of this.quries.filter(
        x => x.parseble
      )) {
        let s = new StringBuilder(q.sql);
        while (
          s.indexOf(c) !== -1 &&
          q.args.length > 0
        ) {
          let value = q.args.shift();
          if (
            Functions.isDefained(value) &&
            typeof value === "string"
          ) {
            if (value.indexOf(c) !== -1)
              value = value.replace(
                new RegExp("\\" + c, "gmi"),
                tempQuestionMark
              );
            value = `'${value}'`;
          }
          if (!Functions.isDefained(value))
            value = "NULL";
          s.replaceIndexOf(c, value.toString());
        }
        sql.push(s);
      }
      if (sql.length > 0)
        qs.push({
          sql: sql
            .join(";\n")
            .replace(
              new RegExp(tempQuestionMark, "gmi"),
              c
            ),
          args: []
        });
      await this.dbContext.executeRawSql(qs);
      const db = this.dbContext as IDataBaseExtender<D>;
      await db.triggerWatch([], "onBulkSave", undefined, this.tableName);
    }
  }
}
