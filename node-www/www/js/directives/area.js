'use strict';

angular.module('app').directive('area', function($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
        },
        templateUrl: 'views/templates/area.html'
    }
});