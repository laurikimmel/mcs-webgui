dojo.provide("webgui.assembly.Assembler");

dojo.require("webgui.comm.CometProxy");
dojo.require("webgui.comm.WebSocketProxy");

dojo.require("webgui.display.ANDdisplay");
dojo.require("webgui.display.StateDisplay");
dojo.require("webgui.display.SCDdisplay");
dojo.require("webgui.display.GRAPHdisplay");
dojo.require("webgui.display.DDDdisplay");
dojo.require("webgui.display.ParameterDisplay");
dojo.require("webgui.display.LogView");

dojo.declare("webgui.assembly.Assembler",null,{
    loadAssembly: function() {
        // TODO load from a config file??
        dojo.parser.parse();
        dojo.byId('loaderInner').innerHTML += " done.";
        setTimeout(function hideLoader() {
        var loader = dojo.byId('loader');
        dojo.fadeOut({node: loader,
                duration:500,
                onEnd: function() {
                    loader.style.display = "none";
                }
        }).play();
        }, 250);
        
        //comet proxy TODO: add generic comm proxy class

        new webgui.comm.CometProxy({cometdUrl: "http://localhost:8086/cometd"});
//        new webgui.comm.WebSocketProxy();
//        new ParameterGenerator();
        //initialize Agents...
        new webgui.display.ANDdisplay();
        new webgui.display.SCDdisplay();
        new webgui.display.GRAPHdisplay();
//        new webgui.display.DDDdisplay();
        new webgui.display.StateDisplay();
        //for handling all parameters
        new webgui.display.ParameterDisplay();
        new webgui.display.LogView();

        //define channels what should be listened to
        // TODO these should really go into each controller
//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/parameter/live"}]);
//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/logs/live"}]);
//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/logs/live"}]);
//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/meta/connect"}]);

//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/logging"}]);
//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/Parameters"}]);
//        webgui.msgbus.publish("/request/subscribe",[{"topic":"/Logs"}]);
        var logOutput = function logOutput(param) {
            console.log(param);
        }
//        webgui.msgbus.subscribe("/logs/live", logOutput);
    },

});
