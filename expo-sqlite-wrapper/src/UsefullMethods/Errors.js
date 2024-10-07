"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StringBuilder_1 = require("./StringBuilder");
var Errors = /** @class */ (function () {
    function Errors() {
    }
    Errors.prototype.missingTableBuilder = function (tableName) {
        var str = new StringBuilder_1.default().append("Missing TableBuilder for", tableName);
        console.error(str.toString());
        return str.toString();
    };
    return Errors;
}());
var errors = new Errors();
exports.default = errors;
