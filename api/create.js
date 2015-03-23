/**
 * API create connections module
 *
 * Create new connections
 */

var crypto = require("crypto");

module.exports = function (data, callback, socket) {
    var onerror = function (error) {
        console.log("ERROR", error);
        return callback({ "message": "Oops! Error! API has gone nuts." });
    };

    var message = function (value, type) {
        type = type || "STATUS";
        socket.emit("message", { value: value, type: type });
    };

    var id = crypto.createHash("sha1")
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .slice(0, 8);

    // Look for the `name` query parameter
    var name = data && data.name && data.name.trim();
    var sdpoffer = data && data.sdpOffer && data.sdpOffer.trim();
    var pipeline = null,
        hub = null,
        hubport = null;

    if (!name) {
        return callback({ "message": "Need `name` to be passed in the data." });
    }

    if (!sdpoffer) {
        return callback({ "message": "Need `sdpOffer` to be passed in the data." });
    }

    var pipelinecreated = function (_pipeline) {
        console.log("MediaPipeline created", _pipeline.id);
        message("Pipeline created");

        pipeline = _pipeline;
        pipeline.create("Composite").then(hubcreated, onerror);
    };

    var hubcreated = function (_hub) {
        console.log("Hub Created", _hub.id);
        message("Hub created");

        hub = _hub;
        cq.kurento.create("HubPort", { hub: hub }).then(hubportcreated, onerror);
    };

    var hubportcreated = function (_hubport) {
        console.log("Hubport created", _hubport.id);
        message("Hubport created");

        hubport = _hubport;
        pipeline.create("WebRtcEndpoint").then(webrtcendpointcreated, onerror);
    };

    var webrtcendpointcreated = function (webrtc) {
        console.log("WebRtcEndpoint created", webrtc.id);
        message("WebRTC Endpoint created");

        webrtc.processOffer(sdpoffer).then(function (sdpanswer) {
            console.log("SDP offer accepted");
            message("SDP offer accepted");

            webrtc.connect(hubport).then(function () {
                console.log("WebRTC Endpoint connected to Hubport " + hubport.id);

                hubport.connect(webrtc).then(function () {
                    console.log("Hubport connected to WebRTC Endpoint.");
                    message("Connections established");
                    createsession(webrtc, sdpanswer);
                }, onerror);

            }, onerror);

        }, onerror);
    };

    var createsession = function (webrtc, sdpanswer) {
        var datetime = new Date();
        // Prepare data object
        var data = {
            members: [{ ip: socket.client.conn.remoteAddress, name: name, joined: datetime, quit: null,
                        hubport: hubport, webrtc: webrtc }],
            meta: {
                created: datetime,
                creator: name
            },
            pipeline: pipeline,
            hub: hub
        };

        // Put id in session db
        cq.db.sessions.put(id, data, function (err) {
            if (err) {
                return onerror(err);
            }
            console.log("Session created", id, data.meta.created);
            return callback(null, { "message": "Session created",
                                    session: { id: id,
                                               data: data,
                                               sdpAnswer: sdpanswer }});


        });
    };

    cq.kurento.create("MediaPipeline").then(pipelinecreated, onerror);
};
