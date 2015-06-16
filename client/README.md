# Conqueror client

The Conqueror client is a JavaScript client that can be integrated with web applications. It provides simple methods to create and manage multi-party calls through the Conqueror API.

## Install

Add the `conqueror.js` file to your HTML:

```html
<script src="conqueror.js" type="text/javascript"></script>
```

## Quick start

This client provides a constructor called `Conqueror`. This constructor takes an `options` object as its argument. Here is how you can instantiate the Conqueror client:

```javascript
// Create an instance of the Conqueror constructor
var conqueror = new Conqueror({ audiocontainer: document.getElementById("container") });

// Start a call
conqueror.initcall();
```

## options

The `options` object for the constructor takes a long list of properties. Here are the important ones:

```javascript
var options = {
  audiocontainer: audioList, // DOM reference of a `div` where the audio elements will be pushed. Defaults to selecting `#audiocontainer`.
  sessionid: id, // Session ID of the call to join. If not provided, it will start a new call.
  username: user, // An ID of the current user
  conqueror_path: path // Provide a path to a conqueror instance.
}
```

## Methods

**this.initcall()**

Start the call once the instance is ready.

**this.mute()**

Mute the outgoing audio stream during a call.

**this.unmute()**

Unmute the outgoing audio stream during a call.

**this.endcall()**

End the current call.

## Event listeners

An instance of `Conqueror` provides a number of hooks where you can provide listener functions. Here are the hooks available:

**this.onuserjoin**

Triggered when a user joins a call. Gets the user data as its argument.

**this.onuserdrop**

Triggered when a user drops from a call. Gets the user data as its argument.

**this.onconnection**

Triggered when a connection is obtained with the Conqueror instance. Gets the connection data as its argument.

**this.onstatus**

Triggered when the server sends a custom status. Gets the status data as its argument.

**this.oncallstart**

Triggered when a call is started. Gets the session id as its argument.

**this.oncallend**

Triggered when a call is ended.
