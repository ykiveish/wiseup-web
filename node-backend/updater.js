const events = require('events');
var console;

function Updater () {
    events.EventEmitter.call (this);
    this.self = this;
    
    console.info("UPDATER: INSTANCE");
}

Updater.prototype.Update = function (id, data, callback) {
    this.self.emit(id, data);
}

Updater.prototype.__proto__ = events.EventEmitter.prototype;

function UpdaterFactory (c) {
    console = c;
    return Updater;
}

module.exports = UpdaterFactory;