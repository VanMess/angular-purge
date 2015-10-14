/*
 *  配置并使用 http 管道
 */
ng.module(libraryName)
    .factory('purge.interceptor', [

        function() {
            var itcp = function($q, purgeConfig, purge) {
                return {
                    'request': function(config) {
                        var model = null,
                            property = purgeConfig.requestFormatProperty;

                        if (ng.isObject(config.data) && config.hasOwnProperty(property)) {
                            if (ng.isFunction(config[property])) {
                                // 支持函数模式的 purge 定义
                                model = config[property];
                                config.data = model(config.data)
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
            };
            return ['$q', 'purge.config', 'purge', itcp];
        }
    ]).config(['$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push('purge.interceptor');
        }
    ]);
