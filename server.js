#!/usr/bin/env node

var http = require("http"),
    express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    io = require("socket.io"),
    easyrtc = require("easyrtc");

var config = require("./config"),
    db = require("./db"),
    api = require("./api");

var app = express();

// Set useful globals
global.cq = {
    db: db,
    config: config
};

// Configure application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, 'static')));

// Start the server
var httpserver = http.createServer(app).listen(config.APP_PORT);
var socketserver = io.listen(httpserver, { "log level": 1 });
var easyrtcserver = easyrtc.listen(app, socketserver);
