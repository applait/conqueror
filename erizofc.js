/*
*/
var io = require('socket.io-client');
var Erizo=Erizo||{};
Erizo.EventDispatcher=function(b){var a={};b.dispatcher={};b.dispatcher.eventListeners={};a.addEventListener=function(a,d){void 0===b.dispatcher.eventListeners[a]&&(b.dispatcher.eventListeners[a]=[]);b.dispatcher.eventListeners[a].push(d)};a.removeEventListener=function(a,d){var e;e=b.dispatcher.eventListeners[a].indexOf(d);-1!==e&&b.dispatcher.eventListeners[a].splice(e,1)};a.dispatchEvent=function(a){var d;L.Logger.debug("Event: "+a.type);for(d in b.dispatcher.eventListeners[a.type])if(b.dispatcher.eventListeners[a.type].hasOwnProperty(d))b.dispatcher.eventListeners[a.type][d](a)};return a};
Erizo.LicodeEvent=function(b){var a={};a.type=b.type;return a};Erizo.RoomEvent=function(b){var a=Erizo.LicodeEvent(b);a.streams=b.streams;return a};Erizo.StreamEvent=function(b){var a=Erizo.LicodeEvent(b);a.stream=b.stream;a.msg=b.msg;return a};Erizo.PublisherEvent=function(b){return Erizo.LicodeEvent(b)};Erizo=Erizo||{};Erizo.FcStack=function(){return{addStream:function(){}}};Erizo=Erizo||{};
Erizo.ChromeStableStack=function(b){var a={},c=webkitRTCPeerConnection;a.pc_config={iceServers:[]};a.con={optional:[{DtlsSrtpKeyAgreement:!0}]};void 0!==b.stunServerUrl&&a.pc_config.iceServers.push({url:b.stunServerUrl});(b.turnServer||{}).url&&a.pc_config.iceServers.push({username:b.turnServer.username,credential:b.turnServer.password,url:b.turnServer.url});if(void 0===b.audio||b.nop2p)b.audio=!0;if(void 0===b.video||b.nop2p)b.video=!0;a.mediaConstraints={mandatory:{OfferToReceiveVideo:b.video,OfferToReceiveAudio:b.audio}};
a.roapSessionId=103;a.peerConnection=new c(a.pc_config,a.con);a.peerConnection.onicecandidate=function(e){L.Logger.debug("PeerConnection: ",b.session_id);if(e.candidate)a.iceCandidateCount+=1;else if(L.Logger.debug("State: "+a.peerConnection.iceGatheringState),void 0===a.ices&&(a.ices=0),a.ices+=1,1<=a.ices&&a.moreIceComing)a.moreIceComing=!1,a.markActionNeeded()};var d=function(a){if(b.maxVideoBW)var c=a.match(/m=video.*\r\n/),d=c[0]+"b=AS:"+b.maxVideoBW+"\r\n",a=a.replace(c[0],d);b.maxAudioBW&&
(c=a.match(/m=audio.*\r\n/),d=c[0]+"b=AS:"+b.maxAudioBW+"\r\n",a=a.replace(c[0],d));return a};a.processSignalingMessage=function(b){L.Logger.debug("Activity on conn "+a.sessionId);b=JSON.parse(b);a.incomingMessage=b;"new"===a.state?"OFFER"===b.messageType?(b={sdp:b.sdp,type:"offer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.state="offer-received",a.markActionNeeded()):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state):"offer-sent"===a.state?
"ANSWER"===b.messageType?(b={sdp:b.sdp,type:"answer"},L.Logger.debug("Received ANSWER: ",b.sdp),b.sdp=d(b.sdp),a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.sendOK(),a.state="established"):"pr-answer"===b.messageType?(b={sdp:b.sdp,type:"pr-answer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))):"offer"===b.messageType?a.error("Not written yet"):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state):"established"===a.state&&("OFFER"===
b.messageType?(b={sdp:b.sdp,type:"offer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.state="offer-received",a.markActionNeeded()):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state))};a.addStream=function(b){a.peerConnection.addStream(b);a.markActionNeeded()};a.removeStream=function(){a.markActionNeeded()};a.close=function(){a.state="closed";a.peerConnection.close()};a.markActionNeeded=function(){a.actionNeeded=!0;a.doLater(function(){a.onstablestate()})};
a.doLater=function(a){window.setTimeout(a,1)};a.onstablestate=function(){var b;if(a.actionNeeded){if("new"===a.state||"established"===a.state)a.peerConnection.createOffer(function(b){b.sdp=d(b.sdp);L.Logger.debug("Changed",b.sdp);b.sdp!==a.prevOffer?(a.peerConnection.setLocalDescription(b,function(){console.log("Success")},function(){console.log("Failed Setting local desc")}),a.state="preparing-offer",a.markActionNeeded()):L.Logger.debug("Not sending a new offer")},null,a.mediaConstraints);else if("preparing-offer"===
a.state){if(a.moreIceComing)return;a.prevOffer=a.peerConnection.localDescription.sdp;L.Logger.debug("Sending OFFER: "+a.prevOffer);a.sendMessage("OFFER",a.prevOffer);a.state="offer-sent"}else if("offer-received"===a.state)a.peerConnection.createAnswer(function(b){a.peerConnection.setLocalDescription(b);a.state="offer-received-preparing-answer";a.iceStarted?a.markActionNeeded():(L.Logger.debug((new Date).getTime()+": Starting ICE in responder"),a.iceStarted=!0)},null,a.mediaConstraints);else if("offer-received-preparing-answer"===
a.state){if(a.moreIceComing)return;b=a.peerConnection.localDescription.sdp;a.sendMessage("ANSWER",b);a.state="established"}else a.error("Dazed and confused in state "+a.state+", stopping here");a.actionNeeded=!1}};a.sendOK=function(){a.sendMessage("OK")};a.sendMessage=function(b,c){var d={};d.messageType=b;d.sdp=c;"OFFER"===b?(d.offererSessionId=a.sessionId,d.answererSessionId=a.otherSessionId,d.seq=a.sequenceNumber+=1,d.tiebreaker=Math.floor(429496723*Math.random()+1)):(d.offererSessionId=a.incomingMessage.offererSessionId,
d.answererSessionId=a.sessionId,d.seq=a.incomingMessage.seq);a.onsignalingmessage(JSON.stringify(d))};a.error=function(a){throw"Error in RoapOnJsep: "+a;};a.sessionId=a.roapSessionId+=1;a.sequenceNumber=0;a.actionNeeded=!1;a.iceStarted=!1;a.moreIceComing=!0;a.iceCandidateCount=0;a.onsignalingmessage=b.callback;a.peerConnection.onopen=function(){if(a.onopen)a.onopen()};a.peerConnection.onaddstream=function(b){if(a.onaddstream)a.onaddstream(b)};a.peerConnection.onremovestream=function(b){if(a.onremovestream)a.onremovestream(b)};
a.peerConnection.oniceconnectionstatechange=function(b){if(a.oniceconnectionstatechange)a.oniceconnectionstatechange(b.currentTarget.iceConnectionState)};a.onaddstream=null;a.onremovestream=null;a.state="new";a.markActionNeeded();return a};Erizo=Erizo||{};
Erizo.ChromeCanaryStack=function(b){var a={},c=webkitRTCPeerConnection;a.pc_config={iceServers:[]};a.con={optional:[{DtlsSrtpKeyAgreement:!0}]};void 0!==b.stunServerUrl&&a.pc_config.iceServers.push({url:b.stunServerUrl});(b.turnServer||{}).url&&a.pc_config.iceServers.push({username:b.turnServer.username,credential:b.turnServer.password,url:b.turnServer.url});if(void 0===b.audio||b.nop2p)b.audio=!0;if(void 0===b.video||b.nop2p)b.video=!0;a.mediaConstraints={mandatory:{OfferToReceiveVideo:b.video,OfferToReceiveAudio:b.audio}};
a.roapSessionId=103;a.peerConnection=new c(a.pc_config,a.con);a.peerConnection.onicecandidate=function(e){L.Logger.debug("PeerConnection: ",b.session_id);if(e.candidate)a.iceCandidateCount+=1;else if(L.Logger.debug("State: "+a.peerConnection.iceGatheringState),void 0===a.ices&&(a.ices=0),a.ices+=1,1<=a.ices&&a.moreIceComing)a.moreIceComing=!1,a.markActionNeeded()};var d=function(a){if(b.maxVideoBW)var d=a.match(/m=video.*\r\n/),c=d[0]+"b=AS:"+b.maxVideoBW+"\r\n",a=a.replace(d[0],c);b.maxAudioBW&&
(d=a.match(/m=audio.*\r\n/),c=d[0]+"b=AS:"+b.maxAudioBW+"\r\n",a=a.replace(d[0],c));return a};a.processSignalingMessage=function(b){L.Logger.debug("Activity on conn "+a.sessionId);b=JSON.parse(b);a.incomingMessage=b;"new"===a.state?"OFFER"===b.messageType?(b={sdp:b.sdp,type:"offer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.state="offer-received",a.markActionNeeded()):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state):"offer-sent"===a.state?
"ANSWER"===b.messageType?(b={sdp:b.sdp,type:"answer"},L.Logger.debug("Received ANSWER: ",b.sdp),b.sdp=d(b.sdp),a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.sendOK(),a.state="established"):"pr-answer"===b.messageType?(b={sdp:b.sdp,type:"pr-answer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))):"offer"===b.messageType?a.error("Not written yet"):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state):"established"===a.state&&("OFFER"===
b.messageType?(b={sdp:b.sdp,type:"offer"},a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),a.state="offer-received",a.markActionNeeded()):a.error("Illegal message for this state: "+b.messageType+" in state "+a.state))};a.addStream=function(b){a.peerConnection.addStream(b);a.markActionNeeded()};a.removeStream=function(){a.markActionNeeded()};a.close=function(){a.state="closed";a.peerConnection.close()};a.markActionNeeded=function(){a.actionNeeded=!0;a.doLater(function(){a.onstablestate()})};
a.doLater=function(a){window.setTimeout(a,1)};a.onstablestate=function(){var b;if(a.actionNeeded){if("new"===a.state||"established"===a.state)a.peerConnection.createOffer(function(b){b.sdp=d(b.sdp);L.Logger.debug("Changed",b.sdp);b.sdp!==a.prevOffer?(a.peerConnection.setLocalDescription(b),a.state="preparing-offer",a.markActionNeeded()):L.Logger.debug("Not sending a new offer")},null,a.mediaConstraints);else if("preparing-offer"===a.state){if(a.moreIceComing)return;a.prevOffer=a.peerConnection.localDescription.sdp;
L.Logger.debug("Sending OFFER: "+a.prevOffer);a.sendMessage("OFFER",a.prevOffer);a.state="offer-sent"}else if("offer-received"===a.state)a.peerConnection.createAnswer(function(b){a.peerConnection.setLocalDescription(b);a.state="offer-received-preparing-answer";a.iceStarted?a.markActionNeeded():(L.Logger.debug((new Date).getTime()+": Starting ICE in responder"),a.iceStarted=!0)},null,a.mediaConstraints);else if("offer-received-preparing-answer"===a.state){if(a.moreIceComing)return;b=a.peerConnection.localDescription.sdp;
a.sendMessage("ANSWER",b);a.state="established"}else a.error("Dazed and confused in state "+a.state+", stopping here");a.actionNeeded=!1}};a.sendOK=function(){a.sendMessage("OK")};a.sendMessage=function(b,d){var c={};c.messageType=b;c.sdp=d;"OFFER"===b?(c.offererSessionId=a.sessionId,c.answererSessionId=a.otherSessionId,c.seq=a.sequenceNumber+=1,c.tiebreaker=Math.floor(429496723*Math.random()+1)):(c.offererSessionId=a.incomingMessage.offererSessionId,c.answererSessionId=a.sessionId,c.seq=a.incomingMessage.seq);
a.onsignalingmessage(JSON.stringify(c))};a.error=function(a){throw"Error in RoapOnJsep: "+a;};a.sessionId=a.roapSessionId+=1;a.sequenceNumber=0;a.actionNeeded=!1;a.iceStarted=!1;a.moreIceComing=!0;a.iceCandidateCount=0;a.onsignalingmessage=b.callback;a.peerConnection.onopen=function(){if(a.onopen)a.onopen()};a.peerConnection.onaddstream=function(b){if(a.onaddstream)a.onaddstream(b)};a.peerConnection.onremovestream=function(b){if(a.onremovestream)a.onremovestream(b)};a.peerConnection.oniceconnectionstatechange=
function(b){if(a.oniceconnectionstatechange)a.oniceconnectionstatechange(b.currentTarget.iceConnectionState)};a.onaddstream=null;a.onremovestream=null;a.state="new";a.markActionNeeded();return a};Erizo=Erizo||{};Erizo.sessionId=103;
Erizo.Connection=function(b){var a={};b.session_id=Erizo.sessionId+=1;a.browser="";if("undefined"!==typeof module&&module.exports)L.Logger.error("Publish/subscribe video/audio streams not supported in erizofc yet"),a=Erizo.FcStack(b);else if(null!==window.navigator.userAgent.match("Firefox"))a.browser="mozilla",a=Erizo.FirefoxStack(b);else if(26<=window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1])L.Logger.debug("Stable"),a=Erizo.ChromeStableStack(b),a.browser="chrome-stable";else if("25"===
window.navigator.appVersion.match(/Bowser\/([\w\W]*?)\./)[1])a.browser="bowser";else throw a.browser="none","WebRTC stack not available";return a};
Erizo.GetUserMedia=function(b,a,c){navigator.getMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia;if(b.screen)if(L.Logger.debug("Screen access requested"),34<=!window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1])c({code:"This browser does not support screen sharing"});else{var d="okeephmleflklcdebijnponpabbmmgeo";b.extensionId&&(L.Logger.debug("extensionId supplied, using "+b.extensionId),d=b.extensionId);L.Logger.debug("Screen access on chrome stable, looking for extension");
try{chrome.runtime.sendMessage(d,{getStream:!0},function(d){if(d==void 0){L.Logger.debug("Access to screen denied");c({code:"Access to screen denied"})}else{b={video:{mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:d.streamId}}};navigator.getMedia(b,a,c)}})}catch(e){L.Logger.debug("Lynckia screensharing plugin is not accessible "),c({code:"no_plugin_present"})}}else"undefined"!==typeof module&&module.exports?L.Logger.error("Video/audio streams not supported in erizofc yet"):navigator.getMedia(b,
a,c)};Erizo=Erizo||{};
Erizo.Stream=function(b){var a=Erizo.EventDispatcher(b),c;a.stream=b.stream;a.url=b.url;a.recording=b.recording;a.room=void 0;a.showing=!1;a.local=!1;a.video=b.video;a.audio=b.audio;a.screen=b.screen;a.videoSize=b.videoSize;a.extensionId=b.extensionId;if(void 0!==a.videoSize&&(!(a.videoSize instanceof Array)||4!=a.videoSize.length))throw Error("Invalid Video Size");if(void 0===b.local||!0===b.local)a.local=!0;a.getID=function(){return b.streamID};a.getAttributes=function(){return b.attributes};a.setAttributes=
function(){L.Logger.error("Failed to set attributes data. This Stream object has not been published.")};a.updateLocalAttributes=function(a){b.attributes=a};a.hasAudio=function(){return b.audio};a.hasVideo=function(){return b.video};a.hasData=function(){return b.data};a.hasScreen=function(){return b.screen};a.sendData=function(){L.Logger.error("Failed to send data. This Stream object has not that channel enabled.")};a.init=function(){try{if((b.audio||b.video||b.screen)&&void 0===b.url){L.Logger.debug("Requested access to local media");
var d=b.video;!0==d&&void 0!==a.videoSize&&(d={mandatory:{minWidth:a.videoSize[0],minHeight:a.videoSize[1],maxWidth:a.videoSize[2],maxHeight:a.videoSize[3]}});var c={video:d,audio:b.audio,fake:b.fake,screen:b.screen,extensionId:a.extensionId};L.Logger.debug(c);Erizo.GetUserMedia(c,function(b){L.Logger.info("User has granted access to local media.");a.stream=b;b=Erizo.StreamEvent({type:"access-accepted"});a.dispatchEvent(b)},function(b){L.Logger.error("Failed to get access to local media. Error code was "+
b.code+".");b=Erizo.StreamEvent({type:"access-denied"});a.dispatchEvent(b)})}else{var f=Erizo.StreamEvent({type:"access-accepted"});a.dispatchEvent(f)}}catch(h){L.Logger.error("Error accessing to local media",h)}};a.close=function(){a.local&&(void 0!==a.room&&a.room.unpublish(a),a.hide(),void 0!==a.stream&&a.stream.stop(),a.stream=void 0)};a.play=function(b,c){c=c||{};a.elementID=b;if(a.hasVideo()||this.hasScreen()){if(void 0!==b){var f=new Erizo.VideoPlayer({id:a.getID(),stream:a,elementID:b,options:c});
a.player=f;a.showing=!0}}else a.hasAudio&&(f=new Erizo.AudioPlayer({id:a.getID(),stream:a,elementID:b,options:c}),a.player=f,a.showing=!0)};a.stop=function(){a.showing&&void 0!==a.player&&(a.player.destroy(),a.showing=!1)};a.show=a.play;a.hide=a.stop;c=function(){if(void 0!==a.player&&void 0!==a.stream){var b=a.player.video,c=document.defaultView.getComputedStyle(b),f=parseInt(c.getPropertyValue("width"),10),h=parseInt(c.getPropertyValue("height"),10),j=parseInt(c.getPropertyValue("left"),10),c=parseInt(c.getPropertyValue("top"),
10),g=document.getElementById(a.elementID),i=document.defaultView.getComputedStyle(g),g=parseInt(i.getPropertyValue("width"),10),i=parseInt(i.getPropertyValue("height"),10),k=document.createElement("canvas");k.id="testing";k.width=g;k.height=i;k.setAttribute("style","display: none");k.getContext("2d").drawImage(b,j,c,f,h);return k}return null};a.getVideoFrameURL=function(a){var b=c();return null!==b?a?b.toDataURL(a):b.toDataURL():null};a.getVideoFrame=function(){var a=c();return null!==a?a.getContext("2d").getImageData(0,
0,a.width,a.height):null};return a};Erizo=Erizo||{};
Erizo.Room=function(b){var a=Erizo.EventDispatcher(b),c,d,e,f,h,j;a.remoteStreams={};a.localStreams={};a.roomID="";a.socket={};a.state=0;a.p2p=!1;a.addEventListener("room-disconnected",function(){var b,c;a.state=0;for(b in a.remoteStreams)a.remoteStreams.hasOwnProperty(b)&&(c=a.remoteStreams[b],j(c),delete a.remoteStreams[b],c=Erizo.StreamEvent({type:"stream-removed",stream:c}),a.dispatchEvent(c));a.remoteStreams={};for(b in a.localStreams)a.localStreams.hasOwnProperty(b)&&(c=a.localStreams[b],c.pc.close(),
delete a.localStreams[b]);try{a.socket.disconnect()}catch(d){L.Logger.debug("Socket already disconnected")}a.socket=void 0});j=function(a){void 0!==a.stream&&(a.hide(),a.pc.close(),a.local&&a.stream.stop())};f=function(a,b){a.local?d("sendDataStream",{id:a.getID(),msg:b}):L.Logger.error("You can not send data through a remote stream")};h=function(a,b){a.local?(a.updateLocalAttributes(b),d("updateStreamAttributes",{id:a.getID(),attrs:b})):L.Logger.error("You can not update attributes in a remote stream")};
c=function(c,i,k){console.log(c);a.socket=io.connect(c.host,{reconnect:!1,secure:c.secure,"force new connection":!0});a.socket.on("onAddStream",function(b){var c=Erizo.Stream({streamID:b.id,local:!1,audio:b.audio,video:b.video,data:b.data,screen:b.screen,attributes:b.attributes});a.remoteStreams[b.id]=c;b=Erizo.StreamEvent({type:"stream-added",stream:c});a.dispatchEvent(b)});a.socket.on("onSubscribeP2P",function(b){var c=a.localStreams[b.streamId];void 0===c.pc&&(c.pc={});c.pc[b.subsSocket]=Erizo.Connection({callback:function(a){e("publish",
{state:"p2pSignaling",streamId:b.streamId,subsSocket:b.subsSocket},a,function(a){a==="error"&&callbackError&&callbackError(a);c.pc[b.subsSocket].onsignalingmessage=function(){c.pc[b.subsSocket].onsignalingmessage=function(){}};c.pc[b.subsSocket].processSignalingMessage(a)})},audio:c.hasAudio(),video:c.hasVideo(),stunServerUrl:a.stunServerUrl,turnServer:a.turnServer});c.pc[b.subsSocket].addStream(c.stream);c.pc[b.subsSocket].oniceconnectionstatechange=function(a){if(a==="disconnected"){c.pc[b.subsSocket].close();
delete c.pc[b.subsSocket]}}});a.socket.on("onPublishP2P",function(c,g){var i=a.remoteStreams[c.streamId];i.pc=Erizo.Connection({callback:function(){},stunServerUrl:a.stunServerUrl,turnServer:a.turnServer,maxAudioBW:b.maxAudioBW,maxVideoBW:b.maxVideoBW});i.pc.onsignalingmessage=function(a){i.pc.onsignalingmessage=function(){};g(a)};i.pc.processSignalingMessage(c.sdp);i.pc.onaddstream=function(b){L.Logger.info("Stream subscribed");i.stream=b.stream;b=Erizo.StreamEvent({type:"stream-subscribed",stream:i});
a.dispatchEvent(b)}});a.socket.on("onDataStream",function(b){var c=a.remoteStreams[b.id],b=Erizo.StreamEvent({type:"stream-data",msg:b.msg,stream:c});c.dispatchEvent(b)});a.socket.on("onUpdateAttributeStream",function(b){var c=a.remoteStreams[b.id],g=Erizo.StreamEvent({type:"stream-attributes-update",attrs:b.attrs,stream:c});c.updateLocalAttributes(b.attrs);c.dispatchEvent(g)});a.socket.on("onRemoveStream",function(b){var c=a.remoteStreams[b.id];delete a.remoteStreams[b.id];j(c);b=Erizo.StreamEvent({type:"stream-removed",
stream:c});a.dispatchEvent(b)});a.socket.on("disconnect",function(){L.Logger.info("Socket disconnected");if(0!==a.state){var b=Erizo.RoomEvent({type:"room-disconnected"});a.dispatchEvent(b)}});d("token",c,i,k)};d=function(b,c,d,e){a.socket.emit(b,c,function(a,b){"success"===a?void 0!==d&&d(b):void 0!==e&&e(b)})};e=function(b,c,d,e){a.socket.emit(b,c,d,function(a,b){void 0!==e&&e(a,b)})};a.connect=function(){var g=L.Base64.decodeBase64(b.token);0!==a.state&&L.Logger.error("Room already connected");
a.state=1;c(JSON.parse(g),function(c){var g=0,d=[],e,f,m;e=c.streams;a.p2p=c.p2p;f=c.id;a.stunServerUrl=c.stunServerUrl;a.turnServer=c.turnServer;a.state=2;b.defaultVideoBW=c.defaultVideoBW;b.maxVideoBW=c.maxVideoBW;for(g in e)e.hasOwnProperty(g)&&(m=e[g],c=Erizo.Stream({streamID:m.id,local:!1,audio:m.audio,video:m.video,data:m.data,screen:m.screen,attributes:m.attributes}),d.push(c),a.remoteStreams[m.id]=c);a.roomID=f;L.Logger.info("Connected to room "+a.roomID);g=Erizo.RoomEvent({type:"room-connected",
streams:d});a.dispatchEvent(g)},function(a){L.Logger.error("Not Connected! Error: "+a)})};a.disconnect=function(){var b=Erizo.RoomEvent({type:"room-disconnected"});a.dispatchEvent(b)};a.publish=function(c,d,k,l){d=d||{};d.maxVideoBW=d.maxVideoBW||b.defaultVideoBW;d.maxVideoBW>b.maxVideoBW&&(d.maxVideoBW=b.maxVideoBW);if(c.local&&void 0===a.localStreams[c.getID()])if(c.hasAudio()||c.hasVideo()||c.hasScreen())if(void 0!==c.url||void 0!==c.recording){var n;c.url?(d="url",n=c.url):(d="recording",n=c.recording);
e("publish",{state:d,data:c.hasData(),audio:c.hasAudio(),video:c.hasVideo(),screen:c.hasScreen(),attributes:c.getAttributes()},n,function(b,d){if(b==="success"){L.Logger.info("Stream published");c.getID=function(){return d};c.sendData=function(a){f(c,a)};c.setAttributes=function(a){h(c,a)};a.localStreams[d]=c;c.room=a;k&&k()}else{L.Logger.info("Error when publishing the stream",b);l&&l(b)}})}else a.p2p?(b.maxAudioBW=d.maxAudioBW,b.maxVideoBW=d.maxVideoBW,e("publish",{state:"p2p",data:c.hasData(),
audio:c.hasAudio(),video:c.hasVideo(),screen:c.hasScreen(),attributes:c.getAttributes()},void 0,function(b,d){b==="error"&&l&&l(b);L.Logger.info("Stream published");c.getID=function(){return d};if(c.hasData())c.sendData=function(a){f(c,a)};c.setAttributes=function(a){h(c,a)};a.localStreams[d]=c;c.room=a})):(c.pc=Erizo.Connection({callback:function(b){e("publish",{state:"offer",data:c.hasData(),audio:c.hasAudio(),video:c.hasVideo(),screen:c.hasScreen(),attributes:c.getAttributes()},b,function(b,d){if(b===
"error")l&&l(b);else{c.pc.onsignalingmessage=function(b){c.pc.onsignalingmessage=function(){};e("publish",{state:"ok",streamId:d,data:c.hasData(),audio:c.hasAudio(),video:c.hasVideo(),screen:c.hasScreen(),attributes:c.getAttributes()},b);L.Logger.info("Stream published");c.getID=function(){return d};if(c.hasData())c.sendData=function(a){f(c,a)};c.setAttributes=function(a){h(c,a)};a.localStreams[d]=c;c.room=a};c.pc.processSignalingMessage(b)}})},stunServerUrl:a.stunServerUrl,turnServer:a.turnServer,
maxAudioBW:d.maxAudioBW,maxVideoBW:d.maxVideoBW}),c.pc.addStream(c.stream));else c.hasData()&&e("publish",{state:"data",data:c.hasData(),audio:!1,video:!1,screen:!1,attributes:c.getAttributes()},void 0,function(b,d){if(b==="error")l&&l(b);else{L.Logger.info("Stream published");c.getID=function(){return d};c.sendData=function(a){f(c,a)};c.setAttributes=function(a){h(c,a)};a.localStreams[d]=c;c.room=a}})};a.startRecording=function(a,b,c){L.Logger.debug("Start Recording streamaa: "+a.getID());d("startRecorder",
{to:a.getID()},b,c)};a.stopRecording=function(a,b,c){d("stopRecorder",{id:a},b,c)};a.unpublish=function(b){if(b.local){d("unpublish",b.getID());b.room=void 0;if((b.hasAudio()||b.hasVideo()||b.hasScreen())&&void 0===b.url)b.pc.close(),b.pc=void 0;delete a.localStreams[b.getID()];b.getID=function(){};b.sendData=function(){};b.setAttributes=function(){}}};a.subscribe=function(b,c,d){c=c||{};if(!b.local){if(b.hasVideo()||b.hasAudio()||b.hasScreen())a.p2p?e("subscribe",{streamId:b.getID()}):(b.pc=Erizo.Connection({callback:function(a){"OFFER"===
JSON.parse(a).messageType&&e("subscribe",{streamId:b.getID(),audio:c.audio,video:c.video,data:c.data},a,function(a){"error"===a?d&&d(a):(a.match(/a=ssrc:55543/)&&(a=a.replace(/a=sendrecv\\r\\na=mid:video/,"a=recvonly\\r\\na=mid:video"),a=a.split("a=ssrc:55543")[0]+'"}'),b.pc.processSignalingMessage(a))})},nop2p:!0,audio:b.hasAudio(),video:b.hasVideo(),stunServerUrl:a.stunServerUrl,turnServer:a.turnServer}),b.pc.onaddstream=function(c){L.Logger.info("Stream subscribed");b.stream=c.stream;c=Erizo.StreamEvent({type:"stream-subscribed",
stream:b});a.dispatchEvent(c)});else if(b.hasData()&&!1!==c.data)e("subscribe",{streamId:b.getID(),data:c.data},void 0,function(c){"error"===c?d&&d(c):(L.Logger.info("Stream subscribed"),c=Erizo.StreamEvent({type:"stream-subscribed",stream:b}),a.dispatchEvent(c))});else{L.Logger.info("Subscribing to anything");return}L.Logger.info("Subscribing to: "+b.getID())}};a.unsubscribe=function(b,c){void 0!==a.socket&&(b.local||d("unsubscribe",b.getID(),function(){"error"===answer?c&&c(answer):j(b)},function(){L.Logger.error("Error calling unsubscribe.")}))};
a.getStreamsByAttribute=function(b,c){var d=[],e,f;for(e in a.remoteStreams)a.remoteStreams.hasOwnProperty(e)&&(f=a.remoteStreams[e],void 0!==f.getAttributes()&&void 0!==f.getAttributes()[b]&&f.getAttributes()[b]===c&&d.push(f));return d};return a};var L=L||{};
L.Logger=function(b){return{DEBUG:0,TRACE:1,INFO:2,WARNING:3,ERROR:4,NONE:5,enableLogPanel:function(){b.Logger.panel=document.createElement("textarea");b.Logger.panel.setAttribute("id","licode-logs");b.Logger.panel.setAttribute("style","width: 100%; height: 100%; display: none");b.Logger.panel.setAttribute("rows",20);b.Logger.panel.setAttribute("cols",20);b.Logger.panel.setAttribute("readOnly",!0);document.body.appendChild(b.Logger.panel)},setLogLevel:function(a){a>b.Logger.NONE?a=b.Logger.NONE:a<
b.Logger.DEBUG&&(a=b.Logger.DEBUG);b.Logger.logLevel=a},log:function(a){var c="";if(!(a<b.Logger.logLevel)){a===b.Logger.DEBUG?c+="DEBUG":a===b.Logger.TRACE?c+="TRACE":a===b.Logger.INFO?c+="INFO":a===b.Logger.WARNING?c+="WARNING":a===b.Logger.ERROR&&(c+="ERROR");for(var c=c+": ",d=[],e=0;e<arguments.length;e++)d[e]=arguments[e];d=d.slice(1);d=[c].concat(d);if(void 0!==b.Logger.panel){c="";for(e=0;e<d.length;e++)c+=d[e];b.Logger.panel.value=b.Logger.panel.value+"\n"+c}else console.log.apply(console,
d)}},debug:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.DEBUG].concat(a))},trace:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.TRACE].concat(a))},info:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.INFO].concat(a))},warning:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,
[b.Logger.WARNING].concat(a))},error:function(){for(var a=[],c=0;c<arguments.length;c++)a[c]=arguments[c];b.Logger.log.apply(b.Logger,[b.Logger.ERROR].concat(a))}}}(L);L=L||{};
L.Base64=function(){var b,a,c,d,e,f,h,j,g;b="A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,+,/".split(",");a=[];for(e=0;e<b.length;e+=1)a[b[e]]=e;f=function(a){c=a;d=0};h=function(){var a;if(!c||d>=c.length)return-1;a=c.charCodeAt(d)&255;d+=1;return a};j=function(){if(!c)return-1;for(;;){if(d>=c.length)return-1;var b=c.charAt(d);d+=1;if(a[b])return a[b];if("A"===b)return 0}};g=function(a){a=a.toString(16);1===a.length&&(a=
"0"+a);return unescape("%"+a)};return{encodeBase64:function(a){var c,d,e;f(a);a="";c=Array(3);d=0;for(e=!1;!e&&-1!==(c[0]=h());)if(c[1]=h(),c[2]=h(),a+=b[c[0]>>2],-1!==c[1]?(a+=b[c[0]<<4&48|c[1]>>4],-1!==c[2]?(a+=b[c[1]<<2&60|c[2]>>6],a+=b[c[2]&63]):(a+=b[c[1]<<2&60],a+="=",e=!0)):(a+=b[c[0]<<4&48],a+="=",a+="=",e=!0),d+=4,76<=d)a+="\n",d=0;return a},decodeBase64:function(a){var b,c;f(a);a="";b=Array(4);for(c=!1;!c&&-1!==(b[0]=j())&&-1!==(b[1]=j());)b[2]=j(),b[3]=j(),a+=g(b[0]<<2&255|b[1]>>4),-1!==
b[2]?(a+=g(b[1]<<4&255|b[2]>>2),-1!==b[3]?a+=g(b[2]<<6&255|b[3]):c=!0):c=!0;return a}}}(L);Erizo=Erizo||{};Erizo.View=function(){var b=Erizo.EventDispatcher({});b.url="http://chotis2.dit.upm.es:3000";return b};Erizo=Erizo||{};
Erizo.VideoPlayer=function(b){var a=Erizo.View({});a.id=b.id;a.stream=b.stream.stream;a.elementID=b.elementID;a.destroy=function(){a.video.pause();delete a.resizer;a.parentNode.removeChild(a.div)};a.resize=function(){var c=a.container.offsetWidth,d=a.container.offsetHeight;if(b.stream.screen||!1===b.options.crop)0.75*c<d?(a.video.style.width=c+"px",a.video.style.height=0.75*c+"px",a.video.style.top=-(0.75*c/2-d/2)+"px",a.video.style.left="0px"):(a.video.style.height=d+"px",a.video.style.width=4/3*
d+"px",a.video.style.left=-(4/3*d/2-c/2)+"px",a.video.style.top="0px");else if(c!==a.containerWidth||d!==a.containerHeight)0.75*c>d?(a.video.style.width=c+"px",a.video.style.height=0.75*c+"px",a.video.style.top=-(0.75*c/2-d/2)+"px",a.video.style.left="0px"):(a.video.style.height=d+"px",a.video.style.width=4/3*d+"px",a.video.style.left=-(4/3*d/2-c/2)+"px",a.video.style.top="0px");a.containerWidth=c;a.containerHeight=d};L.Logger.debug("Creating URL from stream "+a.stream);a.stream_url=(window.URL||
webkitURL).createObjectURL(a.stream);a.div=document.createElement("div");a.div.setAttribute("id","player_"+a.id);a.div.setAttribute("style","width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;");a.loader=document.createElement("img");a.loader.setAttribute("style","width: 16px; height: 16px; position: absolute; top: 50%; left: 50%; margin-top: -8px; margin-left: -8px");a.loader.setAttribute("id","back_"+a.id);a.loader.setAttribute("src",a.url+"/assets/loader.gif");
a.video=document.createElement("video");a.video.setAttribute("id","stream"+a.id);a.video.setAttribute("style","width: 100%; height: 100%; position: absolute");a.video.setAttribute("autoplay","autoplay");b.stream.local&&(a.video.volume=0);void 0!==a.elementID?(document.getElementById(a.elementID).appendChild(a.div),a.container=document.getElementById(a.elementID)):(document.body.appendChild(a.div),a.container=document.body);a.parentNode=a.div.parentNode;a.div.appendChild(a.loader);a.div.appendChild(a.video);
a.containerWidth=0;a.containerHeight=0;a.resizer=new L.ResizeSensor(a.container,a.resize);a.resize();a.bar=new Erizo.Bar({elementID:"player_"+a.id,id:a.id,stream:b.stream,media:a.video,options:b.options});a.div.onmouseover=function(){a.bar.display()};a.div.onmouseout=function(){a.bar.hide()};a.video.src=a.stream_url;return a};Erizo=Erizo||{};
Erizo.AudioPlayer=function(b){var a=Erizo.View({}),c,d;a.id=b.id;a.stream=b.stream.stream;a.elementID=b.elementID;L.Logger.debug("Creating URL from stream "+a.stream);a.stream_url=(window.URL||webkitURL).createObjectURL(a.stream);a.audio=document.createElement("audio");a.audio.setAttribute("id","stream"+a.id);a.audio.setAttribute("style","width: 100%; height: 100%; position: absolute");a.audio.setAttribute("autoplay","autoplay");b.stream.local&&(a.audio.volume=0);b.stream.local&&(a.audio.volume=0);
void 0!==a.elementID?(a.destroy=function(){a.audio.pause();a.parentNode.removeChild(a.div)},c=function(){a.bar.display()},d=function(){a.bar.hide()},a.div=document.createElement("div"),a.div.setAttribute("id","player_"+a.id),a.div.setAttribute("style","width: 100%; height: 100%; position: relative; overflow: hidden;"),document.getElementById(a.elementID).appendChild(a.div),a.container=document.getElementById(a.elementID),a.parentNode=a.div.parentNode,a.div.appendChild(a.audio),a.bar=new Erizo.Bar({elementID:"player_"+
a.id,id:a.id,stream:b.stream,media:a.audio,options:b.options}),a.div.onmouseover=c,a.div.onmouseout=d):(a.destroy=function(){a.audio.pause();a.parentNode.removeChild(a.audio)},document.body.appendChild(a.audio),a.parentNode=document.body);a.audio.src=a.stream_url;return a};Erizo=Erizo||{};
Erizo.Bar=function(b){var a=Erizo.View({}),c,d;a.elementID=b.elementID;a.id=b.id;a.div=document.createElement("div");a.div.setAttribute("id","bar_"+a.id);a.bar=document.createElement("div");a.bar.setAttribute("style","width: 100%; height: 15%; max-height: 30px; position: absolute; bottom: 0; right: 0; background-color: rgba(255,255,255,0.62)");a.bar.setAttribute("id","subbar_"+a.id);a.link=document.createElement("a");a.link.setAttribute("href","http://www.lynckia.com/");a.link.setAttribute("target","_blank");
a.logo=document.createElement("img");a.logo.setAttribute("style","width: 100%; height: 100%; max-width: 30px; position: absolute; top: 0; left: 2px;");a.logo.setAttribute("alt","Lynckia");a.logo.setAttribute("src",a.url+"/assets/star.svg");d=function(b){"block"!==b?b="none":clearTimeout(c);a.div.setAttribute("style","width: 100%; height: 100%; position: relative; bottom: 0; right: 0; display:"+b)};a.display=function(){d("block")};a.hide=function(){c=setTimeout(d,1E3)};document.getElementById(a.elementID).appendChild(a.div);
a.div.appendChild(a.bar);a.bar.appendChild(a.link);a.link.appendChild(a.logo);if(!b.stream.screen&&(void 0===b.options||void 0===b.options.speaker||!0===b.options.speaker))a.speaker=new Erizo.Speaker({elementID:"subbar_"+a.id,id:a.id,stream:b.stream,media:b.media});a.display();a.hide();return a};Erizo=Erizo||{};
Erizo.Speaker=function(b){var a=Erizo.View({}),c,d,e,f=50;a.elementID=b.elementID;a.media=b.media;a.id=b.id;a.stream=b.stream;a.div=document.createElement("div");a.div.setAttribute("style","width: 40%; height: 100%; max-width: 32px; position: absolute; right: 0;z-index:0;");a.icon=document.createElement("img");a.icon.setAttribute("id","volume_"+a.id);a.icon.setAttribute("src",a.url+"/assets/sound48.png");a.icon.setAttribute("style","width: 80%; height: 100%; position: absolute;");a.div.appendChild(a.icon);
a.stream.local?(d=function(){a.media.muted=!0;a.icon.setAttribute("src",a.url+"/assets/mute48.png");a.stream.stream.getAudioTracks()[0].enabled=!1},e=function(){a.media.muted=!1;a.icon.setAttribute("src",a.url+"/assets/sound48.png");a.stream.stream.getAudioTracks()[0].enabled=!0},a.icon.onclick=function(){a.media.muted?e():d()}):(a.picker=document.createElement("input"),a.picker.setAttribute("id","picker_"+a.id),a.picker.type="range",a.picker.min=0,a.picker.max=100,a.picker.step=10,a.picker.value=
f,a.picker.setAttribute("orient","vertical"),a.div.appendChild(a.picker),a.media.volume=a.picker.value/100,a.media.muted=!1,a.picker.oninput=function(){0<a.picker.value?(a.media.muted=!1,a.icon.setAttribute("src",a.url+"/assets/sound48.png")):(a.media.muted=!0,a.icon.setAttribute("src",a.url+"/assets/mute48.png"));a.media.volume=a.picker.value/100},c=function(b){a.picker.setAttribute("style","background: transparent; width: 32px; height: 100px; position: absolute; bottom: 90%; z-index: 1;"+a.div.offsetHeight+
"px; right: 0px; -webkit-appearance: slider-vertical; display: "+b)},d=function(){a.icon.setAttribute("src",a.url+"/assets/mute48.png");f=a.picker.value;a.picker.value=0;a.media.volume=0;a.media.muted=!0},e=function(){a.icon.setAttribute("src",a.url+"/assets/sound48.png");a.picker.value=f;a.media.volume=a.picker.value/100;a.media.muted=!1},a.icon.onclick=function(){a.media.muted?e():d()},a.div.onmouseover=function(){c("block")},a.div.onmouseout=function(){c("none")},c("none"));document.getElementById(a.elementID).appendChild(a.div);
return a};
module.exports = Erizo;
