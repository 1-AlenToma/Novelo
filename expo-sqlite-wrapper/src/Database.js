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
var BulkSave_1 = require("./BulkSave");
var useQuery_1 = require("./hooks/useQuery");
var QuerySelector_1 = require("./QuerySelector");
var UsefullMethods_1 = require("./UsefullMethods");
function default_1(databaseTables, getDatabase, onInit, disableLog) {
    return new Database(databaseTables, getDatabase, onInit, disableLog);
}
exports.default = default_1;
var watchers = [];
var Watcher = /** @class */ (function () {
    function Watcher(tableName) {
        var _this = this;
        this.removeWatch = function () {
            return watchers.splice(watchers.findIndex(function (x) { return x == _this; }), 1);
        };
        this.tableName = tableName;
        this.identifier = "Other";
    }
    return Watcher;
}());
var Database = /** @class */ (function () {
    function Database(databaseTables, getDatabase, onInit, disableLog) {
        var _this = this;
        this.timeout = undefined;
        this.timeStamp = new Date();
        this.allowedKeys = function (tableName, fromCachedKyes, allKeys) { return __awaiter(_this, void 0, void 0, function () {
            var result, table, keys, _loop_1, _i, result_1, row, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fromCachedKyes === true &&
                            !allKeys &&
                            this.mappedKeys.has(tableName))
                            return [2 /*return*/, this.mappedKeys.get(tableName)];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.dataBase()];
                    case 2: return [4 /*yield*/, (_a.sent()).getAllAsync("PRAGMA table_info(".concat(tableName, ")"))];
                    case 3:
                        result = _a.sent();
                        table = this.tables.find(function (x) { return x.tableName === tableName; });
                        keys = [];
                        _loop_1 = function (row) {
                            if ((table === undefined &&
                                row.name != "id") ||
                                (table &&
                                    (table.props.find(function (x) {
                                        return x.columnName == row.name &&
                                            !x.isAutoIncrement;
                                    }) ||
                                        allKeys)))
                                keys.push(row.name);
                        };
                        for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                            row = result_1[_i];
                            _loop_1(row);
                        }
                        if (!allKeys)
                            this.mappedKeys.set(tableName, keys);
                        return [2 /*return*/, keys];
                    case 4:
                        e_1 = _a.sent();
                        console.error(e_1);
                        throw e_1;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.executeRawSql = function (queries) { return __awaiter(_this, void 0, void 0, function () {
            var db, _i, queries_1, sql, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        this.timeStamp = new Date();
                        return [4 /*yield*/, this.dataBase()];
                    case 1:
                        db = _a.sent();
                        _i = 0, queries_1 = queries;
                        _a.label = 2;
                    case 2:
                        if (!(_i < queries_1.length)) return [3 /*break*/, 7];
                        sql = queries_1[_i];
                        if (!(sql.args.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.runAsync.apply(db, __spreadArray([sql.sql], sql.args, false))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db.execAsync(sql.sql)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        console.error(e_2);
                        throw e_2;
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        this.execute = function (query, args) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var e_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, 3, 4]);
                                    this.info("Executing Query:" + query);
                                    return [4 /*yield*/, this.executeRawSql([
                                            { sql: query, args: args || [] }
                                        ])];
                                case 1:
                                    _a.sent();
                                    this.info("Quary executed");
                                    resolve(true);
                                    return [3 /*break*/, 4];
                                case 2:
                                    e_3 = _a.sent();
                                    console.error("Could not execute query:", query, args, e_3);
                                    reject(e_3);
                                    return [3 /*break*/, 4];
                                case 3:
                                    clearTimeout(this.timeout);
                                    return [7 /*endfinally*/];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        }); };
        this.dropTables = function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, x, e_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _i = 0, _a = this.tables;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        x = _a[_i];
                        return [4 /*yield*/, this.execute("DROP TABLE if exists ".concat(x.tableName))];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.setUpDataBase(true)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_4 = _b.sent();
                        console.error(e_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.setUpDataBase = function (forceCheck) { return __awaiter(_this, void 0, void 0, function () {
            var dbType_1, _i, _a, table, query, e_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 10]);
                        if (!(!Database.dbIni || forceCheck)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.beginTransaction()];
                    case 1:
                        _b.sent();
                        dbType_1 = function (columnType) {
                            if (columnType == "Boolean" ||
                                columnType == "Number")
                                return "INTEGER";
                            if (columnType == "Decimal")
                                return "REAL";
                            if (columnType == "BLOB")
                                return "BLOB";
                            return "TEXT";
                        };
                        this.log("dbIni= ".concat(Database.dbIni));
                        this.log("forceCheck= ".concat(forceCheck));
                        this.log("initilize database table setup");
                        _i = 0, _a = this.tables;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        table = _a[_i];
                        query = "CREATE TABLE if not exists ".concat(table.tableName, " (");
                        table.props.forEach(function (col, index) {
                            query += "".concat(col.columnName.toString(), " ").concat(dbType_1(col.columnType), " ").concat(!col.isNullable ? "NOT NULL" : "", " ").concat(col.isPrimary ? "UNIQUE" : "", ",\n");
                        });
                        table.props
                            .filter(function (x) { return x.isPrimary === true; })
                            .forEach(function (col, index) {
                            query +=
                                "PRIMARY KEY(".concat(col.columnName.toString(), " ").concat(col.isAutoIncrement === true
                                    ? "AUTOINCREMENT"
                                    : "", ")") +
                                    (index <
                                        table.props.filter(function (x) { return x.isPrimary === true; }).length -
                                            1
                                        ? ",\n"
                                        : "\n");
                        });
                        if (table.constrains &&
                            table.constrains.length > 0) {
                            query += ",";
                            table.constrains.forEach(function (col, index) {
                                var _a, _b;
                                query +=
                                    "CONSTRAINT \"fk_".concat(col.columnName.toString(), "\" FOREIGN KEY(").concat(col.columnName.toString(), ") REFERENCES ").concat(col.contraintTableName, "(").concat(col.contraintColumnName, ")") +
                                        (index <
                                            ((_b = (_a = table.constrains) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) -
                                                1
                                            ? ",\n"
                                            : "\n");
                            });
                        }
                        query += ");";
                        return [4 /*yield*/, this.execute(query)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.commitTransaction()];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_5 = _b.sent();
                        console.error(e_5);
                        return [4 /*yield*/, this.rollbackTransaction()];
                    case 9:
                        _b.sent();
                        throw e_5;
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.disableLog = disableLog;
        this.onInit = onInit;
        this.mappedKeys = new Map();
        this.isClosing = false;
        this.timer = undefined;
        this.transacting = false;
        this.tempStore = [];
        this.dataBase = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.isClosing) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.wait()];
                    case 1:
                        _e.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        if (!(this.db === undefined ||
                            this.isClosed)) return [3 /*break*/, 5];
                        _a = this;
                        return [4 /*yield*/, getDatabase()];
                    case 3:
                        _a.db = _e.sent();
                        this.isClosed = false;
                        return [4 /*yield*/, ((_c = this.onInit) === null || _c === void 0 ? void 0 : _c.call(this, this))];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        this.isOpen = true;
                        if (!((_d = this.db) !== null && _d !== void 0)) return [3 /*break*/, 6];
                        _b = _d;
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, getDatabase()];
                    case 7:
                        _b = (_e.sent());
                        _e.label = 8;
                    case 8: return [2 /*return*/, _b];
                }
            });
        }); };
        this.tables = databaseTables;
    }
    Database.prototype.log = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!this.disableLog)
            console.log(items);
    };
    Database.prototype.info = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!this.disableLog)
            console.info(items);
    };
    //#region Hooks
    Database.prototype.useQuery = function (tableName, query, onDbItemChanged, updateIf) {
        return (0, useQuery_1.default)(query, this, tableName, onDbItemChanged, updateIf);
    };
    //#endregion Hooks
    //#region private methods
    Database.prototype.resetRefresher = function () {
        if (this.refresherSettings) {
            this.startRefresher(this.refresherSettings.ms);
        }
    };
    Database.prototype.isLocked = function () {
        return this.transacting === true;
    };
    Database.prototype.AddToTempStore = function (items, operation, subOperation, tableName, identifier) {
        try {
            var store_1 = this.tempStore.find(function (x) {
                return x.tableName === tableName &&
                    x.operation === operation &&
                    x.subOperation === subOperation &&
                    x.identifier === identifier;
            });
            if (store_1 === undefined) {
                store_1 = {
                    operation: operation,
                    subOperation: subOperation,
                    tableName: tableName,
                    items: __spreadArray([], items, true),
                    identifier: identifier
                };
                this.tempStore.push(store_1);
            }
            else {
                items.forEach(function (x) {
                    if (!store_1.items.find(function (a) { return a.id === x.id; }))
                        store_1.items.push(x);
                });
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    Database.prototype.executeStore = function (identifier) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, item;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.tempStore
                            .filter(function (x) { return x.identifier === identifier; })
                            .sort(function (a, b) {
                            if (a.operation !== "onBulkSave")
                                return -1;
                            if (b.operation !== "onBulkSave")
                                return 1;
                            return 0;
                        });
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        item = _a[_i];
                        return [4 /*yield*/, this.triggerWatch(item.items, item.operation, item.subOperation, item.tableName, item.identifier)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.tempStore = this.tempStore.filter(function (x) { return x.identifier !== identifier; });
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.triggerWatch = function (items, operation, subOperation, tableName, identifier) {
        return __awaiter(this, void 0, void 0, function () {
            var tItems, s, w, _i, w_1, watcher, e_6, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        this.log("watcher for " + tableName);
                        tItems = Array.isArray(items)
                            ? items
                            : [items];
                        s = UsefullMethods_1.Functions.single(tItems);
                        if (s && !tableName && s && s.tableName)
                            tableName = s.tableName;
                        if (!tableName)
                            return [2 /*return*/];
                        w = watchers.filter(function (x) {
                            var watcher = x;
                            return (watcher.tableName == tableName &&
                                (identifier === undefined ||
                                    identifier === x.identifier));
                        });
                        _i = 0, w_1 = w;
                        _a.label = 1;
                    case 1:
                        if (!(_i < w_1.length)) return [3 /*break*/, 11];
                        watcher = w_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 10]);
                        if (this._disableWatchers &&
                            watcher.identifier !== "Hook") {
                            // this.info("Watcher is Frozen", operation);
                            this.AddToTempStore(tItems, operation, subOperation, tableName, "Other");
                            return [3 /*break*/, 10];
                        }
                        if (this._disableHooks &&
                            watcher.identifier === "Hook") {
                            // this.info("Hook is Frozen", operation);
                            this.AddToTempStore(tItems, operation, subOperation, tableName, "Hook");
                            return [3 /*break*/, 10];
                        }
                        if (!(operation === "onSave" &&
                            watcher.onSave)) return [3 /*break*/, 4];
                        // this.info("Call Watcher", operation);
                        return [4 /*yield*/, watcher.onSave(tItems, subOperation !== null && subOperation !== void 0 ? subOperation : "INSERT")];
                    case 3:
                        // this.info("Call Watcher", operation);
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(operation === "onDelete" &&
                            watcher.onDelete)) return [3 /*break*/, 6];
                        //  this.info("Call Watcher", operation);
                        return [4 /*yield*/, watcher.onDelete(tItems)];
                    case 5:
                        //  this.info("Call Watcher", operation);
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(operation === "onBulkSave" &&
                            watcher.onBulkSave)) return [3 /*break*/, 8];
                        // this.info("Call Watcher", operation);
                        return [4 /*yield*/, watcher.onBulkSave()];
                    case 7:
                        // this.info("Call Watcher", operation);
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_6 = _a.sent();
                        console.error("Watchers.Error:", operation, subOperation, tableName, e_6);
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 1];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        e_7 = _a.sent();
                        console.error("Watchers.Error:", e_7);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.localSave = function (item, insertOnly, tableName, saveAndForget) {
        var _this = this;
        UsefullMethods_1.Functions.validateTableName(item, tableName);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var uiqueItem, table_1, keys_1, _a, _b, sOperations, query_1, args_1, lastItem, error_1;
            var _this = this;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        if (!item) {
                            reject(undefined);
                            return [2 /*return*/];
                        }
                        this.log("Executing Save...");
                        return [4 /*yield*/, this.getUique(item)];
                    case 1:
                        uiqueItem = _d.sent();
                        table_1 = this.tables.find(function (x) { return x.tableName == item.tableName; });
                        _b = (_a = UsefullMethods_1.Functions).getAvailableKeys;
                        return [4 /*yield*/, this.allowedKeys(item.tableName, true)];
                    case 2:
                        keys_1 = _b.apply(_a, [_d.sent(), item]);
                        sOperations = uiqueItem
                            ? "UPDATE"
                            : "INSERT";
                        query_1 = "";
                        args_1 = [];
                        if (uiqueItem) {
                            if (insertOnly) {
                                resolve(item);
                                return [2 /*return*/];
                            }
                            query_1 = "UPDATE ".concat(item.tableName, " SET ");
                            keys_1.forEach(function (k, i) {
                                query_1 +=
                                    " ".concat(k, "=? ") +
                                        (i < keys_1.length - 1 ? "," : "");
                            });
                            query_1 += " WHERE id=?";
                        }
                        else {
                            query_1 = "INSERT INTO ".concat(item.tableName, " (");
                            keys_1.forEach(function (k, i) {
                                query_1 +=
                                    k +
                                        (i < keys_1.length - 1 ? "," : "");
                            });
                            query_1 += ") values(";
                            keys_1.forEach(function (k, i) {
                                query_1 +=
                                    "?" +
                                        (i < keys_1.length - 1 ? "," : "");
                            });
                            query_1 += ")";
                        }
                        keys_1.forEach(function (k, i) {
                            var value = item[k];
                            var column = table_1.props.find(function (x) { return x.columnName.toString() === k; });
                            if (column.columnType === "JSON")
                                value = JSON.stringify(value);
                            var v = value !== null && value !== void 0 ? value : null;
                            v = UsefullMethods_1.Functions.translateAndEncrypt(v, _this, item.tableName, k);
                            args_1.push(v);
                        });
                        if (uiqueItem)
                            item.id = uiqueItem.id;
                        if (uiqueItem != undefined)
                            args_1.push(uiqueItem.id);
                        return [4 /*yield*/, this.execute(query_1, args_1)];
                    case 3:
                        _d.sent();
                        if (!(saveAndForget !== true ||
                            item.id === 0 ||
                            item.id === undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.selectLastRecord(item)];
                    case 4:
                        lastItem = (_c = (_d.sent())) !== null && _c !== void 0 ? _c : item;
                        item.id = lastItem.id;
                        _d.label = 5;
                    case 5: return [4 /*yield*/, this.triggerWatch([item], "onSave", sOperations, item.tableName || tableName)];
                    case 6:
                        _d.sent();
                        resolve(item);
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _d.sent();
                        console.error(error_1, item);
                        reject(error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    };
    Database.prototype.localDelete = function (items, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var q;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q = "DELETE FROM ".concat(tableName, " WHERE id IN (").concat(items
                            .map(function (x) { return "?"; })
                            .join(","), ")");
                        return [4 /*yield*/, this.execute(q, items.map(function (x) { return x.id; }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.getUique = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, trimValue, filter, addedisUnique, table, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(item.id != undefined && item.id > 0)) return [3 /*break*/, 2];
                        _b = (_a = UsefullMethods_1.Functions).single;
                        return [4 /*yield*/, this.where(item.tableName, { id: item.id })];
                    case 1: return [2 /*return*/, _b.apply(_a, [_e.sent()])];
                    case 2:
                        this.log("Executing getUique...");
                        trimValue = function (value) {
                            if (typeof value === "string")
                                return value.trim();
                            return value;
                        };
                        filter = {};
                        addedisUnique = false;
                        table = this.tables.find(function (x) { return x.tableName === item.tableName; });
                        if (table)
                            table.props
                                .filter(function (x) { return x.isUnique === true; })
                                .forEach(function (x) {
                                var anyItem = item;
                                var columnName = x.columnName;
                                if (anyItem[columnName] !== undefined &&
                                    anyItem[columnName] !== null) {
                                    filter[columnName] = trimValue(anyItem[columnName]);
                                    addedisUnique = true;
                                }
                            });
                        if (!addedisUnique)
                            return [2 /*return*/, undefined];
                        _d = (_c = UsefullMethods_1.Functions).single;
                        return [4 /*yield*/, this.where(item.tableName, filter)];
                    case 3: return [2 /*return*/, _d.apply(_c, [_e.sent()])];
                }
            });
        });
    };
    Database.prototype.selectLastRecord = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.log("Executing SelectLastRecord... ");
                        if (!item.tableName) {
                            this.log("TableName cannot be empty for:", item);
                            return [2 /*return*/];
                        }
                        _b = (_a = UsefullMethods_1.Functions).single;
                        return [4 /*yield*/, this.find(!item.id || item.id <= 0
                                ? "SELECT * FROM ".concat(item.tableName, " ORDER BY id DESC LIMIT 1;")
                                : "SELECT * FROM ".concat(item.tableName, " WHERE id=?;"), item.id && item.id > 0
                                ? [item.id]
                                : undefined, item.tableName)];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()).map(function (x) {
                                x.tableName = item.tableName;
                                return x;
                            })])];
                }
            });
        });
    };
    Database.prototype.wait = function (ms) {
        return new Promise(function (resolve, reject) {
            return setTimeout(resolve, ms !== null && ms !== void 0 ? ms : 100);
        });
    };
    //#endregion
    //#region public Methods for Select
    Database.prototype.disableWatchers = function () {
        this._disableWatchers = true;
        return this;
    };
    Database.prototype.enableWatchers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._disableWatchers = false;
                        return [4 /*yield*/, this.executeStore("Other")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.disableHooks = function () {
        this._disableHooks = true;
        return this;
    };
    Database.prototype.enableHooks = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._disableHooks = false;
                        return [4 /*yield*/, this.executeStore("Hook")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.beginTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.resetRefresher();
                        if (this.transacting)
                            return [2 /*return*/];
                        this.info("creating transaction");
                        return [4 /*yield*/, this.execute("begin transaction")];
                    case 1:
                        _a.sent();
                        this.transacting = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.resetRefresher();
                        if (!this.transacting)
                            return [2 /*return*/];
                        this.info("commiting transaction");
                        return [4 /*yield*/, this.execute("commit")];
                    case 1:
                        _a.sent();
                        this.transacting = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.resetRefresher();
                        if (!this.transacting)
                            return [2 /*return*/];
                        this.info("rollback transaction");
                        return [4 /*yield*/, this.execute("rollback")];
                    case 1:
                        _a.sent();
                        this.transacting = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.startRefresher = function (ms) {
        var _this = this;
        if (this.timer)
            clearInterval(this.timer);
        this.refresherSettings = { ms: ms };
        this.timer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var h, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        h = Math.abs(this.timeStamp - new Date()) /
                            36e5;
                        if (h < 2 ||
                            this.isClosing ||
                            this.isClosed)
                            return [2 /*return*/];
                        _a = this.info;
                        _b = ["db refresh:"];
                        return [4 /*yield*/, this.tryToClose()];
                    case 1:
                        _a.apply(this, _b.concat([_c.sent()]));
                        return [2 /*return*/];
                }
            });
        }); }, ms);
    };
    Database.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = this.db;
                        if (!(db && db.closeAsync != undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, db.closeAsync()];
                    case 1:
                        _a.sent();
                        this.isOpen = false;
                        this.isClosed = true;
                        this.db = undefined;
                        this.isClosing = false;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.tryToClose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, db, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        db = this.db;
                        if (!this.db || !this.isOpen)
                            return [2 /*return*/, false];
                        if (db.closeAsync === undefined)
                            throw "Cant close the database, name cant be undefined";
                        if (this.isLocked())
                            return [2 /*return*/, false];
                        this.isClosing = true;
                        return [4 /*yield*/, db.closeAsync()];
                    case 2:
                        _a.sent();
                        r = true;
                        return [2 /*return*/, true];
                    case 3:
                        e_8 = _a.sent();
                        console.error(e_8);
                        return [2 /*return*/, false];
                    case 4:
                        if (r) {
                            this.isOpen = false;
                            this.isClosed = true;
                            this.db = undefined;
                        }
                        this.isClosing = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.watch = function (tableName) {
        var watcher = new Watcher(tableName);
        watchers.push(watcher);
        return watcher;
    };
    Database.prototype.asQueryable = function (item, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        UsefullMethods_1.Functions.validateTableName(item, tableName);
                        db = this;
                        return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(item, db)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Database.prototype.querySelector = function (tableName) {
        return new QuerySelector_1.default(tableName, this);
    };
    Database.prototype.save = function (items, insertOnly, tableName, saveAndForget) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var tItems, returnItem, _i, tItems_1, item, _b, _c, e_9;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tItems = Array.isArray(items)
                            ? items
                            : [items];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        returnItem = [];
                        _i = 0, tItems_1 = tItems;
                        _d.label = 2;
                    case 2:
                        if (!(_i < tItems_1.length)) return [3 /*break*/, 5];
                        item = tItems_1[_i];
                        _c = (_b = returnItem).push;
                        return [4 /*yield*/, this.localSave(item, insertOnly, tableName, saveAndForget)];
                    case 3:
                        _c.apply(_b, [(_a = (_d.sent())) !== null && _a !== void 0 ? _a : item]);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, returnItem];
                    case 6:
                        e_9 = _d.sent();
                        console.error(e_9);
                        throw e_9;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.delete = function (items, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var tItems, _i, _a, key, e_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        tItems = (Array.isArray(items) ? items : [items]).reduce(function (v, c) {
                            var x = UsefullMethods_1.Functions.validateTableName(c, tableName);
                            if (v[x.tableName])
                                v[x.tableName].push(c);
                            else
                                v[x.tableName] = [c];
                            return v;
                        }, {});
                        _i = 0, _a = Object.keys(tItems);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        key = _a[_i];
                        return [4 /*yield*/, this.localDelete(tItems[key], key)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.triggerWatch(tItems[key], "onDelete", undefined, tableName)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_10 = _b.sent();
                        console.error(e_10);
                        throw e_10;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.jsonToSql = function (jsonQuery, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = UsefullMethods_1.Functions.jsonToSqlite(jsonQuery);
                        return [4 /*yield*/, this.find(query.sql, query.args, tableName)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Database.prototype.where = function (tableName, query) {
        return __awaiter(this, void 0, void 0, function () {
            var q;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q = UsefullMethods_1.Functions.translateSimpleSql(this, tableName, query);
                        return [4 /*yield*/, this.find(q.sql, q.args, tableName)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    Database.prototype.find = function (query, args, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var db, result, table_2, booleanColumns_1, dateColumns_1, jsonColumns_1, translateKeys, items, _i, result_2, row, item, translatedItem, rItem, e_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.timeStamp = new Date();
                        return [4 /*yield*/, this.dataBase()];
                    case 1:
                        db = _a.sent();
                        this.info("executing find:", query);
                        return [4 /*yield*/, db.getAllAsync.apply(db, __spreadArray([query], (args !== null && args !== void 0 ? args : []), false))];
                    case 2:
                        result = _a.sent();
                        table_2 = this.tables.find(function (x) { return x.tableName == tableName; });
                        booleanColumns_1 = table_2 === null || table_2 === void 0 ? void 0 : table_2.props.filter(function (x) { return x.columnType == "Boolean"; });
                        dateColumns_1 = table_2 === null || table_2 === void 0 ? void 0 : table_2.props.filter(function (x) { return x.columnType == "DateTime"; });
                        jsonColumns_1 = table_2 === null || table_2 === void 0 ? void 0 : table_2.props.filter(function (x) { return x.columnType == "JSON"; });
                        translateKeys = function (item) {
                            if (!item || !table_2)
                                return item;
                            jsonColumns_1.forEach(function (column) {
                                var columnName = column.columnName;
                                if (item[columnName] != undefined &&
                                    item[columnName] != null &&
                                    item[columnName] != "")
                                    item[columnName] = JSON.parse(item[columnName]);
                            });
                            booleanColumns_1.forEach(function (column) {
                                var columnName = column.columnName;
                                if (item[columnName] != undefined &&
                                    item[columnName] != null) {
                                    if (item[columnName] === 0 ||
                                        item[columnName] === "0" ||
                                        item[columnName] === false)
                                        item[columnName] = false;
                                    else
                                        item[columnName] = true;
                                }
                            });
                            dateColumns_1.forEach(function (column) {
                                var columnName = column.columnName;
                                if (item[columnName] != undefined &&
                                    item[columnName] != null &&
                                    item[columnName].length > 0) {
                                    try {
                                        item[columnName] = new Date(item[columnName]);
                                    }
                                    catch (_a) {
                                        /// ignore
                                    }
                                }
                            });
                            return item;
                        };
                        items = [];
                        for (_i = 0, result_2 = result; _i < result_2.length; _i++) {
                            row = result_2[_i];
                            item = row;
                            if (tableName)
                                item.tableName = tableName;
                            translatedItem = translateKeys(item);
                            UsefullMethods_1.Functions.oDecrypt(translatedItem, table_2);
                            if (table_2 && table_2.typeProptoType)
                                translatedItem =
                                    UsefullMethods_1.Functions.createSqlInstaceOfType(table_2.typeProptoType, translatedItem);
                            rItem = table_2 && table_2.itemCreate
                                ? table_2.itemCreate(translatedItem)
                                : translatedItem;
                            items.push(rItem);
                        }
                        return [2 /*return*/, items];
                    case 3:
                        e_11 = _a.sent();
                        console.error(e_11);
                        throw e_11;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Database.prototype.bulkSave = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var item, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = BulkSave_1.default.bind;
                        _b = [void 0, this];
                        return [4 /*yield*/, this.allowedKeys(tableName, true)];
                    case 1:
                        item = new (_a.apply(BulkSave_1.default, _b.concat([_c.sent(), tableName])))();
                        return [2 /*return*/, item];
                }
            });
        });
    };
    //#endregion
    //#region TableSetup
    Database.prototype.tableHasChanges = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var tbBuilder, appSettingsKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tbBuilder = item;
                        return [4 /*yield*/, this.allowedKeys(tbBuilder.tableName)];
                    case 1:
                        appSettingsKeys = _a.sent();
                        return [2 /*return*/, (appSettingsKeys.filter(function (x) { return x != "id"; })
                                .length !=
                                tbBuilder.props.filter(function (x) { return x.columnName != "id"; }).length ||
                                tbBuilder.props.filter(function (x) {
                                    return x.columnName != "id" &&
                                        !appSettingsKeys.find(function (a) { return a == x.columnName; });
                                }).length > 0)];
                }
            });
        });
    };
    Database.prototype.migrateNewChanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbType, sqls, _loop_2, this_1, _i, _a, table, _b, sqls_1, sql, e_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        dbType = function (columnType) {
                            if (columnType == "Boolean" ||
                                columnType == "Number")
                                return "INTEGER";
                            if (columnType == "Decimal")
                                return "REAL";
                            if (columnType == "BLOB")
                                return "BLOB";
                            return "TEXT";
                        };
                        sqls = [];
                        _loop_2 = function () {
                            var keys, rColumns, aColumns;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        this_1.log("migrating-check ".concat(table.tableName));
                                        return [4 /*yield*/, this_1.allowedKeys(table.tableName, false, true)];
                                    case 1:
                                        keys = _d.sent();
                                        rColumns = keys.filter(function (x) {
                                            return !table.props.find(function (k) { return x == k.columnName.toString(); });
                                        });
                                        aColumns = table.props.filter(function (x) {
                                            return !keys.find(function (k) { return k == x.columnName.toString(); });
                                        });
                                        rColumns.forEach(function (x) {
                                            sqls.push("ALTER TABLE ".concat(table.tableName, " DROP COLUMN ").concat(x));
                                        });
                                        aColumns.forEach(function (x) {
                                            sqls.push("ALTER TABLE ".concat(table.tableName, " ADD COLUMN ").concat(x.columnName.toString(), " ").concat(dbType(x.columnType)));
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = this.tables;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        table = _a[_i];
                        return [5 /*yield**/, _loop_2()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.log("migrating");
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 17, , 20]);
                        if (!(sqls.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.beginTransaction()];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, this.execute("PRAGMA foreign_keys=OFF")];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        _b = 0, sqls_1 = sqls;
                        _c.label = 9;
                    case 9:
                        if (!(_b < sqls_1.length)) return [3 /*break*/, 12];
                        sql = sqls_1[_b];
                        return [4 /*yield*/, this.execute(sql)];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11:
                        _b++;
                        return [3 /*break*/, 9];
                    case 12:
                        if (!(sqls.length > 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.execute("PRAGMA foreign_keys=ON")];
                    case 13:
                        _c.sent();
                        return [4 /*yield*/, this.commitTransaction()];
                    case 14:
                        _c.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        this.log("The database is upp to date, no migration needed");
                        _c.label = 16;
                    case 16: return [3 /*break*/, 20];
                    case 17:
                        e_12 = _c.sent();
                        return [4 /*yield*/, this.execute("PRAGMA foreign_keys=ON")];
                    case 18:
                        _c.sent();
                        return [4 /*yield*/, this.rollbackTransaction()];
                    case 19:
                        _c.sent();
                        console.error("migrating failed", e_12);
                        throw e_12;
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    Database.dbIni = false;
    return Database;
}());
