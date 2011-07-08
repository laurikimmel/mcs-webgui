dojo.provide("webgui.pac.ListPresentation");

dojo.require("webgui.pac.Presentation");
dojo.require("webgui.common.Utils");
dojo.require("dojo.dnd.Source");
dojo.require("dojo.store.Observable");

dojo.declare("webgui.pac.ListPresentation", webgui.pac.Presentation, {
    
    constructor: function(args) {
        
        dojo.safeMixin(this, args);
        
        store = dojo.store.Observable(this.store);
        
        this.dndSource = new dojo.dnd.Source(this.containerId, {
                    copyOnly: true, 
                    creator: dojo.hitch(this, this.nodeCreator),
                });

        
        var all = store.query();
        
        all.observe(dojo.hitch(this, this.dataUpdateHandler), true); // true to listen objects property changes

        if (this.selectionTopic != null) {
            dojo.connect(this.dndSource, "onMouseDown", this.dndSource, dojo.hitch(this, function(e) {
                var data = this.dndSource.getItem(e.target.id).data;
                msgbus.publish(this.selectionTopic, [data]);
            }));
        }


        // TODO - figure out way to listen all of the dnd drops originated from this view.
        // - dojo.connect(dndSource, "onDrop", context, someFunction(source, nodes, copy));  
        //      works for the target not for the source. 
        //      Eg. has to be added to all possible targets.
        // - msgbus.subscribe("/dnd/drop", function(source, nodes, copy, target) {}); 
        //      works, but can't access dnd data object
        // - any other way?

    },

    getId: function(item) {
        return webgui.common.Utils.hashCode(this.containerId + item.name);
    },
    
    nodeCreator: function(item, hint) {
        var li = document.createElement("div");
        li.innerHTML = item.name;
        li.id = this.getId(item);
        return {
            node: li,
            data: item,
            type: this.dndTypes,
        };
    },
    
    dataUpdateHandler: function(object, removedFrom, insertedInto) {
        if (removedFrom > -1) { 
            // existing object removed
            // TODO - implement
        }
        if (insertedInto > -1) {
            // new or updated object inserted
            var id = this.getId(object);
            var item = this.dndSource.getItem(id);
            if (item == null) {
                // new object; add new node
                this.dndSource.insertNodes(false, [object]);
            }
            else {
                // existing object; update data
                this.dndSource.setItem(id, {data: object, type: this.dndTypes});
            }
        }
    },

});
