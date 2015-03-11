#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    config = require("./config"),
    db = require("./db"),
    kurentoclient = require("kurento-client");

var app = express();

// Set useful globals
global.cq = {
    db: db,
    config: config,
    kurento: kurentoclient(config.KURENTO_URL, function (err, kurento) {
        if (err) {
            console.error("Could not find Kurento Media server at " + config.KURENTO_URL, err);
        }
        return kurento;
    })
};

// Configure application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, 'static')));

// Register routes
app.use("/api", require("./api/api"));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Starting ConQueror...");
    console.log("Listening on port %d", server.address().port);
});
