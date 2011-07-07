dojo.provide("webgui.display.ParameterDisplay");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");

//dojo.require("webgui.pac.DndSourceable");

dojo.require("dojo.store.Memory");
dojo.require("dojo.store.Observable");
dojo.require("dojo.dnd.Source");


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

dojo.declare("ParameterPresentation", webgui.pac.Presentation, {
    constructor: function(store, containerId) {
        store = dojo.store.Observable(store);
        
        var dndSource = new dojo.dnd.Source(containerId, 
                {
                    copyOnly: true, 
                    creator: nodeCreator,
                });

        function nodeCreator(parameter, hint) {
            var li = document.createElement("div");
            li.innerHTML = parameter.name;
            li.id = getId(parameter);
            return {
                node: li,
                data: parameter,
                type: [DND_TYPE_PARAMETER],
            };
        }
        
        function getId(parameter) {
            return webgui.common.Utils.hashCode("ParameterPresentation-" + parameter.name);
        }
        
//        var all = store.query(function(parameter) { return parameter.name.match(/CPU .*/); });
        var all = store.query();
        
        all.observe(function(parameter, removedFrom, insertedInto) {
            if (removedFrom > -1) { 
                // existing object removed
                // TODO - implement
            }
            if (insertedInto > -1) {
                // new or updated object inserted
                var id = getId(parameter);
                var item = dndSource.getItem(id);
                if (item == null) {
                    // new parameter; add new node
                    dndSource.insertNodes(false, [parameter]);
                }
                else {
                    // existing parameter; update data
                    dndSource.setItem(id, {data: parameter, type: [DND_TYPE_PARAMETER]});
                }
            }
        }, true); // true to listen objects property changes
        
        // TODO - figure out way to listen all of the dnd drops originated from this view.
        // - dojo.connect(dndSource, "onDrop", context, someFunction(source, nodes, copy));  
        //      works for the target not for the source. 
        //      Eg. has to be added to all possible targets.
        // - msgbus.subscribe("/dnd/drop", function(source, nodes, copy, target) {}); 
        //      works, but can't access dnd data object
        // - any other way?

    }
});

/**
 * Parameter selection screen controller
 */
dojo.declare("ParameterController", webgui.pac.Controller, {
    
    containerId: "parameters", // defaultId
    
    constructor: function(args) {
        dojo.safeMixin(args);

        var dataAbstraction = new ParameterAbstraction();
        var presentation = new ParameterPresentation(dataAbstraction.getStore(), this.containerId);

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
