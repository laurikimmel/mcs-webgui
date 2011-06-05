dojo.provide("webgui.display.ConnectionsView");

dojo.require("dojo.data.ItemFileWriteStore");

dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");
dojo.require("webgui.pac.GridPresentation");
dojo.require("webgui.common.Utils");
dojo.require("webgui.common.Constants");

dojo.declare("ConnectionsViewAbstraction", webgui.pac.Abstraction, {
    
    constructor: function() {
        
        var key = "channel";
        var storedata = { identifier: key, items: [] };
        var store = new dojo.data.ItemFileWriteStore({ data: storedata });
        
        this.getStore = function() {
            return store;
        };
        
        this.handleMessage = function(message, channel) {
            try {
                store.fetch({ query: { channel: channel },
                    onBegin: function(size, request) {
                        if (size == 0) {
                            var item = {};
                            item.channel = channel;
                            item.timestamp = webgui.common.Utils.formatDate(new Date().getTime());
                            item.counter = 0;
                            item.status = "OK";
                            store.newItem(item);
                        }
                    },    
                    onItem: function(item) {
                        store.setValue(item, "timestamp", webgui.common.Utils.formatDate(new Date().getTime()));
                        store.setValue(item, "counter", parseInt(item.counter) + 1);
                    },
                    onError: function(er) {
                        console.err(er);
                    }
                });
            }
            catch (e) {
                console.log("Failed to handle message on channel " + channel + "; " + e);
            }
        };
        
        this.handleChannelEvent = function(channel, status, statusMessage) {
            try {
                store.fetch({ query: { channel: channel },
                    onBegin: function(size, request) {
                        if (size == 0) {
                            var item = {};
                            item.channel = channel;
                            item.timestamp = webgui.common.Utils.formatDate(new Date().getTime());
                            item.counter = 0;
                            item.status = status;
                            item.statusMessage = toString(statusMessage);
                            store.newItem(item);
                        }
                    },    
                    onItem: function(item) {
                        store.setValue(item, "timestamp", webgui.common.Utils.formatDate(new Date().getTime()));
                        store.setValue(item, "status", status);
                        store.setValue(item, "statusMessage", toString(statusMessage));
                    },
                    onError: function(er) {
                        console.err(er);
                    }
                });
            }
            catch (e) {
                console.log("Failed to handle channel event " + channel + "; status: " + status + "; " + e);
            }
        };
        
        function toString(statusMessage) {
            return statusMessage == null ? "" : statusMessage;
        }
        
    },
});

dojo.declare("ConnectionsViewController", [webgui.pac.Controller, webgui.comm.ProxyBase], {
    
    divId: "ConnectionsView", // defaultId
    
    constructor: function(args) {
        
        var dataAbstraction = new ConnectionsViewAbstraction();
        
        var presentation = new webgui.pac.GridPresentation({
            domId: this.divId + "Container",
            configuration: {
                id: this.divId,
                store: dataAbstraction.getStore(),
                clientSort: false,
                structure: [
                    { field: "channel", name: "Channel", width: "200px" },
                    { field: "status", name: "Status", width: "100px" },
                    { field: "counter", name: "Messages", width: "100px" },
                    { field: "timestamp", name: "Last Message", width: "200px" },
                    { field: "statusMessage", name: "Status Message", width: "auto" },
                ]
            }
        });
        
        this.connect = function(channel, activeChannels) {
            dojo.hitch(this, msgbus.subscribe(channel, dataAbstraction.handleMessage));
            console.log("[ConnectionsViewController]  added new channel " + channel);
            activeChannels.push(channel);
        };

        msgbus.subscribe(TOPIC_CHANNEL_EVENT, dataAbstraction.handleChannelEvent);
    },

});

dojo.declare("webgui.display.ConnectionsView", null, {
    constructor: function(args) {
        console.log("[ConnectionsView] init ...");
        var controller = new ConnectionsViewController(args);
    }
});
