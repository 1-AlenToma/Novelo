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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Param = exports.IBaseModule = exports.IId = void 0;
var IId = /** @class */ (function () {
    function IId(id) {
        this.id = id !== null && id !== void 0 ? id : id;
    }
    return IId;
}());
exports.IId = IId;
var IBaseModule = /** @class */ (function (_super) {
    __extends(IBaseModule, _super);
    function IBaseModule(tableName, id) {
        var _this = _super.call(this, id) || this;
        _this.tableName = tableName;
        return _this;
    }
    return IBaseModule;
}(IId));
exports.IBaseModule = IBaseModule;
var Param;
(function (Param) {
    Param["StartParameter"] = "#(";
    Param["EqualTo"] = "#=";
    Param["EndParameter"] = "#)";
    Param["OR"] = "#OR";
    Param["AND"] = "#AND";
    Param["LessThan"] = "#<";
    Param["GreaterThan"] = "#>";
    Param["IN"] = "#IN";
    Param["NotIn"] = "#NOT IN";
    Param["NULL"] = "#IS NULL";
    Param["NotNULL"] = "#IS NOT NULL";
    Param["NotEqualTo"] = "#!=";
    Param["Contains"] = "#like";
    Param["StartWith"] = "S#like";
    Param["EndWith"] = "E#like";
    Param["EqualAndGreaterThen"] = "#>=";
    Param["EqualAndLessThen"] = "#<=";
    Param["OrderByDesc"] = "#Order By #C DESC";
    Param["OrderByAsc"] = "#Order By #C ASC";
    Param["Limit"] = "#Limit #Counter";
})(Param || (exports.Param = Param = {}));
var OUseQuery = function (tableName, query, onDbItemsChanged) {
    return [
        [],
        {},
        new Function(),
        {}
    ];
};
