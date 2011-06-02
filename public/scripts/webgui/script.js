//For HTML and some presentations
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.CheckBox");

var msgbus = dojo.require("webgui.msgbus");
dojo.require("webgui.assembly.Assembler");

/* initialisations */
dojo.addOnLoad(function() {
    var assembler = new webgui.assembly.Assembler();
    assembler.loadAssembly(); // TODO maybe better to call this from within Assembler??
});
