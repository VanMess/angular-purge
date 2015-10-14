/*
 */
ng.module(libraryName)
    .factory('purge.helper', [

        function() {
            var cache = {},
                modelInit = function(modelConfig) {
                    var config = {};
                    if (ng.isFunction(modelConfig)) {
                        config = modelConfig;
                    } else {
                        config = modelParse(modelConfig);
                    }
                    return config;
                },
                modelParse = function(name, cfg) {
                    var defaults = {
                            type: 'auto'
                        },
                        standarCfg;
                    if (_.isString(cfg)) {
                        standarCfg = _.extend({}, defaults, {
                            mapping: cfg
                        });
                    } else if (_.isObject(cfg)) {
                        standarCfg = _.extend({}, defaults, cfg);
                    }

                    if (cfg.hasOwnProperty('child') && ng.isObject(cfg['child'])) {
                        standarCfg['child'] = modelInit(cfg['child']);
                    }
                    return standarCfg;
                };

            var result = function(modelConfig) {
                var modelId = name,
                    config = modelInit(name, modelConfig);

                if (cache.hasOwnProperty(modelId)) {
                    // todo: 抛出异常
                }
                cache[modelId] = new PurgeClass(config);
                cache[modelId]['id'] = modelId;
                return cache[modelId];
            };

            result.get = function(modelId) {
                if (cache[modelId] instanceof Model) {
                    return cache[modelId];
                }
                return undefined;
            };
            result.remove = function(modelId) {
                if (cache[modelId] instanceof Model) {
                    cache[modelId] = undefined;
                }
            };
            result.clear = function() {
                cache = {};
            };

            return result;
        }
    ]);
