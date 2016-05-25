export { memoize };

var FUNC_ERROR_TEXT = "Expected a function";

var memo = new MapCache();

function memoize(func, resolver) {
    if ((typeof func !== "function") || (resolver && typeof resolver !== "function")) {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function (...items) {
        var key = null;
        if (resolver) {
            key = genereteKey(resolver.apply(this, items));
        } else {
            key = genereteKey(items);
        }
        if (memo.has(key)) {
            return memo.get(key);
        }
        var result = func.apply(this, items);
        memo.set(key, result);
        return result;
    };
    return memoized;
}

function MapCache() {
    this.cache = {};
}

MapCache.prototype.set = function (key, value) {
    this.cache[key] = value;
};

MapCache.prototype.get = function (key) {
    return this.cache[key];
};

MapCache.prototype.has = function (key) {
    for (var i in this.cache) {
        if (i === key) {
            return true;
        }
    }
    return false;
};

function genereteKey(args) {
    var key = "";
    
    args.forEach(function(item, i, args) {
        key += JSON.stringify(item);
    });
    return key;
}
