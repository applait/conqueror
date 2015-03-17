/**
 * API create connections module
 *
 * Create new connections
 */

var crypto = require("crypto");

module.exports = function (data, callback, socket) {
    var id = crypto.createHash("sha1")
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .slice(0, 8);

    // Look for the `name` query parameter
    var name = data && data.name && data.name.trim();
    var sdpoffer = data && data.sdpOffer && data.sdpOffer.trim();

    if (!name) {
        return callback({ "message": "Need `name` to be passed in the data." });
    }

    if (!sdpoffer) {
        return callback({ "message": "Need `sdpOffer` to be passed in the data." });
    }

    // Auth passed. Create MediaPipeline
    cq.kurento.create("MediaPipeline", function (error, pipeline) {
        if (error) {
            console.log("MediaPipeline error", error);
            return callback({ "message": "Oops! Error! API has gone nuts." });
        }

        console.log("MediaPipeline created", pipeline.id);

        // Create webrtc endpoint at this point?

        pipeline.create("Composite", function (error, hub) {
            if (error) {
                console.log("Hub error", error);
                return callback({ "message": "Oops! Error! API has gone nuts." });
            }
            console.log("Hub created", hub.id);

            cq.kurento.create("HubPort", { "hub": hub }, function (error, hubport) {
                if (error) {
                    console.log("HubPort error", error);
                    return callback({ "message": "Oops! Error! API has gone nuts." });
                }
                console.log("HubPort created", hubport.id);

                pipeline.create("WebRtcEndpoint", function (error, webrtc) {
                    if (error) {
                        console.log("WebRtcEndpoint error", error);
                        return callback({ "message": "Oops! Error! API has gone nuts." });
                    }
                    console.log("WebRtcEndpoint created", webrtc.id);

                    webrtc.processOffer(sdpoffer, function (err, sdpanswer) {
                        if (error) {
                            console.log("WebRtcEndpoint error", error);
                            return callback({ "message": "Oops! Error! API has gone nuts." });
                        }

                        webrtc.connect(hubport, function (error) {
                            if (error) {
                                console.log("WebRTC->HubPort connection error", error);
                                return callback({ "message": "Oops! Error! API has gone nuts." });
                            }

                            console.log("WebRTCEndpoint %s connected to Hubport %s", hubport.id, webrtc.id);

                            hubport.connect(webrtc, function (error) {
                                if (error) {
                                    console.log("Hubport->WebRTC connection error", error);
                                    return callback({ "message": "Oops! Error! API has gone nuts." });
                                }

                                console.log("Hubport %s connected to WebRTCEndpoint %s", hubport.id, webrtc.id);
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
                                        console.log("[ERR] Creating session", id, null);
                                        return callback({ "message": "Oops! Error! API has gone nuts." });
                                    }
                                    console.log("Session created", id, data.meta.created);
                                    return callback(null, { "message": "Session created",
                                                            session: { id: id,
                                                                       data: data,
                                                                       sdpAnswer: sdpanswer }});


                                });

                            });
                        });
                    });
                });
            });
        });
    });
};
