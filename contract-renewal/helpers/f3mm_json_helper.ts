/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/**
 * Created by zshaikh on 11/20/2015.
 * -
 * Referenced By:
 * - f3mm_base_dal.ts
 * -
 */
public class JsonHelper {


    /**
     * Convert any record object of type `nlobjRecord` into json
     * @param {nlobjRecord} record record object to convert
     * @returns {object} json representation of record
     */
    public static getJsonForFullRecord(record: nlobjRecord): {} {

        let result = null;
        if (!!record) {
            result = {
                id: record.getId(),
                recordType: record.getRecordType()
            };

            // serialize body fields
            let allFields = record.getAllFields();

            // iterate over columns of body fields
            for (let index in allFields) {
                let field = allFields[index];
                let name = field;
                let val: any = record.getFieldValue(field);
                let text: any = record.getFieldText(field);

                if (!!text && name !== "internalid") {
                    result[name] = {
                        text: text,
                        value: val
                    };
                } else {
                    result[name] = val;
                }
            }

            // serialize child records
            result.sublists = {};
            let lineItemGroups = record.getAllLineItems();

            // iterate over child record types
            for (let lineItemIndex in lineItemGroups) {

                let key = lineItemGroups[lineItemIndex];

                let sublistItems = JsonHelper.getSublistItemsJson(record, key);

                result.sublists[key] = sublistItems;
            }

        }

        return result;
    }



    /**
     * Convert sublist items of specific record to json format
     * @param {nlobjRecord} record record object to convert
     * @param {string} key sublist key to get items of.
     * @returns {object} json representation of record
     */
    public static getSublistItemsJson(record: nlobjRecord, key: string) {
        let sublistItems = [];
        let lineItemCount = record.getLineItemCount(key);

        // iterate over child record items of type `key`
        for (let i = 1; i <= lineItemCount; i++) {
            let lineItem = {};
            let fields = record.getAllLineItemFields(key);

            // iterate over columns
            for (let j in fields) {
                let field = fields[j];
                let name: string = field;
                let val: any = record.getLineItemValue(key, field, i);
                let text: any = record.getLineItemText(key, field, i);

                if (!!text && name !== "internalid") {
                    lineItem[name] = {
                        text: text,
                        value: val
                    };
                } else {
                    lineItem[name] = val;
                }
            }

            sublistItems.push(lineItem);
        }

        return sublistItems;
    }


    /**
     * Convert search result array into json array.
     * @param {nlobjSearchResult[]} records array of search result
     * @returns {object[]} json representation of search result array
     */
    public static getJsonArray(records: nlobjSearchResult[]): {}[] {

        let result = [];
        if (!!records && records.length > 0) {

            let cols = records[0].getAllColumns();
            let columnNames = [];
            let item = null,
                label = null,
                nm = null,
                j = 0;
            let record = null,
                jsonObj = null,
                k = 0;

            if (!!cols) {
                for (; j < cols.length; j++) {
                    item = cols[j];
                    label = item.getLabel();
                    if (!!label) {
                        label = label.toLowerCase();
                        label = label.indexOf("_") === 0 ? label.substr(1) : label;
                        label = label.trim().replace(/ /gi, "_");

                        nm = label;
                    } else {
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
    }



    /**
     * Convert search result object into json array.
     * @param {nlobjSearchResult} row single row of search result
     * @param {nlobjSearchColumn[]} cols array of columns to convert into json
     * @param {string[]?} columnNames array of column names
     * @returns {object[]} json representation of search result object
     */
    private static getJsonObject(row: nlobjSearchResult, cols: nlobjSearchColumn[], columnNames? : string[]): {} {

        let obj = null;
        if (row) {
            obj = {
                id: row.getId(),
                recordType: row.getRecordType()
            };
            let nm = null,
                item, val, text;
            if (!!cols) {
                for (let x = 0; x < cols.length; x++) {
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
                    } else {
                        obj[nm] = val;
                    }
                }
            }
        }
        return obj;
    }
}
