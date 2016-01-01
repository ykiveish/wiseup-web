var fs = require('fs');
var vm = require('vm');
var console;

var path = "/home/pi/workspace/proj/wiseup-web/node-backend/"; // TODO - Make this path relative.

function FSAdapter (path) {
    var self = this;
    this.scriptPath = path;
}

FSAdapter.prototype.WriteLog = function (type, msg, callback) {
    console.log ("WriteLog");
    
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    
    fs.appendFile('/home/pi/workspace/proj/wiseup-web/node-logs/general.txt', "#[" + year + "." + month + "." + day + " " + hour + ":" + min + ":" + sec + "] " + msg + "\n", function (err) {
        callback ();
    });
}

FSAdapter.prototype.GetScriptUI = function (scriptUUID, callback) {
    console.log ("GetScriptUI");
    // TODO - Check if file exist.
    fs.readFile(this.scriptPath + scriptUUID + '/' + scriptUUID + '.html', function (e, fsHTML) {
        var html = fsHTML.toString();
        callback (html);
    });
}

FSAdapter.prototype.GetScriptConfig = function (scriptUUID, callback) {
    console.log ("GetScriptConfig");
    fs.readFile(this.scriptPath + scriptUUID + '/'+ scriptUUID + '.json', function (e, fsJSON) {
        var conf = fsJSON.toString();
        callback (conf);
    });
}

FSAdapter.prototype.ExecuteScript = function (scriptUUID, data, callback) {
    console.log ("ExecuteScript");
    var code = "";
    fs.readFile(this.scriptPath + scriptUUID + '/' + scriptUUID + '.js', function (e, fsCode) {
        code = fsCode.toString();
        
        var filename = path + 'web-api.js';
        vm.runInNewContext(code, {
            require: require,
            console: console,
            params: data,
            __filename: filename
        }, filename);
    });
    
    callback (null, null);
}

FSAdapter.prototype.GetIconScript = function (scriptUUID, callback) {
    console.log ("GetIconScript");
    var image = "";
    fs.readFile(this.scriptPath + scriptUUID + '/' + scriptUUID + '.png', function (e, fsCode) {
        image = new Buffer (fsCode, 'binary').toString('base64');
        callback (image);
    });
}

FSAdapter.prototype.GetImageScript = function (req_data, callback) {
    console.log ("GetImageScript");
    var image = "";
    fs.readFile(this.scriptPath + req_data.script_uuid + '/images/' + req_data.file_name, function (e, fsCode) {
        image = new Buffer (fsCode, 'binary').toString('base64');
        callback (image);
    });
}

function FSFactory (c) {
    console = c;
    return FSAdapter;
}

module.exports = FSFactory;
