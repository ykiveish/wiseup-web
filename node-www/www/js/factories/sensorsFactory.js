'use strict';

angular.module('app').factory('sensorsFactory', function($resource, sensorsService, serverService) {
    return $resource(serverService.server + 'api/get_sensors_info', null, {
        getAll: {
            method: "GET",
            isArray: true,
            interceptor: {
                response: function(response) {
                    sensorsService.sensors = response.data;
                    console.log (sensorsService.sensors);
                    return response.data;
                }
            }
        },
        doAction: {
            method: "GET",
            //url: serverService.server + "api/sensors/:id/:action",
            interceptor: {
                response: function(response) {
                    sensorsService.setValue(response.data);
                    return response.data;
                }
            }
        }
    });
});
