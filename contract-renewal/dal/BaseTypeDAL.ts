// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />

class BaseTypeDAL {
    internalId:string;
    fields: {};

    get (id: string) : any {
        var record = nlapiLoadRecord(this.internalId, id);

        var json = this.getRecordJson(record);

        return json;
    }

    getAll (filters: nlobjSearchFilter[], columns: nlobjSearchColumn[], internalId?: string) : {}[] {

        var recs = null;
        var arr = [];
        var cols = null;
        var obj = null;

        try {
            filters = filters ? filters : [];
            columns = columns ? columns : this.getSearchColumns();

            internalId = internalId || this.internalId;
            recs = nlapiSearchRecord(internalId, null, filters, columns);

            if (recs && recs.length > 0) {
                //cols = recs[0].getAllColumns();
                arr = this.getObjects(recs);
                //for (var x = 0; x < recs.length; x++) {
                //    arr.push(this.getObject(recs[x], cols, null));
                //}
            }
        }
        catch (e) {
            //F3.Util.Utility.logException('F3.Storage.BaseDao.getAll', e);
            throw e;
        }
        return arr;
    }

    getObjects (records: nlobjSearchResult[]) : {}[] {

        var result = [];
        if (!!records && records.length > 0) {

            var cols = records[0].getAllColumns();
            var columnNames = [];

            if (!!cols) {
                for (var j = 0; j < cols.length; j++) {
                    var item = cols[j];
                    var label = item.getLabel();
                    var nm = null;
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

            for (var x = 0; x < records.length; x++) {
                result.push(this.getObject(records[x], cols, columnNames));
            }
        }

        return result;
    }

    getObject (row: nlobjSearchResult, cols: nlobjSearchColumn[], columnNames? : string[]) : {} {

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

    getSearchColumns () : nlobjSearchColumn[] {
        var cols = [];

        for (var x in this.fields) {
            var field = this.fields[x];
            var fieldName = field.id || field.toString();
            var searchCol = new nlobjSearchColumn(fieldName, null, null);
            cols.push(searchCol);
        }

        return cols;
    }


    getRecordJson (row: nlobjRecord) : {} {

        var obj = null;
        if (!!row) {
            obj = {id: row.getId(), recordType: row.getRecordType()};
            var nm = null, item, val, text;

            F3.Util.Utility.logDebug('BaseTypeDAL.getRecordJson() // row.fields: ', JSON.stringify(row.getAllFields()));

            var allFields = row.getAllFields();
            for (var index in allFields){
                var field = allFields[index];
                var nm = field;
                var val : any = row.getFieldValue(field);
                var text : any = row.getFieldText(field);

                if (!!text && val != text) {
                    obj[nm] = {text: text, value: val};
                }
                else {
                    obj[nm] = val;
                }
            }

            obj.sublists = {};
            F3.Util.Utility.logDebug('BaseTypeDAL.getRecordJson() // row.linefields: ', JSON.stringify(row.linefields));
            var lineItemGroups = row.getAllLineItems();
            F3.Util.Utility.logDebug('BaseTypeDAL.getRecordJson() // lineItemGroups: ', JSON.stringify(lineItemGroups));

            for (var h in lineItemGroups) {

                var key = lineItemGroups[h];
                var lineItemCount = row.getLineItemCount(key);

                obj.sublists[key] = [];

                for (var i = 1; i <= lineItemCount; i++) {
                    var lineItem = {};
                    var fields = row.getAllLineItemFields(key);
                    for(var j in fields) {
                        var field = fields[j];
                        var nm = field;
                        var val : any = row.getLineItemValue(key, field, i);
                        var text : any = row.getLineItemText(key, field, i);

                        if (!!text && val != text) {
                            lineItem[nm] = {text: text, value: val};
                        }
                        else {
                            lineItem[nm] = val;
                        }
                    }

                    obj.sublists[key].push(lineItem);
                }
            }

        }

        return obj;
    }


    /**
     * Either inserts or updates data. Upsert = Up[date] + [In]sert
     * @param record
     * @returns {*}
     */
    upsert (record, removeExistingLineItems?: boolean) {

        F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // item = ', JSON.stringify(record));

        var id = null;
        var rec = null;

        if (record) {
            try {
                rec = F3.Util.Utility.isBlankOrNull(record.id) ? nlapiCreateRecord(this.internalId) : nlapiLoadRecord(this.internalId, record.id);
                delete record.id;
                for (var key in record) {
                    if (!F3.Util.Utility.isBlankOrNull(key)) {

                        var itemData = record[key];
                        if (key == 'sublists' && !!itemData) {

                            F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // sublists = ', JSON.stringify(itemData));

                            itemData.forEach(sublist => {

                                F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // sublist = ', JSON.stringify(sublist));

                                if ( removeExistingLineItems === true ) {
                                    var existingItemsCount = rec.getLineItemCount(sublist.internalId);
                                    for (var j = 1; j <= existingItemsCount; j++) {
                                        rec.removeLineItem(sublist.internalId, '1');
                                    }
                                }

                                sublist.lineitems.forEach((lineitem, index) => {

                                    F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // lineitem = ', JSON.stringify(lineitem));

                                    var linenum = rec.findLineItemValue(sublist.internalId, sublist.keyField, lineitem[sublist.keyField]);
                                    if (linenum > -1) {
                                        rec.selectLineItem(sublist.internalId, linenum);
                                    }
                                    else {
                                        rec.selectNewLineItem(sublist.internalId);
                                    }

                                    F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // linenum = ', linenum);

                                    for (var i in lineitem) {
                                        rec.setCurrentLineItemValue(sublist.internalId, i, lineitem[i]);
                                    }

                                    rec.commitLineItem(sublist.internalId);
                                });

                            });
                        }
                        else {
                            rec.setFieldValue(key, itemData);
                        }
                    }
                }

                id = nlapiSubmitRecord(rec, true);

                F3.Util.Utility.logDebug('BaseTypeDAL.upsert(); // id = ', id);
            }
            catch (e) {
                F3.Util.Utility.logException('F3.Storage.BaseDao.upsert', e.toString());
                throw e;
            }
        }

        return id;
    }

}



