/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../helpers/f3mm_json_helper.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - f3mm_common_dal.ts
 * - f3mm_contract_dal.ts
 * - f3mm_folders_dal.ts
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
class BaseDAL {
    internalId: string = '';
    fields: {};

    /**
     * Load a record with specified id and and return in json format
     * @param {string} id id of record to load
     * @returns {object} json representation of record
     */
    get(id: string): any {
        var record = nlapiLoadRecord(this.internalId, id);

        var json = JsonHelper.getJsonForFullRecord(record);

        return json;
    }

    /**
     * Load a record with specified id and and return in json format
     * @param {nlobjSearchFilter[]} filters filters to filter data of search result
     * @param {nlobjSearchColumn[]} columns columns to return in search result
     * @param {string?} internalId optional parameter, if null then internal id of this calss will be used
     * @returns {object[]} json representation of records
     */
    getAll(filters: nlobjSearchFilter[], columns: nlobjSearchColumn[], internalId ? : string, options?: any): {}[] {

        var recs = null;
        var arr = [];

        try {
            options = options || {};
            filters = filters ? filters : [];
            columns = columns ? columns : this.getFields(options);
            internalId = internalId || this.internalId;

            F3.Util.Utility.logDebug('BaseDAL.getAll(); // filters: ', JSON.stringify(filters));
            F3.Util.Utility.logDebug('BaseDAL.getAll(); // columns: ', JSON.stringify(columns));
            F3.Util.Utility.logDebug('BaseDAL.getAll(); // internalId: ', JSON.stringify(internalId));
            F3.Util.Utility.logDebug('BaseDAL.getAll(); // options: ', JSON.stringify(options));

            var search = nlapiCreateSearch(internalId, filters, columns);
            var searchResults = search.runSearch();
            var resultIndex = options.startIndex || 0;
            var resultStep = options.pageSize || 1000;
            var resultSet = searchResults.getResults(resultIndex, resultIndex + resultStep);
            recs = resultSet;

            if (recs && recs.length > 0) {
                arr = JsonHelper.getJsonArray(recs);
            }
        } catch (e) {
            F3.Util.Utility.logException('BaseDAL.getAll', e.toString());
            throw e;
        }

        return arr;
    }


    /**
     * Gets all fields of current class to perform search
     * @returns {nlobjSearchColumn[]} array of fields
     */
    private getFields(options?: any): nlobjSearchColumn[] {
        var cols = [];

        for (var key in this.fields) {
            var field = this.fields[key];
            var fieldName = field.id || field.toString();
            var searchCol = new nlobjSearchColumn(fieldName, null, null);
            if(options.sortFields && options.sortFields[fieldName]) {
                var order = options.sortFields[fieldName];
                searchCol.setSort(order == "desc"); // true: desc, false: asc
            }
            cols.push(searchCol);
        }

        return cols;
    }



    /**
     * Either inserts or updates data. Upsert = Up[date] + [In]sert
     * @param {object} record json representation of object to insert/update in db
     * @param {boolean?} removeExistingLineItems default to false
     * @returns {number} id of the inserted or updated record
     */
    upsert(record, removeExistingLineItems ? : boolean) {

        F3.Util.Utility.logDebug('BaseDAL.upsert(); // item = ', JSON.stringify(record));

        var id = null;
        var dbRecord = null;

        try {

            if (!!record) {
                // either load or create record
                if (F3.Util.Utility.isBlankOrNull(record.id)) {
                    dbRecord = nlapiCreateRecord(this.internalId);
                } else {
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
                        } else {
                            dbRecord.setFieldValue(key, itemData);
                        }
                    }
                }

                id = nlapiSubmitRecord(dbRecord, true);

                F3.Util.Utility.logDebug('BaseDAL.upsert(); // id = ', id);
            }
        } catch (e) {
            F3.Util.Utility.logException('BaseDAL.upsert', e.toString());
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
    private upsertLineItems(dbRecord, itemData, removeExistingLineItems ? : boolean) {

        itemData.forEach(sublist => {

            F3.Util.Utility.logDebug('BaseDAL.upsertLineItems(); // sublist = ', JSON.stringify(sublist));

            if (removeExistingLineItems === true) {
                var existingItemsCount = dbRecord.getLineItemCount(sublist.internalId);
                for (var j = 1; j <= existingItemsCount; j++) {
                    dbRecord.removeLineItem(sublist.internalId, '1');
                }
            }

            sublist.lineitems.forEach((lineitem, index) => {

                F3.Util.Utility.logDebug('BaseDAL.upsertLineItems(); // lineitem = ', JSON.stringify(lineitem));

                var linenum = dbRecord.findLineItemValue(sublist.internalId, sublist.keyField, lineitem[sublist.keyField]);
                if (linenum > -1) {
                    dbRecord.selectLineItem(sublist.internalId, linenum);
                } else {
                    dbRecord.selectNewLineItem(sublist.internalId);
                }

                F3.Util.Utility.logDebug('BaseDAL.upsertLineItems(); // linenum = ', linenum);

                for (var linenum in lineitem) {
                    dbRecord.setCurrentLineItemValue(sublist.internalId, linenum, lineitem[linenum]);
                }

                dbRecord.commitLineItem(sublist.internalId);
            });

        });


    }

}