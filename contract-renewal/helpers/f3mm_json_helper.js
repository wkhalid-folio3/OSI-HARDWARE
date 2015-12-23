/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/**
 * Created by zshaikh on 11/20/2015.
 * -
 * Referenced By:
 * - f3mm_base_dal.ts
 * -
 */
var JsonHelper = (function () {
    function JsonHelper() {
    }
    /**
     * Convert any record object of type `nlobjRecord` into json
     * @param {nlobjRecord} record record object to convert
     * @returns {object} json representation of record
     */
    JsonHelper.getJsonForFullRecord = function (record) {
        var result = null;
        if (!!record) {
            result = {
                id: record.getId(),
                recordType: record.getRecordType()
            };
            // serialize body fields
            var allFields = record.getAllFields();
            // iterate over columns of body fields
            for (var index in allFields) {
                var field = allFields[index];
                var name_1 = field;
                var val = record.getFieldValue(field);
                var text = record.getFieldText(field);
                if (!!text && name_1 !== "internalid") {
                    result[name_1] = {
                        text: text,
                        value: val
                    };
                }
                else {
                    result[name_1] = val;
                }
            }
            // serialize child records
            result.sublists = {};
            var lineItemGroups = record.getAllLineItems();
            // iterate over child record types
            for (var lineItemIndex in lineItemGroups) {
                var key = lineItemGroups[lineItemIndex];
                var sublistItems = JsonHelper.getSublistItemsJson(record, key);
                result.sublists[key] = sublistItems;
            }
        }
        return result;
    };
    /**
     * Convert sublist items of specific record to json format
     * @param {nlobjRecord} record record object to convert
     * @param {string} key sublist key to get items of.
     * @returns {object} json representation of record
     */
    JsonHelper.getSublistItemsJson = function (record, key) {
        var sublistItems = [];
        var lineItemCount = record.getLineItemCount(key);
        // iterate over child record items of type `key`
        for (var i = 1; i <= lineItemCount; i++) {
            var lineItem = {};
            var fields = record.getAllLineItemFields(key);
            // iterate over columns
            for (var j in fields) {
                var field = fields[j];
                var name_2 = field;
                var val = record.getLineItemValue(key, field, i);
                var text = record.getLineItemText(key, field, i);
                if (!!text && name_2 !== "internalid") {
                    lineItem[name_2] = {
                        text: text,
                        value: val
                    };
                }
                else {
                    lineItem[name_2] = val;
                }
            }
            sublistItems.push(lineItem);
        }
        return sublistItems;
    };
    /**
     * Convert search result array into json array.
     * @param {nlobjSearchResult[]} records array of search result
     * @returns {object[]} json representation of search result array
     */
    JsonHelper.getJsonArray = function (records) {
        var result = [];
        if (!!records && records.length > 0) {
            var cols = records[0].getAllColumns();
            var columnNames = [];
            var item = null, label = null, nm = null, j = 0;
            var record = null, jsonObj = null, k = 0;
            if (!!cols) {
                for (; j < cols.length; j++) {
                    item = cols[j];
                    label = item.getLabel();
                    if (!!label) {
                        label = label.toLowerCase();
                        label = label.indexOf("_") === 0 ? label.substr(1) : label;
                        label = label.trim().replace(/ /gi, "_");
                        nm = label;
                    }
                    else {
                        nm = item.getName();
                    }
                    columnNames.push(nm);
                }
            }
            for (; k < records.length; k++) {
                record = records[k];
                jsonObj = JsonHelper.getJsonObject(record, cols, columnNames);
                result.push(jsonObj);
            }
        }
        return result;
    };
    /**
     * Convert search result object into json array.
     * @param {nlobjSearchResult} row single row of search result
     * @param {nlobjSearchColumn[]} cols array of columns to convert into json
     * @param {string[]?} columnNames array of column names
     * @returns {object[]} json representation of search result object
     */
    JsonHelper.getJsonObject = function (row, cols, columnNames) {
        var obj = null;
        if (row) {
            obj = {
                id: row.getId(),
                recordType: row.getRecordType()
            };
            var nm = null, item, val, text;
            if (!!cols) {
                for (var x = 0; x < cols.length; x++) {
                    item = cols[x];
                    nm = (columnNames && columnNames[x]) || item.getName();
                    val = row.getValue(item);
                    text = row.getText(item);
                    // donot create object for internal id
                    if (!!text && nm !== "internalid") {
                        obj[nm] = {
                            text: text,
                            value: val
                        };
                    }
                    else {
                        obj[nm] = val;
                    }
                }
            }
        }
        return obj;
    };
    return JsonHelper;
})();
//# sourceMappingURL=f3mm_json_helper.js.map