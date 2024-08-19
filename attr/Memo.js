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
var Methods_1 = require("../Methods");
var Storage_1 = require("./Storage");
var getKey = function (option, propertyName, target) {
    var args = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args[_i - 3] = arguments[_i];
    }
    if (option.argsOverride)
        args = option.argsOverride.apply(option, args);
    var key = JSON.stringify(args);
    if (!option.argsOverride)
        key += propertyName;
    key =
        "memoizing." +
            key
                .replace(/(\/|-|\.|:|"|'|\{|\}|\[|\]|\,| |\’)/gim, "")
                .toLowerCase();
    if (option.keyModifier !== undefined)
        key += option.keyModifier(target, key);
    return key.toLowerCase() + ".json";
};
var callingFun = new Map();
function Memorize(option) {
    if (!option.storage)
        option.storage = new Storage_1.default();
    if (!option.storage) {
        console.error("storage cannnot be null");
        throw "storage cannnot be null";
    }
    return function (target, propertyKey, descriptor) {
        var currentFn = descriptor.value;
        descriptor.value = function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var key, data, data2, e_1, e_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            key = getKey(option, propertyKey, this, args);
                            _b.label = 1;
                        case 1:
                            if (!callingFun.has(key)) return [3 /*break*/, 3];
                            return [4 /*yield*/, (0, Methods_1.sleep)(10)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 1];
                        case 3:
                            data = null;
                            callingFun.set(key, true);
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 22, 23, 24]);
                            if (!option.storage) return [3 /*break*/, 21];
                            return [4 /*yield*/, option.storage.has(key)];
                        case 5:
                            if (!((_b.sent()) &&
                                !option.isDebug)) return [3 /*break*/, 7];
                            return [4 /*yield*/, option.storage.get(key)];
                        case 6:
                            data = _b.sent();
                            _b.label = 7;
                        case 7:
                            if (data &&
                                typeof data.date === "string")
                                data.date = new Date(data.date);
                            if (!(!data ||
                                (0, Methods_1.days_between)(data.date) >=
                                    option.daysToSave
                                || (option.updateIfTrue && option.updateIfTrue(data.data)))) return [3 /*break*/, 21];
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 20, , 21]);
                            return [4 /*yield*/, currentFn.bind(this).apply(void 0, args)];
                        case 9:
                            data2 = _b.sent();
                            if (!(!option.isDebug || 1 == 1)) return [3 /*break*/, 18];
                            if (!data2) return [3 /*break*/, 17];
                            if (!(!option.validator ||
                                option.validator(data2))) return [3 /*break*/, 13];
                            if (!data) return [3 /*break*/, 11];
                            return [4 /*yield*/, option.storage.delete(key)];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11: return [4 /*yield*/, option.storage.set(key, {
                                date: new Date(),
                                data: data2
                            })];
                        case 12:
                            _b.sent();
                            return [2 /*return*/, data2];
                        case 13:
                            if (!data) return [3 /*break*/, 16];
                            return [4 /*yield*/, option.storage.delete(key)];
                        case 14:
                            _b.sent();
                            data.date = new Date();
                            return [4 /*yield*/, option.storage.set(key, data)];
                        case 15:
                            _b.sent(); // extend the date
                            _b.label = 16;
                        case 16: return [2 /*return*/, (_a = data === null || data === void 0 ? void 0 : data.data) !== null && _a !== void 0 ? _a : data2];
                        case 17: return [3 /*break*/, 19];
                        case 18:
                            data = {
                                data: data2,
                                date: new Date()
                            };
                            _b.label = 19;
                        case 19: return [3 /*break*/, 21];
                        case 20:
                            e_1 = _b.sent();
                            console.error("MemoizingError", e_1);
                            return [3 /*break*/, 21];
                        case 21: return [2 /*return*/, data === null || data === void 0 ? void 0 : data.data];
                        case 22:
                            e_2 = _b.sent();
                            console.error("MemoizingError", e_2);
                            return [3 /*break*/, 24];
                        case 23:
                            callingFun.delete(key);
                            return [7 /*endfinally*/];
                        case 24: return [2 /*return*/];
                    }
                });
            });
        };
    };
}
exports.default = Memorize;
