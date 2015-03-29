/**
 * API connect module
 *
 * Connect to existing connections
 */

var crypto = require("crypto");

module.exports = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim();

    var onerror = function (error) {
        console.log("ERROR", error);
        return callback({ "message": "Oops! Error! API has gone nuts." });
    };

    var message = function (value, type) {
        type = type || "STATUS";
        socket.emit("message", { value: value, type: type });
    };

    var createstring = function () {
        return crypto.createHash("sha1")
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .slice(0, 8);
    };

    if (!id) {
        return callback({ "message": "Need `sessionid` to be passed in the data." });
    }

    var updatesession = function (session, username, token) {
        var datetime = new Date();

        session.members[username] = { name: username, joined: datetime, quit: null, token: token };

        // Put id in session db
        cq.db.sessions.put(id, session, function (err) {
            if (err) {
                return onerror(err);
            }
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

        var username = createstring();

        // Check for uxistingname name
        if (session.members[username]) {
            username = createstring();
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
