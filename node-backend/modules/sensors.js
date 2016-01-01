const moment = require('moment');

var SensorAPI_sensorsDB = [];
var SensorAPI_scriptAssociationDB = [];
var SensorAPI_Context = {
    lastSensorDBUpdate: moment().unix(),
    updateDBTimeout: 60
};

function Sensors (database, filesystem) {
    self = this;
    this.db = database;
    this.fs = filesystem;
}

Sensors.prototype.SensorAPI_LoadSensorsToCache = function (data, callback) {
    var sensorApi = this;
    this.db.GetAllSensors (function (err, sensors) {
        for (i = 0; i < sensors.length; i++) {
            var sensor = {
                id: sensors[i].sensor_id,
                addr: sensors[i].sensor_address,
                name: sensors[i].sensor_name,
                type: sensors[i].sensor_type,
                value: sensors[i].sensor_value,
                ts: sensors[i].sensor_ts
            };
            SensorAPI_sensorsDB.push (sensor);
        }
        
        sensorApi.db.GetAllAssociations (function (err, associations) {
            for (i = 0; i < associations.length - 1; i++) {
                var association = {
                    id: associations[i].association_id,
                    script_uuid: associations[i].script_uuid,
                    addr: associations[i].sensor_address,
                    enabled: associations[i].association_enabled
                };
                SensorAPI_scriptAssociationDB.push (association);
            }
        });
        
        if (sensors.length > 0) {
            callback ({status:"OK"}, {length:sensors.length});
        } else {
            callback ({status:"ERROR"}, {length:sensors.length});
        }
    });
}

Sensors.prototype.SensorAPI_GetSensorsInfo = function (data, callback) {
    var sensors = [];
    for (i = 0; i < SensorAPI_sensorsDB.length; i++) {
        sensors.push (SensorAPI_sensorsDB[i]);
    }
    callback ({status:"OK"}, sensors);
}

Sensors.prototype.SensorAPI_GetSensorInfo = function (data, callback) {
    for (i = 0; i < SensorAPI_sensorsDB.length; i++) {
        if (data.sensor_addr == SensorAPI_sensorsDB[i].addr) {
            callback ({status:"OK"}, SensorAPI_sensorsDB[i]);
            return;
        }
    }
    callback ({status:"FAILED"}, null);
}

Sensors.prototype.SensorAPI_GetSensorsInfoByType = function (data, callback) {
    var sensors = [];
    for (i = 0; i < SensorAPI_sensorsDB.length; i++) {
        if (data.sensor_type == SensorAPI_sensorsDB[i].type) {
            sensors.push (SensorAPI_sensorsDB[i]);
        }
    }
    callback ({status:"OK"}, sensors);
}

Sensors.prototype.SensorAPI_SetSensorInfo = function (data, callback) {
    var fs_local  = this.fs;
    var db_local  = this.db;
    var sensorApi = this;
    for (i = 0; i < SensorAPI_sensorsDB.length; i++) {
        if (SensorAPI_sensorsDB[i].addr == data.sensor.addr) {
            // Update the data to DB.
            if (SensorAPI_sensorsDB[i].value != data.sensor.value) {
                SensorAPI_sensorsDB[i].value = data.sensor.value;
                SensorAPI_sensorsDB[i].ts = data.sensor.ts;
                
                var sensorIndex = i;
                if (Math.abs (moment().unix() - SensorAPI_Context.lastSensorDBUpdate) > SensorAPI_Context.updateDBTimeout) {
                    SensorAPI_Context.lastSensorDBUpdate = moment().unix();
                    this.db.UpdateSensorValue (data.sensor);
                }
                
                var executionCounter = 0;
                for (i = 0; i < SensorAPI_scriptAssociationDB.length; i++) {
                    if (SensorAPI_scriptAssociationDB[i].addr == data.sensor.addr) {
                        // console.log (i + ", " + SensorAPI_scriptAssociationDB[i].addr + ", " + SensorAPI_scriptAssociationDB[i].script_uuid);
                        this.fs.ExecuteScript (SensorAPI_scriptAssociationDB[i].script_uuid, 
                            {
                                db: this.db,
                                fs: this.fs,
                                sensors: this,
                                sensor: data.sensor,
                                script_data: SensorAPI_scriptAssociationDB[i]
                            },
                            function (err, data) {
                                executionCounter++;
                        });
                    }
                }
                
                if (executionCounter > 0) {
                    callback (SensorAPI_sensorsDB[sensorIndex], {status: "OK"}, {status: "UPDATE_EXEC"});
                } else {
                    callback (SensorAPI_sensorsDB[sensorIndex], {status: "OK"}, {status: "UPDATE_NO_EXEC"});
                }
                
                
                /*this.db.GetScriptsOnSensorChange (data.sensor.addr, function (err, uuids) {
                    if (uuids.length < 1) {
                        callback (SensorAPI_sensorsDB[sensorIndex], {status: "OK"}, {status: "UPDATE_NO_EXEC"});
                        return;
                    }
                    
                    var res_counter = 0;
                    uuids.forEach (function (item) {
                        var association = {
                            uuid: item.script_uuid,
                            enabled: item.association_enabled
                        };
                        
                        fs_local.ExecuteScript (association.uuid, 
                        {
                            db: db_local,
                            fs: fs_local,
                            sensors: sensorApi,
                            sensor: data.sensor,
                            script_data: uuids[i]
                        },
                        function (err, data) {
                            res_counter++;
                            if (res_counter == uuids.length) {
                                callback (SensorAPI_sensorsDB[sensorIndex], {status: "OK"}, {status: "UPDATE_EXEC"});
                            }
                        });
                    });
                });*/
            } else {
                callback (SensorAPI_sensorsDB[i], {status: "OK"}, {status: "NO_CHANGE"});
            }
            return;
        }
    }
    SensorAPI_sensorsDB.push (data.sensor);
    
    db_local = this.db;
    this.db.GetUserInfo (data.user_key, function (err, info) {
        data.sensor.userId = info[0].user_id;
        console.log (data.sensor);
        // Create new sensor data in DB.
        db_local.CreateNewSensor (data.sensor);
        callback ({status: "OK"}, {status: "ADD_NEW_SENSOR"});
    });
}

Sensors.prototype.SensorAPI_AttachSensorToScript = function (data, callback) {
    this.db.CreateSensorAssociation (data.script_uuid, data.sensor_addr);
    callback ({status: "PASS"}, null);
}

Sensors.prototype.SensorAPI_DeAttachSensorToScript = function (data, callback) {
    this.db.RemoveSensorAssociation (data.script_uuid, data.sensor_addr);
    callback ({status: "PASS"}, null);
}

Sensors.prototype.SensorAPI_GetAllAssociations  = function (data, callback) {
    this.db.GetAllAssociations (function (err, associations) {
        var list = [];
        
        if (associations.length < 1) {
            callback ({status: "FAIL"}, list);
            return;
        }
        
        for (i = 0; i < associations.length; i++) {
            var association = {
                id: associations[i].association_id,
                widget_uuid: associations[i].script_uuid,
                sensor_address: associations[i].sensor_address,
                enabled: associations[i].association_enabled
            };
            list.push (association);
        }
        
        callback ({status: "PASS"}, list);
    });
}

function SensorsFactory () {
    return Sensors;
}

module.exports = Sensors;