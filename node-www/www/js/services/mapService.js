'use strict';

angular.module('app').service('mapService', function() {
    this.jsonRawData;
    this.coordinate = [];
    this.responders = [];
    this.generics = [];
    this.areas = [];

    this.calibration = {
        "maxX": 500,
        "minX": 500,
        "maxY": 500,
        "minY": 500
    };
    
    this.map = {
        "width"  : 1000,
        "height" : 1000
    };
    
    this.backgroud = {
        "width"  : 0,
        "height" : 0
    };

    console.log ("# Loading mapService...");
});
