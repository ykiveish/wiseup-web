'use strict';

var app = angular.module('app', ['ngRoute', 'ngResource']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: "/views/sensors.html",
                controller: 'sensorsController'
            }).when('/sensors', {
                templateUrl: "/views/sensors.html",
                controller: 'sensorsController'
            }).when('/map', {
                templateUrl: "/views/map.html",
                controller: 'mapController'
            }).when('/widgets', {
                templateUrl: "/views/widgets.html",
                controller: 'widgetInfoController'
            }).when('/settings', {
                templateUrl: "/views/settings.html"
            }).when('/widget/:script_uuid', {
                templateUrl: "/views/widget.html",
                controller: 'widgetController'
            }).otherwise({
                redirectTo: '/'
            });
    }
]);
