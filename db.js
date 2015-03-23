/**
 * Adapter to different storage units
 */

var levelup = require("levelup");

module.exports = {
    sessions: levelup("./storage/sessions.db", {
        keyEncoding: "json",
        valueEncoding: "json"
    })
};
