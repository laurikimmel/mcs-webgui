dojo.provide("webgui.comm.ProxyBase");
dojo.require("webgui.msgbus");
dojo.require("webgui.common.Constants");

dojo.declare("webgui.comm.ProxyBase", null, {

    constructor: function(args) {
        dojo.safeMixin(this, args);
        console.log("[ProxyBase] init");
        this.activeChannels = [];
        webgui.msgbus.subscribe(webgui.common.Constants.TOPIC_CHANNEL_REQUEST, dojo.hitch(this, this.subscribeToChannel));
    },

    subscribeToChannel: function(subscription) {
        if (subscription == null) {
            console.error("[ProxyBase] void channel subscription!");
            return;
        }

        if (subscription.channel == null) {
            console.error("[ProxyBase] invalid channel subscription!" + JSON.stringify(subscription));
            return;
        }

        console.log("[ProxyBase] new channel subscription " + subscription.channel + "; source: " + subscription.source);

        var existing = dojo.filter(this.activeChannels, function(channel) {
            return channel == subscription.channel;
        });

        if (existing.length > 0) {
            console.log("[ProxyBase] channel " + subscription.channel + " already active ");
            return;
        }

        if (this.connect != null) {
            console.log("[ProxyBase] adding channel " + subscription.channel);
            dojo.hitch(this, this.connect(subscription.channel, this.activeChannels));
        }
    },

    connect: function(channel, activeChannels) {
        console.log("connect(channel, activeChannels) not implemented!");
    },
});
