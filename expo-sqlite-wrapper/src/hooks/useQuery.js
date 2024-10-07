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
var UsefullMethods_1 = require("../UsefullMethods");
var react_1 = require("react");
var UseQuery = function (query, dbContext, tableName, onItemChange, updateIf) {
    var _a = (0, react_1.useState)(), _ = _a[0], setUpdater = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var dataRef = (0, react_1.useRef)([]);
    var refTimer = (0, react_1.useRef)();
    var refWatcher = (0, react_1.useRef)(dbContext.watch(tableName));
    var refMounted = (0, react_1.useRef)(false);
    var refreshData = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!refMounted.current)
                return [2 /*return*/];
            clearTimeout(refTimer.current);
            refTimer.current = setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                var sQuery, iQuery, fn, _a, r, _i, _b, x, _c, _d, r, _e, _f, x, _g, _h, e_1;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            _j.trys.push([0, 15, 16, 17]);
                            if (!refMounted.current)
                                return [2 /*return*/];
                            setIsLoading(true);
                            sQuery = query;
                            iQuery = query;
                            fn = query;
                            if (!(iQuery.Column !== undefined)) return [3 /*break*/, 2];
                            _a = dataRef;
                            return [4 /*yield*/, iQuery.toList()];
                        case 1:
                            _a.current = _j.sent();
                            return [3 /*break*/, 14];
                        case 2:
                            if (!!UsefullMethods_1.Functions.isFunc(query)) return [3 /*break*/, 8];
                            r = [];
                            _i = 0;
                            return [4 /*yield*/, dbContext.find(sQuery.sql, sQuery.args, tableName)];
                        case 3:
                            _b = _j.sent();
                            _j.label = 4;
                        case 4:
                            if (!(_i < _b.length)) return [3 /*break*/, 7];
                            x = _b[_i];
                            _d = (_c = r).push;
                            return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(x, dbContext)];
                        case 5:
                            _d.apply(_c, [_j.sent()]);
                            _j.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7:
                            dataRef.current = r;
                            return [3 /*break*/, 14];
                        case 8:
                            r = [];
                            _e = 0;
                            return [4 /*yield*/, fn()];
                        case 9:
                            _f = _j.sent();
                            _j.label = 10;
                        case 10:
                            if (!(_e < _f.length)) return [3 /*break*/, 13];
                            x = _f[_e];
                            _h = (_g = r).push;
                            return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(x, dbContext)];
                        case 11:
                            _h.apply(_g, [_j.sent()]);
                            _j.label = 12;
                        case 12:
                            _e++;
                            return [3 /*break*/, 10];
                        case 13:
                            dataRef.current = r;
                            _j.label = 14;
                        case 14:
                            update();
                            return [3 /*break*/, 17];
                        case 15:
                            e_1 = _j.sent();
                            console.error(e_1);
                            return [3 /*break*/, 17];
                        case 16:
                            setIsLoading(false);
                            return [7 /*endfinally*/];
                        case 17: return [2 /*return*/];
                    }
                });
            }); }, 0);
            return [2 /*return*/];
        });
    }); };
    var update = function () {
        if (!refMounted.current)
            return;
        setUpdater(function (x) { return ((x !== null && x !== void 0 ? x : 0) > 100 ? 0 : x !== null && x !== void 0 ? x : 0) + 1; });
    };
    var onSave = function (items, operation) { return __awaiter(void 0, void 0, void 0, function () {
        var itemsAdded, r, _i, itemsAdded_1, x, _a, _b, e_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    if (!refMounted.current)
                        return [2 /*return*/];
                    if (updateIf && !updateIf(__spreadArray([], items, true), operation))
                        return [2 /*return*/];
                    if (!(onItemChange == undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, refreshData()];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 2:
                    setIsLoading(true);
                    items = __spreadArray(__spreadArray([], items, true), dataRef.current.filter(function (x) { return !items.find(function (a) { return a.id == x.id; }); }), true);
                    itemsAdded = onItemChange(items);
                    r = [];
                    _i = 0, itemsAdded_1 = itemsAdded;
                    _c.label = 3;
                case 3:
                    if (!(_i < itemsAdded_1.length)) return [3 /*break*/, 6];
                    x = itemsAdded_1[_i];
                    _b = (_a = r).push;
                    return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(x, dbContext)];
                case 4:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    dataRef.current = r;
                    update();
                    setIsLoading(false);
                    _c.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    e_2 = _c.sent();
                    console.error(e_2);
                    setIsLoading(false);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var onDelete = function (items) { return __awaiter(void 0, void 0, void 0, function () {
        var updateList_1, r_1, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!refMounted.current)
                        return [2 /*return*/];
                    updateList_1 = false;
                    r_1 = __spreadArray([], dataRef.current, true);
                    items.forEach(function (a) {
                        if (r_1.find(function (x) { return a.id == x.id; })) {
                            r_1.splice(r_1.findIndex(function (x) { return a.id == x.id; }), 1);
                            updateList_1 = true;
                        }
                    });
                    if (!updateList_1) return [3 /*break*/, 1];
                    dataRef.current = r_1;
                    update();
                    return [3 /*break*/, 3];
                case 1:
                    if (!(items.length <= 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, refreshData()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    console.error(e_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var onBulkSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!refMounted.current)
                        return [2 /*return*/];
                    return [4 /*yield*/, refreshData()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    refWatcher.current.identifier = "Hook";
    refWatcher.current.onSave = function (items, operation) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, onSave(items, operation)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); }); };
    refWatcher.current.onBulkSave = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, onBulkSave()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); }); };
    refWatcher.current.onDelete = function (items) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, onDelete(items)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); }); };
    (0, react_1.useEffect)(function () {
        refMounted.current = true;
        refreshData();
        return function () {
            clearTimeout(refTimer.current);
            refWatcher.current.removeWatch();
            refMounted.current = false;
        };
    }, []);
    return [
        dataRef.current,
        isLoading,
        refreshData,
        dbContext
    ];
};
exports.default = UseQuery;
