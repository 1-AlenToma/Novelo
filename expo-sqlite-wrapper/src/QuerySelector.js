"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Where = exports.Param = void 0;
var QuerySelectorTranslator_1 = require("./QuerySelectorTranslator");
var UsefullMethods_1 = require("./UsefullMethods");
var Param;
(function (Param) {
    Param["StartParameter"] = "#(";
    Param["EqualTo"] = "#=";
    Param["EndParameter"] = "#)";
    Param["OR"] = "#OR";
    Param["AND"] = "#AND";
    Param["LessThan"] = "#<";
    Param["GreaterThan"] = "#>";
    Param["IN"] = "#IN(";
    Param["Not"] = "#NOT";
    Param["NULL"] = "#IS NULL";
    Param["NotNULL"] = "#IS NOT NULL";
    Param["NotEqualTo"] = "#!=";
    Param["Contains"] = "C#like";
    Param["StartWith"] = "S#like";
    Param["EndWith"] = "E#like";
    Param["EqualAndGreaterThen"] = "#>=";
    Param["EqualAndLessThen"] = "#<=";
    Param["OrderByDesc"] = "#Order By #C DESC";
    Param["OrderByAsc"] = "#Order By #C ASC";
    Param["Limit"] = "#Limit #Counter";
    Param["GroupBy"] = "#GROUP BY";
    Param["InnerJoin"] = "#INNER JOIN";
    Param["LeftJoin"] = "#LEFT JOIN";
    Param["RightJoin"] = "#RIGHT JOIN";
    Param["CrossJoin"] = "#CROSS JOIN";
    Param["Join"] = "#JOIN";
    Param["Max"] = "#MAX";
    Param["Min"] = "#MIN";
    Param["Count"] = "#COUNT";
    Param["Sum"] = "#SUM";
    Param["Total"] = "#Total";
    Param["GroupConcat"] = "#GroupConcat";
    Param["Avg"] = "#AVG";
    Param["Between"] = "#BETWEEN";
    Param["Value"] = "#Value";
    Param["Concat"] = "#Concat";
    Param["Union"] = "#UNION";
    Param["UnionAll"] = "#UNION ALL";
    Param["Case"] = "#CASE";
    Param["When"] = "#WHEN";
    Param["Then"] = "#THEN";
    Param["Else"] = "#ELSE";
    Param["EndCase"] = "#END";
})(Param || (exports.Param = Param = {}));
var ReturnMethods = /** @class */ (function () {
    function ReturnMethods(parent) {
        this.parent = parent;
    }
    ReturnMethods.prototype.firstOrDefault = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parent.firstOrDefault()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ReturnMethods.prototype.toList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parent.toList()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ReturnMethods.prototype.findOrSave = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parent.findOrSave(item)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ReturnMethods.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parent.delete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * get the translated sqlQuery
     */
    ReturnMethods.prototype.getSql = function (sqlType) {
        return this.parent.getSql(sqlType);
    };
    /**
     * get a simple sql
     * @returns sql string
     */
    ReturnMethods.prototype.getInnerSelectSql = function () {
        return this.parent.getInnerSelectSql();
    };
    return ReturnMethods;
}());
var QueryColumnSelector = /** @class */ (function (_super) {
    __extends(QueryColumnSelector, _super);
    function QueryColumnSelector(parent) {
        var _this = _super.call(this, parent) || this;
        _this.columns = [];
        _this.cases = [];
        return _this;
    }
    QueryColumnSelector.prototype.Case = function (alias) {
        var _this = this;
        var caseItems = new Where(this.parent.tableName, this.parent, alias, Param.Case);
        Object.defineProperty(caseItems, "EndCase", {
            get: function () {
                caseItems.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.EndCase));
                return _this;
            }
        });
        this.cases.push(caseItems);
        return caseItems;
    };
    QueryColumnSelector.prototype.Cast = function (converter) {
        this.parent.converter = converter;
        return this;
    };
    QueryColumnSelector.prototype.Columns = function (columns) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns));
        return this;
    };
    QueryColumnSelector.prototype.Concat = function (alias, collectCharacters_type) {
        var columnOrValues = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            columnOrValues[_i - 2] = arguments[_i];
        }
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columnOrValues)
            .Args(Param.Concat)
            .Value2(collectCharacters_type)
            .Alias(alias));
        return this;
    };
    QueryColumnSelector.prototype.Max = function (columns, alias) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.Max)
            .Alias(alias));
        return this;
    };
    QueryColumnSelector.prototype.Min = function (columns, alias) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.Min)
            .Alias(alias));
        return this;
    };
    QueryColumnSelector.prototype.Count = function (columns, alias) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.Count)
            .Alias(alias));
        return this;
    };
    QueryColumnSelector.prototype.Sum = function (columns, alias) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.Sum)
            .Alias(alias));
        return this;
    };
    QueryColumnSelector.prototype.Total = function (columns, alias) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.Total)
            .Alias(alias));
        return this;
    };
    QueryColumnSelector.prototype.GroupConcat = function (columns, alias, seperator) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.GroupConcat)
            .Alias(alias)
            .Value2(seperator));
        return this;
    };
    QueryColumnSelector.prototype.Avg = function (columns, alias) {
        this.parent.clear();
        this.columns.push(UsefullMethods_1.QValue.Q.Value(columns)
            .Args(Param.Avg)
            .Alias(alias));
        return this;
    };
    Object.defineProperty(QueryColumnSelector.prototype, "Having", {
        get: function () {
            this.parent.clear();
            this.parent.having = new Where(this.parent.tableName, this.parent);
            return this.parent.having;
        },
        enumerable: false,
        configurable: true
    });
    return QueryColumnSelector;
}(ReturnMethods));
var Where = /** @class */ (function (_super) {
    __extends(Where, _super);
    function Where(tableName, parent, alias) {
        var queries = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            queries[_i - 3] = arguments[_i];
        }
        var _this = _super.call(this, parent) || this;
        _this.type = "QuerySelector";
        _this.Queries = queries.map(function (x) {
            return x.type != "QValue" ? UsefullMethods_1.QValue.Q.Args(x) : x;
        });
        _this.tableName = tableName;
        _this.alias = alias;
        return _this;
    }
    Where.prototype.LoadChildren = function (child, childColumn, parentColumn, assignTo, isArray) {
        this.parent.children.push({
            parentProperty: parentColumn,
            parentTable: this.parent.tableName,
            childProperty: childColumn,
            childTableName: child,
            assignTo: assignTo,
            isArray: isArray !== null && isArray !== void 0 ? isArray : false
        });
        return this;
    };
    Object.defineProperty(Where.prototype, "Case", {
        get: function () {
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Case));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "When", {
        get: function () {
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.When));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "Then", {
        get: function () {
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Then));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "EndCase", {
        get: function () {
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.EndCase));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "Else", {
        get: function () {
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Else));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Where.prototype.Value = function (value) {
        this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Value).Value(value));
        return this;
    };
    Where.prototype.Between = function (value1, value2) {
        this.parent.clear();
        if (this.Queries.length > 0) {
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Between));
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Value).Value(value1));
            this.AND;
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Value).Value(value2));
        }
        return this;
    };
    Where.prototype.Cast = function (converter) {
        this.parent.converter = converter;
        return this;
    };
    Object.defineProperty(Where.prototype, "Select", {
        get: function () {
            this.parent.queryColumnSelector =
                new QueryColumnSelector(this.parent);
            return this.parent.queryColumnSelector;
        },
        enumerable: false,
        configurable: true
    });
    Where.prototype.Column = function (column) {
        this.parent.clear();
        this.Queries.push(UsefullMethods_1.QValue.Q.Value(column).IsColumn(true));
        return this;
    };
    Where.prototype.Concat = function (collectCharacters_type) {
        var columnOrValues = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            columnOrValues[_i - 1] = arguments[_i];
        }
        this.parent.clear();
        this.Queries.push(UsefullMethods_1.QValue.Q.Value(columnOrValues)
            .Args(Param.Concat)
            .Value2(collectCharacters_type));
        return this;
    };
    Where.prototype.EqualTo = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.EqualTo));
        return this;
    };
    Where.prototype.NotEqualTo = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.NotEqualTo));
        return this;
    };
    Where.prototype.EqualAndGreaterThen = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.EqualAndGreaterThen));
        return this;
    };
    Where.prototype.EqualAndLessThen = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.EqualAndLessThen));
        return this;
    };
    Object.defineProperty(Where.prototype, "Start", {
        get: function () {
            this.parent.clear();
            this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.StartParameter));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "End", {
        get: function () {
            this.parent.clear();
            if (this.Queries.length > 0)
                this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.EndParameter));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "OR", {
        get: function () {
            this.parent.clear();
            if (this.Queries.length > 0)
                this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.OR));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "AND", {
        get: function () {
            this.parent.clear();
            if (this.Queries.length > 0)
                this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.AND));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Where.prototype.GreaterThan = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.GreaterThan));
        return this;
    };
    Where.prototype.LessThan = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.LessThan));
        return this;
    };
    Where.prototype.IN = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.IN));
        return this;
    };
    Object.defineProperty(Where.prototype, "Not", {
        get: function () {
            this.parent.clear();
            if (this.Queries.length > 0)
                this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.Not));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "Null", {
        get: function () {
            this.parent.clear();
            if (this.Queries.length > 0)
                this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.NULL));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Where.prototype, "NotNull", {
        get: function () {
            this.parent.clear();
            if (this.Queries.length > 0)
                this.Queries.push(UsefullMethods_1.QValue.Q.Args(Param.NotNULL));
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Where.prototype.Contains = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.Contains));
        return this;
    };
    Where.prototype.StartsWith = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.StartWith));
        return this;
    };
    Where.prototype.EndsWith = function (value) {
        this.parent.clear();
        if (this.Queries.length > 0)
            this.Queries.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.EndWith));
        return this;
    };
    Where.prototype.OrderByAsc = function (columnName) {
        this.parent.clear();
        this.parent.others.push(UsefullMethods_1.QValue.Q.Value(columnName).Args(Param.OrderByAsc));
        return this;
    };
    Where.prototype.OrderByDesc = function (columnName) {
        this.parent.clear();
        this.parent.others.push(UsefullMethods_1.QValue.Q.Value(columnName).Args(Param.OrderByDesc));
        return this;
    };
    Where.prototype.Limit = function (value) {
        this.parent.clear();
        this.parent.others =
            this.parent.others.filter(function (x) { return x.args !== Param.Limit; });
        this.parent.others.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.Limit));
        return this;
    };
    Where.prototype.GroupBy = function (columnName) {
        this.parent.clear();
        this.parent.others.push(UsefullMethods_1.QValue.Q.Value(columnName).Args(Param.GroupBy));
        return this;
    };
    Where.prototype.InnerJoin = function (tableName, alias) {
        this.parent.clear();
        if (this.alias == alias ||
            this.parent.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.parent.buildJsonExpression(tableName, alias);
        var join = new Where(tableName, this.parent, alias, Param.InnerJoin);
        this.parent.joins.push(join);
        return join;
    };
    Where.prototype.CrossJoin = function (tableName, alias) {
        this.parent.clear();
        if (this.alias == alias ||
            this.parent.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.parent.buildJsonExpression(tableName, alias);
        var join = new Where(tableName, this.parent, alias, Param.CrossJoin);
        this.parent.joins.push(join);
        return join;
    };
    Where.prototype.LeftJoin = function (tableName, alias) {
        this.parent.clear();
        if (this.alias == alias ||
            this.parent.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.parent.buildJsonExpression(tableName, alias);
        var join = new Where(tableName, this.parent, alias, Param.LeftJoin);
        this.parent.joins.push(join);
        return join;
    };
    Where.prototype.Join = function (tableName, alias) {
        this.parent.clear();
        if (this.alias == alias ||
            this.parent.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.parent.buildJsonExpression(tableName, alias);
        var join = new Where(tableName, this.parent, alias, Param.Join);
        this.parent.joins.push(join);
        return join;
    };
    Where.prototype.RightJoin = function (tableName, alias) {
        this.parent.clear();
        if (this.alias == alias ||
            this.parent.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.parent.buildJsonExpression(tableName, alias);
        var join = new Where(tableName, this.parent, alias, Param.RightJoin);
        this.parent.joins.push(join);
        return join;
    };
    Where.prototype.Union = function () {
        var _this = this;
        var queryselectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            queryselectors[_i] = arguments[_i];
        }
        queryselectors.forEach(function (x) {
            return _this.parent.unions.push({
                type: Param.Union,
                value: x(_this.parent.database)
            });
        });
        return this;
    };
    Where.prototype.UnionAll = function () {
        var _this = this;
        var queryselectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            queryselectors[_i] = arguments[_i];
        }
        queryselectors.forEach(function (x) {
            return _this.parent.unions.push({
                type: Param.UnionAll,
                value: x(_this.parent.database)
            });
        });
        return this;
    };
    Object.defineProperty(Where.prototype, "Where", {
        get: function () {
            this.parent.clear();
            this.parent.where = new Where(this.tableName, this.parent, undefined);
            return this.parent.where;
        },
        enumerable: false,
        configurable: true
    });
    return Where;
}(ReturnMethods));
exports.Where = Where;
var QuerySelector = /** @class */ (function () {
    function QuerySelector(tableName, database) {
        this.type = "QuerySelector";
        this.tableName = tableName;
        this.joins = [];
        this.database =
            database;
        this.jsonExpression = {};
        this.buildJsonExpression(tableName, tableName, true);
        this.buildJsonExpression(tableName, "a");
        this.others = [];
        this.children = [];
        this.unions = [];
    }
    QuerySelector.prototype.clear = function () {
        this.translator = undefined;
    };
    QuerySelector.prototype.buildJsonExpression = function (tableName, alias, isInit) {
        this.queryColumnSelector = undefined;
        this.jsonExpression =
            UsefullMethods_1.Functions.buildJsonExpression(this.jsonExpression, this.database, tableName, alias, isInit);
    };
    Object.defineProperty(QuerySelector.prototype, "Select", {
        get: function () {
            this.queryColumnSelector =
                new QueryColumnSelector(this);
            return this.queryColumnSelector;
        },
        enumerable: false,
        configurable: true
    });
    QuerySelector.prototype.Union = function () {
        var _this = this;
        var queryselectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            queryselectors[_i] = arguments[_i];
        }
        queryselectors.forEach(function (x) {
            return _this.unions.push({
                type: Param.Union,
                value: x(_this.database)
            });
        });
        return this;
    };
    QuerySelector.prototype.UnionAll = function () {
        var _this = this;
        var queryselectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            queryselectors[_i] = arguments[_i];
        }
        queryselectors.forEach(function (x) {
            return _this.unions.push({
                type: Param.UnionAll,
                value: x(_this.database)
            });
        });
        return this;
    };
    QuerySelector.prototype.InnerJoin = function (tableName, alias) {
        if (this.alias == alias ||
            this.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.alias = "a";
        this.buildJsonExpression(tableName, alias);
        this.others = [];
        var join = new Where(tableName, this, alias, Param.InnerJoin);
        this.joins.push(join);
        return join;
    };
    QuerySelector.prototype.CrossJoin = function (tableName, alias) {
        if (this.alias == alias ||
            this.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.alias = "a";
        this.buildJsonExpression(tableName, alias);
        this.others = [];
        var join = new Where(tableName, this, alias, Param.CrossJoin);
        this.joins.push(join);
        return join;
    };
    QuerySelector.prototype.LeftJoin = function (tableName, alias) {
        if (this.alias == alias ||
            this.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.alias = "a";
        this.buildJsonExpression(tableName, alias);
        this.others = [];
        var join = new Where(tableName, this, alias, Param.LeftJoin);
        this.joins.push(join);
        return join;
    };
    QuerySelector.prototype.Join = function (tableName, alias) {
        if (this.alias == alias ||
            this.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.alias = "a";
        this.buildJsonExpression(tableName, alias);
        this.others = [];
        var join = new Where(tableName, this, alias, Param.Join);
        this.joins.push(join);
        return join;
    };
    QuerySelector.prototype.RightJoin = function (tableName, alias) {
        if (this.alias == alias ||
            this.joins.find(function (x) { return x.alias == alias; }))
            throw "alias can not be ".concat(alias, ", it is already in use");
        this.alias = "a";
        this.buildJsonExpression(tableName, alias);
        this.others = [];
        var join = new Where(tableName, this, alias, Param.RightJoin);
        this.joins.push(join);
        return join;
    };
    QuerySelector.prototype.LoadChildren = function (child, childColumn, parentColumn, assignTo, isArray) {
        this.children.push({
            parentProperty: parentColumn,
            parentTable: this.tableName,
            childProperty: childColumn,
            childTableName: child,
            assignTo: assignTo,
            isArray: isArray !== null && isArray !== void 0 ? isArray : false
        });
        return this;
    };
    QuerySelector.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = this.getSql("DELETE");
                        console.log("Execute delete:" + item.sql);
                        return [4 /*yield*/, this.database.execute(item.sql, item.args)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.database.triggerWatch([], "onDelete", undefined, this.tableName)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    QuerySelector.prototype.findOrSave = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, dbItem, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        sql = this.getSql("SELECT");
                        item.tableName = this.tableName;
                        _b = (_a = UsefullMethods_1.Functions).single;
                        return [4 /*yield*/, this.database.find(sql.sql, sql.args, this.tableName)];
                    case 1:
                        dbItem = _b.apply(_a, [_e.sent()]);
                        if (!!dbItem) return [3 /*break*/, 3];
                        _d = (_c = UsefullMethods_1.Functions).single;
                        return [4 /*yield*/, this.database.save(item, false, this.tableName)];
                    case 2:
                        dbItem = _d.apply(_c, [_e.sent()]);
                        _e.label = 3;
                    case 3:
                        dbItem.tableName = this.tableName;
                        if (dbItem && this.converter)
                            dbItem = this.converter(dbItem);
                        return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(dbItem, this.database, this.children)];
                    case 4: return [2 /*return*/, _e.sent()];
                }
            });
        });
    };
    QuerySelector.prototype.firstOrDefault = function () {
        return __awaiter(this, void 0, void 0, function () {
            var item, tItem, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        item = this.getSql("SELECT");
                        _b = (_a = UsefullMethods_1.Functions).single;
                        return [4 /*yield*/, this.database.find(item.sql, item.args, this.tableName)];
                    case 1:
                        tItem = _b.apply(_a, [_d.sent()]);
                        if (tItem && this.converter)
                            tItem = this.converter(tItem);
                        if (!tItem) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(tItem, this.database, this.children)];
                    case 2:
                        _c = _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _c = undefined;
                        _d.label = 4;
                    case 4: return [2 /*return*/, _c];
                }
            });
        });
    };
    QuerySelector.prototype.toList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sql, result, _i, _a, x, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        sql = this.getSql("SELECT");
                        result = [];
                        _i = 0;
                        return [4 /*yield*/, this.database.find(sql.sql, sql.args, this.tableName)];
                    case 1:
                        _a = _d.sent();
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        x = _a[_i];
                        x.tableName = this.tableName;
                        if (this.converter)
                            x = this.converter(x);
                        _c = (_b = result).push;
                        return [4 /*yield*/, (0, UsefullMethods_1.createQueryResultType)(x, this.database, this.children)];
                    case 3:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    QuerySelector.prototype.getSql = function (sqlType) {
        return (this.translator = this.translator
            ? this.translator
            : new QuerySelectorTranslator_1.default(this)).translate(sqlType);
    };
    QuerySelector.prototype.getInnerSelectSql = function () {
        return (this.translator = this.translator
            ? this.translator
            : new QuerySelectorTranslator_1.default(this)).translateToInnerSelectSql();
    };
    QuerySelector.prototype.OrderByAsc = function (columnName) {
        this.clear();
        this.others.push(UsefullMethods_1.QValue.Q.Value(columnName).Args(Param.OrderByAsc));
        return this;
    };
    QuerySelector.prototype.OrderByDesc = function (columnName) {
        this.clear();
        this.others.push(UsefullMethods_1.QValue.Q.Value(columnName).Args(Param.OrderByDesc));
        return this;
    };
    QuerySelector.prototype.Limit = function (value) {
        this.clear();
        this.others = this.others.filter(function (x) { return x.args !== Param.Limit; });
        this.others.push(UsefullMethods_1.QValue.Q.Value(value).Args(Param.Limit));
        return this;
    };
    QuerySelector.prototype.GroupBy = function (columnName) {
        this.clear();
        this.others.push(UsefullMethods_1.QValue.Q.Value(columnName).Args(Param.GroupBy));
    };
    Object.defineProperty(QuerySelector.prototype, "Where", {
        get: function () {
            this.where = new Where(this.tableName, this, this.alias);
            return this.where;
        },
        enumerable: false,
        configurable: true
    });
    return QuerySelector;
}());
exports.default = QuerySelector;
