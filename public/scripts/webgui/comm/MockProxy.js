dojo.provide("webgui.comm.MockProxy");
dojo.require("webgui.msgbus");
dojo.require("webgui.common.Constants");
dojo.provide("webgui.comm.ProxyBase");

dojo.declare("webgui.comm.MockProxy", webgui.comm.ProxyBase, {

    parameterInterval: 1* 1000,
    locationInterval: 50,
    commandDefinitionInterval: 10 * 1000,

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

        var commandDefinitions = [
                                  { lockStates: [], tasks: [], arguments: [{ range: null, unit: "Milliseconds", value: null, clazz: null, name: "New Satellite Time", timestamp: 1310561399774, description:"The time expressed as milliseconds from 1970.", objectid: "665c8b97-90a1-4e11-a46f-8600c74bde05", datasetidentifier:0}], releaseTime: 0, executionTime: 0, name: "Set Time", timestamp: 1310561399774, description: "Sets the onboard time", objectid: "e5a1ee2b-50b8-4e78-bbb2-19398d47a56b", datasetidentifier: 0 },
                                  { lockStates: [], tasks: [], arguments: [], releaseTime: 0, executionTime: 0, name: "Send Diagnosis Report", timestamp: 1310561389793, description: "The satellite will send a diagnosis report.", objectid: "aad3a55f-f418-4898-80aa-1f880527dc3a", datasetidentifier: 0 },
                                  { lockStates: [], tasks: [{ executionTime: 0, objectid: "b64d826e-cc3b-4c0b-b58e-728c63d6fc82", name: "Task to set State of Payload Limit Switch", timestamp: 1310561359780, description: "", datasetidentifier: 0 }, { executionTime: 1000, objectid: "7a6addf3-2f5b-4c74-a5a8-ba9ebece6b83", name: "Task to set State of Payload Limit", timestamp: 1310561359780, description: "", datasetidentifier: 0 }, { executionTime: 5000, objectid: "ee70d924-9e60-4fb0-9cc4-55c2566c5ae6", name: "Task to set State of Payload Limit Switch", timestamp: 1310561359781, description: "", datasetidentifier: 0 }], arguments: [{ range: null, unit: "State", value: null, clazz: null, name: "New Payload State", timestamp: 1310561359780, description: "The state of the payload to be set.", objectid: "1ec9fd0b-4615-4099-88a9-948dfe3a480f", datasetidentifier: 0}], releaseTime: 0, executionTime: 0, name: "Set Payload State", timestamp: 1310561359781, description: "Turns the payload on or off.", objectid: "72d47d90-7d81-46b4-bd43-abe49a40314c", datasetidentifier: 0 },
                                  { lockStates: [], tasks: [{ executionTime: 0, objectid: "c46cbb09-46b1-4257-8b8d-2d0f89860122", name: "Task to set State of Transmitter Limit Switch", timestamp: 1310561299775, description: "", datasetidentifier: 0 }, { executionTime: 1000, objectid: "133793ca-3b22-4bcd-affb-89a47df35e5a", name: "Task to set State of Transmitter Limit", timestamp: 1310561299775, description: "", datasetidentifier: 0 }, { executionTime: 5000, objectid: "4977cfe2-d35c-460a-b2df-6bf116c1c139", name: "State of Transmitter Limit Switch", timestamp: 1310561299775, description: "", datasetidentifier: 0 }], arguments: [{ range: null, unit: "State", value: null, clazz: null, name: "New Transmitter State", timestamp: 1310561299775, description: "The state of the transmitter to be set.", objectid: "fa133db9-67f0-4fe3-968e-57678c3298e4", datasetidentifier: 0 }], releaseTime: 0, executionTime: 0, name: "Set Transmitter State", timestamp: 1310561299775, description: "Will turn the transmitter on or off.", objectid: "2ceaa5da-95bc-4327-94ad-c2d1847b91b0", datasetidentifier:0 },
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

        function publishCommandDefinitions() {
            dojo.forEach(commandDefinitions, function(def) {
                webgui.msgbus.publish("/commanddefinitions/live", [def, "/commanddefinitions/live"]);
            });
        }

        setInterval(function() {
            var p = parameters[generateRandomValue(parameters.length)];
            publishValue(p);
        }, this.parameterInterval);

        setInterval(function() {
            publishLocation();
        }, this.locationInterval);

        setInterval(function() {
            publishCommandDefinitions();
        }, this.commandDefinitionInterval);

    },

    connect: function(channel, activeChannels) {
        activeChannels.push(channel);
        webgui.msgbus.publish(webgui.common.Constants.TOPIC_CHANNEL_EVENT, [channel, "Connected", "MockProxy"]);
        console.log("[MockProxy] added channel " + channel);
    },
});