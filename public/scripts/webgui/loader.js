function constantsLoader() {
    console.log(" *** constants loader");
    dojo.byId('loaderInner').innerHTML = " Loading Constants";
    dojo.require("webgui.msgbus");
    dojo.require("webgui.common.Constants");
    dojo.addOnLoad(uiLoader);
}

function uiLoader() {
    console.log(" *** ui loader");
    dojo.byId('loaderInner').innerHTML = " Loading UI";

    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.TabContainer");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("dojo.parser");
    dojo.addOnLoad(proxyLoader);
}

function proxyLoader() {
    dojo.byId('loaderInner').innerHTML = " Loading Proxy";
    console.log(" *** Proxy loader");
    dojo.require("webgui.comm.ProxyBase");
    dojo.addOnLoad(assemblyLoader);
}

function assemblyLoader() {
    dojo.byId('loaderInner').innerHTML = " Loading Assembler";
    console.log(" *** assembly loader");
    dojo.parser.parse();
    dojo.require("webgui.assembly.Assembler");
    dojo.addOnLoad(startApplication);
}

function startApplication() {
    dojo.byId('loaderInner').innerHTML = " Creating Components";
    var assembler = new webgui.assembly.Assembler();
    assembler.loadAssembly(); // TODO maybe better to call this from within Assembler??
    hideLoader();
}

function hideLoader() {
    dojo.byId('loaderInner').innerHTML = " Application Ready";
    setTimeout(function hideLoader() {
        var loader = dojo.byId('loader');
        dojo.fadeOut({
            node: loader,
            duration:500,
            onEnd: function() {
                loader.style.display = "none";
            }
        }).play();
    }, 250);
}

dojo.addOnLoad(constantsLoader);
