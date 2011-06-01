dojo.provide("webgui.pac.Controller");
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
            try {
                msgbus.subscribe(channel, channelHandler);
                msgbus.publish(TOPIC_CHANNEL_REQUEST, [{"channel" : channel}]);
            }
            catch (e) {
                console.error("[Controller] Failed to subscribe to channel " + channel + ";   " + e);
            }
        });
    },
    
});
