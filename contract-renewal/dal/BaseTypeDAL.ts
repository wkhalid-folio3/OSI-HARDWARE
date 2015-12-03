/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - CommonDAL.ts
 * - ContractDAL.ts
 * - FoldersDAL.ts
 * -
 * Dependencies:
 * - f3_common.js
 * -
 */

/**
 * This is generic class, responsible for communication with Database
 * Following are the Responsibilities of this class:
 *  - Load a single record with line items (child records) from Database
 *  - Search Records with specific filters and columns
 *  - Insert / Update Records
 */
class BaseTypeDAL {
    internalId:string;
    fields: {};

    /**
     * Load a record with specified id and and return in json format
     * @param {string} id id of record to load
     * @returns {object} json representation of record
     */
    get (id: string) : any {
        var record = nlapiLoadRecord(this.internalId, id);

        var json = this.getJsonForFullRecord(record);

        return json;
    }

    /**
     * Load a record with specified id and and return in json format
     * @param {nlobjSearchFilter[]} filters filters to filter data of search result
     * @param {nlobjSearchColumn[]} columns columns to return in search result
     * @param {string?} internalId optional parameter, if null then internal id of this calss will be used
     * @returns {object[]} json representation of records
     */
    getAll (filters: nlobjSearchFilter[], columns: nlobjSearchColumn[], internalId?: string) : {}[] {

        var recs = null;
        var arr = [];

        try {
            filters = filters ? filters : [];
            columns = columns ? columns : this.getSearchColumns();

            internalId = internalId || this.internalId;
            recs = nlapiSearchRecord(internalId, null, filters, columns);

            if (recs && recs.length > 0) {
                arr = this.getJsonArray(recs);
            }
        }
        catch (e) {
            F3.Util.Utility.logException('BaseTypeDAL.getAll', e.toString());
            throw e;
        }

        return arr;
    }

    /**
     * Convert search result array into json array.
     * @param {nlobjSearchResult[]} records array of search result
     * @returns {object[]} json representation of search result array
     */
    getJsonArray (records: nlobjSearchResult[]) : {}[] {

        var result = [];
        if (!!records && records.length > 0) {

            var cols = records[0].getAllColumns();
            var columnNames = [];
            var item = null,
                label = null,
                nm = null,
                j = 0;
            var record = null,
                jsonObj = null,
                k = 0;

            if (!!cols) {
                for (; j < cols.length; j++) {
                    item = cols[j];
                    label = item.getLabel();
                    if (!!label) {
                        label = label.toLowerCase();
                        label = label.indexOf('_') == 0 ? label.substr(1) : label;
                        label = label.trim().replace(/ /gi, '_');

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
                jsonObj = this.getJsonObject(record, cols, columnNames);
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
    getJsonObject (row: nlobjSearchResult, cols: nlobjSearchColumn[], columnNames? : string[]) : {} {

        var obj = null;
        if (row) {
            obj = {id: row.getId(), recordType: row.getRecordType()};
            var nm = null, item, val, text;
            if (!!cols) {
                for (var x = 0; x < cols.length; x++) {
                    item = cols[x];
                    nm = (columnNames && columnNames[x]) || item.getName();
                    val = row.getValue(item);
                    text = row.getText(item);

                    if (!!text && val != text) {
                        obj[nm] = {text: text, value: val};
                    }
                    else {
                        obj[nm] = val;
                    }
                }
            }
        }
        return obj;
    }

    /**
     * Gets all column of current class to perform search
     * @returns {nlobjSearchColumn[]} array of columns
     */
    getSearchColumns () : nlobjSearchColumn[] {
        var cols = [];

        for (var key in this.fields) {
            var field = this.fields[key];
            var fieldName = field.id || field.toString();
            var searchCol = new nlobjSearchColumn(fieldName, null, null);
            cols.push(searchCol);
        }

        return cols;
    }

    /**
     * Convert any record object of type `nlobjRecord` into json
     * @param {nlobjRecord} record record object to convert
     * @returns {object} json representation of record
     */
    getJsonForFullRecord (record: nlobjRecord) : {} {

        var result = null;
        if (!!record) {
            result = {id: record.getId(), recordType: record.getRecordType()};

            // serialize body fields
            var allFields = record.getAllFields();

            // iterate over columns of body fields
            for (var index in allFields) {
                var field = allFields[index];
                var name = field;
                var val:any = record.getFieldValue(field);
                var text:any = record.getFieldText(field);

                if (!!text && val != text) {
                    result[name] = {text: text, value: val};
                }
                else {
                    result[name] = val;
                }
            }

            // serialize child records
            result.sublists = {};
            var lineItemGroups = record.getAllLineItems();

            // iterate over child record types
            for (var lineItemIndex in lineItemGroups) {

                var key = lineItemGroups[lineItemIndex];

                var sublistItems = this.getSublistItems(record, key);

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
    getSublistItems(record: nlobjRecord, key: string){
        var sublistItems = [];
        var lineItemCount = record.getLineItemCount(key);

        // iterate over child record items of type `key`
        for (var i = 1; i <= lineItemCount; i++) {
            var lineItem = {};
            var fields = record.getAllLineItemFields(key);

            // iterate over columns
            for (var j in fields) {
                var field = fields[j];
                var name:string = field;
                var val:any = record.getLineItemValue(key, field, i);
                var text:any = record.getLineItemText(key, field, i);

                if (!!text && val != text) {
                    lineItem[name] = {text: text, value: val};
                }
                else {
                    lineItem[name] = val;
                }
            }

            sublistItems.push(lineItem);
        }

        return sublistItems;
    }

    /**
     * Either inserts or updates data. Upsert = Up[date] + [In]sert
     * @param {object} record json representation of object to insert/update in db
     * @param {boolean?} removeExistingLineItems default to false
     * @returns {number} id of the inserted or updated record
     */
    upsert (record, removeExistingLineItems?: boolean) {

        F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // item = ', JSON.stringify(record));

        var id = null;
        var dbRecord = null;

        try {

            if (!!record) {

                // either load or create record
                if (F3.Util.Utility.isBlankOrNull(record.id)) {
                    dbRecord = nlapiCreateRecord(this.internalId);
                }
                else {
                    dbRecord = nlapiLoadRecord(this.internalId, record.id);
                }

                // we donot want to add id in the body fields
                delete record.id;

                for (var key in record) {
                    if (!F3.Util.Utility.isBlankOrNull(key)) {
                        var itemData = record[key];
                        if (key == 'sublists' && !!itemData) {
                            // update line items
                            this.upsertLineItems(dbRecord, itemData, removeExistingLineItems);
                        }
                        else {
                            dbRecord.setFieldValue(key, itemData);
                        }
                    }
                }

                id = nlapiSubmitRecord(dbRecord, true);

                F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // id = ', id);
            }
        }
        catch (e) {
            F3.Util.Utility.logException('F3.Storage.BaseDao.upsert', e.toString());
            throw e;
        }

        return id;
    }

    /**
     * insert / update line items.
     * also deletes existing lineitems if 3rd parameter is true
     * @param {object} dbRecord dbRecord to update data in
     * @param {object} itemData json representation of object to insert/update in db
     * @param {boolean?} removeExistingLineItems default to false
     * @returns {void}
     */
    private upsertLineItems(dbRecord, itemData, removeExistingLineItems?: boolean) {

        itemData.forEach(sublist => {

            F3.Util.Utility.logDebug('BaseTypeDAL.upsertLineItems(); // sublist = ', JSON.stringify(sublist));

            if (removeExistingLineItems === true) {
                var existingItemsCount = dbRecord.getLineItemCount(sublist.internalId);
                for (var j = 1; j <= existingItemsCount; j++) {
                    dbRecord.removeLineItem(sublist.internalId, '1');
                }
            }

            sublist.lineitems.forEach((lineitem, index) => {

                F3.Util.Utility.logDebug('BaseTypeDAL.upsertLineItems(); // lineitem = ', JSON.stringify(lineitem));

                var linenum = dbRecord.findLineItemValue(sublist.internalId, sublist.keyField, lineitem[sublist.keyField]);
                if (linenum > -1) {
                    dbRecord.selectLineItem(sublist.internalId, linenum);
                }
                else {
                    dbRecord.selectNewLineItem(sublist.internalId);
                }

                F3.Util.Utility.logDebug('BaseTypeDAL.upsertLineItems(); // linenum = ', linenum);

                for (var i in lineitem) {
                    dbRecord.setCurrentLineItemValue(sublist.internalId, i, lineitem[i]);
                }

                dbRecord.commitLineItem(sublist.internalId);
            });

        });


    }

}
