/**
 * API connect module
 *
 * Connect to existing connections
 */

var crypto = require("crypto");

module.exports = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim();
    var username = data && data.username && data.username.trim();

    var onerror = function (error) {
        console.log("ERROR", error);
        return callback({ "message": "Oops! Error! API has gone nuts." });
    };

    var message = function (value, type) {
        type = type || "STATUS";
        socket.emit("message", { value: value, type: type });
    };

    if (!id) {
        return callback({ "message": "Need `sessionid` to be passed in the data." });
    }

    if (!username) {
        return callback({ "message": "Need `username` to be passed in the data." });
    }

    var updatesession = function (session, username, token) {
        var datetime = new Date();

        session.members[username] = { name: username, joined: datetime, quit: null, token: token, creator: false };

        // Put id in session db
        cq.db.sessions.put(id, session, function (err) {
            if (err) {
                return onerror(err);
            }
            socket.join(id, function (err) {
                if (err) {
                    message("Couldn't join session list", "ERROR");
                    console.log(err);
                } else {
                    message("Joined session list");
                }
            });
            socket.broadcast.to(id).emit("user:joined", { value: { name: username, joined: datetime } });
            console.log("Session joined", id);
            return callback(null, { message: "Session joined",
                                    session: { id: id,
                                               data: session },
                                    username: username,
                                    token: token });
        });
    };

    // Fetch session
    cq.db.sessions.get(id, function (err, session) {
        if (err) {
            console.error("[ERR] Fetching session", id, err);
            return callback({ "message": "Not right." });
        }

        // Check for existing name
        if (session.members[username]) {
            return callback({ "message": "Username is already present in the call." });
        }

        console.log("Connecting %s to call id %s. Retrieving room.", username, id);

        // Retrieve room
        cq.nuve.API.getRoom(session.room._id, function (room) {
            room = JSON.parse(room);
            message("Found call. Connecting.");
            console.log("Retrieved room");

            //Create token
            cq.nuve.API.createToken(room._id, username, "audiocaller", function (token) {
                // Got user token
                message("Generated token");
                console.log("Got user token. User: %s, Call: %s", username, id);
                updatesession(session, username, token);
            }, onerror);

        }, onerror);
    });
};
