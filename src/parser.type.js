/*
 *  格式化器
 */
ng.module(libraryName).provider(libraryName + '.typeParser', [

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
]).run([libraryName + '.parsers', libraryName + '.typeParser',
    function(parsers, typeParser) {
        parsers.unshift(typeParser);
    }
]);
