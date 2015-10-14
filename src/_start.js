/*
 * angular-purge - v0.0.1 - 2015-10-14
 * https://github.com/VanMess/angular-purge
 * Copyright (c) 2014 Van (http://vanmess.github.io/)
 */
 !(function(factory) {
   if (typeof define === 'function' && define.amd) {
        // AMD
        define(['angular'], factory);
    } else {
        // Global Variables
        factory(window.angular);
    }
    factory(window.angular);
})(function(ng) {
        'use strict';
