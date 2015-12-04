/// <reference path="../../_typescript-refs/jquery.d.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 */

/**
 * Customized handling for min attribute on number field of JSGrid
 */
((jsGrid, $, undefined) => {
    var NumberField = jsGrid.NumberField;
    NumberField.prototype._createTextBox = function(){
        var $input = $("<input>").attr("type", "number");

        if (typeof this.min !== 'undefined') {
            $input.attr('min', this.min);
        }

        return $input;
    };
})(jsGrid, jQuery);


/**
 * A Custom Field for JSGrid to support decimal numbers
 */
((jsGrid, $, undefined) => {

    var TextField = jsGrid.TextField;

    function DecimalNumberField(config) {
        TextField.call(this, config);
    }

    DecimalNumberField.prototype = new TextField({

        sorter: "number",
        align: "right",

        filterValue: function() {
            return parseFloat(parseFloat(this.filterControl.val() || 0).toFixed(2));
        },

        insertValue: function() {
            return parseFloat(this.insertControl.val() || 0).toFixed(2);
        },

        editValue: function() {
            return parseFloat(this.editControl.val() || 0).toFixed(2);
        },

        _createTextBox: function() {
            return $("<input>").attr("type", "number").attr("step", "0.01");
        }
    });

    jsGrid.fields.decimal_number = jsGrid.DecimalNumberField = DecimalNumberField;

})(jsGrid, jQuery);
