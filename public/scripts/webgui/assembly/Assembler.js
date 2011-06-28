dojo.provide("webgui.assembly.Assembler");

dojo.require("webgui.comm.CometProxy");
dojo.require("webgui.comm.WebSocketProxy");
dojo.require("webgui.comm.MockProxy");

dojo.require("webgui.display.ANDdisplay");
dojo.require("webgui.display.StateDisplay");
dojo.require("webgui.display.SCDdisplay");
dojo.require("webgui.display.GRAPHdisplay");
dojo.require("webgui.display.DDDdisplay");
dojo.require("webgui.display.ParameterDisplay");
dojo.require("webgui.display.LogView");
dojo.require("webgui.display.ConnectionsView");
dojo.require("webgui.display.CommandListView");

dojo.declare("webgui.assembly.Assembler", null, {
    
    loadAssembly: function() {
    
        // TODO load from a config file??
        dojo.parser.parse();
        dojo.byId('loaderInner').innerHTML += " done.";
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
        
        // live parameter channel passed to the displays
        var parametersOnly = { channels: ["/parameter/live"] };
        
        //comet proxy TODO: add generic comm proxy class

        new webgui.comm.CometProxy({cometdUrl: "http://localhost:8086/cometd"});
//        new webgui.comm.WebSocketProxy();
//        new webgui.comm.MockProxy();
        
        // initialize Agents ...
        new webgui.display.ConnectionsView();
        new webgui.display.ANDdisplay(parametersOnly);
        new webgui.display.SCDdisplay(parametersOnly);
        new webgui.display.GRAPHdisplay(parametersOnly);
        new webgui.display.DDDdisplay({ channels: [
                                                   "/orbitalpredictions/live",
//                                                   "/locationdefinitions/live,
                                                   ] });
        new webgui.display.StateDisplay(parametersOnly);
        // for handling all parameters
        new webgui.display.ParameterDisplay(parametersOnly);

        // Log view listens other channel than parameter displays. 
        // Additionally limit of log entries is set here
        new webgui.display.LogView({ channels: ["/logs/live"], limit: 50 });
        
        // command view
        new webgui.display.CommandListView({ channels: ["/commanddefinitions/live"] });
        
    }
});
