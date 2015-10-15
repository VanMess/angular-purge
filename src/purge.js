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
