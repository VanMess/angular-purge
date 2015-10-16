/*
    {name:'name',type:'auto',mapping:'name',formatter:function|name,format:'yyyy-dd-mm',defaults:1,child:[modelConfig]}
*/
ng.module(libraryName).factory(libraryName + '.parsers', [

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
