const   express       = require('express');
const   http          = require('http');
const   config        = require('configure');
const   moment        = require('moment');
const   ConsoleDebug  = require('console-debug');
var     console       = new ConsoleDebug(config.console);
const   SensorUpdater = require('./updater.js')(console);
const   SqliteAdapter = require('./adapters/sqlite_adapter.js')(console);
const   FsAdapter     = require('./adapters/fs_adapter.js')(console);
var     fs            = require('fs'); 
var     btoa          = require('btoa')

var     jsSensorDB    = [];
var     app           = express();
var     updater       = new SensorUpdater();
var     db            = new SqliteAdapter('wiseupdb.db');
var     scriptDB      = new FsAdapter('/home/ykiveish/workspace/wiseup-web/node-scripts/');

const   apis          = require('./api/api.js');
var     api           = new apis (db, scriptDB);

// Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    next();
});

var apiRouter = express.Router();
var sseRouter = express.Router();
app.use('/api', apiRouter);
app.use('/sse', sseRouter);

apiRouter.route('/').get(function(req, res) {
    res.end('HELLO ENGINE');
});

/*
 * USERS
 */

apiRouter.route('/get_users_info').get(function(req, res) {
    api.Users.GetAllUsersInfo (null, function (err, users) {
        res.json(users);
    });
});

apiRouter.route('/create_user/:name/:password').get(function(req, res) {
    var data = {
        uuid: "",
        name: req.param ('name'),
        password: req.param ('password'),
        ts: moment().unix(),
        last_login: moment().unix()
    };
    
    api.Users.AddUser (data, function (err, data) {
        res.json(err.status);
    });
});

/*
 * SENSORS
 */
 
apiRouter.route('/get_sensors_info/:key').get(function(req, res) {
    var key = req.params.key;
    
    return api.Security.CheckUserKey (key, function (err, data) {
        if (data == "TRUE") {
            api.Sensors.GetSensorsInfo (null, function (err, sensors) {
                res.json(sensors);
            });
        } else {
            res.json({status:"FALSE"});
        }
    });
});

apiRouter.route('/get_sensors_info_by_type/:key/:type').get(function(req, res) {
    var key = req.params.key;
    var type = req.params.type;
    
    return api.Security.CheckUserKey (key, function (err, data) {
        if (data == "TRUE") {
            api.Sensors.GetSensorsInfoByType ({sensor_type: type}, function (err, sensors) {
                res.json(sensors);
            });
        } else {
            res.json({status:"FALSE"});
        }
    });
});

apiRouter.route('/set_sensor_value/:key/:addr/:type/:value').get(function(req, res) {
    var key = req.params.key;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var data = {
                sensor: {
                    addr: req.param ('addr'),
                    name: "'New Sensor'",
                    type: req.param ('type'),
                    value: req.param ('value'),
                    ts: moment().unix()
                },
                user_key: key 
            };
            
            updater.Update(data.addr, data, function () { });
            api.Sensors.SetSensorInfo (data, function (err, status) {
                res.json(status);
            });
            
            console.log (data);
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/add_sensor_association/:key/:script_uuid/:sensor_addr').get(function(req, res) {
    var key  = req.params.key;
    var addr = req.params.sensor_addr;
    var uuid = req.params.script_uuid;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var req_data = {
                sensor_addr: addr,
                script_uuid: uuid
            };
            
            api.Sensors.AttachSensorToScript (req_data, function (err, data) {
                res.json(err);
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/remove_sensor_association/:key/:script_uuid/:sensor_addr').get(function(req, res) {
    var key  = req.params.key;
    var addr = req.params.sensor_addr;
    var uuid = req.params.script_uuid;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var req_data = {
                sensor_addr: addr,
                script_uuid: uuid
            };
            
            api.Sensors.DeAttachSensorToScript (req_data, function (err, data) {
                res.json(err);
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/get_sensors_associations').get(function(req, res) {
    api.Sensors.GetAllAssociations (null, function (err, associations) {
        res.json(associations);
    });
});

/*
 * SCRIPTS
 */
 
apiRouter.route('/get_scripts_info').get(function(req, res) {
    api.Scripts.GetAllScripts (null, function (err, scripts) {
        if (err.status == "PASS") {
            res.json (scripts);
        } else {
            res.json (err);
        }
    });
});

apiRouter.route('/get_users_scripts_info/:key').get(function(req, res) {
    var key = req.params.key;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            api.Scripts.GetAllUserScripts (key, function (err, scripts) {
                if (err.status == "PASS") {
                    res.json (scripts);
                } else {
                    res.json (err);
                }
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/create_script/:uuid/:name/:description').get(function(req, res) {
    var script = {
        uuid: req.params.uuid,
        name: req.params.name,
        description: req.params.description,
        ts: moment().unix(),
        last_update: moment().unix(),
        enabled: "1"
    };
    
    api.Scripts.CreateScript (script, function (err, data) {
        res.json(err);
    });
});

apiRouter.route('/install_script/:key/:script_id').get(function(req, res) {
    var key = req.params.key;
    var script_id = req.params.script_id;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var script_req = {
                script_id: script_id,
                user_key : key,
                db: ""
            };
            
            api.Scripts.InstallScript (script_req, function (err, data) {
                res.json(err);
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/get_script_ui/:key/:script_uuid').get(function(req, res) {
    var key  = req.params.key;
    var uuid = req.params.script_uuid;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var ui_req = {
                script_uuid: uuid
            };
            
            api.Scripts.GetScriptUI (ui_req, function (err, data) {
                res.json(data.replace(/(\r\n|\n|\r)/gm,""));
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/get_script_icon/:key/:script_uuid').get(function(req, res) {
    var key  = req.params.key;
    var uuid = req.params.script_uuid;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var ui_req = {
                script_uuid: uuid
            };
            
            api.Scripts.GetScriptIcon (ui_req, function (err, data) {
                res.json(data);
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/get_script_image/:key/:script_uuid/:file_name').get(function(req, res) {
    var key  = req.params.key;
    var uuid = req.params.script_uuid;
    var name = req.params.file_name;
    
    return api.Security.CheckUserKey (key, function (err, status) {
        if (status == "TRUE") {
            var ui_req = {
                script_uuid: uuid,
                file_name: name
            };
            
            api.Scripts.GetScriptImage (ui_req, function (err, data) {
                res.json(data);
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/get_script_db/:key/:script_id').get(function(req, res) {
    return api.Security.CheckUserKey (req.params.key, function (err, status) {
        if (status == "TRUE") {
            var db_req = {
                script_id: req.params.script_id
            };
            api.Scripts.LoadScriptDB (db_req, function (err, data) {
                res.json(data);
            });
        } else {
            res.json("FAIL");
        }
    });
});

apiRouter.route('/set_script_db/:key/:script_id/:script_db').get(function(req, res) {
    return api.Security.CheckUserKey (req.params.key, function (err, status) {
        if (status == "TRUE") {
            var db_req = {
                script_id: req.params.script_id,
                script_db: req.params.script_db
            };
            api.Scripts.UpdateScriptDB (db_req, function (err, data) {
                res.json(data);
            });
        } else {
            res.json("FAIL");
        }
    });
});

/*
 * ADMIN
 */

apiRouter.route('/delete_all_users_scripts').get(function(req, res) {
    api.Admin.DeleteUserScripts (function (err) {
        res.json(err);
    });
});

apiRouter.route('/delete_all_scripts').get(function(req, res) {
    api.Admin.DeleteScripts (function (err) {
        res.json(err);
    });
});

apiRouter.route('/delete_all_associations').get(function(req, res) {
    api.Admin.DeleteAssociations (function (err) {
        res.json(err);
    });
});

var msgID = 0;
sseRouter.route('/register_sensor_update/:id').get(function(req, res) {
    var sensorID = req.params.id;
    console.log("Received new listener for sensor id " + sensorID);
    req.socket.setTimeout(Infinity);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    var writeSSE = function(info) {
        res.write("id: " + msgID++ +"\n");
        res.write("data: " + JSON.stringify(info));
        res.write("\n\n");
    }

    var onSensorValueUpdate = function(data) {
        console.log("Received sensor value event for id " + sensorID + ": " + JSON.stringify(data));
        writeSSE(data);
    }
    
    updater.on(sensorID, onSensorValueUpdate);
});


/* INIT SERVER FLOW */
api.Sensors.LoadSensorsToCache (null, function (err, data) {
    if (err.status == "OK") {
        console.log (data);
    } else {
        console.log (err);
    }
});

var server = app.listen(config.serverPort, function() {
    console.info('Listening on port ' + server.address().port);
});
