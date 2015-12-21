function Scripts (database, filesystem) {
    self = this;
    this.db = database;
    this.fs = filesystem;
}

Scripts.prototype.ScriptAPI_GetAllScripts = function (data, callback) {
    this.db.GetAllScripts (function (err, scripts) {
        var list = [];
        
        if (scripts.length < 1) {
            callback ({status: "FAIL"}, list);
            return;
        }
        
        for (i = 0; i < scripts.length; i++) {
            var script = {
                id: scripts[i].script_id,
                uuid: scripts[i].script_uuid,
                name: scripts[i].script_name,
                description: scripts[i].script_description,
                ts: scripts[i].script_ts,
                last_update: scripts[i].script_last_update,
                enabled: scripts[i].script_enabled
            };
            list.push (script);
        }
        
        callback ({status: "PASS"}, list);
    });
}

Scripts.prototype.ScriptAPI_GetAllUserScripts = function (key, callback) {
    var sql_local = this.db;
    this.db.GetUserInfo (key, function (err, info) {
        var userId = info[0].user_id;
        sql_local.GetAllUsersScripts (userId, function (err, scripts) {
            var list = [];
            
            if (scripts.length < 1) {
                callback ({status: "FAIL"}, list);
                return;
            }
            
            for (i = 0; i < scripts.length; i++) {
                var script = {
                    id: scripts[i].record_id,
                    script_id: scripts[i].script_id,
                    script_uuid: scripts[i].script_uuid,
                    script_name: scripts[i].script_name,
                    user_id: scripts[i].user_id,
                    // script_db: scripts[i].script_db,
                    record_enabled: scripts[i].record_enabled
                };
                list.push (script);
            }
            
            callback ({status: "PASS"}, list);
        });
    });
}

Scripts.prototype.ScriptAPI_InstallScript = function (data, callback) {
    var sql_local = this.db;
    var fs_local  = this.fs;
    
    this.db.GetUserInfo (data.user_key, function (err, info) {
        data.user_id = info[0].user_id;
        sql_local.CreateUserScript (data, function (err, uuid) {
            if (uuid.length > 0) {
                console.log (uuid[0].script_uuid);
                return fs_local.GetScriptConfig (uuid[0].script_uuid, function (conf) {
                    var configure = JSON.parse(conf);
                    
                    // Lets check if we have type request.
                    if (configure.types.length > 0) {
						sql_local.GetSensorsByType ({
							user_id: data.user_id,
							type: configure.types }, 
							function (err, sensors) {
                                if (sensors.length < 1) {
                                    callback ({status: "PASS"}, null);
                                    return;
                                }

								// For each sensor type attach widget.
                                for (var sensor_index = 0; sensor_index < sensors.length; sensor_index++) {
                                    sql_local.CreateSensorAssociation (uuid[0].script_uuid, sensors[sensor_index].sensor_address);
                                }
							});
                    } else {
                    }
                    
                    // TODO - Do association with sensor address from configure file.
                    
                    callback ({status: "PASS"}, null);
                    return;
                });
            }
            
            callback ({status: "FAIL"}, null);
        });
    });
}

Scripts.prototype.ScriptAPI_LoadScriptDB = function (data, callback) {
    this.db.GetScriptDB (data, function (status, info) {
        console.log (info);
        var script_db = info[0].script_db;
        callback (status, script_db);
    });
}

Scripts.prototype.ScriptAPI_UpdateScriptDB = function (data, callback) {
    this.db.SetScriptDB (data, function (status) {
        callback (status, null);
    });
}

Scripts.prototype.ScriptAPI_CreateScript = function (data, callback) {
    this.db.CreateScript(data);
    callback ({status: "PASS"}, null);
}

Scripts.prototype.ScriptAPI_GetScriptUI = function (data, callback) {
    this.fs.GetScriptUI (data.script_uuid, function (html) {
        callback ({status: "PASS"}, html)
    });
}

Scripts.prototype.ScriptAPI_GetScriptIcon = function (data, callback) {
    this.fs.GetIconScript (data.script_uuid, function (image) {
        callback ({status: "PASS"}, image)
    });
}

Scripts.prototype.ScriptAPI_GetScriptImage = function (data, callback) {
    this.fs.GetImageScript (data, function (image) {
        callback ({status: "PASS"}, image)
    });
}

function ScriptsFactory () {
    return Scripts;
}

module.exports = Scripts;