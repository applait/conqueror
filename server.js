#!/usr/bin/env node

var express = require("express"),
    https = require("https"),
    fs = require("fs"),
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
    // Lock down domains
    if (config.ALLOWED_ORIGINS.indexOf(req.headers["host"]) < 0) {
        console.log("Blocked connection from: %s. User agent: %s", req.headers["host"], req.headers["user-agent"]);
        return res.status(403).send("Invalid origin");
    }
    console.log("Allowing connection from: %s. User agent: %s", req.headers["host"], req.headers["user-agent"]);
    res.header('Access-Control-Allow-Origin', req.headers.host);
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, 'static')));

// Set https options
var https_options = {
  key: fs.readFileSync(config.SSL_KEY),
  cert: fs.readFileSync(config.SSL_CERT),
  passphrase: config.SSL_PASSPHRASE
};

// Start the secure server
var server = https.createServer(https_options, app).listen(config.APP_PORT, config.APP_IP, function () {
  console.log("Starting Conqueror secure server...");
  console.log("Listening on %s:%d", config.APP_IP, config.APP_PORT);
});

var io = require("socket.io").listen(server);
io.set("log level", 1);
io.set("origins", config.ALLOWED_ORIGINS);
io.sockets.on("connection", function (socket) {
    api(socket);
});
