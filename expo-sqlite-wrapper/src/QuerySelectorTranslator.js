"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var QuerySelector_1 = require("./QuerySelector");
var UsefullMethods_1 = require("./UsefullMethods");
var QuerySelectorTranslator = /** @class */ (function () {
    function QuerySelectorTranslator(selector) {
        this.selector = selector;
        this.querySelectorSql = new UsefullMethods_1.StringBuilder();
    }
    QuerySelectorTranslator.prototype.translateDeleteColumn = function () {
        var sql = new UsefullMethods_1.StringBuilder();
        return sql.append("DELETE FROM", this.selector.tableName);
    };
    QuerySelectorTranslator.prototype.translateColumns = function (args) {
        var _this = this;
        var _a;
        var sql = new UsefullMethods_1.StringBuilder();
        if (!this.selector.queryColumnSelector)
            return sql.append("SELECT * FROM", this.selector.tableName, this.selector.joins.length > 0 ? "as a" : "");
        var counter = new UsefullMethods_1.Counter(this.selector.queryColumnSelector.columns);
        var addedColumns = false;
        while (counter.hasNext) {
            var value = counter.next;
            switch (value.args) {
                case QuerySelector_1.Param.Count:
                    sql.append("count(".concat(value.getColumn(this.selector.jsonExpression), ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.Min:
                    sql.append("min(".concat(value.getColumn(this.selector.jsonExpression), ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.Max:
                    sql.append("max(".concat(value.getColumn(this.selector.jsonExpression), ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.Sum:
                    sql.append("sum(".concat(value.getColumn(this.selector.jsonExpression), ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.Avg:
                    sql.append("avg(".concat(value.getColumn(this.selector.jsonExpression), ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.Total:
                    sql.append("total(".concat(value.getColumn(this.selector.jsonExpression), ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.GroupConcat:
                    sql.append("group_concat(".concat(value.getColumn(this.selector.jsonExpression)).concat(value.value2 ? ",'".concat(value.value2, "'") : "", ")"), "as", value.alias, ",");
                    break;
                case QuerySelector_1.Param.Concat:
                    var arr = value.map(function (x) { var _a, _b; return x.isFunction ? x.getColumn(_this.selector.jsonExpression) : "'".concat(((_b = (_a = x.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""), "'"); }).filter(function (x) { return x.length > 0; }).join(" ".concat((_a = value.value2) !== null && _a !== void 0 ? _a : "||", " "));
                    sql.append(arr, "as", value.alias, ",");
                    break;
                default:
                    addedColumns = true;
                    sql.append(value.getColumn(this.selector.jsonExpression), ",");
                    break;
            }
        }
        this.selector.queryColumnSelector.cases.forEach(function (x) {
            var item = x;
            var c = _this.translateWhere(item, args);
            if (!c.isEmpty)
                sql.append("(", c.toString(), ")", "as", item.alias);
        });
        if (!addedColumns && !sql.isEmpty)
            sql.append("*");
        if (sql.isEmpty)
            return sql.append("SELECT * FROM", this.selector.tableName, this.selector.joins.length > 0 ? "as a" : "");
        return sql.trimEnd(",").prepend("SELECT").append("FROM", this.selector.tableName, this.selector.joins.length > 0 ? "as a" : "");
    };
    QuerySelectorTranslator.prototype.translateOthers = function () {
        var counter = new UsefullMethods_1.Counter(this.selector.others.filter(function (x) { return x.args != QuerySelector_1.Param.GroupBy; }));
        var sql = new UsefullMethods_1.StringBuilder();
        if (counter.length <= 0)
            return sql;
        var orderBy = [];
        var limit = "";
        var _loop_1 = function () {
            var value = counter.next;
            switch (value.args) {
                case QuerySelector_1.Param.OrderByAsc:
                case QuerySelector_1.Param.OrderByDesc:
                    var columns = value.getColumns(this_1.selector.jsonExpression);
                    columns.forEach(function (c) {
                        orderBy.push("".concat(c, " ").concat(value.args === QuerySelector_1.Param.OrderByAsc ? "ASC" : "DESC"));
                    });
                    break;
                case QuerySelector_1.Param.Limit:
                    limit = value.args.toString().substring(1).replace("#Counter", value.value.toString());
                    break;
            }
        };
        var this_1 = this;
        while (counter.hasNext) {
            _loop_1();
        }
        if (orderBy.length > 0) {
            sql.append("ORDER BY", orderBy.join(", "));
        }
        if (limit.length > 0)
            sql.append(limit);
        return sql;
    };
    QuerySelectorTranslator.prototype.translateJoins = function (args) {
        var counter = new UsefullMethods_1.Counter(this.selector.joins);
        var sql = new UsefullMethods_1.StringBuilder();
        if (counter.length <= 0)
            return sql;
        while (counter.hasNext) {
            var value = counter.next;
            var joinType = value.Queries[0];
            var joinWhere = this.translateWhere(value, args);
            if (!joinWhere.isEmpty)
                sql.append("".concat(joinType.args.substring(1), " ").concat(value.tableName, " as ").concat(value.alias, " ON ").concat(joinWhere.toString()));
            else
                sql.append("".concat(joinType.args.substring(1), " ").concat(value.tableName, " as ").concat(value.alias));
        }
        return sql;
    };
    QuerySelectorTranslator.prototype.translateWhere = function (item, args) {
        var _this = this;
        var _a;
        var counter = new UsefullMethods_1.Counter(item.Queries);
        var sql = new UsefullMethods_1.StringBuilder();
        var findColumn = function () {
            for (var i = counter.currentIndex; i >= 0; i--) {
                var value = counter.index(i);
                if (value && value.isColumn)
                    return value.getColumn(_this.selector.jsonExpression);
            }
            return undefined;
        };
        var _loop_2 = function () {
            var value = counter.next;
            var column = findColumn();
            ;
            var arrValue = value.map(function (x) { return x; });
            switch (value.args) {
                case QuerySelector_1.Param.EqualTo:
                case QuerySelector_1.Param.LessThan:
                case QuerySelector_1.Param.GreaterThan:
                case QuerySelector_1.Param.IN:
                case QuerySelector_1.Param.NotEqualTo:
                case QuerySelector_1.Param.EqualAndGreaterThen:
                case QuerySelector_1.Param.EqualAndLessThen:
                    sql.append(value.args.substring(1));
                    if ((!value.isFunction && !value.isColumn) || value.isInnerSelect) {
                        {
                            if (value.isInnerSelect) {
                                if (value.args.indexOf("(") != -1)
                                    sql.append(value.getInnerSelect(value.args), ")");
                                else
                                    sql.append(value.getInnerSelect(value.args));
                            }
                            else {
                                if (value.args.indexOf("(") != -1)
                                    sql.append(arrValue.map(function (x) { return "?"; }).join(", "), ")");
                                else
                                    sql.append("?");
                                args.push.apply(args, arrValue.map(function (x) { return UsefullMethods_1.Functions.translateAndEncrypt(x.value, _this.selector.database, item.tableName, column); }));
                            }
                        }
                    }
                    else {
                        if (value.args.indexOf("(") != -1)
                            sql.append(arrValue.map(function (x) { return x.getColumn(_this.selector.jsonExpression); }).join(", "), ")");
                        else
                            sql.append(value.getColumn(this_2.selector.jsonExpression));
                    }
                    break;
                case QuerySelector_1.Param.NotNULL:
                case QuerySelector_1.Param.NULL:
                case QuerySelector_1.Param.OR:
                case QuerySelector_1.Param.AND:
                case QuerySelector_1.Param.StartParameter:
                case QuerySelector_1.Param.EndParameter:
                case QuerySelector_1.Param.Not:
                case QuerySelector_1.Param.Between:
                case QuerySelector_1.Param.Case:
                case QuerySelector_1.Param.When:
                case QuerySelector_1.Param.Then:
                case QuerySelector_1.Param.EndCase:
                case QuerySelector_1.Param.Else:
                    sql.append(value.args.substring(1));
                    break;
                case QuerySelector_1.Param.Value:
                    if (value.isFunction || value.isColumn) {
                        sql.append(value.getColumn(this_2.selector.jsonExpression));
                    }
                    else {
                        sql.append("?");
                        args.push(UsefullMethods_1.Functions.translateToSqliteValue(value.value));
                    }
                    break;
                case QuerySelector_1.Param.Concat:
                    var arr = value.map(function (x) { var _a, _b; return x.isFunction ? x.getColumn(_this.selector.jsonExpression) : "'".concat(((_b = (_a = x.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""), "'"); }).filter(function (x) { return x.length > 0; }).join(" ".concat((_a = value.value2) !== null && _a !== void 0 ? _a : "||", " "));
                    sql.append(arr);
                    break;
                case QuerySelector_1.Param.Contains:
                case QuerySelector_1.Param.StartWith:
                case QuerySelector_1.Param.EndWith:
                    var v = value.isFunction ? value.getColumn(this_2.selector.jsonExpression) : UsefullMethods_1.Functions.translateAndEncrypt(value.value, this_2.selector.database, this_2.selector.tableName, column);
                    if (value.args === QuerySelector_1.Param.Contains)
                        v = value.isFunction ? "'%' + ".concat(v, " + '%'") : "%".concat(v, "%");
                    else if (value.args === QuerySelector_1.Param.StartWith)
                        v = value.isFunction ? "".concat(v, " + '%'") : "".concat(v, "%");
                    else
                        v = value.isFunction ? "'%' +".concat(v) : "%".concat(v);
                    if (!value.isFunction) {
                        sql.append("like", "?");
                        args.push(v);
                    }
                    else {
                        sql.append("like", v);
                    }
                    break;
                default:
                    if (value.isFunction || value.isColumn)
                        sql.append(value.getColumn(this_2.selector.jsonExpression));
                    break;
            }
        };
        var this_2 = this;
        while (counter.hasNext) {
            _loop_2();
        }
        return sql;
    };
    QuerySelectorTranslator.prototype.translateToInnerSelectSql = function () {
        var sqlQuery = this.translate("SELECT");
        var sql = new UsefullMethods_1.StringBuilder(sqlQuery.sql);
        var args = __spreadArray([], sqlQuery.args, true);
        var tempQuestionMark = "#questionMark";
        var c = "?";
        while (sql.indexOf(c) !== -1 && args.length > 0) {
            {
                var value = args.shift();
                if (UsefullMethods_1.Functions.isDefained(value) && typeof value === "string") {
                    if (value.indexOf(c) !== -1)
                        value = value.replace(new RegExp("\\" + c, "gmi"), tempQuestionMark);
                    value = "'".concat(value, "'");
                }
                if (!UsefullMethods_1.Functions.isDefained(value))
                    value = "NULL";
                sql.replaceIndexOf(c, value.toString());
            }
        }
        return sql.toString().replace(new RegExp(tempQuestionMark, "gmi"), c);
    };
    QuerySelectorTranslator.prototype.translate = function (selectType) {
        var _this = this;
        try {
            var args_1 = [];
            var selectcColumnSql = selectType == "DELETE" ? this.translateDeleteColumn() : this.translateColumns(args_1);
            var whereSql = this.selector.where ? this.translateWhere(this.selector.where, args_1) : new UsefullMethods_1.StringBuilder();
            var groupBy = this.selector.others.filter(function (x) { return x.args === QuerySelector_1.Param.GroupBy; }).map(function (x) { return x.getColumn(_this.selector.jsonExpression); });
            var otherSql = this.translateOthers();
            var joinSql = selectType === "SELECT" ? this.translateJoins(args_1) : new UsefullMethods_1.StringBuilder();
            var havingSql = this.selector.having && selectType === "SELECT" ? this.translateWhere(this.selector.having, args_1) : new UsefullMethods_1.StringBuilder();
            var sql_1 = new UsefullMethods_1.StringBuilder(selectcColumnSql.toString().trim());
            if (!joinSql.isEmpty && selectType == "SELECT")
                sql_1.append(joinSql.toString().trim());
            if (!whereSql.isEmpty)
                sql_1.append("WHERE", whereSql.toString().trim());
            if (groupBy.length > 0 && selectType == "SELECT")
                sql_1.append("GROUP BY", groupBy.join(", "));
            if (!havingSql.isEmpty && selectType == "SELECT")
                sql_1.append("HAVING", havingSql.toString().trim());
            if (!otherSql.isEmpty && selectType == "SELECT")
                sql_1.append(otherSql.toString().trim());
            if (selectType == "SELECT" && this.selector.unions.length > 0) {
                this.selector.unions.forEach(function (x) {
                    var q = x.value.getSql("SELECT");
                    sql_1.append(x.type.substring(1), q.sql);
                    q.args.forEach(function (a) { return args_1.push(a); });
                });
            }
            return { sql: sql_1.toString().trim(), args: args_1 };
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    return QuerySelectorTranslator;
}());
exports.default = QuerySelectorTranslator;
