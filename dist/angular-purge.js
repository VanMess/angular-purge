/*
 * angular-purge - v0.0.1 - 2015-10-14
 * https://github.com/VanMess/angular-purge
 * Copyright (c) 2014 Van (http://vanmess.github.io/)
 */
 !(function(factory) {
   if (typeof define === 'function' && define.amd) {
        // AMD
        define(['angular'], factory);
    } else {
        // Global Variables
        factory(window.angular);
    }
})(function(ng) {
        'use strict';

var libraryName = 'vgPurge';
// Modules
ng.module(libraryName, []);

/*
 *  模块配置
 */
ng
    .module(libraryName)
    .provider('purge.config', function() {
        var cfg = {
                requestFormatProperty: 'paramFormat',
                responseFormatProperty: 'dataFormat'
            },
            factory = {
                $set: function(config) {
                    ng.extend(cfg, config);
                },
                $get: function() {
                    return cfg;
                }
            };

        return factory;
    });

Object.keys = Object.keys || (function(obj) { //ecma262v5 15.2.3.14
    var hasOwn = Object.prototype.hasOwnProperty,
        DONT_ENUM = 'propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor'.split(',');
    return function(obj) {
        var result = [],
            key;
        for (key in obj) {
            if (hasOwn.call(obj, key)) {
                result.push(key);
            }
        }
        if (DONT_ENUM && obj) {
            for (var i = 0; i < DONT_ENUM.length; i++) {
                key = DONT_ENUM[i++];
                if (hasOwn.call(obj, key)) {
                    result.push(key);
                }
            }
        }
        return result;
    };
})();

/*
 *  枚举值转换器
 */
ng.module(libraryName).provider('purge.enumParser', [

    function() {
        var ENUM_DEFAULT_PROPERTY = 'default',
            systemEnums = {},
            provider = {
                /*
                 * 注册
                 * @param {string} name:
                 * - 枚举的名称
                 * @param {object} enumDefine:
                 * - 枚举对应值
                 *
                 * @return null
                 */
                $reg: function(name, enumDefine) {
                    var tst;
                    if (ng.isObject(name)) {
                        tst = name;
                    } else {
                        tst = {};
                        tst[name] = enumDefine;
                    }
                    ng.forEach(tst, function(i, key, value) {
                        systemEnums[key] = value;
                    });
                },
                $get: function() {
                    return function(current, config) {
                        var next, enumDefine;
                        if (config.hasOwnProperty('enum')) {
                            next = function(data) {
                                var value = current(data),
                                    hasMatch = false,
                                    enumDefine;
                                if (systemEnums.hasOwnProperty(config['enum'])) {
                                    enumDefine = systemEnums[config['enum']];
                                    if (!!config['enumReverse']) {
                                        value = _map(enumDefine, value);
                                    } else {
                                        value = enumDefine.hasOwnProperty(value) ? enumDefine[value] : enumDefine[ENUM_DEFAULT_PROPERTY];
                                    }
                                }
                                return value;
                            };
                        } else {
                            next = current;
                        }
                        return next;
                    };
                }
            };

        return provider;


        function _map(enumDefine, value) {
            var keys = Object.keys(enumDefine);

            for (var j = 0; j < keys.length; j++) {
                if (enumDefine.hasOwnProperty(j) && enumDefine[j] === value) {
                    return j;
                }
            }
            return null;
        }
    }
]).run(['purge.parsers', 'purge.enumParser',
    function(parsers, enumParser) {
        parsers.push(enumParser);
    }
]);

/*
 *  格式化器
 */
ng.module(libraryName).provider('purge.typeParser', [

    function() {
        var transporters = {
                'string': function(value) {
                    return value + '';
                },
                'int': function(value) {
                    return +value;
                },
                'float': function(value) {
                    return +value;
                },
                'date': function(value) {
                    return new Date(value);
                },
                'bool': function(value) {
                    return value && true;
                }
            },
            provider = {
                /*
                 * 注册格式化器
                 * @param {string} name:
                 * - 格式化器的名称
                 * @param {function} transporter:
                 * - 格式化器
                 *
                 * @return null
                 */
                $reg: function(name, transporter) {
                    var tst;
                    if (ng.isObject(name)) {
                        tst = name;
                    } else {
                        tst = {};
                        tst[name] = transporter;
                    }
                    ng.forEach(tst, function(i, key, value) {
                        transporters[key] = value;
                    });
                },
                $get: function() {
                    return function(current, config) {
                        var next, tmp = ng.isFunction(config) ? config : config.formatter;
                        if (ng.isFunction(tmp)) {
                            next = function(data) {
                                var value = current(data);
                                return tmp(value, config.format);
                            };
                        } else if (ng.isString(config.formatter) && ng.isFunction(transporters[config.formatter])) {
                            next = function(data) {
                                var value = current(data);
                                return transporters[config.formatter](value, config.format);
                            };
                        } else {
                            next = current;
                        }
                        return next;
                    };
                }
            };

        return provider;
    }
]).run(['purge.parsers', 'purge.typeParser',
    function(parsers, typeParser) {
        parsers.unshift(typeParser);
    }
]);

/*
    {name:'name',type:'auto',mapping:'name',formatter:function|name,format:'yyyy-dd-mm',defaults:1,child:[modelConfig]}
*/
ng.module(libraryName).factory('purge.parsers', [

    function() {
        var channels = [
                // 转换子元素
                function(current, config) {
                    var next, childModel;
                    if (config.hasOwnProperty('child')) {
                        childModel = new PurgeClass(config['child']);
                        next = function(data) {
                            var value = current(data);
                            return value === null ? value : childModel.parse(value);
                        }
                    } else {
                        next = current;
                    }
                    return next;
                },
                // 设置默认值
                function(current, config) {
                    var next;
                    if (config.hasOwnProperty('defaults')) {
                        next = function(data) {
                            var value = current(data);
                            if (ng.isUndefined(value) || value + '' === 'null') value = ng.copy(config.defaults);
                            return value;
                        };
                    } else {
                        next = current;
                    }
                    return next;
                }
            ],
            factory = {
                /*
                 *   队列首插入处理管道
                 */
                unshift: function(channel) {
                    if (ng.isFunction(channel)) {
                        channels.unshift(channel);
                    }
                    // todo: 此处插入异常处理
                },
                /*
                 *   队列末尾插入处理管道
                 */
                push: function(channel) {
                    if (ng.isFunction(channel)) {
                        channels.push(channel);
                    }
                    // todo: 此处插入异常处理
                },
                get: function() {
                    return channels;
                }
            };

        return factory;
    }
]);

/*
 * 模块主入口
 * 配置：
 * {type:'auto',mapping:'name',formatter:function|name,format:'yyyy-dd-mm',defaults:1,child:[modelConfig]}
 */
ng.module(libraryName)
    .provider('purge', [

        function() {
            var provider = {
                $reg: function(name, modelConfig) {
                    var cfgs;
                    if (ng.isObject(name)) {
                        cfgs = name;
                    } else {
                        cfgs = {};
                        cfgs[name + ''] = modelConfig;
                    }

                    ng.forEach(cfgs, function(value, key) {
                        purgeHelper(key, value);
                    });
                    return provider;
                },
                $get: [
                    'purge.parsers',
                    function(parsers) {
                        PurgeClass.setChannels(parsers.get());
                        purgeHelper.$$init();
                        return purgeHelper.get;
                    }
                ]
            };
            return provider;
        }
    ]);

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

/*
 */
var purgeHelper = (function() {
    var cache = {},
        modelInit = function(modelConfig) {
            var config = {};
            if (ng.isFunction(modelConfig)) {
                config = modelConfig;
            } else {
                for (var i in modelConfig) {
                    if (ng.isUndefined(modelConfig[i])) continue;
                    config[i] = modelParse(i, modelConfig[i]);
                }
            }
            return config;
        },
        modelParse = function(name, cfg) {
            var defaults = {
                    type: 'auto'
                },
                standarCfg;
            if (ng.isString(cfg)) {
                standarCfg = ng.extend({}, defaults, {
                    name: name,
                    mapping: cfg
                });
            } else if (ng.isObject(cfg)) {
                standarCfg = ng.extend({}, defaults, {
                    name: name,
                    mapping: name
                }, cfg);
            }

            if (!!cfg && cfg.hasOwnProperty('child') && ng.isObject(cfg['child'])) {
                standarCfg['child'] = modelInit(cfg['child']);
            }
            return standarCfg;
        };

    var _runblocks = [],
        result = function(name, modelConfig) {
            var init = (function(name, modelConfig) {
                return function() {
                    var modelId = name,
                        config = modelInit(modelConfig);

                    if (cache.hasOwnProperty(modelId)) {
                        // todo: 抛出异常
                    }
                    cache[modelId] = new PurgeClass(config);
                    cache[modelId]['id'] = modelId;
                    return cache[modelId];
                };
            })(name, modelConfig);

            _runblocks.push(init);
        };

    result.get = function(modelId) {
        if (cache[modelId] instanceof PurgeClass) {
            return cache[modelId];
        }
        return undefined;
    };
    result.remove = function(modelId) {
        if (cache[modelId] instanceof PurgeClass) {
            cache[modelId] = undefined;
        }
    };
    result.clear = function() {
        cache = {};
    };
    result.$$init = function() {
        ng.forEach(_runblocks, function(func) {
            func();
        });
        _runblocks = [];
    };

    return result;
})();

/*
 *  配置并使用 http 管道
 */
ng.module(libraryName)
    .config(['$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push(['$q', 'purge.config', 'purge', _itcp]);
        }
    ]);


function _itcp($q, purgeConfig, purge) {
    return {
        'request': function(config) {
            var model = null,
                property = purgeConfig.requestFormatProperty;

            if (ng.isObject(config.data) && config.hasOwnProperty(property)) {
                if (ng.isFunction(config[property])) {
                    // 支持函数模式的 purge 定义
                    model = config[property];
                    config.data = model(config.data);
                } else if (ng.isString(config[property])) {
                    // 从已注册的purge转换器中查找
                    model = purge(config[property] + '');
                    if (ng.isObject(model) && ng.isFunction(model.parse)) {
                        config.data = model.parse(config.data);
                    }
                    // todo : 抛出异常
                }
            }
            return $q.when(config);
        },
        'response': function(response) {
            var model = null,
                property = purgeConfig.responseFormatProperty,
                config = response.config;

            if (config.hasOwnProperty(property)) {
                if (ng.isFunction(config[property])) {
                    // 支持函数模式的 purge 定义
                    model = config[property];
                    response.data = model(response.data)
                } else if (ng.isString(config[property])) {
                    // 从已注册的purge转换器中查找
                    model = purge(config[property]);
                    if (ng.isObject(model) && ng.isFunction(model.parse)) {
                        response.data = model.parse(response.data);
                    }
                    // todo : 抛出异常
                }
            }

            return $q.when(response);
        }
    };
}

});
