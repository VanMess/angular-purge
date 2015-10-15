/*
 *    {type:'auto',mapping:'name',formatter:function|name,format:'yyyy-dd-mm',defaults:1,child:[modelConfig], enum:'',enumReverse:false}
 */
var PurgeClass = (function() {
    var parseChannels,

        Model = function(modelConfig) {
            this._parsers = {};
            if (ng.isFunction(modelConfig)) {
                this._parsers = modelConfig;
            } else {
                for (var i in modelConfig) {
                    this._parsers[i] = ng.isFunction(modelConfig[i]) ? modelConfig[i] : _cfgToParser(modelConfig[i]);
                }
            }
        };

    Model.prototype = {
        parse: function(data) {
            var result;
            if (ng.isArray(data)) {
                result = [];
                for (var i = 0; i < data.length; i++) {
                    result.push(this.$$parse(data[i]));
                }
            } else {
                result = this.$$parse(data);
            }
            return result;
        },
        $$parse: function(item) {
            var result = {};
            if (ng.isFunction(this._parsers)) {
                result = this._parsers(item);
            } else {
                for (var i in this._parsers) {
                    result[i] = this._parsers[i](item);
                }
            }
            return result;
        }
    };

    Model.setChannels = _setChannels;

    return Model;

    function _setChannels(channels) {
        parseChannels = channels;
    }

    function _isEmpty(obj) {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            toString = Object.prototype.toString;

        if (obj == null) return true;
        if (obj + '' === 'undefined') return true;
        if (hasOwnProperty.call(obj, 'length') && (toString.call(obj) === '[object Array]' || toString.call(obj) === '[object String]' || hasOwnProperty.call(obj, 'callee'))) {
            return obj.length === 0;
        }
        return Object.keys(obj).length === 0;
    }

    function _getPropertyByPath(data, path) {
        var result = null;
        if (!ng.isString(path) || _isEmpty(path)) {
            return data;
        } else if (!ng.isObject(data)) {
            return data;
        } else {
            path = path.split('.');
            result = data;
            for (var i = 0; i < path.length; i++) {
                if (ng.isObject(result) && result.hasOwnProperty(path[i])) {
                    result = result[path[i]];
                } else {
                    return undefined;
                }
            }
            return result;
        }
    }

    function _cfgToParser(config) {
        var parser = null;

        // 获取mapping值
        parser = function(data) {
            return _getPropertyByPath(data, config.mapping);
        };

        // 经过解析管道，包装转换函数
        ng.forEach(parseChannels, function(node) {
            parser = node(parser, config);
        });

        return parser;
    }
})();
