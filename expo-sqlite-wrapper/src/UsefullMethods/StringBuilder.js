"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StringBuilder = /** @class */ (function () {
    function StringBuilder(text) {
        this.text = text !== null && text !== void 0 ? text : "";
    }
    Object.defineProperty(StringBuilder.prototype, "isEmpty", {
        get: function () {
            if (this.text.trim().length <= 0)
                return true;
            return false;
        },
        enumerable: false,
        configurable: true
    });
    StringBuilder.prototype.append = function () {
        var _this = this;
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        texts.forEach(function (x) {
            if (x.length > 0 && !_this.text.endsWith(" "))
                _this.text += " ";
            _this.text += x;
        });
        return this;
    };
    StringBuilder.prototype.prepend = function () {
        var _this = this;
        var texts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            texts[_i] = arguments[_i];
        }
        texts.forEach(function (x) {
            if (x.length > 0 && !_this.text.startsWith(" "))
                _this.text = " " + _this.text;
            _this.text = x + _this.text;
        });
        return this;
    };
    StringBuilder.prototype.trimEnd = function () {
        var _this = this;
        var q = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            q[_i] = arguments[_i];
        }
        this.text = this.text.trim();
        q.forEach(function (x) {
            if (_this.text.endsWith(x))
                _this.text = _this.text.substring(0, _this.text.length - 1);
        });
        return this;
    };
    StringBuilder.prototype.indexOf = function (search) {
        return this.text.indexOf(search);
    };
    StringBuilder.prototype.replaceIndexOf = function (text, replacement) {
        var index = this.text.indexOf(text);
        this.text = this.text.substring(0, index) + replacement + this.text.substring(index + text.length);
        return this;
    };
    StringBuilder.prototype.toString = function () {
        return this.text;
    };
    return StringBuilder;
}());
exports.default = StringBuilder;
