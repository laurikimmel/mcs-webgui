dojo.provide("webgui.display.CommandListView");

dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.ListPresentation");
dojo.require("webgui.common.Constants");
dojo.require("dojo.store.Memory");

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

/**
 * Command selection screen controller
 */
dojo.declare("CommandListController", webgui.pac.Controller, {

//    divId: "Command", // defaultId
    containerId: "commands",

    constructor: function(args) {
        dojo.safeMixin(args);

        var dataAbstraction = new CommandListAbstraction();
        var presentation = new webgui.pac.ListPresentation({
            store: dataAbstraction.getStore(),
            containerId: this.containerId,
            dndTypes: [webgui.common.Constants.DND_TYPE_COMMAND],
            selectionTopic: webgui.common.Constants.TOPIC_SELECTION_COMMAND,
        });

//        msgbus.subscribe(TOPIC_SELECTION_COMMAND, function (command) {
//            console.log("Selected COMMAND: " + command.name + "; " + command.timestamp);
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
        console.log("[CommandListView] initializing components ...");
        var controller = new CommandListController(args);
        controller.subscribe();
    }
});
