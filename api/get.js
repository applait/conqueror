/**
 * API get information module
 *
 * Get session info
 */

var getsession = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim();

    if (!id) {
        return callback({ "message": "Need a session id" });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, session) {
        if (err) {
            console.log("[ERR] Fetching session", id, err);
            return callback({ "message": "Not right." });
        }

        return callback(null, { "message": "Session info", "session": { "id": id, "data": data }});
    });
};

var getroom = function (data, callback, socket) {
    var id = data && data.roomid && data.roomid.trim();

    if (!id) {
        return callback({ "message": "Need to specify `roomid`" });
    }

    // Fetch room
    cq.nuve.API.getRoom(id, function (room) {
        callback(null, { "message": "Room info", "room": room });
    }, function (err) {
        console.log("[ERR] Fetching room", id, err);
        callback({ "message": "Not right." });
    });
};

var getusers = function (data, callback, socket) {
    var id = data && data.roomid && data.roomid.trim();

    if (!id) {
        return callback({ "message": "Need to specify `roomid`" });
    }

    // Fetch room
    cq.nuve.API.getUsers(id, function (users) {
        callback(null, { "message": "Room users", "users": users });
    }, function (err) {
        console.log("[ERR] Fetching room", id, err);
        callback({ "message": "Not right." });
    });
};

module.exports = {
    getsession: getsession,
    getroom: getroom,
    getusers: getusers
};
