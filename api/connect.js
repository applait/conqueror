/**
 * API connect module
 *
 * Connect to existing connections
 */

module.exports = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim(),
        name = data && data.name && data.name.trim(),
        sdpoffer = data && data.sdpOffer && data.sdpOffer.trim(),
        pipeline = null,
        hub = null,
        hubport = null,
        session = null;

    var onerror = function (error) {
        console.log("ERROR", error);
        return callback({ "message": "Oops! Error! API has gone nuts." });
    };

    var message = function (value, type) {
        type = type || "STATUS";
        socket.emit("message", { value: value, type: type });
    };

    if (!id) {
        return callback({ "message": "Need `sessionid` to be passed in the data." });
    }

    if (!name) {
        return callback({ "message": "Need `name` to be passed in the data." });
    }

    if (!sdpoffer) {
        return callback({ "message": "Need `sdpOffer` to be passed in the data." });
    }

    var pipelineretrieved = function (_pipeline) {
        console.log("MediaPipeline retrieved", _pipeline.id);
        message("Obtained call pipeline");

        pipeline = _pipeline;
        cq.kurento.getMediaobjectById(session.hub.id).then(hubretrieved, onerror);
    };

    var hubretrieved = function (_hub) {
        console.log("Hub retrieved", _hub.id);
        message("Obtained call hub");

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
            message("SDP offer accepted");

            webrtc.connect(hubport).then(function () {
                console.log("WebRTC Endpoint connected to Hubport " + hubport.id);

                hubport.connect(webrtc).then(function () {
                    console.log("Hubport connected to WebRTC Endpoint.");
                    message("Connections established");
                    joinsession(webrtc, sdpanswer);
                }, onerror);

            }, onerror);
        }, onerror);
    };

    var joinsession = function (webrtc, sdpanswer) {
        var datetime = new Date();
        // Prepare data object
        session.members.push({ ip: socket.client.conn.remoteAddress, name: name, joined: datetime, quit: null,
                               hubport: hubport, webrtc: webrtc });

        // Put id in session db
        cq.db.sessions.put(id, session, function (err) {
            if (err) {
                return onerror(err);
            }
            console.log("Session joined", id);
            return callback(null, { "message": "Session joined",
                                    session: { id: id,
                                               data: data,
                                               sdpAnswer: sdpanswer }});


        });
    };

    // Fetch session
    cq.db.sessions.get(id, function (err, _session) {
        if (err) {
            console.er("[ERR] Fetching session", id, err);
            return callback({ "message": "Not right." });
        }

        session = _session;

        // Match name
        var namematch = session.members.filter(function (el) {
            return el.name === name;
        });

        if (namematch.length) {
            return callback({ "message": "Name already in use. Could not join session." });
        }

        console.log("Connecting %s to call id %s. Retrieving pipeline.", name, id);

        cq.kurento.getMediaobjectById(session.pipeline.id).then(pipelineretrieved, onerror);
    });
};
