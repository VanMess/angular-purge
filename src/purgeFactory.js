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
