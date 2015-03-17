/**
 * API connect module
 *
 * Connect to existing connections
 */

module.exports = function (data, callback, socket) {
    var id = data && data.sessionid && data.sessionid.trim(),
        name = data && data.name && data.name.trim(),
        sdpoffer = data && data.sdpOffer && data.sdpOffer.trim();


    if (!id) {
        return callback({ "message": "Need `sessionid` to be passed in the data." });
    }

    if (!name) {
        return callback({ "message": "Need `name` to be passed in the data." });
    }

    if (!sdpoffer) {
        return callback({ "message": "Need `sdpOffer` to be passed in the data." });
    }

    // Fetch session
    cq.db.sessions.get(id, function (err, session) {
        if (err) {
            console.log("[ERR] Fetching session", id, err);
            return callback({ "message": "Not right." });
        }

        // Match name
        var namematch = session.members.filter(function (el) {
            return el.name === name;
        });

        if (namematch.length) {
            return callback({ "message": "Name already in use. Could not join session." });
        }

        console.log("Connecting %s to call id %s. Retrieving pipeline.", name, id);

        cq.kurento.getMediaobjectById(session.pipeline.id, function (error, pipeline) {
            if (error) {
                console.log("[ERR] Fetching pipeline for session", id, err);
                return callback({ "message": "Can't join session." });
            }

            console.log("Retrieved pipeline", pipeline.id);
            console.log("Retrieving hub", session.hub.id);

            cq.kurento.getMediaobjectById(session.hub.id, function (error, hub) {
                if (error) {
                    console.log("[ERR] Fetching hub for session", id, err);
                    return callback({ "message": "Can't join session." });
                }

                console.log("Retrieved hub", hub.id);
                console.log("Creating new HubPort for hub", hub.id);

                cq.kurento.create("HubPort", { "hub": hub }, function (error, hubport) {
                    if (error) {
                        console.log("HubPort error", error);
                        return callback({ "message": "Can't join session." });
                    }
                    console.log("HubPort created", hubport.id);

                    pipeline.create("WebRtcEndpoint", function (error, webrtc) {
                        if (error) {
                            console.log("WebRtcEndpoint error", error);
                            return callback({ "message": "Can't join session'." });
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

                                    // Create new user info
                                    var currentuser = { ip: socket.client.conn.remoteAddress, name: name,
                                                        joined: Date.now(), quit: null, hubport: hubport, webrtc: webrtc };

                                    session.members.push(currentuser);

                                    // Add to current session info
                                    cq.db.sessions.put(id, session, function (err) {
                                        if (err) {
                                            console.log("[ERR] Updating session", id, err);
                                            return callback({ "message": "Can't join session." });
                                        }

                                        return callback(null, { "message": "Session joined",
                                                            "session": {
                                                                "id": id,
                                                                "data": data,
                                                                "sdpAnswer": sdpanswer
                                                            }});
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};
