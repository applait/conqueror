/**
 * API get information module
 *
 * Get session info
 */

module.exports = function (data, callback, socket) {
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
