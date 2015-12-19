'use strict';

angular.module('app').controller('mapController', function($scope, mapFactory, mapService, serverService) {
    $scope.data = mapService;

    // Responders (ancors) declaration area
    $scope.data.responders.push (
    {
        "xBase": 100 * 8.7,
        "yBase": 100 * 4.88,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "id": 1,
        "type": "KINEXON"
    });

    $scope.data.responders.push (
    {
        "xBase": 100 * 8.761,
        "yBase": 100 * 0.315,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "id": 2,
        "type": "KINEXON"
    });

    $scope.data.responders.push (
    {
        "xBase": 100 * 0.417,
        "yBase": 100 * 0.353,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "id": 3,
        "type": "KINEXON"
    });

    $scope.data.responders.push (
    {
        "xBase": 100 * 0.307,
        "yBase": 100 * 4.686,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "id": 4,
        "type": "KINEXON"
    });

    // Generic types decleration area
    /*$scope.data.generics.push ({
        "xBase": 100 * 0.30,
        "yBase": 100 * 0.30,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "text": "room 1",
        "img": "lamp.png",
        "type": "KINEXON"
    });*/

    $scope.data.generics.push ({
        "xBase": 100 * 8.5,
        "yBase": 100 * 1.0,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "text": "room 2",
        "img": "lamp.png",
        "type": "KINEXON"
    });

    $scope.data.generics.push ({
        "xBase": 100 * 7.0,
        "yBase": 100 * 4.0,
        "zBase": 100 * 2.1,
        "x": 0,
        "y": 0,
        "z": 0,
        "text": "room 3",
        "img": "lamp.png",
        "type": "KINEXON"
    });

    // Analytics service areas declaration
    /*$scope.data.areas.push ({
        "xBase": 100 * 0.8,
        "yBase": 100 * -5.0,
        "width": 100 * 3.0,
        "heigth": 100 * 3.5,
        "x": 0,
        "y": 0,
        "w": 0,
        "h": 0,
        "color": "RED",
        "show": 1,
        "type": "KINEXON"
    });

    $scope.data.areas.push ({
        "xBase": 100 * 0.8,
        "yBase": 100 * -1.5,
        "width": 100 * 3.0,
        "heigth": 100 * 5.4,
        "x": 0,
        "y": 0,
        "w": 0,
        "h": 0,
        "color": "GREEN",
        "show": 1,
        "type": "KINEXON"
    });

    $scope.data.areas.push ({
        "xBase": 100 * -5.2,
        "yBase": 100 * -5.2,
        "width": 100 * 4.4,
        "heigth": 100 * 8.9,
        "x": 0,
        "y": 0,
        "w": 0,
        "h": 0,
        "color": "BLUE",
        "show": 1,
        "type": "KINEXON"
    });*/

    var eventSourceCallback = function() {
        return function(event) {
            $scope.$apply();
        }
    }

    this.getCoordinate = function () {
        mapFactory.getCoordinate ( function () {
            console.log ("# data = " + JSON.stringify($scope.data.jsonRawData));
            
            var img = document.getElementById('imgBG');
            $scope.data.backgroud.width   = img.clientWidth;
            $scope.data.backgroud.height  = img.clientHeight;

            for (var i = 0; i < $scope.data.responders.length; i++) {
                var obj = $scope.data.responders[i];
                if (obj.type == "KINEXON") {
                    obj.x = obj.xBase;
                    obj.y = obj.yBase;

                    var ratioX = $scope.data.backgroud.width / $scope.data.map.width;
                    var ratioY = $scope.data.backgroud.height / $scope.data.map.height;

                    obj.x = obj.xBase * ratioX;
                    obj.y = obj.yBase * ratioY;
                    obj.y = $scope.data.backgroud.height - obj.y - 50;
                }
            }

            for (var i = 0; i < $scope.data.generics.length; i++) {
                var obj = $scope.data.generics[i];
                if (obj.type == "KINEXON") {
                    obj.x = obj.xBase;
                    obj.y = obj.yBase;

                    var ratioX = $scope.data.backgroud.width / $scope.data.map.width;
                    var ratioY = $scope.data.backgroud.height / $scope.data.map.height;

                    obj.x = obj.xBase * ratioX;
                    obj.y = obj.yBase * ratioY;
                    obj.y = $scope.data.backgroud.height - obj.y - 70;
                }
            }

            for (var i = 0; i < $scope.data.areas.length; i++) {
                var obj = $scope.data.areas[i];
                if (obj.type == "KINEXON") {
                    obj.x = obj.xBase;
                    obj.y = obj.yBase;

                    var ratioX = $scope.data.backgroud.width / $scope.data.map.width;
                    var ratioY = $scope.data.backgroud.height / $scope.data.map.height;

                    var xRep = ($scope.data.map.width / 2) + obj.x;
                    var yRep = ($scope.data.map.height / 2) + obj.y;

                    if (xRep < 0) {
                        obj.x = 0;
                    }

                    if (yRep < 0) {
                        obj.y = 0;
                    }

                    obj.x = Math.abs(xRep);
                    obj.y = Math.abs(yRep);

                    obj.x = obj.x * ratioX;
                    obj.y = obj.y * ratioY;

                    obj.w = obj.width * ratioX;
                    obj.h = obj.length * ratioY;
                    
                    console.log (obj.color + " " + obj.x + ", " + obj.y);
                    console.log (obj.color + " " + obj.width + ", " + obj.height);

                    obj.y = $scope.data.backgroud.height - obj.y;

                    

                    

                    /*obj.x = obj.xBase * ratioX;
                    obj.y = obj.yBase * ratioY;
                    obj.w = obj.width * ratioX;
                    obj.h = obj.length * ratioY;
                    obj.y = $scope.data.backgroud.height - obj.y - obj.heigth;*/
                }
            }
            
            for (var i = 0; i < $scope.data.jsonRawData.length; i++) {
                var obj = $scope.data.jsonRawData[i];
                var locationStructure = {
                    "deviceId": obj.deviceId,
            		"X": 0,
            		"Y": 0,
            		"Z": 0,
                    "index": obj.index
        		};

                if (obj.type == "KINEXON") {
                    console.log ("KINEXON");

                    obj.X = obj.X * 100;
                    obj.Y = obj.Y * 100;

                    $scope.data.calibration.maxX = (obj.X > $scope.data.calibration.maxX) ? obj.X : $scope.data.calibration.maxX;
                    $scope.data.calibration.minX = (obj.X < $scope.data.calibration.minX) ? obj.X : $scope.data.calibration.minX;
                    $scope.data.calibration.maxY = (obj.Y > $scope.data.calibration.maxY) ? obj.Y : $scope.data.calibration.maxY;
                    $scope.data.calibration.minY = (obj.Y > $scope.data.calibration.minY) ? obj.Y : $scope.data.calibration.minY;

                    $scope.data.map.width = Math.abs($scope.data.calibration.maxX) + Math.abs($scope.data.calibration.minX);
                    $scope.data.map.height = Math.abs($scope.data.calibration.maxY) + Math.abs($scope.data.calibration.minY);

                    var ratioX = $scope.data.backgroud.width / $scope.data.map.width;
                    var ratioY = $scope.data.backgroud.height / $scope.data.map.height;

                    var xRep = ($scope.data.map.width / 2) + obj.X;
                    var yRep = ($scope.data.map.height / 2) + obj.Y

                    if (xRep < 0) {
                        obj.X = 0;
                    }

                    if (yRep < 0) {
                        obj.Y = 0;
                    }

                    obj.X = Math.abs(xRep);
                    obj.Y = Math.abs(yRep);

                    obj.X = obj.X * ratioX;
                    obj.Y = obj.Y * ratioY;
                    obj.Y = $scope.data.backgroud.height - obj.Y - 70;

                    locationStructure.X = obj.X;
                    locationStructure.Y = obj.Y;
                    locationStructure.Z = obj.Z;

                    for (var j = 0; j < $scope.data.areas.length; j++) {
                        var area = $scope.data.areas[j];
                        // console.log (obj.X + ", " + obj.Y + "      " + area.x + ", " + area.y);
                        if (area.type == "KINEXON") {
                            if (obj.X > area.x && obj.X < (area.x + area.width)) {
                                if ((obj.Y + 70) > area.y && (obj.Y + 70) < (area.y + area.heigth))    {
                                    console.log (obj.X + " - " + area.x + " - " + area.width);
                                    // area.show = 1;
                                } else {
                                    // area.show = 0;
                                }
                            } else {
                                // area.show = 0;
                            }
                        }
                    }
                } else {
                    console.log ("TOF");
                    locationStructure.X = parseInt($scope.data.backgroud.width / $scope.data.map.width) * parseInt(obj.X);
                    locationStructure.Y = parseInt($scope.data.backgroud.height / $scope.data.map.height) * parseInt(obj.Y);
                    locationStructure.Z = obj.z;
                }
                $scope.data.coordinate[obj.index] = locationStructure;
            }
            
            eventSourceCallback ();
        });
    }

    setInterval (this.getCoordinate, 1000);

    console.log ("# Loading mapController...");
});
