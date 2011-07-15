dojo.provide("webgui.pac.Controller");
dojo.require("webgui.msgbus");
dojo.require("webgui.common.Constants");

dojo.declare("webgui.pac.Controller", null, {

    presentation : null,
    abstraction : null,
    channels : null,

    constructor : function(args) {
        dojo.safeMixin(this, args);
    },

    channelHandler : function(message, channel) {
        console.log("Missing handler implementation for " + channel);
    },

    subscribe : function() {
        if (this.channels == null) {
            return;
        }
        var channelHandler = this.channelHandler;
        dojo.forEach(this.channels, function(channel, i) {
            console.log("Subscribing to channel[" + i + "]: " + channel);
            try {
                webgui.msgbus.subscribe(channel, channelHandler);
                webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_REQUEST, [{"channel" : channel, source: this.divId}]);
            }
            catch (e) {
                console.error("[Controller] Failed to subscribe to channel " + channel + ";   " + e);
            }
        }, this);
    },

});
