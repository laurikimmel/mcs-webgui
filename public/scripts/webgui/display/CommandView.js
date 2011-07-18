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

dojo.require("webgui.widget.DateTimeWidget");


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
            var timeTextBoxConstraints = { timePattern: 'HH:mm:ss', clickableIncrement: 'T00:01:00', visibleIncrement: 'T00:05:00', visibleRange: 'T01:00:00' } ;

            var releaseDate = new webgui.widget.DateTimeWidget( { name: "releaseDate", label: "Command Release Date", value: releaseDateValue, } );
            releaseDate.getTimeTextBox().set("constraints", timeTextBoxConstraints);

            var execDate = new webgui.widget.DateTimeWidget( { name: "execDate", label: "Command Execution Date" } );
            execDate.getTimeTextBox().set("constraints", timeTextBoxConstraints);

            var value = new dijit.form.TextBox( {name: "value", label: "Value", } );

            var button = new dijit.form.Button({ label: "Go" });
            dojo.connect(button, "onClick", dojo.hitch(this, function() {
                var t = "";
                dojo.forEach(this.widgets, function(w) {
                    t += "- " +  w.get("name") + ": " + w.get("value") + "\n";
                });
                alert("Let's go!\n" + releaseDateValue + "\n" + t);
            }));


            this.widgets.push(releaseDate);
            this.widgets.push(execDate);
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
        new CommandPresentation(dataAbstraction, this.domId);
        webgui.msgbus.subscribe(webgui.common.Constants.TOPIC_SELECTION_COMMAND, function (command) {
            dataAbstraction.setCommand(command);
        });
    },

});

dojo.declare("webgui.display.CommandView", null, {
    constructor: function(args) {
        console.log("[CommandView] initialize components ...");
        new CommandViewController(args);
        //controller.subscribe();
    }
});
