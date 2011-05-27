dojo.provide("webgui.pac.Controller");

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
                msgbus.publish("/request/channel", [{"channel" : channel}]);
            }
            catch (e) {
                console.error("Failed to subscribe to channel " + channel + ";   " + e);
            }
        });
    },
    
});
