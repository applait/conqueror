/**
 * API connect module
 *
 * Connect to existing connections
 */

var router = require("express").Router();

router.post("/:id", function (req, res) {
    res.status(200).json(req.params);
});

router.post("/", function (req, res) {
    res.status(406).json({ "message": "Need a connection id." });
});

module.exports = router;
