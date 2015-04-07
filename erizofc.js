/*
*/
var io = require('socket.io-client');
var Erizo=Erizo||{};
Erizo.EventDispatcher=function(b){var a={};b.dispatcher={};b.dispatcher.eventListeners={};a.addEventListener=function(a,e){void 0===b.dispatcher.eventListeners[a]&&(b.dispatcher.eventListeners[a]=[]);b.dispatcher.eventListeners[a].push(e)};a.removeEventListener=function(a,e){var f;f=b.dispatcher.eventListeners[a].indexOf(e);-1!==f&&b.dispatcher.eventListeners[a].splice(f,1)};a.dispatchEvent=function(a){var e;L.Logger.debug("Event: "+a.type);for(e in b.dispatcher.eventListeners[a.type])if(b.dispatcher.eventListeners[a.type].hasOwnProperty(e))b.dispatcher.eventListeners[a.type][e](a)};return a};
Erizo.LicodeEvent=function(b){var a={};a.type=b.type;return a};Erizo.RoomEvent=function(b){var a=Erizo.LicodeEvent(b);a.streams=b.streams;return a};Erizo.StreamEvent=function(b){var a=Erizo.LicodeEvent(b);a.stream=b.stream;a.msg=b.msg;return a};Erizo.PublisherEvent=function(b){return Erizo.LicodeEvent(b)};Erizo=Erizo||{};Erizo.FcStack=function(){return{addStream:function(){}}};Erizo=Erizo||{};
Erizo.ChromeStableStack=function(b){var a={},c=webkitRTCPeerConnection;a.pc_config={iceServers:[]};a.con={optional:[{DtlsSrtpKeyAgreement:!0}]};void 0!==b.stunServerUrl&&a.pc_config.iceServers.push({url:b.stunServerUrl});(b.turnServer||{}).url&&a.pc_config.iceServers.push({username:b.turnServer.username,credential:b.turnServer.password,url:b.turnServer.url});void 0===b.audio&&(b.audio=!0);void 0===b.video&&(b.video=!0);a.mediaConstraints={mandatory:{OfferToReceiveVideo:b.video,OfferToReceiveAudio:b.audio}};var e=
function(a){console.log("Error in Stack ",a)};a.peerConnection=new c(a.pc_config,a.con);var f=function(a){if(b.video&&b.maxVideoBW){var g=a.match(/m=video.*\r\n/);g==null&&(g=a.match(/m=video.*\n/));var f=g[0]+"b=AS:"+b.maxVideoBW+"\r\n",a=a.replace(g[0],f)}if(b.audio&&b.maxAudioBW){g=a.match(/m=audio.*\r\n/);g==null&&(g=a.match(/m=audio.*\n/));f=g[0]+"b=AS:"+b.maxAudioBW+"\r\n";a=a.replace(g[0],f)}return a};a.close=function(){a.state="closed";a.peerConnection.close()};b.localCandidates=[];a.peerConnection.onicecandidate=
function(a){if(a.candidate){if(!a.candidate.candidate.match(/a=/))a.candidate.candidate="a="+a.candidate.candidate;a={sdpMLineIndex:a.candidate.sdpMLineIndex,sdpMid:a.candidate.sdpMid,candidate:a.candidate.candidate};if(b.remoteDescriptionSet)b.callback({type:"candidate",candidate:a});else{b.localCandidates.push(a);console.log("Local Candidates stored: ",b.localCandidates.length,b.localCandidates)}}else console.log("End of candidates.")};a.peerConnection.onaddstream=function(b){if(a.onaddstream)a.onaddstream(b)};
a.peerConnection.onremovestream=function(b){if(a.onremovestream)a.onremovestream(b)};var h,i=function(a){a.sdp=f(a.sdp);a.sdp=a.sdp.replace(/a=ice-options:google-ice\r\n/g,"");b.callback({type:a.type,sdp:a.sdp});h=a},j=function(d){d.sdp=f(d.sdp);d.sdp=d.sdp.replace(/a=ice-options:google-ice\r\n/g,"");b.callback({type:d.type,sdp:d.sdp});h=d;a.peerConnection.setLocalDescription(d)};a.createOffer=function(b){b===true?a.peerConnection.createOffer(i,e,a.mediaConstraints):a.peerConnection.createOffer(i,
e)};a.addStream=function(b){a.peerConnection.addStream(b)};b.remoteCandidates=[];b.remoteDescriptionSet=!1;a.processSignalingMessage=function(d){if(d.type==="offer"){d.sdp=f(d.sdp);a.peerConnection.setRemoteDescription(new RTCSessionDescription(d));a.peerConnection.createAnswer(j,null,a.mediaConstraints);b.remoteDescriptionSet=true}else if(d.type==="answer"){console.log("Set remote and local description",d.sdp);d.sdp=f(d.sdp);a.peerConnection.setLocalDescription(h,function(){a.peerConnection.setRemoteDescription(new RTCSessionDescription(d),
function(){b.remoteDescriptionSet=true;for(console.log("Candidates to be added: ",b.remoteCandidates.length,b.remoteCandidates);b.remoteCandidates.length>0;)a.peerConnection.addIceCandidate(b.remoteCandidates.shift());for(console.log("Local candidates to send:",b.localCandidates.length);b.localCandidates.length>0;)b.callback({type:"candidate",candidate:b.localCandidates.shift()})})})}else if(d.type==="candidate")try{var g;g=typeof d.candidate==="object"?d.candidate:JSON.parse(d.candidate);g.candidate=
g.candidate.replace(/a=/g,"");g.sdpMLineIndex=parseInt(g.sdpMLineIndex);var k=new RTCIceCandidate(g);b.remoteDescriptionSet?a.peerConnection.addIceCandidate(k):b.remoteCandidates.push(k)}catch(c){L.Logger.error("Error parsing candidate",d.candidate)}};return a};Erizo=Erizo||{};
Erizo.ChromeCanaryStack=function(b){var a={},c=webkitRTCPeerConnection;a.pc_config={iceServers:[]};a.con={optional:[{DtlsSrtpKeyAgreement:!0}]};void 0!==b.stunServerUrl&&a.pc_config.iceServers.push({url:b.stunServerUrl});(b.turnServer||{}).url&&a.pc_config.iceServers.push({username:b.turnServer.username,credential:b.turnServer.password,url:b.turnServer.url});if(void 0===b.audio||b.nop2p)b.audio=!0;if(void 0===b.video||b.nop2p)b.video=!0;a.mediaConstraints={mandatory:{OfferToReceiveVideo:b.video,OfferToReceiveAudio:b.audio}};
a.roapSessionId=103;a.peerConnection=new c(a.pc_config,a.con);a.peerConnection.onicecandidate=function(f){L.Logger.debug("PeerConnection: ",b.session_id);if(f.candidate)a.iceCandidateCount+=1;else if(L.Logger.debug("State: "+a.peerConnection.iceGatheringState),void 0===a.ices&&(a.ices=0),a.ices+=1,1<=a.ices&&a.moreIceComing)a.moreIceComing=!1,a.markActionNeeded()};var e=function(a){if(b.maxVideoBW)var c=a.match(/m=video.*\r\n/),e=c[0]+"b=AS:"+b.maxVideoBW+"\r\n",a=a.replace(c[0],e);b.maxAudioBW&&
(c=a.match(/m=audio.*\r\n/),e=c[0]+"b=AS:"+b.maxAudioBW+"\r\n",a=a.replace(c[0],e));return a};a.processSignalingMessage=function(b){L.Logger.debug("Activity on conn "+a.sessionId);b=JSON.parse(b);a.incomingMessage=b;"new"===a.state?"OFFER"===b.messageType?(b={sdp:b.sdp,type:"offer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.state="offer-received",a.markActionNeeded()):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state):"offer-sent"===a.state?
"ANSWER"===b.messageType?(b={sdp:b.sdp,type:"answer"},L.Logger.debug("Received ANSWER: ",b.sdp),b.sdp=e(b.sdp),a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.sendOK(),a.state="established"):"pr-answer"===b.messageType?(b={sdp:b.sdp,type:"pr-answer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))):"offer"===b.messageType?a.error("Not written yet"):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state):"established"===a.state&&("OFFER"===
b.messageType?(b={sdp:b.sdp,type:"offer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.state="offer-received",a.markActionNeeded()):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state))};a.addStream=function(b){a.peerConnection.addStream(b);a.markActionNeeded()};a.removeStream=function(){a.markActionNeeded()};a.close=function(){a.state="closed";a.peerConnection.close()};a.markActionNeeded=function(){a.actionNeeded=!0;a.doLater(function(){a.onstablestate()})};
a.doLater=function(a){window.setTimeout(a,1)};a.onstablestate=function(){var b;if(a.actionNeeded){if("new"===a.state||"established"===a.state)a.peerConnection.createOffer(function(b){b.sdp=e(b.sdp);L.Logger.debug("Changed",b.sdp);b.sdp!==a.prevOffer?(a.peerConnection.setLocalDescription(b),a.state="preparing-offer",a.markActionNeeded()):L.Logger.debug("Not sending a new offer")},null,a.mediaConstraints);else if("preparing-offer"===a.state){if(a.moreIceComing)return;a.prevOffer=a.peerConnection.localDescription.sdp;
L.Logger.debug("Sending OFFER: "+a.prevOffer);a.sendMessage("OFFER",a.prevOffer);a.state="offer-sent"}else if("offer-received"===a.state)a.peerConnection.createAnswer(function(b){a.peerConnection.setLocalDescription(b);a.state="offer-received-preparing-answer";a.iceStarted?a.markActionNeeded():(L.Logger.debug((new Date).getTime()+": Starting ICE in responder"),a.iceStarted=!0)},null,a.mediaConstraints);else if("offer-received-preparing-answer"===a.state){if(a.moreIceComing)return;b=a.peerConnection.localDescription.sdp;
a.sendMessage("ANSWER",b);a.state="established"}else a.error("Dazed and confused in state "+a.state+", stopping here");a.actionNeeded=!1}};a.sendOK=function(){a.sendMessage("OK")};a.sendMessage=function(b,c){var e={};e.messageType=b;e.sdp=c;"OFFER"===b?(e.offererSessionId=a.sessionId,e.answererSessionId=a.otherSessionId,e.seq=a.sequenceNumber+=1,e.tiebreaker=Math.floor(429496723*Math.random()+1)):(e.offererSessionId=a.incomingMessage.offererSessionId,e.answererSessionId=a.sessionId,e.seq=a.incomingMessage.seq);
a.onsignalingmessage(JSON.stringify(e))};a.error=function(a){throw"Error in RoapOnJsep: "+a;};a.sessionId=a.roapSessionId+=1;a.sequenceNumber=0;a.actionNeeded=!1;a.iceStarted=!1;a.moreIceComing=!0;a.iceCandidateCount=0;a.onsignalingmessage=b.callback;a.peerConnection.onopen=function(){if(a.onopen)a.onopen()};a.peerConnection.onaddstream=function(b){if(a.onaddstream)a.onaddstream(b)};a.peerConnection.onremovestream=function(b){if(a.onremovestream)a.onremovestream(b)};a.peerConnection.oniceconnectionstatechange=
function(b){if(a.oniceconnectionstatechange)a.oniceconnectionstatechange(b.currentTarget.iceConnectionState)};a.onaddstream=null;a.onremovestream=null;a.state="new";a.markActionNeeded();return a};Erizo=Erizo||{};Erizo.sessionId=103;
Erizo.Connection=function(b){var a={};b.session_id=Erizo.sessionId+=1;a.browser=Erizo.getBrowser();if("undefined"!==typeof module&&module.exports)L.Logger.error("Publish/subscribe video/audio streams not supported in erizofc yet"),a=Erizo.FcStack(b);else if("mozilla"===a.browser)L.Logger.debug("Firefox Stack"),a=Erizo.FirefoxStack(b);else if("bowser"===a.browser)L.Logger.debug("Bowser Stack"),a=Erizo.BowserStack(b);else if("chrome-stable"===a.browser)L.Logger.debug("Stable!"),a=Erizo.ChromeStableStack(b);
else throw L.Logger.debug("None!"),"WebRTC stack not available";return a};
Erizo.getBrowser=function(){var b="none";null!==window.navigator.userAgent.match("Firefox")?b="mozilla":null!==window.navigator.userAgent.match("Bowser")?b="bowser":null!==window.navigator.userAgent.match("Chrome")?26<=window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1]&&(b="chrome-stable"):null!==window.navigator.userAgent.match("Safari")?b="bowser":null!==window.navigator.userAgent.match("AppleWebKit")&&(b="bowser");return b};
Erizo.GetUserMedia=function(b,a,c){navigator.getMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia;if(b.screen)if(L.Logger.debug("Screen access requested"),34<=!window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1])c({code:"This browser does not support screen sharing"});else{var e="okeephmleflklcdebijnponpabbmmgeo";b.extensionId&&(L.Logger.debug("extensionId supplied, using "+b.extensionId),e=b.extensionId);L.Logger.debug("Screen access on chrome stable, looking for extension");
try{chrome.runtime.sendMessage(e,{getStream:!0},function(e){if(e==void 0){L.Logger.debug("Access to screen denied");c({code:"Access to screen denied"})}else{b={video:{mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:e.streamId}}};navigator.getMedia(b,a,c)}})}catch(f){L.Logger.debug("Lynckia screensharing plugin is not accessible "),c({code:"no_plugin_present"})}}else"undefined"!==typeof module&&module.exports?L.Logger.error("Video/audio streams not supported in erizofc yet"):navigator.getMedia(b,
a,c)};Erizo=Erizo||{};
Erizo.Stream=function(b){var a=Erizo.EventDispatcher(b),c;a.stream=b.stream;a.url=b.url;a.recording=b.recording;a.room=void 0;a.showing=!1;a.local=!1;a.video=b.video;a.audio=b.audio;a.screen=b.screen;a.videoSize=b.videoSize;a.extensionId=b.extensionId;if(void 0!==a.videoSize&&(!(a.videoSize instanceof Array)||4!=a.videoSize.length))throw Error("Invalid Video Size");if(void 0===b.local||!0===b.local)a.local=!0;a.getID=function(){return b.streamID};a.getAttributes=function(){return b.attributes};a.setAttributes=
function(){L.Logger.error("Failed to set attributes data. This Stream object has not been published.")};a.updateLocalAttributes=function(a){b.attributes=a};a.hasAudio=function(){return b.audio};a.hasVideo=function(){return b.video};a.hasData=function(){return b.data};a.hasScreen=function(){return b.screen};a.sendData=function(){L.Logger.error("Failed to send data. This Stream object has not that channel enabled.")};a.init=function(){try{if((b.audio||b.video||b.screen)&&void 0===b.url){L.Logger.debug("Requested access to local media");
var e=b.video;!0==e&&void 0!==a.videoSize&&(e={mandatory:{minWidth:a.videoSize[0],minHeight:a.videoSize[1],maxWidth:a.videoSize[2],maxHeight:a.videoSize[3]}});var c={video:e,audio:b.audio,fake:b.fake,screen:b.screen,extensionId:a.extensionId};L.Logger.debug(c);Erizo.GetUserMedia(c,function(b){L.Logger.info("User has granted access to local media.");a.stream=b;b=Erizo.StreamEvent({type:"access-accepted"});a.dispatchEvent(b)},function(b){L.Logger.error("Failed to get access to local media. Error code was "+
b.code+".");b=Erizo.StreamEvent({type:"access-denied"});a.dispatchEvent(b)})}else{var h=Erizo.StreamEvent({type:"access-accepted"});a.dispatchEvent(h)}}catch(i){L.Logger.error("Error accessing to local media",i)}};a.close=function(){a.local&&(void 0!==a.room&&a.room.unpublish(a),a.hide(),void 0!==a.stream&&a.stream.stop(),a.stream=void 0)};a.play=function(b,c){c=c||{};a.elementID=b;if(a.hasVideo()||this.hasScreen()){if(void 0!==b){var h=new Erizo.VideoPlayer({id:a.getID(),stream:a,elementID:b,options:c});
a.player=h;a.showing=!0}}else a.hasAudio&&(h=new Erizo.AudioPlayer({id:a.getID(),stream:a,elementID:b,options:c}),a.player=h,a.showing=!0)};a.stop=function(){a.showing&&void 0!==a.player&&(a.player.destroy(),a.showing=!1)};a.show=a.play;a.hide=a.stop;c=function(){if(void 0!==a.player&&void 0!==a.stream){var b=a.player.video,c=document.defaultView.getComputedStyle(b),h=parseInt(c.getPropertyValue("width"),10),i=parseInt(c.getPropertyValue("height"),10),j=parseInt(c.getPropertyValue("left"),10),c=parseInt(c.getPropertyValue("top"),
10),d=document.getElementById(a.elementID),g=document.defaultView.getComputedStyle(d),d=parseInt(g.getPropertyValue("width"),10),g=parseInt(g.getPropertyValue("height"),10),k=document.createElement("canvas");k.id="testing";k.width=d;k.height=g;k.setAttribute("style","display: none");k.getContext("2d").drawImage(b,j,c,h,i);return k}return null};a.getVideoFrameURL=function(a){var b=c();return null!==b?a?b.toDataURL(a):b.toDataURL():null};a.getVideoFrame=function(){var a=c();return null!==a?a.getContext("2d").getImageData(0,
0,a.width,a.height):null};return a};Erizo=Erizo||{};
Erizo.Room=function(b){var a=Erizo.EventDispatcher(b),c,e,f,h,i,j;a.remoteStreams={};a.localStreams={};a.roomID="";a.socket={};a.state=0;a.p2p=!1;a.addEventListener("room-disconnected",function(){var b,g;a.state=0;for(b in a.remoteStreams)a.remoteStreams.hasOwnProperty(b)&&(g=a.remoteStreams[b],j(g),delete a.remoteStreams[b],g=Erizo.StreamEvent({type:"stream-removed",stream:g}),a.dispatchEvent(g));a.remoteStreams={};for(b in a.localStreams)a.localStreams.hasOwnProperty(b)&&(g=a.localStreams[b],g.pc.close(),
delete a.localStreams[b]);try{a.socket.disconnect()}catch(c){L.Logger.debug("Socket already disconnected")}a.socket=void 0});j=function(a){void 0!==a.stream&&(a.hide(),a.pc&&a.pc.close(),a.local&&a.stream.stop())};h=function(a,b){a.local?e("sendDataStream",{id:a.getID(),msg:b}):L.Logger.error("You can not send data through a remote stream")};i=function(a,b){a.local?(a.updateLocalAttributes(b),e("updateStreamAttributes",{id:a.getID(),attrs:b})):L.Logger.error("You can not update attributes in a remote stream")};
c=function(d,g,c){console.log(d);a.socket=io.connect(d.host,{reconnect:!1,secure:d.secure,"force new connection":!0});a.socket.on("onAddStream",function(b){var d=Erizo.Stream({streamID:b.id,local:!1,audio:b.audio,video:b.video,data:b.data,screen:b.screen,attributes:b.attributes});a.remoteStreams[b.id]=d;b=Erizo.StreamEvent({type:"stream-added",stream:d});a.dispatchEvent(b)});a.socket.on("signaling_message_erizo",function(b){var d;(d=b.peerId?a.remoteStreams[b.peerId]:a.localStreams[b.streamId])&&
d.pc.processSignalingMessage(b.mess)});a.socket.on("signaling_message_peer",function(b){var d=a.localStreams[b.streamId];d?d.pc[b.peerSocket].processSignalingMessage(b.msg):(d=a.remoteStreams[b.streamId],d.pc||l(d,b.peerSocket),d.pc.processSignalingMessage(b.msg))});a.socket.on("publish_me",function(b){var d=a.localStreams[b.streamId];void 0===d.pc&&(d.pc={});d.pc[b.peerSocket]=Erizo.Connection({callback:function(a){f("signaling_message",{streamId:b.streamId,peerSocket:b.peerSocket,msg:a})},audio:d.hasAudio(),
video:d.hasVideo(),stunServerUrl:a.stunServerUrl,turnServer:a.turnServer});d.pc[b.peerSocket].oniceconnectionstatechange=function(a){if(a==="disconnected"){d.pc[b.peerSocket].close();delete d.pc[b.peerSocket]}};d.pc[b.peerSocket].addStream(d.stream);d.pc[b.peerSocket].createOffer()});var l=function(d,g){d.pc=Erizo.Connection({callback:function(a){f("signaling_message",{streamId:d.getID(),peerSocket:g,msg:a})},stunServerUrl:a.stunServerUrl,turnServer:a.turnServer,maxAudioBW:b.maxAudioBW,maxVideoBW:b.maxVideoBW});
d.pc.onaddstream=function(b){L.Logger.info("Stream subscribed");d.stream=b.stream;b=Erizo.StreamEvent({type:"stream-subscribed",stream:d});a.dispatchEvent(b)}};a.socket.on("onDataStream",function(b){var d=a.remoteStreams[b.id],b=Erizo.StreamEvent({type:"stream-data",msg:b.msg,stream:d});d.dispatchEvent(b)});a.socket.on("onUpdateAttributeStream",function(b){var d=a.remoteStreams[b.id],g=Erizo.StreamEvent({type:"stream-attributes-update",attrs:b.attrs,stream:d});d.updateLocalAttributes(b.attrs);d.dispatchEvent(g)});
a.socket.on("onRemoveStream",function(b){var d=a.remoteStreams[b.id];delete a.remoteStreams[b.id];j(d);b=Erizo.StreamEvent({type:"stream-removed",stream:d});a.dispatchEvent(b)});a.socket.on("disconnect",function(){L.Logger.info("Socket disconnected");if(0!==a.state){var b=Erizo.RoomEvent({type:"room-disconnected"});a.dispatchEvent(b)}});a.socket.on("connection_failed",function(){L.Logger.info("ICE Connection Failed");if(0!==a.state){var b=Erizo.RoomEvent({type:"stream-failed"});a.dispatchEvent(b)}});
e("token",d,g,c)};e=function(b,g,c,e){a.socket.emit(b,g,function(a,b){"success"===a?void 0!==c&&c(b):"error"===a?void 0!==e&&e(b):void 0!==c&&c(a,b)})};f=function(b,g,c,e){a.socket.emit(b,g,c,function(a,b){void 0!==e&&e(a,b)})};a.connect=function(){var d=L.Base64.decodeBase64(b.token);0!==a.state&&L.Logger.error("Room already connected");a.state=1;c(JSON.parse(d),function(d){var c=0,e=[],f,n,h;f=d.streams||[];a.p2p=d.p2p;n=d.id;a.stunServerUrl=d.stunServerUrl;a.turnServer=d.turnServer;a.state=2;b.defaultVideoBW=
d.defaultVideoBW;b.maxVideoBW=d.maxVideoBW;for(c in f)f.hasOwnProperty(c)&&(h=f[c],d=Erizo.Stream({streamID:h.id,local:!1,audio:h.audio,video:h.video,data:h.data,screen:h.screen,attributes:h.attributes}),e.push(d),a.remoteStreams[h.id]=d);a.roomID=n;L.Logger.info("Connected to room "+a.roomID);c=Erizo.RoomEvent({type:"room-connected",streams:e});a.dispatchEvent(c)},function(a){L.Logger.error("Not Connected! Error: "+a)})};a.disconnect=function(){var b=Erizo.RoomEvent({type:"room-disconnected"});a.dispatchEvent(b)};
a.publish=function(d,c,e){c=c||{};c.maxVideoBW=c.maxVideoBW||b.defaultVideoBW;c.maxVideoBW>b.maxVideoBW&&(c.maxVideoBW=b.maxVideoBW);if(d.local&&void 0===a.localStreams[d.getID()])if(d.hasAudio()||d.hasVideo()||d.hasScreen())if(void 0!==d.url||void 0!==d.recording){var l,m;d.url?(l="url",m=d.url):(l="recording",m=d.recording);f("publish",{state:l,data:d.hasData(),audio:d.hasAudio(),video:d.hasVideo(),attributes:d.getAttributes()},m,function(b,c){if(b!==null){L.Logger.info("Stream published");d.getID=
function(){return b};d.sendData=function(a){h(d,a)};d.setAttributes=function(a){i(d,a)};a.localStreams[b]=d;d.room=a;e&&e(b)}else{L.Logger.error("Error when publishing the stream",c);e&&e(void 0,c)}})}else a.p2p?(b.maxAudioBW=c.maxAudioBW,b.maxVideoBW=c.maxVideoBW,f("publish",{state:"p2p",data:d.hasData(),audio:d.hasAudio(),video:d.hasVideo(),screen:d.hasScreen(),attributes:d.getAttributes()},void 0,function(b,c){if(b===null){L.Logger.error("Error when publishing the stream",c);e&&e(void 0,c)}L.Logger.info("Stream published");
d.getID=function(){return b};if(d.hasData())d.sendData=function(a){h(d,a)};d.setAttributes=function(a){i(d,a)};a.localStreams[b]=d;d.room=a})):f("publish",{state:"erizo",data:d.hasData(),audio:d.hasAudio(),video:d.hasVideo(),screen:d.hasScreen(),attributes:d.getAttributes()},void 0,function(b,l){if(b===null){L.Logger.error("Error when publishing the stream: ",l);e&&e(void 0,l)}else{L.Logger.info("Stream published");d.getID=function(){return b};if(d.hasData())d.sendData=function(a){h(d,a)};d.setAttributes=
function(a){i(d,a)};a.localStreams[b]=d;d.room=a;d.pc=Erizo.Connection({callback:function(a){console.log("Sending message",a);f("signaling_message",{streamId:d.getID(),msg:a},void 0,function(){})},stunServerUrl:a.stunServerUrl,turnServer:a.turnServer,maxAudioBW:c.maxAudioBW,maxVideoBW:c.maxVideoBW,audio:d.hasAudio(),video:d.hasVideo()});d.pc.addStream(d.stream);d.pc.createOffer();e&&e(b)}});else d.hasData()&&f("publish",{state:"data",data:d.hasData(),audio:!1,video:!1,screen:!1,attributes:d.getAttributes()},
void 0,function(b,c){if(b===null){L.Logger.error("Error publishing stream ",c);e&&e(void 0,c)}else{L.Logger.info("Stream published");d.getID=function(){return b};d.sendData=function(a){h(d,a)};d.setAttributes=function(a){i(d,a)};a.localStreams[b]=d;d.room=a;e&&e(b)}})};a.startRecording=function(a,b){L.Logger.debug("Start Recording streamaa: "+a.getID());e("startRecorder",{to:a.getID()},function(a,d){null===a?(L.Logger.error("Error on start recording",d),b&&b(void 0,d)):(L.Logger.info("Start recording",
a),b&&b(a))})};a.stopRecording=function(a,b){e("stopRecorder",{id:a},function(a,d){null===a?(L.Logger.error("Error on stop recording",d),b&&b(void 0,d)):(L.Logger.info("Stop recording"),b&&b(!0))})};a.unpublish=function(b,c){if(b.local){e("unpublish",b.getID(),function(a,b){null===a?(L.Logger.error("Error unpublishing stream",b),c&&c(void 0,b)):(L.Logger.info("Stream unpublished"),c&&c(!0))});var f=b.room.p2p;b.room=void 0;if((b.hasAudio()||b.hasVideo()||b.hasScreen())&&void 0===b.url&&!f)b.pc.close(),
b.pc=void 0;delete a.localStreams[b.getID()];b.getID=function(){};b.sendData=function(){};b.setAttributes=function(){}}};a.subscribe=function(b,c,e){c=c||{};if(!b.local){if(b.hasVideo()||b.hasAudio()||b.hasScreen())a.p2p?(f("subscribe",{streamId:b.getID()}),e&&e(!0)):f("subscribe",{streamId:b.getID(),audio:c.audio,video:c.video,data:c.data,browser:Erizo.getBrowser()},void 0,function(c,g){null===c?(L.Logger.error("Error subscribing to stream ",g),e&&e(void 0,g)):(L.Logger.info("Subscriber added"),
b.pc=Erizo.Connection({callback:function(a){L.Logger.info("Sending message",a);f("signaling_message",{streamId:b.getID(),msg:a,browser:b.pc.browser},void 0,function(){})},nop2p:!0,audio:b.hasAudio(),video:b.hasVideo(),stunServerUrl:a.stunServerUrl,turnServer:a.turnServer}),b.pc.onaddstream=function(c){L.Logger.info("Stream subscribed");b.stream=c.stream;c=Erizo.StreamEvent({type:"stream-subscribed",stream:b});a.dispatchEvent(c)},b.pc.createOffer(!0),e&&e(!0))});else if(b.hasData()&&!1!==c.data)f("subscribe",
{streamId:b.getID(),data:c.data},void 0,function(c,g){if(null===c)L.Logger.error("Error subscribing to stream ",g),e&&e(void 0,g);else{L.Logger.info("Stream subscribed");var f=Erizo.StreamEvent({type:"stream-subscribed",stream:b});a.dispatchEvent(f);e&&e(!0)}});else{L.Logger.info("Subscribing to anything");return}L.Logger.info("Subscribing to: "+b.getID())}};a.unsubscribe=function(b,c){void 0!==a.socket&&(b.local||e("unsubscribe",b.getID(),function(a,e){null===a?c&&c(void 0,e):(j(b),c&&c(!0))},function(){L.Logger.error("Error calling unsubscribe.")}))};
a.getStreamsByAttribute=function(b,c){var e=[],f,h;for(f in a.remoteStreams)a.remoteStreams.hasOwnProperty(f)&&(h=a.remoteStreams[f],void 0!==h.getAttributes()&&void 0!==h.getAttributes()[b]&&h.getAttributes()[b]===c&&e.push(h));return e};return a};var L=L||{};
L.Logger=function(b){return{DEBUG:0,TRACE:1,INFO:2,WARNING:3,ERROR:4,NONE:5,enableLogPanel:function(){b.Logger.panel=document.createElement("textarea");b.Logger.panel.setAttribute("id","licode-logs");b.Logger.panel.setAttribute("style","width: 100%; height: 100%; display: none");b.Logger.panel.setAttribute("rows",20);b.Logger.panel.setAttribute("cols",20);b.Logger.panel.setAttribute("readOnly",!0);document.body.appendChild(b.Logger.panel)},setLogLevel:function(a){a>b.Logger.NONE?a=b.Logger.NONE:a<
b.Logger.DEBUG&&(a=b.Logger.DEBUG);b.Logger.logLevel=a},log:function(a){var c="";if(!(a<b.Logger.logLevel)){a===b.Logger.DEBUG?c+="DEBUG":a===b.Logger.TRACE?c+="TRACE":a===b.Logger.INFO?c+="INFO":a===b.Logger.WARNING?c+="WARNING":a===b.Logger.ERROR&&(c+="ERROR");for(var c=c+": ",e=[],f=0;f<arguments.length;f++)e[f]=arguments[f];e=e.slice(1);e=[c].concat(e);if(void 0!==b.Logger.panel){c="";for(f=0;f<e.length;f++)c+=e[f];b.Logger.panel.value=b.Logger.panel.value+"\n"+c}else console.log.apply(console,
e)}},debug:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.DEBUG].concat(a))},trace:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.TRACE].concat(a))},info:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.INFO].concat(a))},warning:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,
[b.Logger.WARNING].concat(a))},error:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.ERROR].concat(a))}}}(L);L=L||{};
L.Base64=function(){var b,a,c,e,f,h,i,j,d;b="A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,+,/".split(",");a=[];for(f=0;f<b.length;f+=1)a[b[f]]=f;h=function(a){c=a;e=0};i=function(){var a;if(!c||e>=c.length)return-1;a=c.charCodeAt(e)&255;e+=1;return a};j=function(){if(!c)return-1;for(;;){if(e>=c.length)return-1;var b=c.charAt(e);e+=1;if(a[b])return a[b];if("A"===b)return 0}};d=function(a){a=a.toString(16);1===a.length&&(a=
"0"+a);return unescape("%"+a)};return{encodeBase64:function(a){var c,d,e;h(a);a="";c=Array(3);d=0;for(e=!1;!e&&-1!==(c[0]=i());)if(c[1]=i(),c[2]=i(),a+=b[c[0]>>2],-1!==c[1]?(a+=b[c[0]<<4&48|c[1]>>4],-1!==c[2]?(a+=b[c[1]<<2&60|c[2]>>6],a+=b[c[2]&63]):(a+=b[c[1]<<2&60],a+="=",e=!0)):(a+=b[c[0]<<4&48],a+="=",a+="=",e=!0),d+=4,76<=d)a+="\n",d=0;return a},decodeBase64:function(a){var b,c;h(a);a="";b=Array(4);for(c=!1;!c&&-1!==(b[0]=j())&&-1!==(b[1]=j());)b[2]=j(),b[3]=j(),a+=d(b[0]<<2&255|b[1]>>4),-1!==
b[2]?(a+=d(b[1]<<4&255|b[2]>>2),-1!==b[3]?a+=d(b[2]<<6&255|b[3]):c=!0):c=!0;return a}}}(L);Erizo=Erizo||{};Erizo.View=function(){var b=Erizo.EventDispatcher({});b.url="http://chotis2.dit.upm.es:3000";return b};Erizo=Erizo||{};
Erizo.VideoPlayer=function(b){var a=Erizo.View({});a.id=b.id;a.stream=b.stream.stream;a.elementID=b.elementID;a.destroy=function(){a.video.pause();delete a.resizer;a.parentNode.removeChild(a.div)};a.resize=function(){var c=a.container.offsetWidth,e=a.container.offsetHeight;if(b.stream.screen||!1===b.options.crop)0.75*c<e?(a.video.style.width=c+"px",a.video.style.height=0.75*c+"px",a.video.style.top=-(0.75*c/2-e/2)+"px",a.video.style.left="0px"):(a.video.style.height=e+"px",a.video.style.width=4/3*
e+"px",a.video.style.left=-(4/3*e/2-c/2)+"px",a.video.style.top="0px");else if(c!==a.containerWidth||e!==a.containerHeight)0.75*c>e?(a.video.style.width=c+"px",a.video.style.height=0.75*c+"px",a.video.style.top=-(0.75*c/2-e/2)+"px",a.video.style.left="0px"):(a.video.style.height=e+"px",a.video.style.width=4/3*e+"px",a.video.style.left=-(4/3*e/2-c/2)+"px",a.video.style.top="0px");a.containerWidth=c;a.containerHeight=e};L.Logger.debug("Creating URL from stream "+a.stream);a.stream_url=(window.URL||
webkitURL).createObjectURL(a.stream);a.div=document.createElement("div");a.div.setAttribute("id","player_"+a.id);a.div.setAttribute("style","width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;");a.loader=document.createElement("img");a.loader.setAttribute("style","width: 16px; height: 16px; position: absolute; top: 50%; left: 50%; margin-top: -8px; margin-left: -8px");a.loader.setAttribute("id","back_"+a.id);a.loader.setAttribute("src",a.url+"/assets/loader.gif");
a.video=document.createElement("video");a.video.setAttribute("id","stream"+a.id);a.video.setAttribute("style","width: 100%; height: 100%; position: absolute");a.video.setAttribute("autoplay","autoplay");b.stream.local&&(a.video.volume=0);void 0!==a.elementID?(document.getElementById(a.elementID).appendChild(a.div),a.container=document.getElementById(a.elementID)):(document.body.appendChild(a.div),a.container=document.body);a.parentNode=a.div.parentNode;a.div.appendChild(a.loader);a.div.appendChild(a.video);
a.containerWidth=0;a.containerHeight=0;a.resizer=new L.ResizeSensor(a.container,a.resize);a.resize();a.bar=new Erizo.Bar({elementID:"player_"+a.id,id:a.id,stream:b.stream,media:a.video,options:b.options});a.div.onmouseover=function(){a.bar.display()};a.div.onmouseout=function(){a.bar.hide()};a.video.src=a.stream_url;return a};Erizo=Erizo||{};
Erizo.AudioPlayer=function(b){var a=Erizo.View({}),c,e;a.id=b.id;a.stream=b.stream.stream;a.elementID=b.elementID;L.Logger.debug("Creating URL from stream "+a.stream);a.stream_url=(window.URL||webkitURL).createObjectURL(a.stream);a.audio=document.createElement("audio");a.audio.setAttribute("id","stream"+a.id);a.audio.setAttribute("style","width: 100%; height: 100%; position: absolute");a.audio.setAttribute("autoplay","autoplay");b.stream.local&&(a.audio.volume=0);b.stream.local&&(a.audio.volume=0);
void 0!==a.elementID?(a.destroy=function(){a.audio.pause();a.parentNode.removeChild(a.div)},c=function(){a.bar.display()},e=function(){a.bar.hide()},a.div=document.createElement("div"),a.div.setAttribute("id","player_"+a.id),a.div.setAttribute("style","width: 100%; height: 100%; position: relative; overflow: hidden;"),document.getElementById(a.elementID).appendChild(a.div),a.container=document.getElementById(a.elementID),a.parentNode=a.div.parentNode,a.div.appendChild(a.audio),a.bar=new Erizo.Bar({elementID:"player_"+
a.id,id:a.id,stream:b.stream,media:a.audio,options:b.options}),a.div.onmouseover=c,a.div.onmouseout=e):(a.destroy=function(){a.audio.pause();a.parentNode.removeChild(a.audio)},document.body.appendChild(a.audio),a.parentNode=document.body);a.audio.src=a.stream_url;return a};Erizo=Erizo||{};
Erizo.Bar=function(b){var a=Erizo.View({}),c,e;a.elementID=b.elementID;a.id=b.id;a.div=document.createElement("div");a.div.setAttribute("id","bar_"+a.id);a.bar=document.createElement("div");a.bar.setAttribute("style","width: 100%; height: 15%; max-height: 30px; position: absolute; bottom: 0; right: 0; background-color: rgba(255,255,255,0.62)");a.bar.setAttribute("id","subbar_"+a.id);a.link=document.createElement("a");a.link.setAttribute("href","http://www.lynckia.com/");a.link.setAttribute("target","_blank");
a.logo=document.createElement("img");a.logo.setAttribute("style","width: 100%; height: 100%; max-width: 30px; position: absolute; top: 0; left: 2px;");a.logo.setAttribute("alt","Lynckia");a.logo.setAttribute("src",a.url+"/assets/star.svg");e=function(b){"block"!==b?b="none":clearTimeout(c);a.div.setAttribute("style","width: 100%; height: 100%; position: relative; bottom: 0; right: 0; display:"+b)};a.display=function(){e("block")};a.hide=function(){c=setTimeout(e,1E3)};document.getElementById(a.elementID).appendChild(a.div);
a.div.appendChild(a.bar);a.bar.appendChild(a.link);a.link.appendChild(a.logo);if(!b.stream.screen&&(void 0===b.options||void 0===b.options.speaker||!0===b.options.speaker))a.speaker=new Erizo.Speaker({elementID:"subbar_"+a.id,id:a.id,stream:b.stream,media:b.media});a.display();a.hide();return a};Erizo=Erizo||{};
Erizo.Speaker=function(b){var a=Erizo.View({}),c,e,f,h=50;a.elementID=b.elementID;a.media=b.media;a.id=b.id;a.stream=b.stream;a.div=document.createElement("div");a.div.setAttribute("style","width: 40%; height: 100%; max-width: 32px; position: absolute; right: 0;z-index:0;");a.icon=document.createElement("img");a.icon.setAttribute("id","volume_"+a.id);a.icon.setAttribute("src",a.url+"/assets/sound48.png");a.icon.setAttribute("style","width: 80%; height: 100%; position: absolute;");a.div.appendChild(a.icon);
a.stream.local?(e=function(){a.media.muted=!0;a.icon.setAttribute("src",a.url+"/assets/mute48.png");a.stream.stream.getAudioTracks()[0].enabled=!1},f=function(){a.media.muted=!1;a.icon.setAttribute("src",a.url+"/assets/sound48.png");a.stream.stream.getAudioTracks()[0].enabled=!0},a.icon.onclick=function(){a.media.muted?f():e()}):(a.picker=document.createElement("input"),a.picker.setAttribute("id","picker_"+a.id),a.picker.type="range",a.picker.min=0,a.picker.max=100,a.picker.step=10,a.picker.value=
h,a.picker.setAttribute("orient","vertical"),a.div.appendChild(a.picker),a.media.volume=a.picker.value/100,a.media.muted=!1,a.picker.oninput=function(){0<a.picker.value?(a.media.muted=!1,a.icon.setAttribute("src",a.url+"/assets/sound48.png")):(a.media.muted=!0,a.icon.setAttribute("src",a.url+"/assets/mute48.png"));a.media.volume=a.picker.value/100},c=function(b){a.picker.setAttribute("style","background: transparent; width: 32px; height: 100px; position: absolute; bottom: 90%; z-index: 1;"+a.div.offsetHeight+
"px; right: 0px; -webkit-appearance: slider-vertical; display: "+b)},e=function(){a.icon.setAttribute("src",a.url+"/assets/mute48.png");h=a.picker.value;a.picker.value=0;a.media.volume=0;a.media.muted=!0},f=function(){a.icon.setAttribute("src",a.url+"/assets/sound48.png");a.picker.value=h;a.media.volume=a.picker.value/100;a.media.muted=!1},a.icon.onclick=function(){a.media.muted?f():e()},a.div.onmouseover=function(){c("block")},a.div.onmouseout=function(){c("none")},c("none"));document.getElementById(a.elementID).appendChild(a.div);
return a};
module.exports = Erizo;
