function Users (database) {
    self = this;
    this.db = database;
}

Users.prototype.UserAPI_AddUser = function (data, callback) {
    this.db.CreateUser(data);
    callback ({status:"OK"}, null);
}

Users.prototype.UserAPI_RemoveUser = function (data, callback) {
    
}

Users.prototype.UserAPI_EditUser = function (data, callback) {
    
}

Users.prototype.UserAPI_GetUserInfo = function (data, callback) {
    
}

Users.prototype.UserAPI_GetAllUsersInfo = function (data, callback) {
    this.db.GetAllUsers (function (err, users) {
        var data = [];

        for (i = 0; i < users.length; i++) {
            var user = {
                id: users[i].user_id,
                key: users[i].user_key,
                name: users[i].user_name,
                password: users[i].user_password,
                ts: users[i].user_ts,
                last_login: users[i].user_last_login_ts,
                enabled: users[i].user_enabled
            };
            data.push (user);
        }
        
        callback (err, data);
    });
}

Users.prototype.UserAPI_ChangeUserKey = function (data, callback) {
    
}

function UsersFactory () {
    return Users;
}

module.exports = Users;