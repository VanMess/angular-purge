/*
 * 模块主入口
 * 配置：
 * {type:'auto',mapping:'name',formatter:function|name,format:'yyyy-dd-mm',defaults:1,child:[modelConfig]}
 */
ng.module(libraryName)
    .provider('purge', [
        'purge.helper',
        function(purgeHelper) {
            var provider = {
                $reg: function(name, modelConfig) {
                    var cfgs;
                    if (ng.isObject(name)) {
                        cfgs = name;
                    } else {
                        cfgs = {};
                        cfgs[name + ''] = modelConfig;
                    }

                    ng.forEach(cfgs, function(i, key, value) {
                        purgeHelper(key, value);
                    });
                },
                $get: function() {
                    return purgeHelper.get;
                }
            };
            return provider;
        }
    ]);
