/**
 * API create connections module
 *
 * Create new connections
 */

var router = require("express").Router(),
    crypto = require("crypto");

router.post("/", function (req, res) {
    var id = crypto.createHash("sha1")
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex');

    // Look for the `name` query parameter
    var name = req.body && req.body.name && req.body.name.trim();

    if (!name) {
        return res.status(406).json({ "message": "Need `name` as a query parameter." });
    }

    // Prepare data object
    var data = {
        members: [{ ip: req.ip, name: name, joined: Date.now(), quit: null }],
        meta: {
            created: Date.now(),
            creator: name
        }
    };

    // Put id in session db
    cq.db.sessions.put(id, data, function (err) {
        if (err) {
            console.log("[ERR] Creating session", id, req.ip);
            return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
        }
        res.status(200).json({ "message": "Session created", session: { id: id, data: data }});
    });
});

module.exports = router;
