/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../helpers/f3mm_contract_status_enum.ts" />
/// <reference path="./f3mm_base_dal.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var CommonDAL = (function (_super) {
    __extends(CommonDAL, _super);
    function CommonDAL() {
        _super.apply(this, arguments);
    }
    /**
     * Gets / Searches contract with specified query from database
     * @param {object?} options
     * @returns {object[]} array of contacts searched from database
     */
    CommonDAL.prototype.getContacts = function (options) {
        var filters = [];
        var cols = [];
        var queryFilters = [];
        cols.push(new nlobjSearchColumn("firstname").setSort());
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("entityid"));
        cols.push(new nlobjSearchColumn("company"));
        cols.push(new nlobjSearchColumn("email"));
        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                var queryToSearch = null;
                var splittedQuery = query.split(":");
                if (splittedQuery.length > 1) {
                    queryToSearch = splittedQuery[1].trim();
                }
                else {
                    queryToSearch = query.trim();
                }
                queryFilters.push(["entityid", "contains", queryToSearch]);
            }
            if (F3.Util.Utility.isBlankOrNull(options.customerId) === false) {
                filters.push(["company", "anyof", options.customerId]);
                filters.push("and");
            }
        }
        filters.push(["isinactive", "is", "F"]);
        if (queryFilters.length > 0) {
            filters.push("and");
            filters.push(queryFilters);
        }
        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        var result = this.getAll(filters, cols, "contact");
        jsonConverterTimer.stop();
        return result;
    };
    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    CommonDAL.prototype.getEmployees = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("firstname"));
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("email"));
        filters.push(new nlobjSearchFilter("salesrep", null, "is", "T"));
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        var result = this.getAll(filters, cols, "employee");
        return result;
    };
    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    CommonDAL.prototype.getDefaultEmailTemplate = function (type) {
        return this.getEmailTemplate(type, null);
    };
    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    CommonDAL.prototype.getEmailTemplate = function (type, vendorId) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("custrecord_f3mm_vendor"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_template"));
        filters.push(new nlobjSearchFilter("custrecord_notification_type", null, "anyof", type));
        if (!!vendorId) {
            filters.push(new nlobjSearchFilter("custrecord_f3mm_vendor", null, "anyof", vendorId));
        }
        else {
            // filters.push(new nlobjSearchFilter("custrecord_f3mm_vendor", null, "isempty"));
            filters.push(new nlobjSearchFilter("custrecord_f3mm_vendor", null, "anyof", "@NONE@"));
        }
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        var result = this.getAll(filters, cols, "customrecord_f3mm_vendor_template_maping");
        return result;
    };
    /**
     * Gets Price Levels of specified inventory item from database
     * @param {object?} options
     * @returns {object[]} array of price levels fetched from database
     */
    CommonDAL.prototype.getPriceLevels = function (options) {
        var record = nlapiLoadRecord(options.recordType, options.itemId);
        // Check the features enabled in the account. See Pricing Sublist Feature Dependencies for
        // details on why this is important.
        var multiCurrency = nlapiGetContext().getFeature("MULTICURRENCY");
        var multiPrice = nlapiGetContext().getFeature("MULTPRICE");
        var quantityPricing = nlapiGetContext().getFeature("QUANTITYPRICING");
        var priceID = "";
        // Set the ID for the sublist and the price field. Note that if all pricing-related features
        // are disabled, you will set the price in the rate field. See Pricing Sublist Feature Dependencies
        // for details.
        if (!multiCurrency && !multiPrice && !quantityPricing) {
        }
        else {
            priceID = "price";
            if (multiCurrency) {
                // var filters = new nlobjSearchFilter('symbol', null, 'contains', currencyID);
                // var internalId = nlapiSearchRecord('currency', null, filters)[0].getId();
                // for USD as default curremcy id - TODO: generalize in future for more than one currency support
                var internalId = 1;
                // Append the currency ID to the sublist name
                priceID = priceID + internalId;
            }
        }
        var priceLevels = JsonHelper.getSublistItemsJson(record, priceID);
        var priceLevelsFiltered = priceLevels.filter(function (priceLevel) {
            return !!priceLevel.price_1_ || !!priceLevel.discount;
        });
        return priceLevelsFiltered;
    };
    /**
     * Get Quotes of a Contract
     * @param {object} options
     * @returns {object[]} array of quotes fetched from database
     */
    CommonDAL.prototype.searchQuotes = function (options) {
        var result = null;
        var filters = [];
        var cols = [];
        try {
            cols.push(new nlobjSearchColumn("tranid").setSort());
            cols.push(new nlobjSearchColumn("trandate"));
            if (!!options) {
                var contractIds = options.contractIds;
                if (F3.Util.Utility.isBlankOrNull(contractIds) === false) {
                    filters.push(new nlobjSearchFilter("custbody_f3mm_quote_contract", null, "anyof", [contractIds]));
                }
            }
            // load data from db
            result = this.getAll(filters, cols, "estimate");
        }
        catch (ex) {
            F3.Util.Utility.logException("CommonDAL.getQuotes()", ex);
            throw ex;
        }
        return result;
    };
    /**
     * Get Quotes of a Contract
     * @param {object} options
     * @returns {object[]} array of quotes fetched from database
     */
    CommonDAL.prototype.getQuotes = function (options) {
        var result = null;
        var filters = [];
        var cols = [];
        try {
            cols.push(new nlobjSearchColumn("tranid").setSort());
            cols.push(new nlobjSearchColumn("trandate"));
            if (!!options) {
                var contractId = options.contractId;
                if (F3.Util.Utility.isBlankOrNull(contractId) === false) {
                    filters.push(new nlobjSearchFilter("custbody_f3mm_quote_contract", null, "anyof", [contractId]));
                }
            }
            // load data from db
            result = this.getAll(filters, cols, "estimate");
        }
        catch (ex) {
            F3.Util.Utility.logException("CommonDAL.getQuotes()", ex);
            throw ex;
        }
        return result;
    };
    /**
     * Get / Search Items
     * @param {object} options
     * @returns {object[]} array of searched items
     */
    CommonDAL.prototype.getItems = function (options) {
        var filters = [];
        var cols = [];
        var result = null;
        try {
            cols.push(new nlobjSearchColumn("displayname").setSort());
            cols.push(new nlobjSearchColumn("baseprice"));
            cols.push(new nlobjSearchColumn("salesdescription"));
            cols.push(new nlobjSearchColumn("itemid"));
            cols.push(new nlobjSearchColumn("custitem_long_name"));
            var queryFilters = [];
            if (!!options) {
                if (!!options.query) {
                    var query = options.query;
                    var queryToSearch = null;
                    var splittedQuery = query.split(":");
                    if (splittedQuery.length > 1) {
                        queryToSearch = splittedQuery[splittedQuery.length - 1].trim();
                    }
                    else {
                        queryToSearch = query.trim();
                    }
                    if (F3.Util.Utility.isBlankOrNull(queryToSearch) === false) {
                        var wildcardKeyword = "%" + queryToSearch.replace(/ /gi, "%") + "%";
                        queryFilters.push(["custitem_long_name", "contains", wildcardKeyword]);
                        if (queryFilters.length > 0) {
                            queryFilters.push("or");
                        }
                        queryFilters.push(["displayname", "contains", wildcardKeyword]);
                        queryFilters.push("or");
                        queryFilters.push(["itemid", "contains", queryToSearch]);
                    }
                }
                var itemIds = options.itemIds;
                if (!!itemIds && itemIds.length > 0) {
                    if (queryFilters.length > 0) {
                        queryFilters.push("or");
                    }
                    queryFilters.push(["internalid", "anyof", itemIds]);
                }
            }
            filters.push(["isinactive", "is", "F"]);
            filters.push("and");
            filters.push(queryFilters);
            // load data from db
            result = this.getAll(filters, cols, "item");
        }
        catch (ex) {
            F3.Util.Utility.logException("CommonDAL.getItems()", ex);
            throw ex;
        }
        return result;
    };
    /**
     * Get Disccount Items from database
     * @param {object?} options
     * @returns {object[]} array of discount items
     */
    CommonDAL.prototype.getDiscountItems = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("itemid"));
        // cols.push(new nlobjSearchColumn("rate"));
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        // filters.push(new nlobjSearchFilter("custentity_f3mm_show_vendor_on_contract", null, "is", "T"));
        var result = this.getAll(filters, cols, "discountitem");
        return result;
    };
    /**
     * Get Vendors from database
     * @param {object?} options
     * @returns {object[]} array of vendors
     */
    CommonDAL.prototype.getVendors = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("firstname"));
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("companyname"));
        cols.push(new nlobjSearchColumn("isperson"));
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        filters.push(new nlobjSearchFilter("custentity_f3mm_show_vendor_on_contract", null, "is", "T"));
        var result = this.getAll(filters, cols, "vendor");
        return result;
    };
    /**
     * Get Departments from database
     * @param {object?} options
     * @returns {object[]} array of departments
     */
    CommonDAL.prototype.getDepartments = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("name").setSort());
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        var result = this.getAll(filters, cols, "department");
        return result;
    };
    /**
     * Get / Search Customers from database based on specified query
     * @param {object?} options
     * @returns {object[]} array of searched customers
     */
    CommonDAL.prototype.getCustomers = function (options) {
        var filters = [];
        var cols = [];
        var queryFilters = [];
        cols.push(new nlobjSearchColumn("isperson"));
        cols.push(new nlobjSearchColumn("firstname"));
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("companyname"));
        cols.push(new nlobjSearchColumn("entityid").setSort());
        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                queryFilters.push(["companyname", "startswith", query]);
                queryFilters.push("or");
                queryFilters.push(["entityid", "startswith", query]);
            }
        }
        filters.push(["isinactive", "is", "F"]);
        if (queryFilters.length > 0) {
            filters.push("and");
            filters.push(queryFilters);
        }
        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        var result = this.getAll(filters, cols, "customer");
        jsonConverterTimer.stop();
        return result;
    };
    /**
     * Get / Search Tax Groups and Tax Codes and merge them
     * @param {object?} options
     * @returns {object[]} array of tax groups and tax codes merged
     */
    CommonDAL.prototype.getTaxItems = function (options) {
        var taxGroups = this.getTaxGroups(options);
        var taxCodes = this.getTaxCodes(options);
        var taxItems = taxGroups.concat(taxCodes);
        taxItems.sort(function (a, b) {
            var nameA = a.itemid.toLowerCase(), nameB = b.itemid.toLowerCase();
            // sort string ascending
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0; // default return value (no sorting)
        });
        return taxItems;
    };
    /**
     * Get / Search Tax Groups
     * @param {object?} options
     * @returns {object[]} array of searched tax groups
     */
    CommonDAL.prototype.getTaxGroups = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("itemid").setSort());
        cols.push(new nlobjSearchColumn("rate"));
        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                filters.push(new nlobjSearchFilter("itemid", null, "startswith", query));
            }
        }
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        var result = this.getAll(filters, cols, "taxgroup");
        jsonConverterTimer.stop();
        return result;
    };
    /**
     * Get / Search Tax Codes
     * @param {object?} options
     * @returns {object[]} array of searched tax codes
     */
    CommonDAL.prototype.getTaxCodes = function (options) {
        var filters = [];
        var cols = [];
        cols.push(new nlobjSearchColumn("itemid").setSort());
        cols.push(new nlobjSearchColumn("rate"));
        if (!!options) {
            var query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                filters.push(new nlobjSearchFilter("itemid", null, "startswith", query));
            }
        }
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        // serialize data
        var jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        var result = this.getAll(filters, cols, "salestaxitem");
        jsonConverterTimer.stop();
        return result;
    };
    return CommonDAL;
})(BaseDAL);
//# sourceMappingURL=f3mm_common_dal.js.map