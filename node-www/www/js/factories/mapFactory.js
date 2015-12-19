'use strict';

angular.module('app').factory('mapFactory', function($resource, mapService, serverService) {
    return $resource(serverService.server + 'api/map/get_coordinates/', null, {
        getCoordinate: {
            method: "GET",
            isArray: true,
            interceptor: {
                response: function(response) {
                    console.log ("# getCoordinate... " + response.data.length);
                    mapService.jsonRawData = response.data;
                    return response.data;
                }
            }
        }
    });

    console.log ("# Loading mapFactory...");
});
