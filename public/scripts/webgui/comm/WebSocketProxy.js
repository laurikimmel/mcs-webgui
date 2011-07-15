dojo.provide("webgui.comm.WebSocketProxy");
dojo.require("dojox.socket");
dojo.require("dojox.socket.Reconnect");
dojo.require("webgui.msgbus");
dojo.require("webgui.common.Constants");
dojo.provide("webgui.comm.ProxyBase");

dojo.declare("webgui.comm.WebSocketProxy", webgui.comm.ProxyBase, {

    constructor: function() {
    },

    connect: function(channel, activeChannels) {
        try {
            console.log("[WebSocketProxy] connecting to " + channel);
            webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_EVENT, [channel, "Connecting", "WebSocketProxy"]);
            activeChannels.push(channel);
            var socket = dojox.socket.Reconnect(dojox.socket(channel));
            dojo.hitch(this, this.listenSocket(activeChannels, channel, socket));
        }
        catch (e) {
            webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "WebSocketProxy", e]);
            console.error("[WebSocketProxy] failed to listent WebSocket " + channel + "; " + e);
        }
    },

    listenSocket: function(activeChannels, channel, socket) {
        socket.on("open", dojo.hitch(this, this.onSocketOpen, activeChannels, channel));
        socket.on("close", dojo.hitch(this, this.onSocketClose, activeChannels, channel));
        socket.on("error", dojo.hitch(this, this.onSocketError, channel));
        socket.on("message", dojo.hitch(this, this.onSocketMessage, channel));
    },

    onSocketOpen: function(activeChannels, channel, event) {
        webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_EVENT, [channel, "Connected", "WebSocketProxy"]);
        console.log("[WebSocketProxy] channel "+ channel + " is active now; total channels: " + activeChannels.length);
    },

    onSocketClose: function(activeChannels, channel, event) {
        var i = activeChannels.indexOf(channel);
        if (i != -1) {
            activeChannels.splice(i, 1);
        }
        webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_EVENT, [channel, "Closed", "WebSocketProxy"]);
        console.log("[WebSocketProxy] channel " + channel + " closed; total channels: " + activeChannels.length);
    },

    onSocketError: function(channel, error) {
        webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "WebSocketProxy", error]);
        console.log("[WebSocketProxy] socket error " + channel + "; " + error);
    },

    onSocketMessage: function(channel, event) {
//        console.log("[WebSocketProxy] message " + channel + "; " + JSON.stringify(event.data));
        var data = JSON.parse(event.data);
        webgui.msgbus.publish(channel, [data, channel]);
    },

});
