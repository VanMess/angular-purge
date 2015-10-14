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
