dojo.provide("webgui.comm.MockProxy");
dojo.require("webgui.msgbus");
dojo.require("webgui.common.Constants");
dojo.provide("webgui.comm.ProxyBase");

dojo.declare("webgui.comm.MockProxy", webgui.comm.ProxyBase, {
    
    interval: 1000,
    locationInterval: 50,
    
    constructor: function() {

        var parameters = [
                          { name: "par1", counter: 0, scale:  10, generator: function(c, s) { return generateRandomValue(s); }, },
                          { name: "par2", counter: 0, scale:  10, generator: function(c, s) { return s * generateSinValue(c); }, },
                          { name: "par3", counter: 0, scale:   2, generator: function(c, s) { return generateModValue(c, s); }, },
                          { name: "par4", counter: 0, scale:  20, generator: function(c, s) { return -s * generateSinValue(c); }, },
                          { name: "parT", counter: 0, scale:  15, generator: function(c, s) { return generateModValue(c, s); }, },
                          ];
        
        var locationParams = [
                              { name: "Elevation", counter: 0, generator: function(i) { return 340 * 1000.0; }, },
                              { name: "Latitude", counter: 0, generator: function(i) { return 0; }, },
                              { name : "Longitude", counter: 0, generator: function(i) { return i / 100; }, },
                              ];
        
        var generateRandomValue = function(limit) {
            return Math.floor(Math.random() * limit);
        };
        
        var generateSinValue = function(counter) {
            return Math.sin(counter * 0.1);
        };
        
        var generateModValue = function(counter, scale) {
            return counter % scale;
        };
        
        var counter = 0;
        
        function publishValue(p) {
            var param = {};
            var log = {};
            param.name = p.name;
            param.value = p.generator(p.counter ++, p.scale);
            param.type = "Parameter";
            param.timestamp = new Date().getTime();
            param.clazz = "N/A";
            param.description = "Description of " + param.name;
            param.state = param.value % 3 == 0;
            log.timeStamp = param.timestamp;
            log.renderedMessage = "Sending " + JSON.stringify(param);
            webgui.msgbus.publish("/parameter/live", [param, "/parameter/live"]);
            webgui.msgbus.publish("/logs/live", [log, "/logs/live"]);
        }
        
        function publishLocation() {
            dojo.forEach(locationParams, function(param) {
                var loc = {};
                loc.name = param.name;
                loc.value = param.generator(param.counter ++);
                webgui.msgbus.publish("/orbitalpredictions/live", [loc, "/orbitalpredictions/live"]);
            });
        }
        
        setInterval(function() {
            var p = parameters[generateRandomValue(parameters.length)];
            publishValue(p);
        }, this.interval);
        
        setInterval(function() {
            publishLocation();
        }, this.locationInterval);

    },
    
    connect: function(channel, activeChannels) {
        activeChannels.push(channel);
        webgui.msgbus.publish(TOPIC_CHANNEL_EVENT, [channel, "Connected"]);
        console.log("[MockProxy] added channel " + channel);
    },
});