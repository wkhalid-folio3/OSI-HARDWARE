// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />

class BaseTypeDAL {
    internalId:string;
    fields: {};

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


    /**
     * Either inserts or updates data. Upsert = Up[date] + [In]sert
     * @param item
     * @returns {*}
     */
    upsert (item) {
        var id = null;
        var rec = null;
        if (item) {
            try {
                rec = F3.Util.Utility.isBlankOrNull(item.id) ? nlapiCreateRecord(this.internalId) : nlapiLoadRecord(this.internalId, item.id);
                delete item.id;
                for (var key in item) {
                    if (!F3.Util.Utility.isBlankOrNull(key)) {
                        rec.setFieldValue(key, item[key]);
                    }
                }
                id = nlapiSubmitRecord(rec, true);
            }
            catch (e) {
                F3.Util.Utility.logException('F3.Storage.BaseDao.upsert', e);
                throw e;
            }
        }
        return id;
    }

}



