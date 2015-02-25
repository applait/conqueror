/**
 * API connect module
 *
 * Connect to existing connections
 */

var router = require("express").Router();

router.post("/:id", function (req, res) {
    var id = req.params && req.params.id && req.params.id.trim(),
        name = req.body && req.body.name && req.body.name.trim();

    if (!id) {
        return res.status(406).json({ "message": "Need a connection id." });
    }

    if (!name) {
        return res.status(406).json({ "message": "Need name as a query parameter." });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, data) {
        if (err) {
            console.log("[ERR] Fetching session", id, err);
            return res.status(406).json({ "message": "Not right." });
        }

        // Match name
        var namematch = data.members.filter(function (el) {
            return el.name === name;
        });

        if (namematch.length) {
            return res.status(406).json({ "message": "Name already in use. Could not join session." });
        }

        // Create new user info
        var currentuser = { ip: req.ip, name: name, joined: Date.now(), quit: null };

        // Add to current session info
        cq.db.sessions.put(id, data.members.push(currentuser), function (err) {
            if (err) {
                console.log("[ERR] Updating session", id, err);
                return res.status(500).json({ "message": "Can't join session.'" });
            }

            res.status(200).json({ "message": "Session joined", "session": { "id": id, "data": data }});
        });
    });
});

router.post("/", function (req, res) {
    res.status(406).json({ "message": "Need a connection id." });
});

module.exports = router;
