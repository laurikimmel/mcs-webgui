dojo.provide("webgui.comm.CometProxy");
//Cometd for CometProxy
dojo.require("dojox.cometd");
// our message bus
dojo.require("webgui.msgbus");

/**
 * Refactor, currently this class'es code is called by a subscription bus, bu it might not be the best idea ...
 */
dojo.declare("webgui.comm.CometProxy", null, {
    cometdUrl: "http://127.0.0.1:8086/cometd", //default url for cometd
    activeChannels: [],
   
    initCometd: function() {
        var io = dojox.cometd;
        console.log("[CometProxy] connecting to " + this.cometdUrl);
        io.init(this.cometdUrl);
        //TODO add connection check
        this.listenCometd();
    },
    
    listenCometd: function() {
        var io = dojox.cometd;        
        var publishToInnerBus = function(message) {
//            console.log("[ConnectionManager] received " + JSON.stringify(message));
//            console.log("[ConnectionManager] received " + message.channel + ": " + JSON.parse(message.data));
            try {
                var data = JSON.parse(message.data);
                webgui.msgbus.publish(message.channel, [data, message.channel]);
            }
            catch (e) {
                console.error("[CometProxy] error: " + e + "; channel: " + message.channel + "; message: " + JSON.stringify(message));
            }
        };
        
        /**
        *  CometListener listenes internal dojo channel "request/channel" for channels.
        *  If a channel is requested, this function is called, which in turn subscribes to the requested channel on cometd message-bus.
        *  @param subscription The  subscription message
        */
        var subscribeToCometdChannel = function(subscription) {
            console.log("[CometProxy] new channel subscription " + subscription.channel);
            
            var existing = dojo.filter(this.activeChannels, function(channel) {
                return channel == subscription.channel;
            });
            
            if (existing.length > 0) {
                console.log("[CometProxy] channel " + subscription.channel + " already active ");
                return;
            }
            else {
                var handle = io.subscribe(subscription.channel, publishToInnerBus);
                handle.addCallback(dojo.hitch(this, function() {
                    console.log("[CometProxy] channel "+ handle.args[0] + " is active now; total channels " + this.activeChannels.length);
                }));
                this.activeChannels.push(subscription.channel);
                console.log("[CometProxy] added new channel: " + subscription.channel);
            }
        };        
        webgui.msgbus.subscribe("/request/channel", dojo.hitch(this, subscribeToCometdChannel));
    },
    
    constructor: function(args){
        dojo.safeMixin(this.args);
        this.initCometd();
    }
});