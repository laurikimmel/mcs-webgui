﻿dojo.provide("webgui.display.GRAPHdisplay");
dojo.require("webgui.pac.Controller");
dojo.require("webgui.pac.Abstraction");
dojo.require("webgui.pac.Presentation");
dojo.require("webgui.common.Constants");

// For Chart Views
dojo.require("dojox.charting.widget.Chart2D");
dojo.require("dojox.charting.widget.Legend");
dojo.require("dojox.charting.action2d.Magnify");
dojo.require("dojox.charting.action2d.Tooltip");

// TODO store, abstraction, presentation
dojo.declare("GRAPHAbstraction", webgui.pac.Abstraction, {
    
    constructor: function() {
        var key = "Timestamp";
        var storedata = { identifier: key, items: [] };
        var store = new dojo.data.ItemFileWriteStore({ data: storedata });
        var viewParameters = [];
        this.getStore = function() {
            return store;
        };
        
        // for removing from store TODO refactor
        var counter = 0;
        var limit = 40;

        this.handleParameter = function (parameter) {
//            console.log("[ANDParameterStore] received " + JSON.stringify(parameter));
            if (!viewParameters[parameter.name] || viewParameters[parameter.name] === false) {
                return;
            }

            // init new timestamp store element, as we don't really require all parameter stuff
            var storeElem = {};
            storeElem[parameter.name + "Value"] = parameter.value;
            storeElem.Name = parameter.name;
            storeElem.Timestamp = parameter.timestamp;

            store.newItem(storeElem);

            /* refactor, prolly need to use queries and different sort of table !!! */

            counter++;
            if (counter > limit) {
                // getting the size of the store
                var size = function(size, request) {
                    // remove excess elements 
                    store.fetch({ count: (size - limit),
                        onItem: function(item) {
                            store.deleteItem(item);
                        }
                    });
                };
                store.fetch({ query: {}, onBegin: size, start: 0, count: 0 });
            }

            /* refactor/ */
        };

        // parameter hiding and showing
        function addViewParameter(item) {
            viewParameters[item.parameter] = true;
        }
        
        function hideViewParameter(item) {
            viewParameters[item.parameter] = false;
        }

        msgbus.subscribe("/viewparams/show", addViewParameter);
        msgbus.subscribe("/viewparams/hide", hideViewParameter);

    }
});

dojo.declare("GRAPHPresentation", webgui.pac.Presentation, {
    
    updateInterval: 500, // update interval in milliseconds
    domId: null,
    
    constructor: function() {
        console.log("creating new chart in " + this.domId);
        var chart = new dojox.charting.Chart2D(this.domId);
        this.getChart = function() {
            return chart;
        };

        // Add the plot area at an offset of 10 pixels from the top left

//        chart.plotArea = {height: 800, width: 800};

        chart.addPlot("default", {
            type: "Lines", // type of chart
            markers: true,
            lines: true,
//            areas: true,
            labelOffset: -30,
            shadows: { dx:2, dy:2, dw:2 }
        });
        chart.addAxis("x");
        chart.addAxis("y", { vertical: true });
//        chart.resize(800, 400);

        // connect browser resize to chart
        dojo.connect(dijit.byId("chartPane"), "resize", this, function(evt) {
            var dim = dijit.byId("chartPane")._contentBox;
            chart.resize(dim.w, dim.h);
        });        
        new dojox.charting.action2d.Magnify(chart, "default");
        new dojox.charting.action2d.Tooltip(chart, "default");

        // update View at set interval
        var legend;
        var chartContainer = dojo.byId("ChartContainer");

        var updateView = function() {
            chart.render();
            // legend
            if (legend) {
                legend.destroy();
            }
            chartContainer.appendChild(dojo.create("div", { id: "legend" }));
            legend = new dojox.charting.widget.Legend({ chart:chart }, "legend");
        };
        
        setInterval(updateView, this.updateInterval);        

        // connect browser resize to chart
        dojo.connect(dijit.byId("chartPane"), "resize", this, function(evt){
            var dim = dijit.byId("chartPane")._contentBox;
            chart.resize(dim.w, dim.h);
        });
    }
});

// TODO: Refactor into parts, after parameter change boxes are done
dojo.declare("GRAPHController", webgui.pac.Controller, {

    divId: "chartDiv", // defaultId
    
    constructor: function(args) {
        
        var dataAbstraction = new GRAPHAbstraction();
        var presentation = new GRAPHPresentation({
            domId: this.divId
        });
        
        presentation = webgui.pac.DndTargetable(presentation, {
            isSource: false,
            creator: function creator(item, hint) {
                console.log("item creator");
                console.log(item);
                console.log("hint: " + hint);
                var n = document.createElement("div");
                msgbus.publish("/viewparams/show", [{ parameter:item.name }]);
                return {node: n, data: item};
            },
            accept: [DND_TYPE_PARAMETER],
        });
        
        this.channelHandler = function(parameter, channel) {
            dataAbstraction.handleParameter(parameter);
        };

        /* get the right plot of the series, also truncates the series for scrolling */
        var historyLimit = 100; // the limit of datapoints TODO should be a mixinvariable, but then this function can't access this
        /*** This function should be refactored to access/retrieve data from abstraction ****/
        var getSeriesData = function(itemName) {
            var seriesExists = false;
            var seriesArrayData;
            dojo.forEach(presentation.getChart().series, function(entry, key) {
                if (entry.name == itemName) {
                    seriesExists = true;
                    seriesArrayData = entry.data;
                }
            });
            if (!seriesExists) {
                return false;
            }

            if (seriesArrayData.length >= historyLimit) {
                seriesArrayData.splice(0, seriesArrayData.length - historyLimit);
            }

            return seriesArrayData;
        }

        // to change chart as new items are added
        var updateViewCallback = function(item) {
            var seriesArrayData = getSeriesData(item.Name);
            if (seriesArrayData === false) {
                presentation.getChart().addSeries(item.Name, [{ x: item["Timestamp"], y: item[item["Name"] + "Value"] }]/*, {stroke: {color: "#FFFF00"}, fill: "#FFFF00"}*/);
            } else {
                seriesArrayData.push({ x: item["Timestamp"], y: item[item["Name"] + "Value"] });
                presentation.getChart().updateSeries(item.Name, seriesArrayData);
            }
        };
        
        // TODO not a good idea to update the view constantly
        dojo.connect(dataAbstraction.getStore(), "newItem", updateViewCallback);

        var removeFromView = function(remove) {
            dojo.forEach(chart.series, function(entry, key) {
                if (entry && entry.name == remove.parameter) {
                    presentation.getChart().removeSeries(remove.parameter);
                }
            });
        }

        // TODO, this should be done with connect like updateViewCallback
        msgbus.subscribe("/viewparams/hide", removeFromView);
    }
});

dojo.declare("webgui.display.GRAPHdisplay", null, {
    constructor: function(args) {
        var controller = new GRAPHController(args);
        controller.subscribe();
    }
});
