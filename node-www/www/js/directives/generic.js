'use strict';

angular.module('app').directive('generic', function($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
        },
        templateUrl: 'views/templates/generic.html'
    }
});