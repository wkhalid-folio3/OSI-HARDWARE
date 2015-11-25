// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./BaseTypeDAL.ts" />

/**
 * Created by zshaikh on 11/19/2015.
 */

class CommonDAL extends BaseTypeDAL {

    getContacts(options?){

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('firstname').setSort());
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('entityid'));
        cols.push(new nlobjSearchColumn('email'));

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(['firstname', 'startswith', query]);
                //filters.push('or');
                //filters.push(['lastname', 'contains', query]);
                //filters.push('or');
                //filters.push(['companyname', 'startswith', query]);
                //filters.push('or');
                //filters.push(['email', 'contains', query]);
                filters.push('or');
                filters.push(['entityid', 'is', query]);
            }
        }

        var x = [];
        x.push(['isinactive', 'is', 'F']);
        x.push('and');
        x.push(filters);


        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(x, cols, 'contact');
        jsonConverterTimer.stop();

        return result;

    }


    /**
     * Get all partners from db
     */
    getEmployees (options?) {

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
     * Get all partners from db
     */
    getItems (options) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('displayname').setSort());
        cols.push(new nlobjSearchColumn('baseprice'));
        cols.push(new nlobjSearchColumn('salesdescription'));

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(new nlobjSearchFilter('displayname', null, 'startswith', query));
            }
        }

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        // load data from db
        var result = this.getAll(filters, cols, 'item');

        return result;
    }


    /**
     * Get all partners from db
     */
    getVendors (options?) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('firstname'));
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('companyname'));
        cols.push(new nlobjSearchColumn('isperson'));

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        //filters.push(new nlobjSearchFilter('companyname', null, 'isnotempty'));

        var result = this.getAll(filters, cols, 'vendor');

        return result;
    }

    /**
     * Get all partners from db
     */
    getDepartments (options?) {

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('name').setSort());

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

        var result = this.getAll(filters, cols, 'department');

        return result;
    }


    getCustomers(options?){

        var filters = [];
        var cols = [];

        cols.push(new nlobjSearchColumn('isperson').setSort());
        cols.push(new nlobjSearchColumn('firstname').setSort());
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('companyname').setSort());
        cols.push(new nlobjSearchColumn('entityid'));

        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(['firstname', 'startswith', query]);
                filters.push('or');
                //filters.push(['lastname', 'contains', query]);
                //filters.push('or');
                filters.push(['companyname', 'startswith', query]);
                //filters.push('or');
                //filters.push(['email', 'contains', query]);
                filters.push('or');
                filters.push(['entityid', 'is', query]);
            }
        }

        var x = [];
        x.push(['isinactive', 'is', 'F']);
        x.push('and');
        x.push(filters);

        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(x, cols, 'customer');
        jsonConverterTimer.stop();

        return result;

    }

}