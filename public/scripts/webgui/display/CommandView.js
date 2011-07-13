dojo.provide("webgui.display.CommandView");

dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");
dojo.require("dojo.Stateful");

dojo.require("dojox.form.Manager");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.dijit");
dojo.require("dojox.layout.TableContainer");
dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.TextBox");



dojo.declare("CommandViewAbstraction", [webgui.pac.Abstraction, dojo.Stateful], {
    
    
    constructor: function(command) {
        this.set("command", command);
    },
    
    setCommand: function(command) {
        this.set("command", command);
    },
});
 
dojo.declare("CommandPresentation", webgui.pac.Presentation, {
    
    
    constructor: function(abstraction, domId) {
        this.abstraction = abstraction;
        this.headerBase = dojo.create("div", {}, dojo.byId("CommandView"), "last");
        this.formBase = dojo.create("div", {}, dojo.byId("CommandView"), "last");
        this.form = null;
        this.widgets = [];
        
        abstraction.watch("command", dojo.hitch(this, function() {
            console.log("New command: " + JSON.stringify(this.abstraction.get("command")));
            
            // TODO - move to some better place
            dijit.byId("DetailsView").selectChild(dijit.byId("CommandView"), false);
            
            if (this.form != null) {
                dojo.forEach(this.form.getChildren(), function(w) {
                    w.destroyRecursive();
                });
                dojo.forEach(dojo.query("> *", this.form.id), function(c) {
                    dojo.destroy(c);
                });
                dojo.forEach(dojo.query("> *", this.headerBase), function(c) {
                    dojo.destroy(c);
                });
                
                this.form.destroyRecursive(true);
                this.widgets = [];
            }
            
            var command = this.abstraction.get("command");
            
            dojo.create("h2", { innerHTML: command.name }, this.headerBase, "last");
            dojo.create("p", { innerHTML: command.description }, this.headerBase, "last");

            this.form = new dojox.layout.TableContainer(
                    {
                        cols: 1,
                        customClass: "labelsAndValues",
                        labelWidth: 150,
                        showLabels: true,
                        orientation: "horiz",
                        spacing: 1,
                    },
                    this.formBase);

            var releaseDateValue = new Date();
            
            var releaseDate = dijit.form.DateTextBox( { name: "releaseDate", label: "Command Release Date", value: releaseDateValue, } );
            var releaseTime = new dijit.form.TimeTextBox( { name: "releaseTime", label: "Command Release Time", value: releaseDateValue, style: "width:auto"} );
            var execDate = dijit.form.DateTextBox( { name: "execDate", label: "Command Execution Date"} );
            var execTime = new dijit.form.TimeTextBox( { name: "execTime", label: "Command Execution Time"} );
            var value = new dijit.form.TextBox( {name: "value", label: "Value", } );
            
            dojo.connect(releaseDate, "onChange", releaseTime, function(newValue) {
                this.set("value", newValue);
            });
            
            var button = new dijit.form.Button({ label: "Go" });
            dojo.connect(button, "onClick", dojo.hitch(this, function() {
                var t = "";
                dojo.forEach(this.widgets, function(w) {
                    t += "- " +  w.get("name") + ": " + w.get("value") + "\n";
                });
                alert("Let's go!\n" + releaseDateValue + "\n" + t);
            }));
            

            this.widgets.push(releaseDate);
            this.widgets.push(releaseTime);
            this.widgets.push(execDate);
            this.widgets.push(execTime);
            this.widgets.push(value);

            dojo.forEach(this.widgets, function(w) {
                this.form.addChild(w);
            }, this);
            
            this.form.addChild(button);
            this.form.startup();
            
        }));
    },
});

dojo.declare("CommandViewController", webgui.pac.Controller, {

    domId: "CommandViewContainer",
    
    constructor: function(args) {
        var dataAbstraction = new CommandViewAbstraction();
        var presentation = new CommandPresentation(dataAbstraction, this.domId);
        msgbus.subscribe(TOPIC_SELECTION_COMMAND, function (command) {
            dataAbstraction.setCommand(command);
        });
    },
    
});

dojo.declare("webgui.display.CommandView", null, {
    constructor: function(args) {
        var controller = new CommandViewController(args);
        //controller.subscribe();
    }
});
