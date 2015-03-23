/**
 * API connect module
 *
 * Connect to existing connections
 */

module.exports = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim(),
        name = data && data.name && data.name.trim(),
        session;

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

    if (!name) {
        return callback({ "message": "Need `name` to be passed in the data." });
    }

    var joinsession = function () {
        var datetime = new Date();
        // Prepare data object
        session.members.push({ ip: socket.client.conn.remoteAddress, name: name, joined: datetime, quit: null });

        // Put id in session db
        cq.db.sessions.put(id, session, function (err) {
            if (err) {
                return onerror(err);
            }
            console.log("Session joined", id);
            return callback(null, { "message": "Session joined",
                                    session: { id: id,
                                               data: data,
                                               sdpAnswer: sdpanswer }});


        });
    };

    // Fetch session
    cq.db.sessions.get(id, function (err, _session) {
        if (err) {
            console.er("[ERR] Fetching session", id, err);
            return callback({ "message": "Not right." });
        }

        session = _session;

        // Match name
        var namematch = session.members.filter(function (el) {
            return el.name === name;
        });

        if (namematch.length) {
            return callback({ "message": "Name already in use. Could not join session." });
        }

        console.log("Connecting %s to call id %s.", name, id);
        joinsession();
    });
};
