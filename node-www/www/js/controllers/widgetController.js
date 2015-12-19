'use strict';

angular.module('app').controller('widgetController', function($scope, serverService, $http, $routeParams) {
    $scope.app_content = "HELLO";
    
    $scope.GetScriptUI = function (user_key, callback) {
        $http.get (serverService.server + 'api/get_script_ui/' + user_key + "/" + $routeParams.script_uuid).
        success(function(data, status, headers, config) {
            data = data.replace("<USER_KEY>", "85994f97-5fb4-2915-6ccf-98c3bf16f664");
            callback (data);
        }).
        error(function(data, status, headers, config) {
        });
    }
    
    $scope.GetScriptUI ("85994f97-5fb4-2915-6ccf-98c3bf16f664", function (html) {
        $scope.app_content = html.substring(1, html.length - 1);
        $("#app-content").append($scope.app_content);
    });
});