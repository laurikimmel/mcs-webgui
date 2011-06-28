dojo.provide("webgui.display.CommandListView");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");
dojo.require("webgui.pac.GridPresentation");
dojo.require("webgui.common.Constants");


/**
 * No store currently required
 */
dojo.declare("CommandListAbstraction", webgui.pac.Abstraction, {
    
    constructor: function() {
        this.commands = []; 
        
        var key = 'name';
        var storedata = { identifier: key, items: [] };
        var store = new dojo.data.ItemFileWriteStore({ data: storedata });
        var viewParameters = [];
        
        this.getStore = function() {
            return store;
        };
        
        this.handleCommand = function(command) {
            store.fetch({ 
                
                query: { name: command.name },
                
                onBegin: function(size, request) {
                    if (size == 0) {
                        store.newItem(command);
                    }
                },    
                onItem: function(item) {
                    // TODO - update
//                    store.setValue(item, "name", parameter.name);
//                    store.setValue(item, "value", parameter.value);
//                        store.setValue(item, "type", parameter.clazz);
//                    var date = webgui.common.Utils.formatDate(parameter.timestamp);
//                    store.setValue(item, "timestamp", date);
                },
                onError: function(er) {
                    console.error("[CommandListView] commands query failed: " + er);
                }
            });
            
        };
        
    },
    
});

dojo.declare("CommandListPresentation", webgui.pac.Presentation, {
    constructor: function() { }
});

/**
 * Command selection screen controller
 */
dojo.declare("CommandListController", webgui.pac.Controller, {
    
    divId: "Command", // defaultId
    
    constructor: function(args) {

        var dataAbstraction = new CommandListAbstraction();
        var presentation = new webgui.pac.GridPresentation({
            "domId": this.divId + "Container",
            "configuration": {
                "id": this.divId,
                "store": dataAbstraction.getStore(),
                "clientSort": true,
                "structure": [
                        { "field": "name", "name": "Name", width: "100%" },
                ],
                "selectionMode" : "single",
            }
        });
        
        // publish selection events to public topic
        dojo.connect(presentation.getGrid(), "onRowClick", function(e) {
            var command = e.grid.getItem(e.rowIndex);
            msgbus.publish(TOPIC_COMMAND_SELECTION, [command]);
        });
        
//        msgbus.subscribe(TOPIC_COMMAND_SELECTION, function (command) {
//            console.log("Selected: " + command.name + "; " + command.timestamp);
//        });

        
        // hide table header
        var query = "#" + this.divId + "Container .dojoxGridHeader"; 
//        console.log("*** N: " + dojo.query(query).length);
        dojo.style(dojo.query(query)[0], "display", "none");

        this.channelHandler = function(command, channel) {
//            console.log("*** " + JSON.stringify(command));
//            [17:29:51.293] *** {"lockStates":[],"tasks":[],"arguments":[{"range":null,"unit":"Milliseconds","value":null,"clazz":null,"name":"New Satellite Time","timestamp":1309184990589,"description":"The time expressed as milliseconds from 1970.","objectid":"1feaa242-36e5-47db-b626-0c5416dbe9be","datasetidentifier":0}],"releaseTime":0,"executionTime":0,"name":"Set Time","timestamp":1309184990589,"description":"Sets the onboard time","objectid":"f506f3af-b1cf-48f7-93ba-1ad078a270c7","datasetidentifier":0}            
            try {
                dataAbstraction.handleCommand(command);
            }
            catch (e) {
                console.error("[CommandListView] failed to handle command " + command.name + " - " + e);
            }
        };
    }
});

dojo.declare("webgui.display.CommandListView", null, {
    constructor: function(args) {
        var controller = new CommandListController(args);
        controller.subscribe();
    }
});
