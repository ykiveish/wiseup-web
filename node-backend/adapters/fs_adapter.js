var fs = require('fs');
var vm = require('vm');
var console;

function FSAdapter (path) {
    var self = this;
    this.scriptPath = path;
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
    fs.readFile('/home/ykiveish/workspace/wiseup-web/node-scripts/' + scriptUUID + '/' + scriptUUID + '.js', function (e, fsCode) {
        code = fsCode.toString();
        
        var filename = '/home/ykiveish/workspace/wiseup-web/node-backend/web-api.js';
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
    fs.readFile('/home/ykiveish/workspace/wiseup-web/node-scripts/' + scriptUUID + '/' + scriptUUID + '.png', function (e, fsCode) {
        image = new Buffer (fsCode, 'binary').toString('base64');
        callback (image);
    });
}

FSAdapter.prototype.GetImageScript = function (req_data, callback) {
    console.log ("GetImageScript");
    var image = "";
    fs.readFile('/home/ykiveish/workspace/wiseup-web/node-scripts/' + req_data.script_uuid + '/images/' + req_data.file_name, function (e, fsCode) {
        image = new Buffer (fsCode, 'binary').toString('base64');
        callback (image);
    });
}

function FSFactory (c) {
    console = c;
    return FSAdapter;
}

module.exports = FSFactory;