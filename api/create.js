/**
 * API create connections module
 *
 * Create new connections
 */

var crypto = require("crypto");

module.exports = function (data, callback, socket) {
    var onerror = function (error) {
        console.log("ERROR", error);
        return callback({ "message": "Oops! Error! API has gone nuts." });
    };

    var message = function (value, type) {
        type = type || "STATUS";
        socket.emit("message", { value: value, type: type });
    };

    var id = crypto.createHash("sha1")
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .slice(0, 8);

    // Look for the `name` query parameter
    var name = data && data.name && data.name.trim();

    if (!name) {
        return callback({ "message": "Need `name` to be passed in the data." });
    }

    var createsession = function () {
        var datetime = new Date();
        // Prepare data object
        var data = {
            members: [{ ip: socket.client.conn.remoteAddress, name: name, joined: datetime, quit: null }],
            meta: {
                created: datetime,
                creator: name
            }
        };

        // Put id in session db
        cq.db.sessions.put(id, data, function (err) {
            if (err) {
                return onerror(err);
            }
            console.log("Session created", id, data.meta.created);
            return callback(null, { "message": "Session created",
                                    session: { id: id,
                                               data: data,
                                               sdpAnswer: sdpanswer }});


        });
    };
};
