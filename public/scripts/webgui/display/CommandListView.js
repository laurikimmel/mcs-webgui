dojo.provide("webgui.display.CommandListView");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");
dojo.require("webgui.common.Constants");

dojo.require("dojo.store.Memory");
dojo.require("dojo.store.Observable");
dojo.require("dojo.dnd.Source");

/**
 * Using Dojo Object Storage
 */
dojo.declare("CommandListAbstraction", webgui.pac.Abstraction, {
    
    constructor: function() {
        
        var store = new dojo.store.Memory({idProperty: "name"});
        
        this.getStore = function() {
            return store;
        };
        
        this.handleCommand = function(command) {
            //var query = store.query({name : command.name});
            //console.log("[CommandListView] handle: " + command.name + "; count: " + query.length);
            store.put(command);
        };
        
    },
    
});

dojo.declare("CommandListPresentation", webgui.pac.Presentation, {
    
    constructor: function(store, containerId) {

        store = dojo.store.Observable(store);
        
        var dndSource = new dojo.dnd.Source(containerId, 
                {
                    copyOnly: true, 
                    creator: nodeCreator,
                    singular: true,
                });

        function nodeCreator(command, hint) {
            var li = document.createElement("div");
            li.innerHTML = command.name;
            return {
                node: li,
                data: command,
                type: [DND_TYPE_COMMAND],
            };
        }
        
        var all = store.query();
        all.observe(function(command, removedFrom, insertedInto) {
            //console.log("[CommandListView] updated " + command.name + "; removedFrom: " + removedFrom + "; insertedInto: " + insertedInto);
            if (removedFrom > -1) { 
                // existing object removed
                // TODO - implement
            }
            if (insertedInto > -1) { 
                // new or updated object inserted
                dndSource.insertNodes(false, [command]);
            }
        });
    }
});

/**
 * Command selection screen controller
 */
dojo.declare("CommandListController", webgui.pac.Controller, {
    
//    divId: "Command", // defaultId
    containerId: "commands",
    
    constructor: function(args) {
        dojo.safeMixin(args);

        var dataAbstraction = new CommandListAbstraction();
        var presentation = new CommandListPresentation(dataAbstraction.getStore(), this.containerId);
        
//        // publish selection events to public topic
//        dojo.connect(presentation.getGrid(), "onRowClick", function(e) {
//            var command = e.grid.getItem(e.rowIndex);
//            msgbus.publish(TOPIC_COMMAND_SELECTION, [command]);
//        });
        
//        msgbus.subscribe(TOPIC_COMMAND_SELECTION, function (command) {
//            console.log("Selected: " + command.name + "; " + command.timestamp);
//        });

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
