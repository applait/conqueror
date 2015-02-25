/**
 * Core API handler
 */

var router = require("express").Router();

router.get("/", function (req, res) {
    res.status(406).json({ "message": "Hello, multiverse!" });
});

router.use("/create", require("./create"));

router.use("/connect", require("./connect"));

module.exports = router;
