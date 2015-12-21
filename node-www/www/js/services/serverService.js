'use strict';

angular.module('app').service('serverService', function() {
    this.imgPath    = "img/"
    this.server     = "http://10.0.0.15:8080/"; // TODO - IP address must be changed on application install.
    this.userKey    = "85994f97-5fb4-2915-6ccf-98c3bf16f664";
});
