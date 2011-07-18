dojo.provide("webgui.widget.DateTimeWidget");

dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.form.DateTextBox");

dojo.declare("webgui.widget.DateTimeWidget", [dijit._Widget], {

    dateInput: null,
    timeInput: null,
    value: null,

    buildRendering: function() {
        this.inherited(arguments);
        var dateInputDiv = dojo.create("div", {}, this.domNode, "last");
        var timeInputDiv = dojo.create("div", {}, this.domNode, "last");
        this.dateInput = dijit.form.DateTextBox( { tooltip: "Date" }, dateInputDiv );
        this.timeInput = dijit.form.TimeTextBox( { tooltip: "Time" }, timeInputDiv );
        dojo.style(this.timeInput.domNode, "margin", "3px");

        dojo.connect(this.timeInput, "onChange", this, function() {
            if (this.dateInput.get("value") == null) {
                this.dateInput.set("value", new Date());
            }
        });

        dojo.connect(this.dateInput, "onChange", this, function() {
            if (this.timeInput.get("value") == null) {
                this.timeInput.set("value", this.dateInput.get("value"));
            }
        });
    },

    postCreate: function() {
        this.inherited(arguments);
        this._updateValue(this.value);
    },

    startup: function() {
        this.inherited(arguments);
        this.dateInput.startup();
        this.timeInput.startup();
    },

    getDateTextBox: function() {
        return this.dateInput;
    },

    getTimeTextBox: function() {
        return this.timeInput;
    },

    _setValueAttr: function(date) {
        this._updateValue(date);
        this._set("dateValue", date);
    },

    _getValueAttr: function() {
        var date = this.dateInput.get("value");
        var time = this.timeInput.get("value");
        if (date == null || time == null) {
            return null;
        }
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(time.getSeconds());
        date.setMilliseconds(time.getMilliseconds());
        return date;
    },

    _updateValue: function(date) {
        if (date != null) {
            this.dateInput.set("value", date);
            this.timeInput.set("value", date);
        }
    },

});