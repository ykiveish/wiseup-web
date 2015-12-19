'use strict';

angular.module('app').directive('responder', function($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
        },
        templateUrl: 'views/templates/responder.html'
    }
});