"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableBuilder = void 0;
var TableBuilder = /** @class */ (function () {
    function TableBuilder(tableName) {
        this.props = [];
        this.tableName = tableName;
        this.constrains = [];
    }
    TableBuilder.prototype.colType = function (colType) {
        if (colType !== "String" &&
            this.getLastProp.encryptionKey) {
            var ms = "Error:Encryption can only be done to columns with String Types. (".concat(this.tableName, ".").concat(this.getLastProp.columnName, ")");
            console.error(ms);
            throw ms;
        }
        this.getLastProp.columnType = colType;
        return this;
    };
    Object.defineProperty(TableBuilder.prototype, "blob", {
        get: function () {
            return this.colType("BLOB");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "json", {
        get: function () {
            return this.colType("JSON");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "boolean", {
        get: function () {
            return this.colType("Boolean");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "number", {
        get: function () {
            return this.colType("Number");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "decimal", {
        get: function () {
            return this.colType("Decimal");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "string", {
        get: function () {
            return this.colType("String");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "dateTime", {
        get: function () {
            return this.colType("DateTime");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "nullable", {
        get: function () {
            this.getLastProp.isNullable = true;
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "primary", {
        get: function () {
            this.getLastProp.isPrimary = true;
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "autoIncrement", {
        get: function () {
            this.getLastProp.isAutoIncrement = true;
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "unique", {
        get: function () {
            this.getLastProp.isUnique = true;
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBuilder.prototype, "getLastProp", {
        get: function () {
            if (this.props.length > 0)
                return this.props[this.props.length - 1];
            return {};
        },
        enumerable: false,
        configurable: true
    });
    TableBuilder.prototype.objectPrototype = function (objectProptoType) {
        this.typeProptoType = objectProptoType;
        return this;
    };
    TableBuilder.prototype.encrypt = function (encryptionKey) {
        if (this.getLastProp.columnType !== "String") {
            var ms = "Error:Encryption can only be done to columns with String Types. (".concat(this.tableName, ".").concat(this.getLastProp.columnName, ")");
            console.error(ms);
            throw ms;
        }
        this.getLastProp.encryptionKey =
            encryptionKey;
        return this;
    };
    TableBuilder.prototype.onItemCreate = function (func) {
        this.itemCreate = func;
        return this;
    };
    TableBuilder.prototype.column = function (colName) {
        var col = {
            columnName: colName,
            columnType: "String"
        };
        this.props.push(col);
        return this;
    };
    TableBuilder.prototype.constrain = function (columnName, contraintTableName, contraintColumnName) {
        this.constrains.push({
            columnName: columnName,
            contraintColumnName: contraintColumnName,
            contraintTableName: contraintTableName
        });
        return this;
    };
    return TableBuilder;
}());
exports.TableBuilder = TableBuilder;
exports.default = (function (tableName) {
    return new TableBuilder(tableName);
});
