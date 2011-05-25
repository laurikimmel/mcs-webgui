dojo.provide("webgui.pac.Utils");
dojo.require("dojox.date.posix");

webgui.pac.Utils.formatDate = function(timestamp) {
//	return timestamp;
	return dojox.date.posix.strftime(new Date(timestamp), "%Y.%j %T %z");
}