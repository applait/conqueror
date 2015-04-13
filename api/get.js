/**
 * API get information module
 *
 * Get session info
 */

var getsession = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim();

    if (!id) {
        return callback({ "message": "Need a session id", "status": 401 });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, session) {
        if (err) {
            console.log("[ERR] Fetching session", id, err);
            return callback({ "message": "Error fetching session.", "status": 500 });
        }

        return callback(null, { "message": "Session info", "session": { "id": id, "data": data }});
    });
};

var getroom = function (data, callback, socket) {
    var id = data && data.roomid && data.roomid.trim();

    if (!id) {
        return callback({ "message": "Need to specify `roomid`", "status": 401 });
    }

    // Fetch room
    cq.nuve.API.getRoom(id, function (room) {
        callback(null, { "message": "Room info", "room": room });
    }, function (err) {
        console.log("[ERR] Fetching room", id, err);
        callback({ "message": "Error fetching room.", "status": 500 });
    });
};

var getusers = function (data, callback, socket) {
    var id = data && data.roomid && data.roomid.trim();

    if (!id) {
        return callback({ "message": "Need to specify `roomid`", "status": 401 });
    }

    // Fetch room
    cq.nuve.API.getUsers(id, function (users) {
        callback(null, { "message": "Room users", "users": users });
    }, function (err) {
        console.log("[ERR] Fetching users for session.", id, err);
        callback({ "message": "Error fetching users", "status": 500 });
    });
};

module.exports = {
    getsession: getsession,
    getroom: getroom,
    getusers: getusers
};
