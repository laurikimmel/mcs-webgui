dojo.provide("webgui.display.ParameterDisplay");

dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.ListPresentation");
dojo.require("webgui.common.Constants");
dojo.require("dojo.store.Memory");

/**
 * Using Dojo Object Storage
 */
dojo.declare("ParameterAbstraction", webgui.pac.Abstraction, {
    
    constructor: function() {
        
        var store = new dojo.store.Memory({idProperty: "name"});
        
        this.getStore = function() {
            return store;
        };
        
        this.handleParameter = function(parameter) {
            store.put(parameter);
        };
        
    },

});

/**
 * Parameter selection screen controller
 */
dojo.declare("ParameterController", webgui.pac.Controller, {
    
    containerId: "parameters", // defaultId
    
    constructor: function(args) {
        dojo.safeMixin(args);

        var dataAbstraction = new ParameterAbstraction();
        var presentation = new webgui.pac.ListPresentation({
                    store: dataAbstraction.getStore(), 
                    containerId: this.containerId,
                    dndTypes: [DND_TYPE_PARAMETER],
                    selectionTopic: TOPIC_SELECTION_PARAMETER,
                });

//        msgbus.subscribe(TOPIC_SELECTION_PARAMETER, function (parameter) {
//            console.log("Selected PARAMETER: " + parameter.name + "; " + parameter.timestamp);
//        });
        
        this.channelHandler = function(parameter, channel) {
            try {
//              [15:21:27.682] "Parameter: value->0 clazz->java.lang.Double objectid->f69594c4-d103-41aa-9a83-3ed89945f8aa datasetidentifier->0 name->Video Stream State description->The State of the Video Stream. '1' means enabled. '0' means disabled. timestamp->1306239686838"
                dataAbstraction.handleParameter(parameter);
            }
            catch (e) {
                console.error("[ParameterListView] failed to handle parameter " + parameter.name + " - " + e);
            }
        };
    }
});

dojo.declare("webgui.display.ParameterDisplay", null, {
    constructor: function(args) {
        var controller = new ParameterController(args);
        controller.subscribe();
    }
});
