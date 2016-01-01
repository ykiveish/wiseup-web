var sqlite3 = require('sqlite3').verbose();
var console;

//TODO: protect against SQL injection (escape user input)

function SqliteAdapter(dbFile) {
    var self = this;
    this.db = new sqlite3.Database(dbFile);
    
    var sql = this.db;
    sql.serialize(function() {
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_users` (" +
            "`user_id`              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`user_key`             VARCHAR(128) NOT NULL," +
            "`user_name`            VARCHAR(64) NOT NULL," +
            "`user_password`        VARCHAR(64) NOT NULL," +
            "`user_ts`              INTEGER NOT NULL," +
            "`user_last_login_ts`   INTEGER NOT NULL," +
            "`user_enabled`         TINYINT NOT NULL);");
        
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_sensors` (" +
            "`sensor_id`            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`user_id`              INTEGER NOT NULL," +
            "`sensor_address`       UNSIGNEDBIGINT NOT NULL," +
            "`sensor_type`          SMALLINT NOT NULL," +
            "`sensor_value`         INTEGER NOT NULL," +
            "`sensor_name`          VARCHAR(64) NOT NULL," +
            "`sensor_feature_db`    VARCHAR(128) NOT NULL," +
            "`sensor_ts`            INTEGER NOT NULL," +
            "`sensor_is_favorite`   TINYINT NOT NULL," +
            "`sensor_room_id`       UNSIGNEDBIGINT NOT NULL," +
            "`sensor_enabled`       TINYINT NOT NULL);");
            
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_sensor_history` (" +
            "`record_id`            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`sensor_address`       VARCHAR(128) NOT NULL," +
            "`sensor_value`         VARCHAR(64) NOT NULL," +
            "`sensor_ts`            VARCHAR(64) NOT NULL);");
        
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_scripts` (" +
            "`script_id`            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`script_uuid`          VARCHAR(128) NOT NULL," +
            "`script_name`          VARCHAR(64) NOT NULL," +
            "`script_description`   VARCHAR(256) NOT NULL," +
            "`script_ts`            INTEGER NOT NULL," +
            "`script_last_update`   INTEGER NOT NULL," +
            "`script_enabled`       TINYINT NOT NULL);");
        
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_user_scripts` (" +
            "`record_id`            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`script_id`            INTEGER NOT NULL," +
            "`user_id`              INTEGER NOT NULL," +
            "`script_db`            VARCHAR(256) NOT NULL," +
            "`record_enabled`       TINYINT NOT NULL);");
            
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_script_sensor_association` (" +
            "`association_id`       INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`script_uuid`          VARCHAR(128) NOT NULL," +
            "`sensor_address`       UNSIGNEDBIGINT NOT NULL," +
            "`association_enabled`  TINYINT NOT NULL);");
        /* 
        sql.run("CREATE TABLE IF NOT EXISTS `tbl_log_script` (" +
            "`log_id`               INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
            "`log_ts`               VARCHAR(128) NOT NULL," +
            "`log_message`          UNSIGNEDBIGINT NOT NULL," +
            "`script_id`            TINYINT NOT NULL);");
        */
    });
}

/*
 * USERS
 */

SqliteAdapter.prototype.GetAllUsers = function (callback) {
    var sql = this.db;
    console.log ("GetAllUsers");
    sql.serialize(function() {
        var query = "SELECT `user_id`, `user_key`, `user_name`, `user_password`, `user_ts`, `user_last_login_ts`, `user_enabled` " +
            "FROM  `tbl_users`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.GetUserInfo = function (key, callback) {
    var sql = this.db;
    console.log ("GetUserInfo");
    sql.serialize(function() {
        var query = "SELECT `user_id`, `user_key`, `user_name`, `user_password`, `user_ts`, `user_last_login_ts`, `user_enabled` " +
            "FROM  `tbl_users` " +
            "WHERE `user_key` = '" + key + "';";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}


SqliteAdapter.prototype.CreateUser = function (user) {
    var sql = this.db;
    console.log ("CreateUser");
    
    function s4 () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    user.uuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    
    // TODO - check if credentials already existing in the system
    sql.serialize(function() {
        sql.run("INSERT INTO `tbl_users` (`user_id`, `user_key`, `user_name`, `user_password`, `user_ts`, `user_last_login_ts`, `user_enabled`) " +
            "VALUES (NULL,'" + user.uuid + "','" + user.name + "','" + user.password + "'," + user.ts + "," + user.last_login + ", 1);");
    });
}

SqliteAdapter.prototype.CheckUserKey = function (key, callback) {
    var sql = this.db;
    console.log ("CheckUserKey");
    return sql.serialize(function() {
        var query = "SELECT 'OK' as status, `user_id` " +
            "FROM  `tbl_users` " +
            "WHERE `user_key` = '" + key + "';";

        return sql.all(query, function(err, rows) {
            if (rows.length > 0) {
                if (rows[0].status == 'OK') {
                    return callback ('TRUE');
                }
            }
            return callback ('FALSE');
        });
    });
}

/*
 * SENSORS
 */

SqliteAdapter.prototype.GetAllSensors = function (callback) {
    var sql = this.db;
    console.log ("GetAllSensors");
    sql.serialize(function() {
        var query = "SELECT sensor_id, sensor_address, sensor_type, sensor_value, sensor_name, sensor_feature_db, sensor_ts, sensor_is_favorite, sensor_room_id, sensor_enabled " +
            "FROM  `tbl_sensors`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.GetSensorsByType = function (data, callback) {
    var sql = this.db;
    console.log ("GetAllSensors " + data.type);
    sql.serialize(function() {
        var query = "SELECT sensor_id, sensor_address, sensor_type, sensor_value, sensor_name, sensor_feature_db, sensor_ts, sensor_is_favorite, sensor_room_id, sensor_enabled " +
            "FROM  `tbl_sensors` " +
			"WHERE user_id = " + data.user_id + " AND sensor_type in (" + data.type + ");";
        console.log (query);
        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.CreateNewSensor = function (sensor) {
    var sql = this.db;
    console.log ("CreateNewSensor");
    sql.serialize(function() {
        var query = "INSERT INTO `tbl_sensors` (`sensor_id`, " +
            "`user_id`, " +
            "`sensor_address`, " +
            "`sensor_type`, " +
            "`sensor_value`, " +
            "`sensor_name`, " +
            "`sensor_feature_db`, " +
            "`sensor_ts`, " +
            "`sensor_is_favorite`, " +
            "`sensor_room_id`, " +
            "`sensor_enabled`) " +
            "VALUES ( NULL, " +
            sensor.userId + "," +
            sensor.addr + "," +
            sensor.type + "," +
            sensor.value + "," +
            sensor.name + "," +
            "'', " +
            "strftime('%s','now')," +
            "1," +
            "0," +
            "1);";
        sql.run(query);
    });
}

SqliteAdapter.prototype.UpdateSensorValue = function(sensor) {
    var sql = this.db;
    console.log ("UpdateSensorValue");
    sql.serialize(function() {
        sql.run("UPDATE `tbl_sensors` SET `sensor_value`=" + sensor.value + ", `sensor_ts`=" + sensor.ts + " WHERE `sensor_address`=" + sensor.addr);
    });
}

SqliteAdapter.prototype.ArchiveSensorValue = function(sensor) {
    var sql = this.db;
    console.log ("ArchiveSensorValue");
    sql.serialize(function() {
        sql.run("INSERT INTO `tbl_sensor_history` (`record_id`, `sensor_address`, `sensor_value`, `sensor_ts`) " +
            "VALUES (NULL," + sensor.addr + "," + sensor.value + "," + sensor.ts + ");");
    });
}

/*
 * SCRIPTS
 */

SqliteAdapter.prototype.GetAllScripts = function(callback) {
    var sql = this.db;
    console.log ("GetAllScripts");
    sql.serialize(function() {
        var query = "SELECT `script_id`, `script_uuid`, `script_name`, `script_description`, `script_ts`, `script_last_update`, `script_enabled` " +
            "FROM  `tbl_scripts`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.GetAllUsersScripts = function (data, callback) {
    var sql = this.db;
    console.log ("GetAllUsersScripts");
    sql.serialize(function() {
        var query = "SELECT * " +
            "FROM  `tbl_user_scripts` JOIN `tbl_scripts` ON `tbl_scripts`.script_id = `tbl_user_scripts`.script_id "
            "WHERE user_id = " + data.user_id + "'";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.GetAllAssociations = function (callback) {
    var sql = this.db;
    console.log ("GetAllAssociations");
    sql.serialize(function() {
        var query = "SELECT `association_id`, `script_uuid`, `sensor_address`, `association_enabled` " +
            "FROM  `tbl_script_sensor_association`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.GetScriptsOnSensorChange = function(sensorId, callback) {
    var sql = this.db;
    console.log ("GetScriptsOnSensorChange");
    sql.serialize(function() {
        var query = "SELECT `script_uuid`,`association_enabled` " +
            "FROM  `tbl_script_sensor_association` " +
            "WHERE `sensor_address` = " + sensorId + " AND `association_enabled` = 1;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.GetScriptIdByUUID = function(uuid, callback) {
    var sql = this.db;
    console.log ("GetScriptIdByUUID");
    sql.serialize(function() {
        var query = "SELECT `script_id` " +
            "FROM  `tbl_scripts` " +
            "WHERE `script_uuid` = '" + uuid + "';";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.CreateScript = function (script) {
    var sql = this.db;
    console.log ("CreateScript");
    // TODO - Check whether the UUID already exist in the system.
    sql.serialize(function() {
        sql.run("INSERT INTO `tbl_scripts` (`script_id`, `script_uuid`, `script_name`, `script_description`, `script_ts`, `script_last_update`, `script_enabled`) " +
            "VALUES (NULL,'" + script.uuid + "','" + script.name + "','" + script.description + "'," + script.ts + "," + script.last_update + "," + script.enabled + ");");
    });
}

SqliteAdapter.prototype.CreateUserScript = function (script, callback) {
    var sql = this.db;
    console.log ("CreateUserScript");
    sql.serialize(function() {
        var query = "INSERT INTO `tbl_user_scripts` (`record_id`, `script_id`, `user_id`, `script_db`, `record_enabled`) " +
            "SELECT NULL," + script.script_id + "," + script.user_id + ",'" + script.db + "', 1 " + 
            "WHERE NOT EXISTS (SELECT 1 FROM `tbl_user_scripts` WHERE `script_id` = " + script.script_id + " AND `user_id` = " + script.user_id + ");";
        sql.run (query);

        query = "SELECT `script_uuid` " +
            "FROM  `tbl_scripts` " +
            "WHERE `script_id` = " + script.script_id + ";";
        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.CreateSensorAssociation = function (scriptUUID, sensorAddr) {
    var sql = this.db;
    console.log ("CreateSensorAssociation");

    // TODO - Check whether the UUID already exist in the system.
    sql.serialize (function() {
        sql.run("INSERT INTO `tbl_script_sensor_association` (`association_id`, `script_uuid`, `sensor_address`, `association_enabled`) " +
            "SELECT NULL,'" + scriptUUID + "'," + sensorAddr + ", 1 " + 
            "WHERE NOT EXISTS (SELECT 1 FROM `tbl_script_sensor_association` WHERE `script_uuid` = '" + scriptUUID + "' AND `sensor_address` = " + sensorAddr + ");");
        sql.run("UPDATE `tbl_script_sensor_association` " +
            "SET `association_enabled` = 1 " + 
            "WHERE `script_uuid` = '" + scriptUUID + "' AND `sensor_address` = " + sensorAddr + ";");
    });
}

SqliteAdapter.prototype.RemoveSensorAssociation = function (scriptUUID, sensorAddr) {
    var sql = this.db;
    console.log ("RemoveSensorAssociation");

    // TODO - Check whether the UUID already exist in the system.
    sql.serialize (function() {
        sql.run("UPDATE `tbl_script_sensor_association` " +
            "SET `association_enabled` = 0 " + 
            "WHERE `script_uuid` = '" + scriptUUID + "' AND `sensor_address` = " + sensorAddr + ";");
    });
}

SqliteAdapter.prototype.SetScriptDB = function (data, callback) {
    var sql = this.db;
    console.log ("SetScriptDB");
    
    sql.serialize(function() {
        sql.run("UPDATE `tbl_user_scripts` " +
            "SET `script_db` = '" + data.script_db + "' " +
            "WHERE `script_id` = " + data.script_id + ";");
    });
    
    callback ({status: "PASS"});
}

SqliteAdapter.prototype.GetScriptDB = function (data, callback) {
    var sql = this.db;
    console.log ("GetScriptDB");
    
    sql.serialize(function() {
        var query = "SELECT `script_db` " +
            "FROM  `tbl_user_scripts` " +
            "WHERE `script_id` = " + data.script_id + ";";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.DeleteAllUsersScripts = function(callback) {
    var sql = this.db;
    console.log ("DeleteAllUsersScripts");
    sql.serialize(function() {
        var query = "DELETE FROM `tbl_user_scripts`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.DeleteAllScripts = function(callback) {
    var sql = this.db;
    console.log ("DeleteAllScripts");
    sql.serialize(function() {
        var query = "DELETE FROM `tbl_scripts`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

SqliteAdapter.prototype.DeleteAllAssociations = function(callback) {
    var sql = this.db;
    console.log ("DeleteAllAssociations");
    sql.serialize(function() {
        var query = "DELETE FROM `tbl_script_sensor_association`;";

        sql.all(query, function(err, rows) {
            callback(null, rows);
        });
    });
}

function SqliteFactory(c) {
    console = c;
    return SqliteAdapter;
}

module.exports = SqliteFactory;
