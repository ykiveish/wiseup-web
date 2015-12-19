'use strict';

angular.module('app').controller('sensorsController', function($scope, sensorsFactory, sensorsService, serverService) {
    $scope.data = sensorsService;

    var eventSourceCallback = function(idx) {
        return function(event) {
            $scope.data.sensors[idx] = JSON.parse(event.data);
            console.log("sid " + $scope.data.sensors[idx].addr + " received sse " + event.data);
            $scope.$apply();
        }
    }

    
    this.getAllSensors = function () {
        sensorsFactory.getAll(function() {
            if ($scope.data.sensors.length == 0) {
                $scope.data.sensors = [];
                return;
            }
            
            for (var i = 0; i < $scope.data.sensors.length; i++) {
                var s = $scope.data.sensors[i];
                var source = new EventSource(serverService.server + "sse/register_sensor_update/" + s.addr);
                source.onmessage = eventSourceCallback(i);
            }
        });
    }
    // setInterval (this.getAllSensors, 30000);
    this.getAllSensors ();

    $scope.doAction = function(sensor) {
        console.log('do action');
        var val = (parseInt(sensor.value) + 1) % 2;
        sensorsFactory.doAction({
            id: sensor.id,
            action: val
        });
    }

    $scope.toggleFavorite = function(sensor) {
        console.log('toggle favorite');
        sensorsService.toggleFavorite(sensor);
    }
});
