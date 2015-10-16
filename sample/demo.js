!(function(ng, $root) {
    'use strict';
    var purgeMapping = {
        'user': {
            'name': 'user_name',
            'email': 'user_account',
            'avatar': 'user_avatar'
        },
        'userParam': {
            'user_name': 'name',
            'user_account': 'email',
            'user_avatar': 'avatar'
        }
    };
    purgeMapping.book = {
        'name': 'book_name',
        'price': 'book_price',
        'author': {
            mapping: 'book_author',
            child: purgeMapping.user
        }
    };
    purgeMapping.bookParam = {
        'book_name': 'name',
        'book_price': 'price',
        'book_author': {
            mapping: 'author',
            child: purgeMapping.userParam
        }
    };



    ng

    .module('vgPurge.demo', ['vgPurge', 'ngResource'])

    // 配置 转换器
    .config([
        'vgPurgeProvider',
        function(purgeProvider) {
            for (var i in purgeMapping) {
                purgeProvider.$reg(i, purgeMapping[i]);
            }
        }
    ])

    // 配置store
    .factory('userStore', [
        '$resource',
        function($resource) {
            return $resource('/user', {}, {
                get: {
                    method: 'get',
                    dataFormat: 'user'
                },
                getSource: {
                    method: 'get'
                }
            });
        }
    ])

    .factory('bookStore', [
        '$resource',
        function($resource) {
            return $resource('/book', {}, {
                get: {
                    method: 'get',
                    dataFormat: 'book'
                },
                getSource: {
                    method: 'get'
                }
            });
        }
    ])

    .controller('DemoController', [
        'userStore',
        'bookStore',
        '$http',
        function(userStore, bookStore, $http) {
            var ctrl = this;
            ctrl.mappings = purgeMapping;
            ctrl.book = bookStore.get();
            ctrl.bookSource = bookStore.getSource();

            ctrl.user = userStore.get();
            ctrl.userSource = userStore.getSource();
            ctrl.user.$promise.then(function() {
                $http({
                    method: 'post',
                    url: '/user',
                    data: ctrl.user,
                    paramFormat: 'userParam'
                }).then(function(req) {
                    ctrl.userParam = req.config.data;
                });
                $http({
                    method: 'post',
                    url: '/user',
                    data: ctrl.user
                }).then(function(req) {
                    ctrl.userParamSource = req.config.data;
                });
            });
        }
    ]);

    // 定义假数据
    Mock.mockjax(ng.module('vgPurge.demo'));
    Mock.mock('/user', {
        'user_name': '@cname(5)',
        'user_account': '@email',
        'user_avatar': '@image("250x250")'
    }).mock('/book', {
        'book_name': '@cname',
        'book_price|100-1000': 1,
        'book_author': {
            'user_name': '@cname(5)',
            'user_account': '@email',
            'user_avatar': '@image("250x250")'
        }
    });

    ng.bootstrap($root, ['vgPurge.demo']);
})(window.angular, window.document);
