/**
 * API connect module
 *
 * Connect to existing connections
 */

var util = require("util");

var q = function (c) {
    return util.inspect(c, {showHidden: true, depth: null });
};

module.exports = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim(),
        name = data && data.name && data.name.trim();

    if (!id) {
        return callback({ "message": "Need a connection id." });
    }

    if (!name) {
        return callback({ "message": "Need name as a query parameter." });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, session) {
        if (err) {
            console.log("[ERR] Fetching session", id, err);
            return callback({ "message": "Not right." });
        }

        // Match name
        var namematch = session.members.filter(function (el) {
            return el.name === name;
        });

        if (namematch.length) {
            return callback({ "message": "Name already in use. Could not join session." });
        }

        cq.kurento.getMediaobjectById(session.pipeline.id, function (error, pipeline) {
            if (error) {
                console.log("[ERR] Updating session", id, err);
                return callback({ "message": "Can't join session." });
            }

            // Create new user info
            var currentuser = { ip: null, name: name, joined: Date.now(), quit: null };

            session.members.push(currentuser);

            // Add to current session info
            cq.db.sessions.put(id, session, function (err) {
                if (err) {
                    console.log("[ERR] Updating session", id, err);
                    return callback({ "message": "Can't join session." });
                }

                return callback(null, { "message": "Session joined", "session": { "id": id, "data": data }});
            });
        });
    });
};
