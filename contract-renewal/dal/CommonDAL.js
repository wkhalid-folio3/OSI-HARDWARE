// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./BaseTypeDAL.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by zshaikh on 11/19/2015.
 */
var CommonDAL = (function (_super) {
    __extends(CommonDAL, _super);
    function CommonDAL() {
        _super.apply(this, arguments);
    }
    CommonDAL.prototype.getContacts = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn('firstname').setSort());
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('entityid'));
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
        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(filters, cols, 'contact');
        jsonConverterTimer.stop();
        return result;
    };
    /**
     * Get all partners from db
     */
    CommonDAL.prototype.getEmployees = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn('firstname'));
        cols.push(new nlobjSearchColumn('lastname'));
        //filters.push(new nlobjSearchFilter('companyname', null, 'isnotempty'));
        var result = this.getAll(filters, cols, 'employee');
        return result;
    };
    /**
     * Get all partners from db
     */
    CommonDAL.prototype.getItems = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn('name').setSort());
        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) == false) {
                filters.push(new nlobjSearchFilter('name', null, 'startswith', query));
            }
        }
        // load data from db
        var result = this.getAll(filters, cols, 'item');
        return result;
    };
    /**
     * Get all partners from db
     */
    CommonDAL.prototype.getVendors = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn('firstname'));
        cols.push(new nlobjSearchColumn('lastname'));
        cols.push(new nlobjSearchColumn('companyname'));
        cols.push(new nlobjSearchColumn('isperson'));
        //filters.push(new nlobjSearchFilter('companyname', null, 'isnotempty'));
        var result = this.getAll(filters, cols, 'vendor');
        return result;
    };
    /**
     * Get all partners from db
     */
    CommonDAL.prototype.getDepartments = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn('name').setSort(false));
        filters.push(new nlobjSearchFilter('isinactive', null, 'isnot', 'F'));
        var result = this.getAll(filters, cols, 'department');
        return result;
    };
    CommonDAL.prototype.getCustomers = function (options) {
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
        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
        var result = this.getAll(filters, cols, 'customer');
        jsonConverterTimer.stop();
        return result;
    };
    return CommonDAL;
})(BaseTypeDAL);
//# sourceMappingURL=CommonDAL.js.map