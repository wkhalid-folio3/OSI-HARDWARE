/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./f3mm_base_dal.ts" />
/**
 * Created by zshaikh on 11/19/2015.
 * -
 * Referenced By:
 * - f3mm_create_contract_api_suitelet.ts
 * - f3mm_create_contract_ui_suitelet.ts
 * -
 * Dependencies:
 * - f3mm_contract_dal.ts
 * -
 */
/**
 * This class handles all common operations related to searching records in database
 * Following are the responsibilities of this class:
 *  - Get Contacts
 *  - Get Employees
 *  - Get Price Levels
 *  - Get Quotes
 *  - Get Items
 *  - Get Vendors
 *  - Get Departments
 *  - Get Customers
 *  - Get Tax Items
 *  - Get Tax Groups
 *  - Get Tax Codes
 */
class CommonDAL extends BaseDAL {

    /**
     * Gets / Searches contract with specified query from database
     * @param {object?} options
     * @returns {object[]} array of contacts searched from database
     */
    getContacts(options ? ) {

        var filters = [];
        var cols = [];
        var queryFilters = [];

        cols.push(new nlobjSearchColumn('firstname').setSort());
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('entityid'));
        cols.push(new nlobjSearchColumn('company'));
        cols.push(new nlobjSearchColumn('email'));

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                var queryToSearch = null;
                var splittedQuery = query.split(':');
                if (splittedQuery.length > 1) {
                    queryToSearch = splittedQuery[1].trim();
                } else {
                    queryToSearch = query.trim();
                }

                queryFilters.push(['entityid', 'contains', queryToSearch]);
            }
        }

        filters.push(['isinactive', 'is', 'F']);

        if (queryFilters.length > 0) {
            filters.push('and');
            filters.push(queryFilters);
        }

        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(filters, cols, 'contact');
        jsonConverterTimer.stop();

        return result;
    }

    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    getEmployees(options ? ) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('firstname'));
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('email'));

        filters.push(new nlobjSearchFilter('salesrep', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        var result = this.getAll(filters, cols, 'employee');

        return result;
    }

    /**
     * Gets Price Levels of specified inventory item from database
     * @param {object?} options
     * @returns {object[]} array of price levels fetched from database
     */
    getPriceLevels(options ? ) {
        var record = nlapiLoadRecord(options.recordType, options.itemId);
        var priceLevels = this.getSublistItems(record, 'price1');
        return priceLevels;
    }

    /**
     * Get Quotes of a Contract
     * @param {object} options
     * @returns {object[]} array of quotes fetched from database
     */
    getQuotes(options) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('tranid').setSort());
        cols.push(new nlobjSearchColumn('trandate'));

        if (!!options) {
            var contractId = options.contractId;
            if (F3.Util.Utility.isBlankOrNull(contractId) == false) {
                filters.push(new nlobjSearchFilter('custbody_f3mm_quote_contract', null, 'anyof', contractId));
            }
        }

        // load data from db
        var result = this.getAll(filters, cols, 'estimate');

        return result;
    }

    /**
     * Get / Search Items
     * @param {object} options
     * @returns {object[]} array of searched items
     */
    getItems(options) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('displayname').setSort());
        cols.push(new nlobjSearchColumn('baseprice'));
        cols.push(new nlobjSearchColumn('salesdescription'));
        cols.push(new nlobjSearchColumn('itemid'));

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(new nlobjSearchFilter('displayname', null, 'startswith', query));
            }

            var itemIds = options.itemIds;
            if (!!itemIds) {
                filters.push(new nlobjSearchFilter('internalid', null, 'anyof', itemIds));
            }
        }

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        // load data from db
        var result = this.getAll(filters, cols, 'item');

        return result;
    }

    /**
     * Get Vendors from database
     * @param {object?} options
     * @returns {object[]} array of vendors
     */
    getVendors(options ? ) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('firstname'));
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('companyname'));
        cols.push(new nlobjSearchColumn('isperson'));

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        var result = this.getAll(filters, cols, 'vendor');

        return result;
    }

    /**
     * Get Departments from database
     * @param {object?} options
     * @returns {object[]} array of departments
     */
    getDepartments(options ? ) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('name').setSort());

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        var result = this.getAll(filters, cols, 'department');

        return result;
    }

    /**
     * Get / Search Customers from database based on specified query
     * @param {object?} options
     * @returns {object[]} array of searched customers
     */
    getCustomers(options ? ) {

        var filters = [];
        var cols = [];
        var queryFilters = [];

        cols.push(new nlobjSearchColumn('isperson'));
        cols.push(new nlobjSearchColumn('firstname'));
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('companyname'));
        cols.push(new nlobjSearchColumn('entityid').setSort());

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                queryFilters.push(['companyname', 'startswith', query]);
                queryFilters.push('or');
                queryFilters.push(['entityid', 'startswith', query]);
            }
        }

        filters.push(['isinactive', 'is', 'F']);

        if (queryFilters.length > 0) {
            filters.push('and');
            filters.push(queryFilters);
        }

        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(filters, cols, 'customer');
        jsonConverterTimer.stop();

        return result;

    }

    /**
     * Get / Search Tax Groups and Tax Codes and merge them
     * @param {object?} options
     * @returns {object[]} array of tax groups and tax codes merged
     */
    getTaxItems(options ? ) {
        var taxGroups = this.getTaxGroups(options);
        var taxCodes = this.getTaxCodes(options);

        var taxItems = taxGroups.concat(taxCodes);

        taxItems.sort((a, b) => {
            var nameA = a.itemid.toLowerCase(),
                nameB = b.itemid.toLowerCase();
            if (nameA < nameB) { //sort string ascending
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            return 0; //default return value (no sorting)
        });

        return taxItems;
    }

    /**
     * Get / Search Tax Groups
     * @param {object?} options
     * @returns {object[]} array of searched tax groups
     */
    getTaxGroups(options ? ) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('itemid').setSort());
        cols.push(new nlobjSearchColumn('rate'));


        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(new nlobjSearchFilter('itemid', null, 'startswith', query));
            }
        }

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(filters, cols, 'taxgroup');
        jsonConverterTimer.stop();

        return result;

    }

    /**
     * Get / Search Tax Codes
     * @param {object?} options
     * @returns {object[]} array of searched tax codes
     */
    getTaxCodes(options ? ) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('itemid').setSort());
        cols.push(new nlobjSearchColumn('rate'));

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(new nlobjSearchFilter('itemid', null, 'startswith', query));
            }
        }

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(filters, cols, 'salestaxitem');
        jsonConverterTimer.stop();

        return result;
    }
}