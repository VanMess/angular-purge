/*
 *  枚举值转换器
 */
ng.module(libraryName).provider(libraryName + '.enumParser', [

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
]).run([libraryName + '.parsers', libraryName + '.enumParser',
    function(parsers, enumParser) {
        parsers.push(enumParser);
    }
]);
