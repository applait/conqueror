#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    nuve = require("./nuve");

var config = require("./config"),
    db = require("./db"),
    api = require("./api");

var app = express();

nuve.API.init(config.NUVE_SERVICE_ID, config.NUVE_SERVICE_KEY, config.NUVE_HOST);

// Set useful globals
global.cq = {
    db: db,
    config: config,
    nuve: nuve
};

// Configure application
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, 'static')));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Starting ConQueror...");
    console.log("Listening on port %d", server.address().port);
});

var io = require("socket.io").listen(server);
io.set("log level", 1);
io.sockets.on("connection", function (socket) {
    api(socket);
});
