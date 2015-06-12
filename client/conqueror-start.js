var Conqueror = function (options) {

    this.options = options || {};

    this.conqueror_path = this.options.conqueror_path || "https://grouphone.me:441";
    this.sessionid = this.options.sessionid || null;
    this.username = this.options.username || null;
    this.localstream = this.options.localstream || null;
    this.room = this.options.room || null;
    this.token = this.options.token || null;
    this.socket = this.options.socket || null;
    this.audiocontainer = this.options.audiocontainer || document.getElementById("audiocontainer");

    this.membercount = 0;
    this.creator = {};

};

Conqueror.prototype.initcall = function () {

    var self = this;

    // ---------------------------------------------
    // Real operations begin here
    // ---------------------------------------------

    self.socket = io.connect(self.conqueror_path, { secure: true });

    self.socket.on("message", function (message) {
        if (message.type) {
            switch (message.type) {
            case "CONNECTION":
                checkcall();
                break;
            case "STATUS":
                console.log("message", message.value);
                break;
            }
        }
    });

    self.socket.on("user:joined", function () {
        // User joined
    });

    self.socket.on("user:dropped", function () {
        // User dropped
    });

    self.socket.on("call:ended", function () {
        self.endcall();
    });

    var checkcall = function () {
        if (!self.localstream && !self.token && !self.room) {
            createcall();
        } else {
            // Try reconnecting here
            self.localstream = self.token = self.room = null;
            console.log("Reconnecting...");
            createcall();
        }
    };

    var createcall = function () {
        var callid = self.sessionid && self.sessionid.trim(),
            callmethod = "call:create",
            calldata = {};

        if (callid) {
            callmethod = "call:connect";
            calldata.sessionid = callid;
        }

        calldata.username = self.username;

        self.socket.emit(callmethod, calldata, function (err, data) {
            if (err) {
                console.error("Error", err.status);
                return;
            }

            // No error has been hit. Do stuff.
            self.sessionid = data.session.id;
            self.socket.emit("call:data", { sessionid: self.sessionid, username: self.username });

            window.onbeforeunload = function () {
                return "Call in progress. Navigating away will end call. You can always press the 'End' button.";
            };

            self.creator = self.getcreator(data.session.data.members);
            self.membercount = Object.keys(data.session.data.members).length;

            self.token = data.token;

            self.localstream = Erizo.Stream({ audio: true, video: false, data: false });
            self.room = Erizo.Room({ roomID: data.session.data.room._id, token: self.token});

            // When user has accepted request to share microphone
            self.localstream.addEventListener("access-accepted", function () {

                var subscribeall = function (streamslist) {
                    for (var index in streamslist) {
                        var currentstream = streamslist[index];
                        if (self.localstream.getID() !== currentstream.getID()) {
                            self.room.subscribe(currentstream);
                        }
                    }
                };

                self.room.addEventListener("stream-subscribed", function (streamevent) {
                    var div = document.createElement("div");
                    div.setAttribute("id", "stream-" + streamevent.stream.getID());
                    self.audiocontainer && self.audiocontainer.appendChild(div);
                    streamevent.stream.play("stream-" + streamevent.stream.getID());
                });

                self.room.addEventListener("stream-added", function (streamevent) {
                    var streams = [];
                    streams.push(streamevent.stream);
                    subscribeall(streams);
                });

                self.room.addEventListener("stream-failed", function (){
                    self.room.disconnect();
                });

                self.room.addEventListener("stream-removed", function (streamevent) {
                    if (streamevent.stream.elementID !== undefined) {
                        var streamer = document.getElementById(streamevent.stream.elementID);
                        streamer && self.audiocontainer && self.audiocontainer.removeChild(streamer);
                    }
                });

                // Trigger publishing of stream when room is connected
                self.room.addEventListener("room-connected", function (roomevent) {

                    setTimeout(function () {

                        self.room.publish(self.localstream, { maxAudioBW: 24}, function (pubid, err) {
                            if (pubid === undefined) {
                                console.log("Error publishing stream");
                                window.onbeforeunload = null;
                                return;
                            }

                            subscribeall(roomevent.streams);
                        });

                    }, 5000);

                });

                self.room.connect();
            }, false);

            // When user has denied request to share microphone
            self.localstream.addEventListener("access-denied", function () {
                window.onbeforeunload = null;
            }, false);

            // Initiate access to stream
            self.localstream.init();
        });
    };
};

Conqueror.prototype.mute = function () {
    if (this.localstream && this.localstream.stream){
        if (this.localstream.stream.getAudioTracks()[0].enabled) {
            this.localstream.stream.getAudioTracks()[0].enabled = false;
        }
    }
};

Conqueror.prototype.unmute = function () {
    if (this.localstream && this.localstream.stream){
        this.localstream.stream.getAudioTracks()[0].enabled = true;
    }
};

// Get the creator of the call
Conqueror.prototype.getcreator = function (members) {
    var user = null;
    var key;
    for (key in members) {
        if (members.hasOwnProperty(key) && members[key].creator) {
            user = members[key];
        }
    }
    this.creator = user;
    return user;
};

// End call
Conqueror.prototype.endcall = function () {
    if (this.localstream) this.localstream.close();
    if (this.room) this.room.disconnect();
    if (this.socket) this.socket.disconnect();
    window.onbeforeunload = null;
    this.room = this.socket = this.localstream = null;
};
