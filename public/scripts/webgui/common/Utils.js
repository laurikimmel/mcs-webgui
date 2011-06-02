dojo.provide("webgui.common.Utils");

dojo.require("dojo.date.locale");

var DEFAULT_FORMAT = "yyyy.D HH:mm:ss.SSS ZZZZ";

webgui.common.Utils.formatDate = function(timestamp) {
    return format(new Date(timestamp), DEFAULT_FORMAT);
}

function format(date, fmt) {
    // TODO: set time zone to UTC
    return dojo.date.locale.format(date, {
        selector: "date",
        datePattern: fmt,
    });
};
