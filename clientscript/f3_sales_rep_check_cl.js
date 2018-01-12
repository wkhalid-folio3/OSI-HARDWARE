/**
 * Created by manas on 12/19/2017.
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */
/**
 * SalesRepChecker class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var SalesRepChecker = (function() {
    return {
        config: {
            SaveSearchId: {
                internalId: "1566"
            },
            customerLimit: '300'
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function(type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @returns {Boolean} True to continue save, false to abort save
         */
        clientSaveRecord: function() {
            var count = 0;
            var salesRepObj = {};
            var isSave = true;
            var ctx = nlapiGetContext();
            var specifiedCustomersLimit = ctx.getSetting('SCRIPT', 'custscript_f3_max_customer_sale_rep');
            if(!specifiedCustomersLimit){
                specifiedCustomersLimit = this.config.customerLimit;
            }
            var lineNumber = nlapiFindLineItemValue('salesteam', 'isprimary', 'T');
            try {
                if (lineNumber > -1) {
                    var salesRep = nlapiGetLineItemValue('salesteam', 'employee', lineNumber);
                    var salesRepName = nlapiGetLineItemText('salesteam', 'employee', lineNumber);
                    count = this.getSalesRepCountFromCustomers(salesRep);
                    if (parseInt(count) > parseInt(specifiedCustomersLimit)) {
                        alert('This salesperson (' + salesRepName  +') has reached the '+ specifiedCustomersLimit +' max customer limit');
                        isSave = false;
                    }
                }
                return isSave;
            } catch (e) {

            }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Boolean} True to continue changing field value, false to abort value change
         */
        clientValidateField: function(type, name, linenum) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Void}
         */
        clientFieldChanged: function(type, name, linenum) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @returns {Void}
         */
        clientPostSourcing: function(type, name) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientLineInit: function(type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to save line item, false to abort save
         */
        clientValidateLine: function(type) {
            nlapiLogExecution("DEBUG", "type", type);
            var isLineAdded = true;
            if (type == 'salesteam') {
                var ctx = nlapiGetContext();
                var specifiedCustomersLimit = ctx.getSetting('SCRIPT', 'custscript_f3_max_customer_sale_rep');
                if(!specifiedCustomersLimit){
                    specifiedCustomersLimit = this.config.customerLimit;
                }
                var count = nlapiGetCurrentLineItemValue('salesteam');
                var isPrimary = nlapiGetCurrentLineItemValue('salesteam', 'isprimary');
                nlapiLogExecution("DEBUG", "isPrimary", isPrimary);
                if (isPrimary == 'T') {
                    var salesRep = nlapiGetCurrentLineItemValue('salesteam', 'employee');
                    var salesRepName = nlapiGetCurrentLineItemText('salesteam', 'employee');
                    count = this.getSalesRepCountFromCustomers(salesRep);
                    if (parseInt(count) > parseInt(specifiedCustomersLimit)) {
                        alert('This salesperson (' + salesRepName  +') has reached the '+ specifiedCustomersLimit +' max customer limit');
                        isLineAdded = false;
                    }
                }
            }

            return isLineAdded;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientRecalc: function(type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item insert, false to abort insert
         */
        clientValidateInsert: function(type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item delete, false to abort delete
         */
        clientValidateDelete: function(type) {

            return true;
        },

        getSalesRepCountFromCustomers: function(salesRep) {
            var count = 0;
            var salesRepArray = this.getSalesReps();
            salesRepObj = _.find(salesRepArray, function(num) {
                return num.salesRep == salesRep;
            });
            nlapiLogExecution("DEBUG", "salesRepObj", JSON.stringify(salesRepObj));
            if (!!salesRepObj.count) {
                count = salesRepObj.count;
            }
            return count;
        },

        getSalesReps: function() {
            nlapiLogExecution("DEBUG", "config", this.config.SaveSearchId.internalId);
            // var savedSearch = nlapiLoadSearch(null, this.config.SaveSearchId.internalId);
            // var runSearch = savedSearch.runSearch();

            // var start = 0,
            //     end = 1000;
            // var page = 1;

            // var search = runSearch.getResults(start, end);

            var columns = [];
            columns.push(new nlobjSearchColumn("salesrep",null, "group"));
            columns.push(new nlobjSearchColumn("internalid",null, "count"));
            var search = nlapiSearchRecord('customer', null, [], columns);

            var salesRepArray = search.map(function(e) {
                return {
                    salesRep: e.getValue('salesrep', null, 'group'),
                    count: e.getValue('internalid', null, 'count')
                };
            });
            return salesRepArray;
        },

        getCustomersFromSalesRep: function(salesRep) {
            var customerSearch = nlapiSearchRecord("customer", null, [
                new nlobjSearchFilter("salesteammember", null, "anyof", salesRep) //sample internal ID of employee
            ], [new nlobjSearchColumn("altname", null, null)]);

            var cnt = 0;
            for (var i = 0; i < customerSearch.length; i++) {
                var rec = nlapiLoadRecord('customer', customerSearch[i].id);
                var fldid = rec.findLineItemValue('salesteam', 'employee', salesrep); //sample internal ID of employee
                if (fldid != null && rec.getLineItemValue('salesteam', 'isprimary', fldid) == 'T') {
                    cnt++;
                }
            }
            return cnt;
        },

    };
})();


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function SalesRepCheckerClientPageInit(type) {
    return SalesRepChecker.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function SalesRepCheckerClientSaveRecord() {

    return SalesRepChecker.clientSaveRecord();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function SalesRepCheckerClientValidateField(type, name, linenum) {

    return SalesRepChecker.clientValidateField(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function SalesRepCheckerClientFieldChanged(type, name, linenum) {
    return SalesRepChecker.clientFieldChanged(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function SalesRepCheckerClientPostSourcing(type, name) {
    return SalesRepChecker.clientPostSourcing(type, name);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function SalesRepCheckerClientLineInit(type) {
    return SalesRepChecker.clientLineInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function SalesRepCheckerClientValidateLine(type) {

    return SalesRepChecker.clientValidateLine(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function SalesRepCheckerClientRecalc(type) {
    return SalesRepChecker.clientRecalc(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function SalesRepCheckerClientValidateInsert(type) {

    return SalesRepChecker.clientValidateInsert(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function SalesRepCheckerClientValidateDelete(type) {

    return SalesRepChecker.clientValidateDelete(type);
}