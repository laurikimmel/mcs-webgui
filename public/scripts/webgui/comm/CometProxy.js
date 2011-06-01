dojo.provide("webgui.comm.CometProxy");
//Cometd for CometProxy
dojo.require("dojox.cometd");
// our message bus
dojo.require("webgui.msgbus");
dojo.require("webgui.common.Constants");
dojo.require("webgui.comm.ProxyBase");

/**
 * Refactor, currently this class'es code is called by a subscription bus, bu it might not be the best idea ...
 */
dojo.declare("webgui.comm.CometProxy", webgui.comm.ProxyBase, {

    cometdUrl: "http://127.0.0.1:8086/cometd", // default url for cometd
    io: dojox.cometd,

    constructor: function(args) {
        this.initCometd();
    },

    initCometd: function() {
        console.log("[CometProxy] connecting to " + this.cometdUrl);
        this.io.init(this.cometdUrl);
    },

    publishToInnerBus: function(message) {
//      console.log("[ConnectionManager] received " + JSON.stringify(message));
//      console.log("[ConnectionManager] received " + message.channel + ": " + JSON.parse(message.data));
        try {
            var data = JSON.parse(message.data);
            webgui.msgbus.publish(message.channel, [data, message.channel]);
        }
        catch (e) {
            console.error("[CometProxy] error: " + e + "; channel: " + message.channel + "; message: " + JSON.stringify(message));
        }
    },

    connect: function (channel, activeChannels) {
        var handle = this.io.subscribe(channel, this.publishToInnerBus);
        handle.addCallback(dojo.hitch(this, function() {
            webgui.msgbus.publish(TOPIC_CHANNEL_EVENT, [channel, "Connected"]);
            console.log("[CometProxy] channel " + handle.args[0] + " is active now; total channels " + this.activeChannels.length);
        }));
        activeChannels.push(channel);
        webgui.msgbus.publish(TOPIC_CHANNEL_EVENT, [channel, "Connecting"]);
        console.log("[CometProxy] added new channel: " + channel);
    },
    
});