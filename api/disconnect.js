/**
 * API delete/disconnect module
 *
 */

var disconnect = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim(),
        username = data && data.username && data.username.trim();

    if (!id) {
        return callback({ "message": "Need a session id", "status": 401 });
    }

    if (!username) {
        return callback({ "message": "Need a `username`", "status": 401 });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, session) {
        if (err) {
            console.log("Session already closed.", id);
            return callback({ "message": "Session already closed.", "status": 200 });
        }

        var user = session.members[username];

        if (!user) {
            return callback({ "message": "User does not exist in session.", "status": 401 });
        }

        // if (user.creator) {
        //     deleteroom(id, session, socket, callback);
        // } else {
        //     deleteuser(user, id, session, socket, callback);
        // }
        deleteuser(user, id, session, socket, callback);

        //return callback(null, { "message": "Session info", "session": { "id": id, "data": data }});
    });
};

var deleteroom = function (sessionid, session, socket, callback) {

    // Fetch room
    cq.nuve.API.deleteRoom(session.room._id, function () {

        cq.db.sessions.del(sessionid, function (err) {
            if (err) {
                console.log("Room deleted, but could not delete session: ", sessionid);
                return callback({ "message": "Room deleted. But session not deleted", "status": 500 });
            }
            socket.broadcast.to(sessionid).emit("call:ended", { value: { sessionid: sessionid } });
            console.log("Call ended - creator disconnect", sessionid);
            callback(null, { "message": "Session deleted" });
        });
    }, function (err) {
        console.log("[ERR] Deleting room", roomid, err);
        callback({ "message": "Couldn't delete room.", "status": 500 });
    });
};

var deleteuser = function (user, sessionid, session, socket, callback) {
    session.members[user.name].quit = true;
    cq.db.sessions.put(sessionid, session, function (err) {
        if (err) {
            console.log("[ERR] Updating session after removing user", sessionid, err);
            return callback({ "message": "Couldn't update session.", "status": 500 });
        }
        socket.broadcast.to(sessionid).emit("user:dropped", { value: { name: user.name } });
        console.log("User quit from session. user: %s, session: %s", user.name, sessionid);
        callback(null, { "message": "User quit" });
    });
};

module.exports = disconnect;
