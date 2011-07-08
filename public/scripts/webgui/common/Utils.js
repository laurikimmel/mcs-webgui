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

webgui.common.Utils.hashCode = function(str) {
    var hash = 0;
    if (str.length == 0) {
        return code;
    }
    for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = 31 * hash + char;
            hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}
