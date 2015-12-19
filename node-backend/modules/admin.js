function Admin (database, filesystem) {
    self = this;
    this.db = database;
    this.fs = filesystem;
}

Admin.prototype.AdminAPI_DeleteScripts = function (callback) {
    this.db.DeleteAllScripts (function (err, data) {
        callback ({status: "PASS"});
    });
}

Admin.prototype.AdminAPI_DeleteAssociations = function (callback) {
    this.db.DeleteAllAssociations (function (err, data) {
        callback ({status: "PASS"});
    });
}

Admin.prototype.AdminAPI_DeleteUserScripts = function (callback) {
    this.db.DeleteAllUsersScripts (function (err, data) {
        callback ({status: "PASS"});
    });
}

function AdminFactory () {
    return Admin;
}

module.exports = Admin;