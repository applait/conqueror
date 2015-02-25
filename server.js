#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    config = require("./config");

var app = express();

// Configure application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, 'assets')));
app.use("/", express.static(path.join(__dirname, 'static')));

// Register routes
app.use("/api", require("./api/api"));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Starting ConQueror...");
    console.log("Listening on port %d", server.address().port);
});
