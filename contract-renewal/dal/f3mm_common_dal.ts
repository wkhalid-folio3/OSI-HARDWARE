/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../helpers/f3mm_contract_status_enum.ts" />
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
    public getContacts(options?) {

        let filters = [];
        let cols = [];
        let queryFilters = [];

        cols.push(new nlobjSearchColumn("firstname").setSort());
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("entityid"));
        cols.push(new nlobjSearchColumn("company"));
        cols.push(new nlobjSearchColumn("email"));

        if (!!options) {
            let query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                let queryToSearch = null;
                let splittedQuery = query.split(":");
                if (splittedQuery.length > 1) {
                    queryToSearch = splittedQuery[1].trim();
                } else {
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
        let jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        let result = this.getAll(filters, cols, "contact");
        jsonConverterTimer.stop();

        return result;
    }

    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    public getEmployees(options?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("firstname"));
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("email"));

        filters.push(new nlobjSearchFilter("salesrep", null, "is", "T"));
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));

        let result = this.getAll(filters, cols, "employee");

        return result;
    }


    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    public getDefaultEmailTemplate(type: ContractNotificationType) {
        return this.getEmailTemplate(type, null);
    }

    /**
     * Gets / Searches employees with specified query from database
     * @param {object?} options
     * @returns {object[]} array of employees searched from database
     */
    public getEmailTemplate(type: ContractNotificationType, vendorId?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("custrecord_f3mm_vendor"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_template"));

        filters.push(new nlobjSearchFilter("custrecord_notification_type", null, "anyof", type));

        if ( !!vendorId) {
            filters.push(new nlobjSearchFilter("custrecord_f3mm_vendor", null, "anyof", vendorId));
        } else {
            filters.push(new nlobjSearchFilter("custrecord_f3mm_vendor", null, "isempty"));
        }
        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));

        let result = this.getAll(filters, cols, "customrecord_f3mm_vendor_template_maping");

        return result;
    }

    /**
     * Gets Price Levels of specified inventory item from database
     * @param {object?} options
     * @returns {object[]} array of price levels fetched from database
     */
    public getPriceLevels(options ?) {
        let record = nlapiLoadRecord(options.recordType, options.itemId);

        // Check the features enabled in the account. See Pricing Sublist Feature Dependencies for
        // details on why this is important.
        let multiCurrency = nlapiGetContext().getFeature("MULTICURRENCY");
        let multiPrice = nlapiGetContext().getFeature("MULTPRICE");
        let quantityPricing = nlapiGetContext().getFeature("QUANTITYPRICING");
        let priceID = "";

        // Set the ID for the sublist and the price field. Note that if all pricing-related features
        // are disabled, you will set the price in the rate field. See Pricing Sublist Feature Dependencies
        // for details.
        if (!multiCurrency && !multiPrice && !quantityPricing) {
            //
        } else {
            priceID = "price";
            if (multiCurrency) {
                // var filters = new nlobjSearchFilter('symbol', null, 'contains', currencyID);
                // var internalId = nlapiSearchRecord('currency', null, filters)[0].getId();
                // for USD as default curremcy id - TODO: generalize in future for more than one currency support
                let internalId = 1;
                // Append the currency ID to the sublist name
                priceID = priceID + internalId;
            }
        }

        let priceLevels = JsonHelper.getSublistItemsJson(record, priceID);

        let priceLevelsFiltered = priceLevels.filter(priceLevel  => {
            return !!priceLevel.price_1_ || !!priceLevel.discount;
        });

        return priceLevelsFiltered;
    }


    /**
     * Get Quotes of a Contract
     * @param {object} options
     * @returns {object[]} array of quotes fetched from database
     */
    public searchQuotes(options) {
        let result = null;
        let filters = [];
        let cols = [];

        try {
            cols.push(new nlobjSearchColumn("tranid").setSort());
            cols.push(new nlobjSearchColumn("trandate"));

            if (!!options) {
                let contractIds = options.contractIds;
                if (F3.Util.Utility.isBlankOrNull(contractIds) === false) {
                    filters.push(new nlobjSearchFilter("custbody_f3mm_quote_contract", null, "anyof", [contractIds]));
                }
            }

            // load data from db
            result = this.getAll(filters, cols, "estimate");
        } catch (ex) {
            F3.Util.Utility.logException("CommonDAL.getQuotes()", ex);
            throw ex;
        }

        return result;
    }


    /**
     * Get Quotes of a Contract
     * @param {object} options
     * @returns {object[]} array of quotes fetched from database
     */
    public getQuotes(options) {
        let result = null;
        let filters = [];
        let cols = [];

        try {
            cols.push(new nlobjSearchColumn("tranid").setSort());
            cols.push(new nlobjSearchColumn("trandate"));

            if (!!options) {
                let contractId = options.contractId;
                if (F3.Util.Utility.isBlankOrNull(contractId) === false) {
                    filters.push(new nlobjSearchFilter("custbody_f3mm_quote_contract", null, "anyof", [contractId]));
                }
            }

            // load data from db
            result = this.getAll(filters, cols, "estimate");
        } catch (ex) {
            F3.Util.Utility.logException("CommonDAL.getQuotes()", ex);
            throw ex;
        }

        return result;
    }

    /**
     * Get / Search Items
     * @param {object} options
     * @returns {object[]} array of searched items
     */
    public getItems(options) {

        let filters = [];
        let cols = [];
        let result = null;

        try {
            cols.push(new nlobjSearchColumn("displayname").setSort());
            cols.push(new nlobjSearchColumn("baseprice"));
            cols.push(new nlobjSearchColumn("salesdescription"));
            cols.push(new nlobjSearchColumn("itemid"));

            if (Config.IS_PROD === true) {
                cols.push(new nlobjSearchColumn("custitem_long_name"));
            }

            let queryFilters = [];
            if (!!options) {
                if (!!options.query) {
                    let query = options.query;
                    let queryToSearch = null;
                    let splittedQuery = query.split(":");
                    if (splittedQuery.length > 1) {
                        queryToSearch = splittedQuery[splittedQuery.length - 1].trim();
                    } else {
                        queryToSearch = query.trim();
                    }

                    if (Config.IS_PROD === true) {
                        queryFilters.push(["custitem_long_name", "contains", queryToSearch]);
                    }

                    if (F3.Util.Utility.isBlankOrNull(queryToSearch) === false) {
                        if (queryFilters.length > 0) {
                            queryFilters.push("or");
                        }
                        queryFilters.push(["displayname", "contains", queryToSearch]);
                        queryFilters.push("or");
                        queryFilters.push(["itemid", "contains", queryToSearch]);
                    }
                }

                let itemIds = options.itemIds;
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
        } catch (ex) {
            F3.Util.Utility.logException("CommonDAL.getItems()", ex);
            throw ex;
        }

        return result;
    }

    /**
     * Get Disccount Items from database
     * @param {object?} options
     * @returns {object[]} array of discount items
     */
    public getDiscountItems(options?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("itemid"));
        // cols.push(new nlobjSearchColumn("rate"));

        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        // filters.push(new nlobjSearchFilter("custentity_f3mm_show_vendor_on_contract", null, "is", "T"));

        let result = this.getAll(filters, cols, "discountitem");

        return result;
    }

    /**
     * Get Vendors from database
     * @param {object?} options
     * @returns {object[]} array of vendors
     */
    public getVendors(options?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("firstname"));
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("companyname"));
        cols.push(new nlobjSearchColumn("isperson"));

        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
        filters.push(new nlobjSearchFilter("custentity_f3mm_show_vendor_on_contract", null, "is", "T"));

        let result = this.getAll(filters, cols, "vendor");

        return result;
    }

    /**
     * Get Departments from database
     * @param {object?} options
     * @returns {object[]} array of departments
     */
    public getDepartments(options?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("name").setSort());

        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));

        let result = this.getAll(filters, cols, "department");

        return result;
    }

    /**
     * Get / Search Customers from database based on specified query
     * @param {object?} options
     * @returns {object[]} array of searched customers
     */
    public getCustomers(options?) {

        let filters = [];
        let cols = [];
        let queryFilters = [];

        cols.push(new nlobjSearchColumn("isperson"));
        cols.push(new nlobjSearchColumn("firstname"));
        cols.push(new nlobjSearchColumn("lastname"));
        cols.push(new nlobjSearchColumn("companyname"));
        cols.push(new nlobjSearchColumn("entityid").setSort());

        if (!!options) {
            let query = options.query;
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
        let jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        let result = this.getAll(filters, cols, "customer");
        jsonConverterTimer.stop();

        return result;

    }

    /**
     * Get / Search Tax Groups and Tax Codes and merge them
     * @param {object?} options
     * @returns {object[]} array of tax groups and tax codes merged
     */
    public getTaxItems(options?) {
        let taxGroups = this.getTaxGroups(options);
        let taxCodes = this.getTaxCodes(options);

        let taxItems = taxGroups.concat(taxCodes);

        taxItems.sort((a, b) => {
            let nameA = a.itemid.toLowerCase(),
                nameB = b.itemid.toLowerCase();

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
    }

    /**
     * Get / Search Tax Groups
     * @param {object?} options
     * @returns {object[]} array of searched tax groups
     */
    public getTaxGroups(options?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("itemid").setSort());
        cols.push(new nlobjSearchColumn("rate"));


        if (!!options) {
            let query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                filters.push(new nlobjSearchFilter("itemid", null, "startswith", query));
            }
        }

        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));

        // serialize data
        let jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        let result = this.getAll(filters, cols, "taxgroup");
        jsonConverterTimer.stop();

        return result;

    }

    /**
     * Get / Search Tax Codes
     * @param {object?} options
     * @returns {object[]} array of searched tax codes
     */
    public getTaxCodes(options?) {

        let filters = [];
        let cols = [];

        cols.push(new nlobjSearchColumn("itemid").setSort());
        cols.push(new nlobjSearchColumn("rate"));

        if (!!options) {
            let query = options.query;
            if (F3.Util.Utility.isBlankOrNull(query) === false) {
                filters.push(new nlobjSearchFilter("itemid", null, "startswith", query));
            }
        }

        filters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));

        // serialize data
        let jsonConverterTimer = F3.Util.StopWatch.start("Convert objects to json manually.");
        let result = this.getAll(filters, cols, "salestaxitem");
        jsonConverterTimer.stop();

        return result;
    }
}