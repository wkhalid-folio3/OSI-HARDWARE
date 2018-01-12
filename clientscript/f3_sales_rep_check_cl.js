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
 * customizations added by Waleed B Khalid 12/1/2018
 * function added: getCustomMaxCountAllowedForSalesRep() to override default preferences for cust count
 * additional handling in getSalesRepCount
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
         * Get the custom_max_count for the employee
         * @argument employeeinternalid
         * @return max_allowed_count for customers
         */

        getCustomMaxCountAllowedForSalesRep: function(internalid, salesRepArray) {
            var count = 0;
            var ctx = nlapiGetContext();
            var specifiedCustomersLimit = ctx.getSetting('SCRIPT', 'custscript_f3_max_customer_sale_rep');
            salesRepObj = _.find(salesRepArray, function(num) {
                return num.salesRep == internalid;
            });

            if (!!salesRepObj && !!salesRepObj.MaxCount) {
                //get maxcount and check against it
                count = salesRepObj.MaxCount;
            }

            return (!!count && count > 0) ? count : ((!specifiedCustomersLimit) ? this.config.customerLimit : specifiedCustomersLimit);
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
            // var ctx = nlapiGetContext();
            // var specifiedCustomersLimit = ctx.getSetting('SCRIPT', 'custscript_f3_max_customer_sale_rep');
            // if (!specifiedCustomersLimit) {
            //     specifiedCustomersLimit = this.config.customerLimit;
            // }

            var lineNumber = nlapiFindLineItemValue('salesteam', 'isprimary', 'T');
            try {
                if (lineNumber > -1) {
                    var salesRep = nlapiGetLineItemValue('salesteam', 'employee', lineNumber);
                    var salesRepArray = this.getSalesReps();
                    var specifiedCustomersLimit = this.getCustomMaxCountAllowedForSalesRep(salesRep, salesRepArray);
                    var salesRepName = nlapiGetLineItemText('salesteam', 'employee', lineNumber);

                    count = this.getSalesRepCountFromCustomers(salesRep, salesRepArray);
                    if (parseInt(count) > parseInt(specifiedCustomersLimit)) {
                        alert('This salesperson (' + salesRepName + ') has reached the ' + specifiedCustomersLimit + ' max customer limit');
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

                var salesRepArray = this.getSalesReps();
                var isPrimary = nlapiGetCurrentLineItemValue('salesteam', 'isprimary');
                nlapiLogExecution("DEBUG", "isPrimary", isPrimary);
                if (isPrimary == 'T') {
                    var salesRep = nlapiGetCurrentLineItemValue('salesteam', 'employee');
                    var specifiedCustomersLimit = this.getCustomMaxCountAllowedForSalesRep(salesRep, salesRepArray);
                    var salesRepName = nlapiGetCurrentLineItemText('salesteam', 'employee');

                    var _count = this.getSalesRepCountFromCustomers(salesRep, salesRepArray);
                    if (parseInt(_count) > parseInt(specifiedCustomersLimit)) {
                        alert('This salesperson (' + salesRepName + ') has reached the ' + specifiedCustomersLimit + ' max customer limit');
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

        getSalesRepCountFromCustomers: function(salesRep, salesRepArray) {
            var count = 0;
            nlapiLogExecution("DEBUG", "new salesRepObj", JSON.stringify(salesRepArray));

            salesRepObj = _.find(salesRepArray, function(num) {
                return num.salesRep == salesRep;
            });
            nlapiLogExecution("DEBUG", "salesRepObj", JSON.stringify(salesRepObj));
            //additional handling done if object undefined and count returned
            if (!!salesRepObj && !!salesRepObj.count) {
                count = salesRepObj.count;
            }
            return count;
        },

        getSalesReps: function() {
            nlapiLogExecution("DEBUG", "config", this.config.SaveSearchId.internalId);

            var columns = [];
            columns.push(new nlobjSearchColumn("salesrep", null, "group"));
            columns.push(new nlobjSearchColumn("internalid", null, "count"));
            columns.push(new nlobjSearchColumn("custentity_f3_max_no_of_customers", "salesRep", "GROUP"));
            var search = nlapiSearchRecord('customer', null, [], columns);

            var salesRepArray = search.map(function(e) {
                return {
                    salesRep: e.getValue('salesrep', null, 'group'),
                    count: e.getValue('internalid', null, 'count'),
                    MaxCount: e.getValue("custentity_f3_max_no_of_customers", "salesRep", "GROUP")
                };
            });
            nlapiLogExecution("DEBUG", "salesRepObj----2", JSON.stringify(salesRepArray));
            debugger;
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