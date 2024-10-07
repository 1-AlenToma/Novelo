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
Object.defineProperty(exports, "__esModule", { value: true });
var createQueryResultType = function (item, database, children) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _i, children_1, x, filter, items, r, _a, items_1, m, _b, _c, _d, _e;
        var _this = this;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    result = item;
                    result.saveChanges = function () { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = createQueryResultType;
                                return [4 /*yield*/, database.save(result, false, undefined, true)];
                            case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent())[0], database])];
                        }
                    }); }); };
                    result.update = function () {
                        var keys = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            keys[_i] = arguments[_i];
                        }
                        return __awaiter(_this, void 0, void 0, function () {
                            var kItem;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!keys || keys.length <= 0)
                                            return [2 /*return*/];
                                        kItem = { tableName: result.tableName, id: result.id };
                                        keys.forEach(function (k) {
                                            kItem[k] = result[k];
                                        });
                                        return [4 /*yield*/, database.save(kItem, false, undefined, true)];
                                    case 1:
                                        _a.sent();
                                        if (result.id == 0 || result.id === undefined)
                                            result.id = kItem.id;
                                        return [2 /*return*/];
                                }
                            });
                        });
                    };
                    result.delete = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, database.delete(result)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); };
                    if (!(children && children.length > 0)) return [3 /*break*/, 10];
                    _i = 0, children_1 = children;
                    _f.label = 1;
                case 1:
                    if (!(_i < children_1.length)) return [3 /*break*/, 10];
                    x = children_1[_i];
                    if (!(x.childTableName.length > 0 && x.childProperty.length > 0 && x.parentProperty.length > 0 && x.parentTable.length > 0 && x.assignTo.length > 0)) return [3 /*break*/, 9];
                    if (item[x.parentProperty] === undefined) {
                        if (x.isArray)
                            item[x.assignTo] = [];
                        return [3 /*break*/, 9];
                    }
                    filter = {};
                    filter[x.childProperty] = item[x.parentProperty];
                    return [4 /*yield*/, database.where(x.childTableName, filter)];
                case 2:
                    items = _f.sent();
                    if (!x.isArray) return [3 /*break*/, 7];
                    r = [];
                    _a = 0, items_1 = items;
                    _f.label = 3;
                case 3:
                    if (!(_a < items_1.length)) return [3 /*break*/, 6];
                    m = items_1[_a];
                    _c = (_b = r).push;
                    return [4 /*yield*/, createQueryResultType(m, database)];
                case 4:
                    _c.apply(_b, [_f.sent()]);
                    _f.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 3];
                case 6:
                    item[x.assignTo] = r;
                    return [3 /*break*/, 9];
                case 7:
                    if (!(items.length > 0)) return [3 /*break*/, 9];
                    _d = item;
                    _e = x.assignTo;
                    return [4 /*yield*/, createQueryResultType(items[0], database)];
                case 8:
                    _d[_e] = _f.sent();
                    _f.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, result];
            }
        });
    });
};
exports.default = createQueryResultType;
