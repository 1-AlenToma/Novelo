"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var UsefullMethods_1 = require("./UsefullMethods");
var BulkSave = /** @class */ (function () {
    function BulkSave(dbContext, keys, tableName) {
        this.dbContext = dbContext;
        this.keys = keys;
        this.tableName = tableName;
        this.quries = [];
    }
    BulkSave.prototype.insert = function (items) {
        var _this = this;
        var itemArray = Array.isArray(items)
            ? items
            : [items];
        var table = this.dbContext.tables.find(function (x) { return x.tableName == _this.tableName; });
        itemArray.forEach(function (item) {
            var q = {
                sql: "INSERT INTO ".concat(_this.tableName, " ("),
                args: [],
                parseble: true
            };
            var keys = UsefullMethods_1.Functions.getAvailableKeys(_this.keys, item);
            keys.forEach(function (k, i) {
                q.sql +=
                    k + (i < keys.length - 1 ? "," : "");
            });
            q.sql += ") values(";
            keys.forEach(function (k, i) {
                q.sql +=
                    "?" + (i < keys.length - 1 ? "," : "");
            });
            q.sql += ")";
            keys.forEach(function (k, i) {
                var _a;
                var column = table === null || table === void 0 ? void 0 : table.props.find(function (x) {
                    return x.columnName == k && x.encryptionKey;
                });
                var v = (_a = item[k]) !== null && _a !== void 0 ? _a : null;
                if (UsefullMethods_1.Functions.isDate(v))
                    v = v.toISOString();
                else if (column &&
                    column.columnType === "JSON" &&
                    v)
                    v = JSON.stringify(v);
                if (column &&
                    column.columnType === "BLOB")
                    q.parseble = false;
                if (typeof v === "boolean")
                    v = v === true ? 1 : 0;
                if (column)
                    v = UsefullMethods_1.Functions.encrypt(v, column.encryptionKey);
                q.args.push(v);
            });
            _this.quries.push(q);
        });
        return this;
    };
    BulkSave.prototype.update = function (items) {
        var _this = this;
        var itemArray = Array.isArray(items)
            ? items
            : [items];
        var table = this.dbContext.tables.find(function (x) { return x.tableName == _this.tableName; });
        itemArray.forEach(function (item) {
            var q = {
                sql: "UPDATE ".concat(_this.tableName, " SET "),
                args: [],
                parseble: true
            };
            var keys = UsefullMethods_1.Functions.getAvailableKeys(_this.keys, item);
            keys.forEach(function (k, i) {
                q.sql +=
                    " ".concat(k, "=? ") +
                        (i < keys.length - 1 ? "," : "");
            });
            q.sql += " WHERE id=?";
            keys.forEach(function (k, i) {
                var _a;
                var column = table === null || table === void 0 ? void 0 : table.props.find(function (x) {
                    return x.columnName == k && x.encryptionKey;
                });
                var v = (_a = item[k]) !== null && _a !== void 0 ? _a : null;
                if (UsefullMethods_1.Functions.isDate(v))
                    v = v.toISOString();
                else if (column &&
                    column.columnType === "JSON" &&
                    v) {
                    v = JSON.stringify(v);
                }
                if (column &&
                    column.columnType === "BLOB")
                    q.parseble = false;
                if (typeof v === "boolean")
                    v = v === true ? 1 : 0;
                if (column)
                    v = UsefullMethods_1.Functions.encrypt(v, column.encryptionKey);
                q.args.push(v);
            });
            q.args.push(item.id);
            _this.quries.push(q);
        });
        return this;
    };
    BulkSave.prototype.delete = function (items) {
        var _this = this;
        var itemArray = Array.isArray(items)
            ? items
            : [items];
        itemArray.forEach(function (item) {
            var q = {
                sql: "DELETE FROM ".concat(_this.tableName, " WHERE id = ?"),
                args: [item.id],
                parseble: true
            };
            _this.quries.push(q);
        });
        return this;
    };
    BulkSave.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var qs, sql, c, tempQuestionMark, _i, _a, q, s, value, db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.quries.length > 0)) return [3 /*break*/, 3];
                        qs = __spreadArray([], this.quries.filter(function (x) { return !x.parseble; }), true);
                        sql = [];
                        c = "?";
                        tempQuestionMark = "#questionMark";
                        for (_i = 0, _a = this.quries.filter(function (x) { return x.parseble; }); _i < _a.length; _i++) {
                            q = _a[_i];
                            s = new UsefullMethods_1.StringBuilder(q.sql);
                            while (s.indexOf(c) !== -1 &&
                                q.args.length > 0) {
                                value = q.args.shift();
                                if (UsefullMethods_1.Functions.isDefained(value) &&
                                    typeof value === "string") {
                                    if (value.indexOf(c) !== -1)
                                        value = value.replace(new RegExp("\\" + c, "gmi"), tempQuestionMark);
                                    value = "'".concat(value, "'");
                                }
                                if (!UsefullMethods_1.Functions.isDefained(value))
                                    value = "NULL";
                                s.replaceIndexOf(c, value.toString());
                            }
                            sql.push(s);
                        }
                        if (sql.length > 0)
                            qs.push({
                                sql: sql
                                    .join(";\n")
                                    .replace(new RegExp(tempQuestionMark, "gmi"), c),
                                args: []
                            });
                        return [4 /*yield*/, this.dbContext.executeRawSql(qs)];
                    case 1:
                        _b.sent();
                        db = this
                            .dbContext;
                        return [4 /*yield*/, db.triggerWatch([], "onBulkSave", undefined, this.tableName)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return BulkSave;
}());
exports.default = BulkSave;
