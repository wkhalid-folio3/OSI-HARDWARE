/// <reference path="../../_typescript-refs/jquery.d.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 */
/**
 * Customized handling for min attribute on number field of JSGrid
 */
(function (jsGrid, $, undefined) {
    var NumberField = jsGrid.NumberField;
    NumberField.prototype._createTextBox = function () {
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
(function (jsGrid, $, undefined) {
    var TextField = jsGrid.TextField;
    function DecimalNumberField(config) {
        TextField.call(this, config);
    }
    DecimalNumberField.prototype = new TextField({
        sorter: "number",
        align: "right",
        filterValue: function () {
            return parseFloat(parseFloat(this.filterControl.val() || 0).toFixed(2));
        },
        insertValue: function () {
            return parseFloat(this.insertControl.val() || 0).toFixed(2);
        },
        editValue: function () {
            return parseFloat(this.editControl.val() || 0).toFixed(2);
        },
        _createTextBox: function () {
            return $("<input>").attr("type", "number").attr("step", "0.01");
        }
    });
    jsGrid.fields.decimal_number = jsGrid.DecimalNumberField = DecimalNumberField;
})(jsGrid, jQuery);
(function (jsGrid, $, undefined) {
    var NumberField = jsGrid.NumberField;
    function CustomSelectField(config) {
        this.items = [];
        this.selectedIndex = -1;
        this.valueField = "";
        this.textField = "";
        if (config.valueField && config.items && config.items.length) {
            this.valueType = typeof config.items[0][config.valueField];
        }
        this.sorter = this.valueType;
        NumberField.call(this, config);
    }
    CustomSelectField.prototype = new NumberField({
        align: "center",
        valueType: "number",
        getItems: function (item) {
            console.log('CustomSelectField.prototype.getItems();', item);
            return null;
        },
        itemTemplate: function (value, item) {
            console.log('itemTemplate();');
            var items = this.items || (this.items = this.getItems(item)) || [], valueField = this.valueField, textField = this.textField, resultItem;
            if (valueField) {
                resultItem = $.grep(items, function (item, index) {
                    return item[valueField] === value;
                })[0] || {};
            }
            else {
                resultItem = items[value];
            }
            var result = (textField ? resultItem[textField] : resultItem);
            return (result === undefined || result === null) ? "" : result;
        },
        filterTemplate: function () {
            if (!this.filtering)
                return "";
            var grid = this._grid, $result = this.filterControl = this._createSelect();
            if (this.autosearch) {
                $result.on("change", function (e) {
                    grid.search();
                });
            }
            return $result;
        },
        insertTemplate: function () {
            if (!this.inserting)
                return "";
            var $result = this.insertControl = this._createSelect();
            return $result;
        },
        editTemplate: function (value) {
            if (!this.editing)
                return this.itemTemplate(value);
            var $result = this.editControl = this._createSelect();
            (value !== undefined) && $result.val(value);
            return $result;
        },
        filterValue: function () {
            var val = this.filterControl.val();
            return this.valueType === "number" ? parseInt(val || 0, 10) : val;
        },
        insertValue: function () {
            var val = this.insertControl.val();
            return this.valueType === "number" ? parseInt(val || 0, 10) : val;
        },
        editValue: function () {
            var val = this.editControl.val();
            return this.valueType === "number" ? parseInt(val || 0, 10) : val;
        },
        _createSelect: function (item) {
            var items = this.items || (this.items = this.getItems(item)) || [];
            var $result = $("<select>"), valueField = this.valueField, textField = this.textField, selectedIndex = this.selectedIndex;
            $.each(items, function (index, item) {
                var value = valueField ? item[valueField] : index, text = textField ? item[textField] : item;
                var $option = $("<option>")
                    .attr("value", value)
                    .text(text)
                    .appendTo($result);
                $option.prop("selected", (selectedIndex === index));
            });
            return $result;
        }
    });
    jsGrid.fields.custom_select = jsGrid.CustomSelectField = CustomSelectField;
}(jsGrid, jQuery));
/**
 * A Custom Field for JSGrid to support decimal numbers
 */
(function (jsGrid, $, undefined) {
    var TextField = jsGrid.TextField;
    function DateField(config) {
        TextField.call(this, config);
    }
    DateField.prototype = new TextField({
        sorter: "date",
        align: "right",
        filterValue: function () {
            return parseFloat(parseFloat(this.filterControl.val() || 0).toFixed(2));
        },
        insertValue: function () {
            return parseFloat(this.insertControl.val() || 0).toFixed(2);
        },
        editValue: function () {
            return parseFloat(this.editControl.val() || 0).toFixed(2);
        },
        _createTextBox: function () {
            return $("<input>").attr("type", "number").attr("step", "0.01");
        }
    });
    jsGrid.fields.date = jsGrid.DateField = DateField;
})(jsGrid, jQuery);
//# sourceMappingURL=f3mm_jsgrid_fields.js.map