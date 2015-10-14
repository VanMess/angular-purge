Object.keys = Object.keys || (function(obj) { //ecma262v5 15.2.3.14
    var hasOwn = Object.prototype.hasOwnProperty,
        DONT_ENUM = 'propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor'.split(',');
    return function(obj) {
        var result = [];
        for (var key in obj)
            if (hasOwn.call(obj, key)) {
                result.push(key);
            }
        if (DONT_ENUM && obj) {
            for (var i = 0; key = DONT_ENUM[i++];) {
                if (hasOwn.call(obj, key)) {
                    result.push(key);
                }
            }
        }
        return result;
    };
})();
