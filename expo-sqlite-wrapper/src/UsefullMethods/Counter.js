"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Counter = /** @class */ (function () {
    function Counter(items) {
        this.currentIndex = -1;
        this.items = items;
    }
    Object.defineProperty(Counter.prototype, "length", {
        get: function () {
            return this.items.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Counter.prototype, "hasNext", {
        get: function () {
            return this.currentIndex + 1 < this.items.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Counter.prototype, "hasPrev", {
        get: function () {
            return this.currentIndex - 1 >= 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Counter.prototype, "hasCurrent", {
        get: function () {
            if (this.currentIndex >= 0 && this.currentIndex < this.items.length)
                return true;
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Counter.prototype, "next", {
        get: function () {
            if (this.hasNext) {
                this.currentIndex++;
                return this.items[this.currentIndex];
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Counter.prototype, "prev", {
        get: function () {
            if (this.hasPrev) {
                return this.items[this.currentIndex - 1];
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Counter.prototype, "current", {
        get: function () {
            return this.items[this.currentIndex];
        },
        enumerable: false,
        configurable: true
    });
    Counter.prototype.index = function (index) {
        if (index >= 0 && index < this.items.length)
            return this.items[index];
        return undefined;
    };
    return Counter;
}());
exports.default = Counter;
