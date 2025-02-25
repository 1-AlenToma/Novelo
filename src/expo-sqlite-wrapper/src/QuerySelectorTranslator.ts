
import { Counter, StringBuilder, Functions, QValue } from './UsefullMethods';
import { Param } from "./QuerySelectorProps";
import { IWhereProp, IQuerySelectorProps } from "./sql.wrapper.types";

export default class QuerySelectorTranslator {
    selector: IQuerySelectorProps<string>;
    querySelectorSql: StringBuilder;
    constructor(selector: IQuerySelectorProps<string>) {
        this.selector = selector;
        this.querySelectorSql = new StringBuilder();
    }

    private translateDeleteColumn() {
        let sql = new StringBuilder();
        return sql.append("DELETE FROM", this.selector.tableName);
    }

    private translateColumns(args: any[]) {
        let sql = new StringBuilder();
        if (!this.selector.queryColumnSelector)
            return sql.append("SELECT * FROM", this.selector.tableName, this.selector.joins.length > 0 ? "as a" : "")
        const counter = new Counter(this.selector.queryColumnSelector._columns as QValue[]);
        let addedColumns = false;


        while (counter.hasNext) {
            const value = counter.next;
            switch (value.args) {
                case Param.Count:
                    sql.append(`count(${value.getColumn(this.selector.jsonExpression)})`, "as", value.alias, ",");
                    break;
                case Param.Min:
                    sql.append(`min(${value.getColumn(this.selector.jsonExpression)})`, "as", value.alias, ",");
                    break;
                case Param.Max:
                    sql.append(`max(${value.getColumn(this.selector.jsonExpression)})`, "as", value.alias, ",");
                    break;
                case Param.Sum:
                    sql.append(`sum(${value.getColumn(this.selector.jsonExpression)})`, "as", value.alias, ",");
                    break;
                case Param.Avg:
                    sql.append(`avg(${value.getColumn(this.selector.jsonExpression)})`, "as", value.alias, ",");
                    break;
                case Param.Total:
                    sql.append(`total(${value.getColumn(this.selector.jsonExpression)})`, "as", value.alias, ",");
                    break;
                case Param.GroupConcat:
                    sql.append(`group_concat(${value.getColumn(this.selector.jsonExpression)}${value.value2 ? `,'${value.value2}'` : ""})`, "as", value.alias, ",");
                    break;
                case Param.Concat:
                    const arr = value.map<string>(x => x.isFunction ? x.getColumn(this.selector.jsonExpression) : `'${(x.value?.toString() ?? "")}'`).filter(x => x.length > 0).join(` ${value.value2 ?? "||"} `)
                    sql.append(arr, "as", value.alias, ",");
                    break;
                default:
                    addedColumns = true;
                    sql.append(value.getColumn(this.selector.jsonExpression), ",")
                    break;
            }
        }
        this.selector.queryColumnSelector.cases.forEach(x => {
            const item = x as any as IWhereProp<string>
            const c = this.translateWhere(item, args);
            if (!c.isEmpty)
                sql.append("(", c.toString(), ")", "as", item.alias);
        });


        if (!addedColumns && !sql.isEmpty)
            sql.append("*")

        if (sql.isEmpty)
            return sql.append("SELECT * FROM", this.selector.tableName, this.selector.joins.length > 0 ? "as a" : "")
        return sql.trimEnd(",").prepend("SELECT").append("FROM", this.selector.tableName, this.selector.joins.length > 0 ? "as a" : "")

    }

    private translateOthers() {
        const counter = new Counter(this.selector.others.filter(x => x.args != Param.GroupBy));
        let sql = new StringBuilder();
        if (counter.length <= 0)
            return sql;
        const orderBy = [] as string[];
        let limit = "";
        while (counter.hasNext) {
            const value = counter.next;
            switch (value.args) {
                case Param.OrderByAsc:
                case Param.OrderByDesc:
                    const columns = value.getColumns(this.selector.jsonExpression);
                    columns.forEach(c => {
                        orderBy.push(`${c} ${value.args === Param.OrderByAsc ? "ASC" : "DESC"}`);
                    });

                    break
                case Param.Limit:
                    limit = value.args.toString().substring(1).replace("#Counter", value.value.toString());
                    break;
            }
        }

        if (orderBy.length > 0) {
            sql.append("ORDER BY", orderBy.join(", "));
        }

        if (limit.length > 0)
            sql.append(limit)

        return sql;
    }

    private translateJoins(args: any[]) {
        const counter = new Counter(this.selector.joins);
        let sql = new StringBuilder();
        if (counter.length <= 0)
            return sql;
        while (counter.hasNext) {
            const value = counter.next;
            const joinType = value.Queries[0];
            const joinWhere = this.translateWhere(value, args);
            if (!joinWhere.isEmpty)
                sql.append(`${joinType.args.substring(1)} ${value.tableName} as ${value.alias} ON ${joinWhere.toString()}`);
            else sql.append(`${joinType.args.substring(1)} ${value.tableName} as ${value.alias}`);
        }

        return sql;
    }

    private translateWhere(item: IWhereProp<string>, args: any[]) {
        const counter = new Counter(item.Queries as QValue[]);
        let sql = new StringBuilder();
        const findColumn = () => {
            for (let i = counter.currentIndex; i >= 0; i--) {
                const value = counter.index(i);
                if (value && value.isColumn)
                    return value.getColumn(this.selector.jsonExpression);
            }

            return undefined;
        }
        while (counter.hasNext) {
            const value = counter.next;

            let column = findColumn();;
            const arrValue = value.map(x => x);
            switch (value.args) {
                case Param.EqualTo:
                case Param.LessThan:
                case Param.GreaterThan:
                case Param.IN:
                case Param.NotEqualTo:
                case Param.EqualAndGreaterThen:
                case Param.EqualAndLessThen:
                    sql.append(value.args.substring(1));
                    if ((!value.isFunction && !value.isColumn) || value.isInnerSelect) {
                        {
                            if (value.isInnerSelect) {
                                if (value.args.indexOf("(") != -1)
                                    sql.append(value.getInnerSelect(value.args), ")");
                                else sql.append(value.getInnerSelect(value.args));
                            } else {
                                if (value.args.indexOf("(") != -1)
                                    sql.append(arrValue.map(x => "?").join(", "), ")");
                                else sql.append("?");
                                args.push(...arrValue.map(x => Functions.translateAndEncrypt(x.value, this.selector.database, item.tableName, column)));
                            }
                        }
                    } else {
                        if (value.args.indexOf("(") != -1)
                            sql.append(arrValue.map(x => x.getColumn(this.selector.jsonExpression)).join(", "), ")");
                        else sql.append(value.getColumn(this.selector.jsonExpression));
                    }

                    break;
                case Param.NotNULL:
                case Param.NULL:
                case Param.OR:
                case Param.AND:
                case Param.StartParameter:
                case Param.EndParameter:
                case Param.Not:
                case Param.Between:
                case Param.Case:
                case Param.When:
                case Param.Then:
                case Param.EndCase:
                case Param.Else:
                    sql.append(value.args.substring(1));
                    break;
                case Param.Value:
                    if (value.isFunction || value.isColumn) {
                        sql.append(value.getColumn(this.selector.jsonExpression));
                    } else {
                        sql.append("?")
                        args.push(Functions.translateToSqliteValue(value.value));
                    }
                    break;
                case Param.Concat:
                    const arr = value.map<string>(x => x.isFunction ? x.getColumn(this.selector.jsonExpression) : `'${(x.value?.toString() ?? "")}'`).filter(x => x.length > 0).join(` ${value.value2 ?? "||"} `)
                    sql.append(arr);
                    break;
                case Param.Contains:
                case Param.StartWith:
                case Param.EndWith:
                    let v = value.isFunction ? value.getColumn(this.selector.jsonExpression) : Functions.translateAndEncrypt(value.value, this.selector.database, this.selector.tableName, column);
                    if (value.args === Param.Contains)
                        v = value.isFunction ? `'%' + ${v} + '%'` : `%${v}%`;
                    else if (value.args === Param.StartWith)
                        v = value.isFunction ? `${v} + '%'` : `${v}%`;
                    else v = value.isFunction ? `'%' +${v}` : `%${v}`;
                    if (!value.isFunction) {
                        sql.append("like", "?");
                        args.push(v);
                    } else {
                        sql.append("like", v);
                    }
                    break;
                default:
                    if (value.isFunction || value.isColumn)
                        sql.append(value.getColumn(this.selector.jsonExpression));

                    break
            }
        }

        return sql;
    }

    translateToInnerSelectSql() {
        const sqlQuery = this.translate("SELECT");
        const sql = new StringBuilder(sqlQuery.sql);
        const args = [...sqlQuery.args];
        const tempQuestionMark = "#questionMark"
        const c = "?";
        while (sql.indexOf(c) !== -1 && args.length > 0) {
            {

                let value = args.shift();
                if (Functions.isDefained(value) && typeof value === "string") {
                    if (value.indexOf(c) !== -1)
                        value = value.replace(new RegExp("\\" + c, "gmi"), tempQuestionMark)
                    value = `'${value}'`;
                }
                if (!Functions.isDefained(value))
                    value = "NULL";
                sql.replaceIndexOf(c, value.toString())
            }
        }

        return sql.toString().replace(new RegExp(tempQuestionMark, "gmi"), c);
    }

    translate(selectType: "SELECT" | "DELETE") {
        try {
            const args = [] as any[];
            const selectcColumnSql = selectType == "DELETE" ? this.translateDeleteColumn() : this.translateColumns(args);
            const whereSql = this.selector._where ? this.translateWhere(this.selector._where, args) : new StringBuilder();
            const groupBy = this.selector.others.filter(x => x.args === Param.GroupBy).map(x => x.getColumn(this.selector.jsonExpression));
            const otherSql = this.translateOthers();
            const joinSql = selectType === "SELECT" ? this.translateJoins(args) : new StringBuilder();
            const havingSql = this.selector.having && selectType === "SELECT" ? this.translateWhere(this.selector.having, args) : new StringBuilder();
            const sql = new StringBuilder(selectcColumnSql.toString().trim());

            if (!joinSql.isEmpty && selectType == "SELECT")
                sql.append(joinSql.toString().trim());
            if (!whereSql.isEmpty)
                sql.append("WHERE", whereSql.toString().trim());
            if (groupBy.length > 0 && selectType == "SELECT")
                sql.append("GROUP BY", groupBy.join(", "));
            if (!havingSql.isEmpty && selectType == "SELECT")
                sql.append("HAVING", havingSql.toString().trim());
            if (!otherSql.isEmpty && selectType == "SELECT")
                sql.append(otherSql.toString().trim());
            if (selectType == "SELECT" && this.selector.unions.length > 0) {
                this.selector.unions.forEach(x => {
                    const q = x.value.getSql("SELECT");
                    sql.append(x.type.substring(1), q.sql);
                    q.args.forEach(a => args.push(a));
                });
            }

            return { sql: sql.toString().trim(), args: args }
        } catch (e) {
            console.error(e);
            throw e;
        }

    }
}