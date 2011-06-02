/*3d Display*/
dojo.provide("webgui.display.DDDdisplay");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");

/**
 * Currently only keeps track of one satellite
 * No store currently required
 */
dojo.declare("X3DDataAbstraction", webgui.pac.Abstraction, {
    
    constructor: function() {
        
        var satellite = {};

        /**
         * privileged function to return the satellite object for views
         */
        this.getsatellite = function() {
            return satellite;
        }

        /**
         * Updates satellite position data any time some of its
         * parameters arrive.
         */
        this.handleParameter = function(parameter) {

            switch(parameter.name) {
                case "Elevation":
                    satellite.Elevation = parameter.value;
                    break;
                case "Longitude":
                    satellite.Longitude = parameter.value;
                    break;
                case "Latitude":
                    satellite.Latitude = parameter.value;
                    break;
            }

        };
    }
});

dojo.declare("X3DPresentation", webgui.pac.Presentation, {
    constructor: function() {
        var satTransform = dojo.byId("satelliteTransform");
        var satRotation = dojo.byId("satelliteRotation");
        this.refreshView = function(item) {
            dojo.attr(satTransform, "translation", item.CartesianCoordinates);
            //dojo.attr(satRotation, "rotation", item.RotationQuaternion);
        }
    }
});

//TODO make updateinterval a property for all controllers
/**
 * 3D-display controller
 */
dojo.declare("X3DController", webgui.pac.Controller, {
    
//    updateInterval: 50, //update interval in milliseconds
    divId: "chartDiv", //defaultId
    
    constructor: function(args) {
        var converter = new CartesianConverter();
        var dataAbstraction = new X3DDataAbstraction();
        var presentation = new X3DPresentation();

        var updateView = function() {
            presentation.refreshView(converter.convertItem(dataAbstraction.getsatellite()));
        };
        
        this.channelHandler = function(parameter, channel) {
//            [10:59:56.641] "[X3DController] channelHandler /locationdefinitions/live; {\"thresholdElevation\":0.08726646259971647,\"position\":{\"p1\":{\"clazz\":\"java.lang.Double\",\"value\":28.536275,\"objectid\":\"334543c8-4d0a-4511-99fd-156e385de8ec\",\"datasetidentifier\":0,\"name\":\"p1\",\"description\":\"Dimension 1 of vector.\",\"timestamp\":1306915196121},\"p2\":{\"clazz\":\"java.lang.Double\",\"value\":77.255859,\"objectid\":\"7d354339-a91c-471a-a8c4-32c5847c5857\",\"datasetidentifier\":0,\"name\":\"p2\",\"description\":\"Dimension 2 of vector.\",\"timestamp\":1306915196121},\"p3\":{\"clazz\":\"java.lang.Double\",\"value\":0,\"objectid\":\"66e3e0b3-7701-4d56-992d-7da9eaafcfd0\",\"datasetidentifier\":0,\"name\":\"p3\",\"description\":\"Dimension 3 of vector.\",\"timestamp\":1306915196121},\"objectid\":\"745687b0-176e-471c-bd86-4a5c5dfd96b5\",\"datasetidentifier\":0,\"name\":\"New Delhi\",\"description\":\"3D vector pointing to New Delhi, India\",\"timestamp\":1306915196121},\"objectid\":\"3732f246-28f1-4832-b564-563674bfa752\",\"datasetidentifier\":0,\"name\":\"New Delhi\",\"description\":\"Test ground station in India (New Delhi)\",\"timestamp\":1306915196122}"
//            console.log("[X3DController] channelHandler " + channel + "; " + JSON.stringify(parameter));
            dataAbstraction.handleParameter(parameter);
            updateView();
        }


//        setInterval(updateView, this.updateInterval);
    }
});

dojo.declare("webgui.display.DDDdisplay", null, {
    constructor: function(args) {
        var controller = new X3DController(args);
        controller.subscribe();
    }
});

/**
 * Longitude-Latitude to Cartesian converter
 */
function CartesianConverter() {
    //constants
    var planetRadius = 6371; //km
    var radianConstant = Math.PI / 180; //conversion constant to radians

    /**
     * Converts an object into a string containing cartesian coordinates.
     * @param item an object with Longitude, Latitude and Elevation properties.
     * @return String containing x, y, z coordinates that are acceptable
     * for X3Dom Transfomation node's translation attribute.
     */
    this.convertItem = function(item) {

        //javascript trigonometric functions use radians, therefore convert
        var radLongitude = item.Longitude * radianConstant;
        var radLatitude = item.Latitude * radianConstant;
        //divided by 1000 as item elevation is in m.
        var elevation = planetRadius + (item.Elevation / 1000);

        //precalculation
        var sinFi = Math.sin(radLatitude);
        var cosFi = Math.cos(radLatitude);
        var sinLambda = Math.sin(radLongitude);
        var cosLambda = Math.cos(radLongitude);

        var x = elevation * cosFi * cosLambda;
        var y = elevation * cosFi * sinLambda;
        var z = elevation * sinFi;
        item.CartesianCoordinates = (y) + " " + z + " " + x;

        //set rotation, maybe not the best place to do it ?
        item.RotationQuaternion = " 0 0 1 " + (radLongitude);

        return item;
    }
}
