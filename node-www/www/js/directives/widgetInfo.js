'use strict';

angular.module('app').directive('widgetinfo', function($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
            onLaunch: '&'
        },
        templateUrl: 'views/templates/widget_info.html'
    }
});