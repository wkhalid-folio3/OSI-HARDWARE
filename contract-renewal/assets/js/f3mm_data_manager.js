/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/es6-promise.d.ts" />
/**
 * Created by zshaikh on 11/19/2015.
 * -
 * Referenced By:
 * - f3mm_create_contract_ui_manager.ts
 * -
 * Dependencies:
 * - jquery-1.11.0.min.js
 * - jstorage.js
 * -
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
        this._cachePrefix = "mm_cn_";
        this._viewType = type;
        var oneSecond = 1000;
        var oneMinute = 60 * oneSecond;
        var oneHour = 60 * oneMinute;
        var oneDay = oneHour * 24;
        this._cacheTime = oneDay;
        this._serverUrl = window.apiSuiteletUrl;
        this._serverUrl += "&type=" + this._viewType; // append type
    }
    /**
     * Get Vendors from server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getVendorsFromServer = function (callback) {
        var data = {
            "action": "get_vendors"
        };
        return jQuery.get(this._serverUrl, data, function (result) {
            console.log("getVendorsFromServer(); // jquery complete: ", arguments);
            if (!!callback) {
                callback(result);
            }
        });
    };
    /**
     * Get Employees from server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getEmployeesFromServer = function (callback) {
        var data = {
            "action": "get_employees"
        };
        return jQuery.get(this._serverUrl, data, function (result) {
            console.log("getEmployeesFromServer(); // jquery complete: ", arguments);
            if (!!callback) {
                callback(result);
            }
        });
    };
    /**
     * Get Departments from server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getDepartmentFromServer = function (callback) {
        var data = {
            'action': 'get_departments'
        };
        return jQuery.get(this._serverUrl, data, function (result) {
            console.log('getDepartmentFromServer(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    /**
     * Get tax codes from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
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
     * Get tax codes from cache or server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.getTaxCodes = function (params, callback) {
        var _this = this;
        try {
            var cacheKey = this._cachePrefix + 'taxcodes';
            var data = $.jStorage.get(cacheKey);
            if (!!data) {
                callback && callback(data);
            }
            else {
                return this.getTaxCodesFromServer(params, function (data) {
                    $.jStorage.set(cacheKey, data, {
                        TTL: _this._cacheTime
                    });
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
     * Search Contracts from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.searchContracts = function (params, callback) {
        try {
            var options = {
                'action': 'get_contracts'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options).then(function (result) {
                console.log('searchContracts(); // jquery complete: ', arguments);
                callback && callback(result);
                return result;
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getItems()', e.toString());
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
        var cacheKey = this._cachePrefix + 'vendors';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getVendorsFromServer(function (data) {
                $.jStorage.set(cacheKey, data, {
                    TTL: this._cacheTime
                });
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
        var cacheKey = this._cachePrefix + 'employees';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getEmployeesFromServer(function (data) {
                $.jStorage.set(cacheKey, data, {
                    TTL: this._cacheTime
                });
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
        var cacheKey = this._cachePrefix + 'departments';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
            return data;
        }
        else {
            return this.getDepartmentFromServer(function (data) {
                $.jStorage.set(cacheKey, data, {
                    TTL: this._cacheTime
                });
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
                "action": "generate_quote"
            };
            var filters = {
                "params": JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(this._serverUrl, options, function (result) {
                console.log("generateQuote(); // jquery complete: ", arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error("ERROR", "Error during main DataManager.generateQuote()", e.toString());
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
        $.extend(options, {
            'params': JSON.stringify(data)
        });
        return jQuery.post(this._serverUrl, options, function (result) {
            console.log('submit(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    /**
     * Delete contract
     * @param {object} data contract json object to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.deleteContract = function (data, callback) {
        var options = {
            'action': 'delete_contract'
        };
        $.extend(options, {
            'params': JSON.stringify(data)
        });
        return jQuery.post(this._serverUrl, options, function (result) {
            console.log('deleteContract(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    /**
     * Void Selected contracts
     * @param {object} data object containing ids of contracts
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.voidContract = function (data, callback) {
        var options = {
            "action": "void_contract"
        };
        $.extend(options, {
            "params": JSON.stringify(data)
        });
        return jQuery.post(this._serverUrl, options, function (result) {
            console.log("voidContract(); // jquery complete: ", arguments);
            callback && callback(result);
        });
    };
    /**
     * Update specific properties of contract
     * @param {object} data contract json object to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    DataManager.prototype.updateContract = function (data, callback) {
        var options = {
            'action': 'update_contract'
        };
        $.extend(options, {
            'params': JSON.stringify(data)
        });
        return jQuery.post(this._serverUrl, options, function (result) {
            console.log('updateContract(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    return DataManager;
})();
//# sourceMappingURL=f3mm_data_manager.js.map