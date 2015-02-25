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
    res.status(200).json({ "message": "Call created", "id": id });
});

module.exports = router;
