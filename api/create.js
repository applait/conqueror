/**
 * API create connections module
 *
 * Create new connections
 */

var crypto = require("crypto");

module.exports = function (data, callback, socket) {
    var username = data && data.username && data.username.trim();

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

    if (!username) {
        return callback({ "message": "Need `username` to be passed in the data." });
    }

    var id = createstring();

    var createsession = function (room, username, token) {
        var datetime = new Date();
        // Prepare data object
        var sessiondata = {
            room: room,
            members: {},
            meta: {
                created: datetime,
                creator: username
            }
        };

        sessiondata.members[username] =  { name: username, joined: datetime, quit: null, token: token, creator: true };

        // Put id in session db
        cq.db.sessions.put(id, sessiondata, function (err) {
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
            console.log("Session created", id, sessiondata.meta.created);
            return callback(null, { message: "Session created",
                                    session: { id: id,
                                               data: sessiondata },
                                    username: username,
                                    token: token });


        });
    };

    // Create call room here
    console.log("Beginning call: ", id);
    cq.nuve.API.createRoom(id, function (room) {
        message("Room created");
        console.log("Nuve Room created ", room._id);
        // Room created. Connect current user
        cq.nuve.API.createToken(room._id, username, "audiocaller", function (token) {
            // Got user token
            message("Generated token");
            console.log("Got user token. User: %s, Call: %s", username, id);
            createsession(room, username, token);
        }, onerror);

    }, onerror);
};
