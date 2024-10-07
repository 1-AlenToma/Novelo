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
var Functions_1 = require("./Functions");
var QValue = /** @class */ (function () {
    function QValue() {
        this.type = "QValue";
    }
    QValue.prototype.validate = function () {
        this.isInnerSelect = this.value && this.value.getInnerSelectSql !== undefined;
        this.isFunction = Functions_1.default.isFunc(this.value);
    };
    QValue.prototype.toSqlValue = function (database, tableName, column) {
        return Functions_1.default.translateAndEncrypt(this.value, database, tableName, column);
    };
    QValue.prototype.getInnserSelectorValue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var items, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.selector)
                            throw "Database cannot be null";
                        return [4 /*yield*/, this.value.toList()];
                    case 1:
                        items = _a.sent();
                        res = [];
                        items.forEach(function (x) {
                            for (var k in x) {
                                var v = x[k];
                                if (k === "tableName" || !Functions_1.default.isPrimitive(v))
                                    continue;
                                res.push(v);
                            }
                        });
                        this.value = res;
                        return [2 /*return*/];
                }
            });
        });
    };
    QValue.prototype.map = function (fn) {
        var _this = this;
        return this.toArray().map(function (x) {
            var item = QValue.Q;
            item.isColumn = _this.isColumn;
            item.args = _this.args;
            item.isFunction = _this.isFunction;
            item.Value(x);
            return fn(item);
        });
    };
    QValue.prototype.toArray = function () {
        return Array.isArray(this.value) ? this.value : [this.value];
    };
    QValue.prototype.toType = function () {
        return this.value;
    };
    QValue.prototype.getColumn = function (jsonExpression) {
        try {
            if (typeof this.value === "string")
                return this.value;
            else {
                return this.toType()(jsonExpression, Functions_1.default.aliasNameming).toString().split(",").filter(function (x) { return x.length > 0; }).join(",");
            }
        }
        catch (e) {
            console.error(e, this);
            throw e;
        }
    };
    QValue.prototype.getColumns = function (jsonExpression) {
        if (typeof this.value === "string")
            return [this.value];
        else {
            return this.toType()(jsonExpression, Functions_1.default.aliasNameming).toString().split(",").filter(function (x) { return x.length > 1; });
        }
    };
    Object.defineProperty(QValue, "Q", {
        get: function () {
            return new QValue();
        },
        enumerable: false,
        configurable: true
    });
    QValue.prototype.Value = function (value) {
        this.value = value;
        this.validate();
        return this;
    };
    QValue.prototype.Value2 = function (value) {
        this.value2 = value;
        return this;
    };
    QValue.prototype.Args = function (args) {
        this.args = args;
        return this;
    };
    QValue.prototype.IsColumn = function (isColumn) {
        this.isColumn = isColumn;
        return this;
    };
    QValue.prototype.Alias = function (alias) {
        this.alias = alias;
        return this;
    };
    QValue.prototype.getInnerSelect = function (param) {
        var sql = this.value.getInnerSelectSql();
        return param.indexOf("(") === -1 ? "(".concat(sql, ")") : "".concat(sql);
    };
    return QValue;
}());
exports.default = QValue;
