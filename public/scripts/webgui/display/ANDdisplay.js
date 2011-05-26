dojo.provide("webgui.display.ANDdisplay");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.GridPresentation");
dojo.require("webgui.pac.DndTargetable");

dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("webgui.pac.Utils");

dojo.declare("ANDAbstraction", webgui.pac.Abstraction, {
      constructor: function(args) {
          var key = 'key';
            var storedata = {identifier: key, items: []};
            var store = new dojo.data.ItemFileWriteStore({data:storedata});
            var viewParameters = [];
            this.getStore = function(){
                return store;
            };
            
            function parameterHandler (parameter) {
                /* console.log("[ANDParameterStore] received " + JSON.stringify(parameter)); */
//              var str = "Parameter:";
//              for (key in parameter) {
//                  str += " " + key + "->" + parameter[key];
//              }
//              console.info(str);
//             [15:36:02.055] "Parameter: value->0 clazz->java.lang.Double objectid->dad653b8-f27e-488f-81b2-01ea9b7acebb datasetidentifier->0 name->Payload Deployment State description->The State of the Payload Deployment. '1' means deployed. '0' means not-deployed. timestamp->1306240560830"            

                // TODO refactor this filtering using the controller
                if (!viewParameters[parameter.name] || viewParameters[parameter.name] === false) {
                    return;
                }
                
                parameter.key = parameter.name;
                //AND display store logic
                store.fetch({query: {key:parameter.name},
                    onBegin: function(size, request){
                        if(size == 0){
                            store.newItem(parameter);
                        }
                    },    
                    onItem: function(item) {
                        store.setValue(item,"Name",parameter.name);
                        store.setValue(item,"Value",parameter.value);
                        store.setValue(item,"Type",parameter.clazz);
                        var date = webgui.pac.Utils.formatDate(parameter.timestamp);
                        store.setValue(item,"Timestamp", date);
                    },
                    onError: function(er) {
                        console.err(er);
                    }
                });
            }
        
            var subscribeToTopic = function(subscription) {
                msgbus.subscribe(subscription.topic, parameterHandler);
            };

            msgbus.subscribe("/request/subscribe", subscribeToTopic);

            //parameter hiding and showing
            function addViewParameter(item) {
                console.log("AND display addViewParameter for ");
                viewParameters[item.parameter] = true;
            }

            function hideViewParameter(item) {
                console.log("AND display hideViewParameter for ");
                viewParameters[item.parameter] = false;
                store.fetch({query: {key:item.parameter},
                    onItem: function(item){
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

dojo.declare("ANDController", webgui.pac.Controller,{
    divId: "ANDTable", //defaultId
    constructor: function() {
        var dataAbstraction = new ANDAbstraction();
        var presentation = new webgui.pac.GridPresentation({
            "domId": this.divId+"Container",
            "configuration": {
            "id": this.divId,
            "store": dataAbstraction.getStore(),
            "clientSort": true,
            //"updateDelay": 1000,
            "structure": [
                    {"field": 'Name', "name": 'Name', width: '200px'},
                    {"field": 'Value', "name": 'Value', width: '200px'},
                    {"field": 'Unit', "name": 'Unit', width: '100px'},
                    {"field": 'Type', "name": 'Type', width: '100px'},
                    {"field": 'Timestamp', "name": 'Timestamp', width: '200px'},
                ]
            }
        });

        // add DnD capability to the presentation 

         presentation = webgui.pac.DndTargetable(presentation, {
             "isSource":false,
             "creator":function creator(item, hint) {
                 console.log("item creator");
                 console.log(item);
                 console.log("hint: " + hint);
                 var n = document.createElement("div");
                 msgbus.publish("/viewparams/show",[{parameter:item}]);
                 return {node: n, data: item};
             }
         });
    }
});

dojo.declare("webgui.display.ANDdisplay", null, {
    constructor: function(){
        console.log("[ANDdisplay] initializing components..");
        var controller = new ANDController();        
    }
});
