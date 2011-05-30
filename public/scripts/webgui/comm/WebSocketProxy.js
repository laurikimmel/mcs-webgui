dojo.provide("webgui.comm.WebSocketProxy");
dojo.require("dojox.socket");
dojo.require("dojox.socket.Reconnect");
dojo.require("webgui.msgbus");

dojo.declare("webgui.comm.WebSocketProxy", null, {
    
    activeChannels: [],
    
    constructor: function() {
        dojo.safeMixin(this.args);
        
        var subscribeToSocket = function(subscription) {
            console.log("[WebSocketProxy] new channel subscription " + subscription.channel);
            
            var existing = dojo.filter(this.activeChannels, function(channel) {
                return channel == subscription.channel;
            });
            
            if (existing.length > 0) {
                console.log("[WebSocketProxy] channel " + subscription.channel + " already active ");
                return;
            }
            else {
                connectToSocket(subscription.channel, this.activeChannels);
            }
        };
        
        var connectToSocket = function(channel, activeChannels) {
            try {
                console.log("[WebSocketProxy] connecting to " + channel);
                activeChannels.push(channel);
                var socket = dojox.socket.Reconnect(dojox.socket(channel));
                dojo.hitch(this, listenSocket(activeChannels, channel, socket));
            }
            catch (e) {
                console.error("[WebSocketProxy] failed to listent WebSocket " + channel + "; " + e);
            }
        };
      
        var listenSocket = function(activeChannels, channel, socket) {
            socket.on("open", dojo.hitch(this, onSocketOpen, activeChannels, channel));
            socket.on("close", dojo.hitch(this, onSocketClose, activeChannels, channel));
            socket.on("error", dojo.hitch(this, onSocketError, channel));
            socket.on("message", dojo.hitch(this, onSocketMessage, channel));
        };
      
        var onSocketOpen = function(activeChannels, channel, event) {
            console.log("[WebSocketProxy] channel "+ channel + " is active now; total channels: " + activeChannels.length);
        };

        var onSocketClose = function(activeChannels, channel, event) {
            var i = activeChannels.indexOf(channel);
            if (i != -1) {
                activeChannels.splice(i, 1);
            }
            console.log("[WebSocketProxy] channel " + channel + " closed; total channels: " + activeChannels.length);
        };

        var onSocketError = function(channel, error) {
            console.log("[WebSocketProxy] socket error " + channel + "; " + error);
        };

        var onSocketMessage = function(channel, event) {
//            console.log("[WebSocketProxy] message " + channel + "; " + JSON.stringify(event.data));
            var data = JSON.parse(event.data);
            webgui.msgbus.publish(channel, [data, channel]);
        };
        
        webgui.msgbus.subscribe("/request/channel", dojo.hitch(this, subscribeToSocket));       
    }
});
