/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/es6-promise.d.ts" />
/**
 * Created by zshaikh on 11/19/2015.
 */
/**
 * Responsible for communicating with server
 * Also responsible for caching data returned from server
 * All kinds of ajax requests are made through this class
 * This class is initialized from UI Manager class
 */
var DataManager = (function () {
    function DataManager(type) {
        this._serverUrl = null;
        this._cacheTime = 0;
        this._viewType = type;
        var oneSecond = 1000;
        var oneMinute = 60 * oneSecond;
        var oneHour = 60 * oneMinute;
        var oneDay = oneHour * 24;
        this._cacheTime = oneDay;
        this._serverUrl = window.apiSuiteletUrl;
        this._serverUrl += '&type=' + this._viewType; // append type
    }
    DataManager.prototype.getVendorsFromServer = function (callback) {
        var data = { 'action': 'get_vendors' };
        return jQuery.get(this._serverUrl, data, function (result) {
            console.log('getVendorsFromServer(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    DataManager.prototype.getEmployeesFromServer = function (callback) {
        var data = { 'action': 'get_employees' };
        return jQuery.get(this._serverUrl, data, function (result) {
            console.log('getEmployeesFromServer(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    DataManager.prototype.getDepartmentFromServer = function (callback) {
        var data = { 'action': 'get_departments' };
        return jQuery.get(this._serverUrl, data, function (result) {
            console.log('getDepartmentFromServer(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    DataManager.prototype.getTaxCodesFromServer = function (params, callback) {
        var options = {
            'action': 'get_taxcodes'
        };
        var filters = {
            'params': JSON.stringify(params)
        };
        $.extend(options, filters);
        return jQuery.get(this._serverUrl, options, function (result) {
            console.log('getTaxCodesFromServer(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    /**
     * Get tax codes from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getTaxCodes = function (params, callback) {
        var _this = this;
        try {
            var cacheKey = 'taxcodes';
            var data = $.jStorage.get(cacheKey);
            if (!!data) {
                callback && callback(data);
            }
            else {
                return this.getTaxCodesFromServer(params, function (data) {
                    $.jStorage.set(cacheKey, data, { TTL: _this._cacheTime });
                    callback && callback(data);
                });
            }
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getTaxCodes()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Get Items from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getItems = function (params, callback) {
        try {
            var options = {
                'action': 'get_items'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options, function (result) {
                console.log('getItems(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getItems()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Get Vendors from cache or server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getVendors = function (callback) {
        var cacheKey = 'vendors';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getVendorsFromServer(function (data) {
                $.jStorage.set(cacheKey, data, { TTL: this._cacheTime });
                callback && callback(data);
            });
        }
    };
    /**
     * Get Employees from cache or server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getEmployees = function (callback) {
        var cacheKey = 'employees';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getEmployeesFromServer(function (data) {
                $.jStorage.set(cacheKey, data, { TTL: this._cacheTime });
                callback && callback(data);
            });
        }
    };
    /**
     * Get Departments from cache or server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getDepartment = function (callback) {
        var cacheKey = 'departments';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
            return data;
        }
        else {
            return this.getDepartmentFromServer(function (data) {
                $.jStorage.set(cacheKey, data, { TTL: this._cacheTime });
                callback && callback(data);
            });
        }
    };
    /**
     * Description of method DataManager
     * @param parameter
     */
    DataManager.prototype.getPrimaryContacts = function (params, callback) {
        try {
            var options = {
                'action': 'get_contacts'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options, function (result) {
                console.log('getPrimaryContacts(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getPrimaryContacts()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Get Customers from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getCustomers = function (params, callback) {
        try {
            var options = {
                'action': 'get_customers'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options, function (result) {
                console.log('getCustomers(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Get Price Levels from server for specific item id
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getPriceLevels = function (params, callback) {
        try {
            var options = {
                'action': 'get_pricelevels'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options, function (result) {
                console.log('getPriceLevels(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Generate Quote
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.generateQuote = function (params, callback) {
        try {
            var options = {
                'action': 'generate_quote'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options, function (result) {
                console.log('generateQuote(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.generateQuote()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Submit contract information to server
     * @param {object} data contract json object to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.submit = function (data, callback) {
        var options = {
            'action': 'submit'
        };
        $.extend(options, { 'params': JSON.stringify(data) });
        return jQuery.post(this._serverUrl, options, function (result) {
            console.log('submit(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    return DataManager;
})();
//# sourceMappingURL=f3mm-data-manager.js.map