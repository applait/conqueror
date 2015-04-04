/**
 * Core API handler
 */

var callcreate = require("./create"),
    callconnect = require("./connect"),
    get = require("./get"),
    disconnect = require("./disconnect");

module.exports = function (socket) {

    console.log("Received connection");
    socket.emit("message", { value: "Connected. Ready.", type: "CONNECTION" });

    socket.on("call:create", function (data, callback) {
        callcreate(data, callback, socket);
    });

    socket.on("call:connect", function (data, callback) {
        callconnect(data, callback, socket);
    });

    socket.on("call:get", function (data, callback) {
        get.getsession(data, callback, socket);
    });

    socket.on("call:disconnect", function (data, callback) {
        disconnect(data, callback, socket);
    });

    socket.on("room:get", function (data, callback) {
        get.getroom(data, callback, socket);
    });

    socket.on("room:users", function (data, callback) {
        get.getusers(data, callback, socket);
    });

};
