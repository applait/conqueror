/**
 * API create connections module
 *
 * Create new connections
 */

var router = require("express").Router(),
    crypto = require("crypto");

router.post("/", function (req, res) {
    var id = crypto.createHash("sha1")
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .slice(0, 8);

    // Look for the `name` query parameter
    var name = req.body && req.body.name && req.body.name.trim();

    if (!name) {
        return res.status(406).json({ "message": "Need `name` as a query parameter." });
    }

    // Auth passed. Create MediaPipeline
    cq.kurento.create("MediaPipeline", function (error, pipeline) {
        if (error) {
            console.log("MediaPipeline error", error);
            return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
        }

        console.log("MediaPipeline created", pipeline.id);

        // Create webrtc endpoint at this point?

        pipeline.create("Mixer", function (error, mixer) {
            if (error) {
                console.log("Mixer error", error);
                return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
            }
            console.log("Mixer created", mixer.id);

            cq.kurento.create("HubPort", { "hub": mixer }, function (error, hubport) {
                if (error) {
                    console.log("HubPort error", error);
                    return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
                }
                console.log("HubPort created", hubport.id);

                pipeline.create("WebRtcEndpoint", function (error, webrtc) {
                    if (error) {
                        console.log("WebRtcEndpoint error", error);
                        return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
                    }
                    console.log("WebRtcEndpoint created", webrtc.id);

                    hubport.connect(webrtc, function (error) {
                        if (error) {
                            console.log("HubPort connection error", error);
                            return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
                        }

                        console.log("Hubport %s connected to WebRtcEndpoint %s", hubport.id, webrtc.id);

                        var datetime = new Date();
                        // Prepare data object
                        var data = {
                            members: [{ ip: req.ip, name: name, joined: datetime, quit: null,
                                        hubport: hubport, webrtc: webrtc }],
                            meta: {
                                created: datetime,
                                creator: name
                            },
                            pipeline: pipeline,
                            mixer: mixer
                        };

                        // Put id in session db
                        cq.db.sessions.put(id, data, function (err) {
                            if (err) {
                                console.log("[ERR] Creating session", id, req.ip);
                                return res.status(500).json({ "message": "Oops! Error! API has gone nuts." });
                            }
                            console.log("Session created", id, data.meta.created);
                            res.status(200).json({ "message": "Session created", session: { id: id, data: data }});
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
