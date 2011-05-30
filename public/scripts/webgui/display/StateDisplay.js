/*States display*/
dojo.provide("webgui.display.StateDisplay");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.GridPresentation");
//Stores
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("webgui.pac.Utils");

dojo.declare("StatesAbstraction", webgui.pac.Abstraction, {
    
    constructor: function(args) {
    
        var key = 'key';
        var storedata = { identifier: key, items: [] };
        var store = new dojo.data.ItemFileWriteStore({ data: storedata });
        this.getStore = function() {
            return store;
        };
        var viewParameters = [];
        
        this.handleParameter = function(parameter) {
//            console.log("[StateParameterStore] received " + JSON.stringify(parameter));
            
            // TODO refactor this filtering using the controller
            if (!viewParameters[parameter.name] || viewParameters[parameter.name] === false) {
                return;
            }
            
//            if(parameter.unit !== "") {
//                return;
//            }
//            console.log("Here");
            
            parameter.key = parameter.name;
            parameter.state = '<div class="stateTable' + (parameter.value == true ? "True" : "False") + '">' + parameter.value + '</div>';

            // States display store logic
            store.fetch({ query: { key: parameter.name },
                onBegin: function (size, request) {
                    if (size == 0) {
                        store.newItem(parameter);
                    }
                },
                onItem: function(item) {
                    store.setValue(item, "Name", parameter.name);
                    store.setValue(item, "State", parameter.state);
                    store.setValue(item, "Timestamp", webgui.pac.Utils.formatDate(parameter.timestamp));
                    store.setValue(item, "Description", parameter.description);
                },
                onError: function(er) {
                    console.err(er);
                }
            });
        };
       
        // parameter hiding and showing
        function addViewParameter(item) {
            console.log("States display addViewParameter for ");
            viewParameters[item.parameter] = true;
        }
        
        function hideViewParameter(item) {
            console.log("States display hideViewParameter for ");
            viewParameters[item.parameter] = false;
            store.fetch({ query: { key: item.parameter },
                onItem: function(item) {
                    store.deleteItem(item);
                },
                onError: function(er) {
                    console.err(er);
                }
            });
        };
        msgbus.subscribe("/viewparams/show", addViewParameter);
        msgbus.subscribe("/viewparams/hide", hideViewParameter);
    }
});

dojo.declare("StatesController", webgui.pac.Controller, {
    
    divId: "StatesTable", // defaultId
    
    constructor: function(args) {
        dojo.safeMixin(args);
        
        var dataAbstraction = new StatesAbstraction();
        
        var presentation = new webgui.pac.GridPresentation({
            "domId": this.divId + "Container",
            "configuration": {
                "id": this.divId,
                "store": dataAbstraction.getStore(),
                "clientSort": true,
                "escapeHTMLInData": false,
                "structure": [
                    { "field": 'Name', "name": 'Name', "width": '200px' },
                    { "field": 'State', "name": 'State', "width": '200px' },
                    { "field": 'Timestamp', "name": 'Timestamp', "width": '200px' },
                    { "field": 'Description', "name": 'Description', "width": 'auto' },
                ]
        }});
        
        presentation = webgui.pac.DndTargetable(presentation, {
            "isSource": false,
            "creator": function creator(item, hint) {
                console.log("item creator");
                console.log(item);
                console.log("hint: " + hint);
                var n = document.createElement("div");
                msgbus.publish("/viewparams/show", [{ parameter: item }]);
                return { node: n, data: item };
            }
        });
        
        this.channelHandler = function(message, channel) {
            dataAbstraction.handleParameter(message);
        };
    }
});

dojo.declare("webgui.display.StateDisplay", null, {
    constructor: function(args) {
        console.log("[StateDisplay] initializing components ...");
        var controller = new StatesController(args);
        controller.subscribe();
    }
});
