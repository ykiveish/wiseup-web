var usersApi    = require('./../modules/users.js');
var sensorsApi  = require('./../modules/sensors.js');
var scriptsApi  = require('./../modules/scripts.js');
var adminApi    = require('./../modules/admin.js');
var config      = require('configure');
var consoleDebug  = require('console-debug');

var objUser     = new usersApi (null);
var objSensor   = new sensorsApi (null, null);
var objScript   = new scriptsApi (null, null);
var objAdmin    = new adminApi (null, null);

var     console       = new consoleDebug(config.console);

function API (database, filesystem) {
    self            = this;
    this.db         = database;
    this.userKey    = "85994f97-5fb4-2915-6ccf-98c3bf16f664";
    
    objUser.db   = database;
    
    objSensor.db = database;
    objSensor.fs = filesystem;
    
    objScript.db = database;
    objScript.fs = filesystem;
    
    objAdmin.db = database;
    objAdmin.fs = filesystem;
    
    this.Security = {
        "CheckUserKey": function (key, isCache, callback) {
            if (isCache == "TRUE") {
                console.log ("CheckUserKey [CACHE]");
                if (self.userKey == key) {
                    callback ({status: "OK"}, "TRUE");
                } else {
                    callback ({status: "ERROR"}, "FALSE");
                }
            } else {
                self.db.CheckUserKey (key, function (status) {
                    var data = [];
                    if (status == "TRUE") {
                        callback ({status: "OK"}, "TRUE");
                    } else {
                        callback ({status: "ERROR"}, "FALSE");
                    }
                });
            }
        }
    }
    
    this.Users = {
        "AddUser": function (data, callback) {
            objUser.UserAPI_AddUser (data, callback);
        },
        "RemoveUser": function (data, callback) {
            objUser.UserAPI_RemoveUser (data, callback);
        },
        "EditUser": function (data, callback) {
            objUser.UserAPI_EditUser (data, callback);
        },
        "GetUserInfo": function (data, callback) {
            objUser.UserAPI_GetUserInfo (data, callback);
        },
        "GetAllUsersInfo": function (data, callback) {
            objUser.UserAPI_GetAllUsersInfo (data, callback);
        },
        "ChangeUserKey": function (data, callback) {
            objUser.UserAPI_ChangeUserKey (data, callback);
        }
    }
    
    this.Sensors = {
        "LoadSensorsToCache": function (data, callback) {
            objSensor.SensorAPI_LoadSensorsToCache (null, callback);
        },
        "AddSensor": function (data, callback) {
        },
        "RemoveSensor": function (data, callback) {
        },
        "GetSensorInfo": function (data, callback) {
        },
        "GetSensorsInfo": function (data, callback) {
            objSensor.SensorAPI_GetSensorsInfo (data, callback);
        },
        "GetSensorsInfoByType": function (data, callback) {
            objSensor.SensorAPI_GetSensorsInfoByType (data, callback);
        },
        "SetSensorInfo": function (data, callback) {
            objSensor.SensorAPI_SetSensorInfo (data, callback);
        },
        "AttachSensorToScript": function (data, callback) {
            objSensor.SensorAPI_AttachSensorToScript (data, callback);
        },
        "DeAttachSensorToScript": function (data, callback) {
            objSensor.SensorAPI_DeAttachSensorToScript (data, callback);
        },
        "GetAllAssociations": function (data, callback) {
            objSensor.SensorAPI_GetAllAssociations (data, callback);
        }
    }
    
    this.Scripts = {
        "GetAllScripts": function (data, callback) {
            objScript.ScriptAPI_GetAllScripts (data, callback);
        },
        "GetAllUserScripts": function (data, callback) {
            objScript.ScriptAPI_GetAllUserScripts (data, callback);
        },
        "InstallScript": function (data, callback) {
            objScript.ScriptAPI_InstallScript (data, callback);
        },
        "RemoveScript": function (data, callback) {
        },
        "ExecuteScript": function (data, callback) {
        },
        "LoadConfiguration": function (data, callback) {
        },
        "LoadScriptDB": function (data, callback) {
            objScript.ScriptAPI_LoadScriptDB (data, callback);
        },
        "UpdateScriptDB": function (data, callback) {
            objScript.ScriptAPI_UpdateScriptDB (data, callback);
        },
        "CreateScript": function (data, callback) {
            objScript.ScriptAPI_CreateScript (data, callback);
        },
        "GetScriptUI": function (data, callback) {
            objScript.ScriptAPI_GetScriptUI (data, callback);
        },
        "GetScriptImage": function (data, callback) {
            objScript.ScriptAPI_GetScriptImage (data, callback);
        },
        "GetScriptIcon": function (data, callback) {
            objScript.ScriptAPI_GetScriptIcon (data, callback);
        }
    }
    
    this.Locations = {
        "AddLocation": function (data, callback) {
        },
        "RemoveLocation": function (data, callback) {
        },
        "ChangeLocation": function (data, callback) {
        }
    }
    
    this.Geomerties = {
        "AddGeometry": function (data, callback) {
        },
        "RemoveGeometry": function (data, callback) {
        },
        "EditGeometry": function (data, callback) {
        },
        "IsInside": function (data, callback) {
        }
    }
    
    this.Admin = {
        "DeleteScripts": function (callback) {
            objAdmin.AdminAPI_DeleteScripts (callback);
        },
        "DeleteAssociations": function (callback) {
            objAdmin.AdminAPI_DeleteAssociations (callback);
        },
        "DeleteUserScripts": function (callback) {
            objAdmin.AdminAPI_DeleteUserScripts (callback);
        }
    }
}

function APIFactory (con) {
    console = con;
    return API;
}

module.exports = API;