'use strict';

angular.module('app').controller('widgetController', function($scope, serverService, $http, $routeParams) {
    $scope.app_content = "HELLO";
    $scope.app_server = serverService.server;
    
    $scope.GetScriptUI = function (user_key, callback) {
        $http.get (serverService.server + 'api/get_script_ui/' + user_key + "/" + $routeParams.script_uuid).
        success(function(data, status, headers, config) {
            data = data.replace("<USER_KEY>", serverService.userKey);
            callback (data);
        }).
        error(function(data, status, headers, config) {
        });
    }
	
    /*
     * API AREA
     */
	$scope.API_Test = function () {
		console.log ("TEST_API");
    }
	
	$scope.API_GetImage = function (user_id, script_uuid, path, obj_name, callback) {
        $.get($scope.app_server + "api/get_script_image/" + user_id + "/" + script_uuid + "/" + path, function(data, status) {
            callback (obj_name, "data:image/png;base64," + data);
        });
    }
    
    $scope.API_GetWidgetDB = function (user_id, script_id, callback) {
        $.get($scope.app_server + "api/get_script_db/" + user_id + "/" + script_id, function(data, status) {
            callback (data, status);
        });
    }
    
    $scope.API_SetWidgetDB = function (user_id, script_id, db, callback) {
        $.get($scope.app_server + "api/set_script_db/" + user_id + "/" + script_id + "/" + db, function(data, status) {
            callback (data);
        });
    }
    
    $scope.API_GetUserSensorsInfo = function (user_id, callback) {
        $.get($scope.app_server + "api/get_sensors_info/" + user_id, function(data, status) {
            callback (data, status);
        });
    }
    
    $scope.API_GetUserSensorsInfoByType = function (user_id, callback) {
        $.get($scope.app_server + "api/get_sensors_info/" + user_id, function(data, status) {
            callback (data, status);
        });
    }
    
    $scope.API_AddSensorAssociation = function (data, callback) {
        $.get($scope.app_server + "api/add_sensor_association/" + data.key + "/" + data.script_uuid + "/" + data.sensor_addr, function(data, status) {
            callback (data, status);
        });
    }
    
    $scope.API_RemoveSensorAssociation = function (data, callback) {
        $.get($scope.app_server + "api/remove_sensor_association/" + data.key + "/" + data.script_uuid + "/" + data.sensor_addr, function(data, status) {
            callback (data, status);
        });
    }
    
    $scope.GetScriptUI (serverService.userKey, function (html) {
        $scope.app_content = html.substring(1, html.length - 1);
        $("#app-content").append($scope.app_content);
    });
});