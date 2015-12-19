'use strict';

angular.module('app').directive('location', function($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
        },
        templateUrl: 'views/templates/location.html'
    }
});

