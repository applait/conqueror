/**
 * API get information module
 *
 * Get session info
 */

var router = require("express").Router();

router.get("/:id", function (req, res) {
    var id = req.params && req.params.id && req.params.id.trim();

    if (!id) {
        return res.status(406).json({ "message": "Need a session id" });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, data) {
        if (err) {
            console.log("[ERR] Fetching session", id, err);
            return res.status(406).json({ "message": "Not right." });
        }

        res.status(200).json({ "message": "Session info", "session": { "id": id, "data": data }});
    });
});

router.post("/", function (req, res) {
    res.status(406).json({ "message": "Need a session id." });
});

module.exports = router;
