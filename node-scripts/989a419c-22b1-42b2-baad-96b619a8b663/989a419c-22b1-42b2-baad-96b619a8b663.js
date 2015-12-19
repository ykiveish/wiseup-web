var nodemailer = require("nodemailer");

console.log ("SECURITY");

function API () {
    var self = this;
}

API.prototype.GetWidgetDB = function (script_uuid, callback) {
    params.db.GetScriptIdByUUID (script_uuid, function (err, data) {
        if (data.length < 1) {
            callback ({status: "FAILED"}, null);
            return;
        }
        
        params.db.GetScriptDB ( {
            script_id: data[0].script_id }, 
            function (err, info) {
                var script_db = info[0].script_db;
                callback ({status: "OK"}, script_db);
        });
    });
}

api = new API ();
api.GetWidgetDB (params.script_data.script_uuid, function (err, data) {    
    if (err.status == "FAILED") {
        return;
    }
    
    params.sensors.SensorAPI_GetSensorInfo ({
        sensor_addr: params.sensor.addr },
        function (err, sensor) {            
            if (sensor == null) {
                return;
            }
            
            appDB = JSON.parse(data);
            if (appDB.status == 1) {
                if (sensor.value == 1) {
                    // TODO - Update local DB that user was acknowledged more than 3 times. 
                    console.log ("ALERT >> CALL THE POLICE ...");
                    var smtpTransport = nodemailer.createTransport("SMTP", {
                        service: "Mandrill",
                        auth: {
                            user: "wiseup.mail@gmail.com",
                            pass: "PKBrtXRs1Dm5vm6hfG6OIw"
                        }
                    });
                    
                    var mailOptions = {
                        to : "lodmilak@gmail.com",
                        subject : "WISEUP SECURITY ALARM",
                        text : "There is a movement in your home."
                    }

                    smtpTransport.sendMail (mailOptions, function (error, response){
                        if (error) {
                            console.log (error);
                        } else {
                            console.log ("Message sent: " + response.message);
                        }
                    });
                } else {
                    console.log ("ALERT >> NOTHING MOVED ...");
                }
            } else {
                console.log ("SECURITY NOT ARMED ...");
            }
        });
});