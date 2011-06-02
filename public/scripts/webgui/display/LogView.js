dojo.provide("webgui.display.LogView");

dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");
dojo.require("webgui.pac.GridPresentation");
dojo.require("dojox.uuid.generateRandomUuid");
dojo.require("webgui.common.Utils");


dojo.declare("LogViewAbstraction", webgui.pac.Abstraction, {
    
    constructor: function(limit) {
        var key = "id";
        var storedata = { identifier: key, items: [] };
        var store = new dojo.data.ItemFileWriteStore({ data: storedata });
        
        this.getStore = function() {
            return store;
        };
        
        // for removing from store TODO refactor
        var counter = 0;
        
        this.handleMessage = function(logMessage) {
            // [18:31:05.667] "channel: /logs/live; message: {\"data\":\"{\\\"categoryName\\\":\\\"org.hbird.business.simpleparametersimulator.ConstantParameter\\\",\\\"threadName\\\":\\\"state.of.video.stream\\\",\\\"locationInformation\\\":{\\\"fullInfo\\\":null,\\\"className\\\":\\\"?\\\",\\\"fileName\\\":\\\"?\\\",\\\"lineNumber\\\":\\\"?\\\",\\\"methodName\\\":\\\"?\\\"},\\\"ndc\\\":null,\\\"renderedMessage\\\":\\\"Sending new constant value with name 'Video Stream State'.\\\",\\\"throwableInformation\\\":null,\\\"throwableStrRep\\\":null,\\\"propertyKeySet\\\":[],\\\"fqnofLoggerClass\\\":null,\\\"properties\\\":{},\\\"message\\\":\\\"Sending new constant value with name 'Video Stream State'.\\\",\\\"logger\\\":null,\\\"level\\\":{\\\"syslogEquivalent\\\":7},\\\"timeStamp\\\":1306423865517,\\\"loggerName\\\":\\\"org.hbird.business.simpleparametersimulator.ConstantParameter\\\"}\",\"channel\":\"/logs/live\"}"
            
            try {
                var storeItem = {};
                storeItem.id = dojox.uuid.generateRandomUuid();
                storeItem.timestamp = webgui.common.Utils.formatDate(logMessage.timeStamp);
                storeItem.message = logMessage.renderedMessage;
                store.newItem(storeItem);
                
                counter++;
                if (counter > limit) {
                    // getting the size of the store
                    var size = function(size, request) {
                        // remove excess elements
                        store.fetch({ 
                            count: (size - limit), 
                            onItem: function(item) { 
                                store.deleteItem(item); 
                            } 
                        });
                    };
                    store.fetch({ query: {}, onBegin: size, start: 0, count: 0 });
                }
            }
            catch (e) {
                console.error("Failed to store log message " + e);
            }
        }
    },
});

dojo.declare("LogViewController", webgui.pac.Controller, {
    
    divId: "LogView", // defaultId
    limit: 10,
    
    constructor: function(args) {
    
        var dataAbstraction = new LogViewAbstraction(this.limit);
        
        var presentation = new webgui.pac.GridPresentation({
            "domId": this.divId + "Container",
            "configuration": {
                "id": this.divId,
                "store": dataAbstraction.getStore(),
                "clientSort": false,
                "structure": [
                    { "field": "timestamp", "name": "Timestamp", width: "200px" },
                    { "field": "message", "name": "Message", width: "auto" },
                ]
            }
        });
        
        this.channelHandler = function(message, channel) {
            dataAbstraction.handleMessage(message);
            presentation.scrollToGridBottom();
        }
    },
    
});

dojo.declare("webgui.display.LogView", null, {
    constructor: function(args) {
        var controller = new LogViewController(args);
        controller.subscribe();
    }
});
