'use strict';

angular.module('app').controller('widgetInfoController', function($scope, widgetInfoService, serverService, $http, $location) {
    $scope.data = widgetInfoService;
    $scope.self = this;
    
    console.log ("widgetInfoController - Loading");
    
    var eventSourceCallback = function() {
        return function(event) {
            $scope.$apply();
        }
    }
    
    var UpdateUI = function() {
        console.log ($scope.data.WidgetInfos);
        $scope.$apply();
    }
    
    $scope.GetUserWidgets = function (user_key, callback) {
        $http.get (serverService.server + 'api/get_users_scripts_info/' + user_key).
        success(function(data, status, headers, config) {
            callback (data);
        }).
        error(function(data, status, headers, config) {
            console.log ("GetUserWidgets ERROR");
        });
    }
    
    $scope.GetScriptIcon = function (req_info, callback) {
        $http.get (serverService.server + 'api/get_script_icon/' + req_info.user_key + "/" + req_info.script_uuid).
        success(function(data, status, headers, config) {
            callback ({
                image: data,
                script_id: req_info.script_id
            });
        }).
        error(function(data, status, headers, config) {
        });
    }
    
    $scope.GetUserWidgets (serverService.userKey, function (widgets) {
        $scope.data.WidgetInfos = "";
        if (widgets.status == "SUCCESS") {
            $scope.data.WidgetInfos = widgets.data;
        
            for (var i = 0; i < $scope.data.WidgetInfos.length; i++) {
                $scope.GetScriptIcon ({
                    user_key: serverService.userKey,
                    script_uuid: $scope.data.WidgetInfos[i].script_uuid,
                    script_id: $scope.data.WidgetInfos[i].script_id
                },
                function (data) {
                    for (var i = 0; i < $scope.data.WidgetInfos.length; i++) {
                        if (data.script_id == $scope.data.WidgetInfos[i].script_id) {
                            $scope.data.WidgetInfos[i].image = data.image.substring(1, data.image.length - 1);
                            console.log ($scope.data.WidgetInfos);
                            return;
                        }
                    }
                });
            }
            
            console.log ("GetUserWidgets ... Exit");
        }
    });
    
    $scope.onLaunch = function (widget) {
        console.log (widget.script_uuid);
        $location.path('/widget/' + widget.script_uuid)
    }
    
    // setInterval (UpdateUI, 1000);
});