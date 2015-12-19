'use strict';

angular.module('app').factory('widgetInfoFactory', function($resource, widgetInfoService, serverService) {
    return $resource(serverService.server + 'api/', null, {
        GetWidgetInfo: {
            method: "GET",
            isArray: true,
            interceptor: {
                response: function (response) {
                    widgetInfoService.WidgetInfos = response.data;
                    console.log (widgetInfoService.WidgetInfos);
                    return response.data;
                }
            }
        }
    });
});