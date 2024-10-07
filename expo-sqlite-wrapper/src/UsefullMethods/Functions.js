"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("./Errors");
var crypto_js_1 = require("crypto-js");
var json_sql_1 = require("json-sql");
var Functions = /** @class */ (function () {
    function Functions() {
        this.encryptionsIdentifier = "#dbEncrypted&";
    }
    Functions.prototype.buildJsonExpression = function (jsonExpression, database, tableName, alias, isInit) {
        var table = database.tables.find(function (x) { return x.tableName == tableName; });
        if (!table)
            throw Errors_1.default.missingTableBuilder(tableName);
        var item = jsonExpression;
        if (!isInit) {
            item[alias] = {};
            item = item[alias];
        }
        table.props.forEach(function (x) {
            item[x.columnName] = isInit ? x.columnName : "".concat(alias, ".").concat(x.columnName);
        });
        return jsonExpression;
    };
    Functions.prototype.aliasNameming = function (column, alias) {
        return "".concat(column, " as ").concat(alias);
    };
    Functions.prototype.isPrimitive = function (v) {
        if (!this.isDefained(v) ||
            typeof v === 'string' ||
            typeof v === 'number' ||
            typeof v === 'function' ||
            Object.prototype.toString.call(v) === '[object Date]' ||
            typeof v === 'boolean' ||
            typeof v === 'bigint')
            return true;
        return false;
    };
    Functions.prototype.isDefained = function (v) {
        return v !== null && v !== undefined;
    };
    Functions.prototype.isFunc = function (value) {
        if (value === null || value === undefined || value.toString === undefined)
            return false;
        if (typeof value === "function")
            return true;
        return value.toString().indexOf('function') !== -1;
    };
    Functions.prototype.isDate = function (v) {
        if (v === null || v === undefined)
            return false;
        if (Object.prototype.toString.call(v) === "[object Date]")
            return true;
        return false;
    };
    Functions.prototype.translateToSqliteValue = function (v) {
        if (v === null || v === undefined)
            return v;
        if (this.isDate(v))
            return v.toISOString();
        if (typeof v === "boolean")
            return v === true ? 1 : 0;
        return v;
    };
    Functions.prototype.translateAndEncrypt = function (v, database, tableName, column) {
        if (column && column.indexOf("."))
            column = this.last(column.split("."));
        var table = database.tables.find(function (x) { return x.tableName == tableName; });
        var encryptValue = typeof v === "string" && column && table && table.props.find(function (f) { return f.columnName === column && f.encryptionKey; }) != undefined;
        v = this.translateToSqliteValue(v);
        if (encryptValue) {
            v = this.encrypt(v, table.props.find(function (x) { return x.columnName === column; }).encryptionKey);
        }
        return v;
    };
    Functions.prototype.encrypt = function (str, key) {
        if (!str || str == "" || str.startsWith(this.encryptionsIdentifier))
            return str; // already Encrypted
        var hash = crypto_js_1.default.SHA256(key);
        return this.encryptionsIdentifier + crypto_js_1.default.AES.encrypt(str, hash, { mode: crypto_js_1.default.mode.ECB }).toString();
    };
    Functions.prototype.decrypt = function (str, key) {
        if (!str || str == "" || !str.startsWith(this.encryptionsIdentifier))
            return str;
        var hash = crypto_js_1.default.SHA256(key);
        str = str.substring(this.encryptionsIdentifier.length);
        var bytes = crypto_js_1.default.AES.decrypt(str, hash, { mode: crypto_js_1.default.mode.ECB });
        var originalText = bytes.toString(crypto_js_1.default.enc.Utf8);
        return originalText;
    };
    Functions.prototype.oEncypt = function (item, tableBuilder) {
        var _this = this;
        if (!tableBuilder)
            return item;
        tableBuilder.props.filter(function (x) { return x.encryptionKey; }).forEach(function (x) {
            var v = item[x.columnName];
            if (v)
                item[x.columnName] = _this.encrypt(v, x.encryptionKey);
        });
        return item;
    };
    Functions.prototype.oDecrypt = function (item, tableBuilder) {
        var _this = this;
        if (!tableBuilder)
            return item;
        tableBuilder.props.filter(function (x) { return x.encryptionKey; }).forEach(function (x) {
            var v = item[x.columnName];
            if (v)
                item[x.columnName] = _this.decrypt(v, x.encryptionKey);
        });
        return item;
    };
    Functions.prototype.validateTableName = function (item, tableName) {
        if (!item.tableName || item.tableName.length <= 2)
            if (!tableName)
                throw "TableName cannot be null, This item could not be saved";
            else
                item.tableName = tableName;
        return item;
    };
    Functions.prototype.jsonToSqlite = function (query) {
        try {
            var builder = (0, json_sql_1.default)();
            var sql = builder.build(query);
            sql.query = sql.query.replace(/\"/g, '');
            var vArray = [];
            for (var key in sql.values) {
                while (sql.query.indexOf('$' + key) !== -1) {
                    sql.query = sql.query.replace('$' + key, '?');
                    vArray.push(sql.values[key]);
                }
            }
            var sqlResult = { sql: sql.query, args: vArray };
            return sqlResult;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    };
    Functions.prototype.translateSimpleSql = function (database, tableName, query) {
        var _this = this;
        var q = "SELECT * FROM ".concat(tableName, " ").concat(query ? 'WHERE ' : '');
        var values = [];
        if (query && Object.keys(query).length > 0) {
            var table_1 = database.tables.find(function (x) { return x.tableName == tableName; });
            var keys_1 = Object.keys(query);
            keys_1.forEach(function (x, i) {
                var start = x.startsWith('$') ? x.substring(0, x.indexOf('-')).replace('-', '') : undefined;
                var columnName = start ? x.replace("$in-", "").trim() : x.trim();
                var column = table_1 ? table_1.props.find(function (f) { return f.columnName === columnName; }) : undefined;
                if (!start) {
                    q += x + '=? ' + (i < keys_1.length - 1 ? 'AND ' : '');
                    var v = query[x];
                    if (column)
                        v = _this.translateAndEncrypt(v, database, tableName, columnName);
                    values.push(v);
                }
                else {
                    if (start == '$in') {
                        var v_1 = query[x];
                        q += x.replace("$in-", "") + ' IN (';
                        v_1.forEach(function (item, index) {
                            q += '?' + (index < v_1.length - 1 ? ', ' : '');
                            if (column)
                                item = _this.translateAndEncrypt(item, database, tableName, columnName);
                            values.push(item);
                        });
                    }
                    q += ') ' + (i < keys_1.length - 1 ? 'AND ' : '');
                }
            });
        }
        return { sql: q, args: values };
    };
    Functions.prototype.getAvailableKeys = function (dbKeys, item) {
        return dbKeys.filter(function (x) { return Object.keys(item).includes(x); });
    };
    Functions.prototype.createSqlInstaceOfType = function (prototype, item) {
        if (!prototype)
            return item;
        var x = Object.create(prototype);
        for (var key in item)
            x[key] = item[key];
        return x;
    };
    Functions.prototype.counterSplit = function (titems, counter) {
        var _this = this;
        var items = [];
        titems.forEach(function (x, index) {
            var _a;
            if (items.length <= 0 || index % counter === 0) {
                items.push([]);
            }
            var current = (_a = _this.last(items)) !== null && _a !== void 0 ? _a : [];
            current.push(x);
        });
        return items;
    };
    Functions.prototype.findAt = function (titems, index) {
        if (!titems)
            return undefined;
        if (index < 0 || index >= titems.length)
            return undefined;
        return this[index];
    };
    Functions.prototype.last = function (titems) {
        return titems && titems.length > 0 ? titems[titems.length - 1] : undefined;
    };
    Functions.prototype.toType = function (titems) {
        return titems !== null && titems !== void 0 ? titems : [];
    };
    Functions.prototype.single = function (titems) {
        return titems && titems.length > 0 ? titems[0] : undefined;
    };
    return Functions;
}());
var functions = new Functions();
exports.default = functions;
