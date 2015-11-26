/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/es6-promise.d.ts" />
/**
 * Created by zshaikh on 11/19/2015.
 */
var DataManager = (function () {
    function DataManager(type) {
        this._serverUrl = null;
        this._type = type;
    }
    DataManager.prototype.getServerUrl = function () {
        if (!this._serverUrl) {
            this._serverUrl = window.apiSuiteletUrl;
            this._serverUrl += '&type=' + this._type; // append type
        }
        return this._serverUrl;
    };
    DataManager.prototype.getVendorsFromServer = function (callback) {
        var suiteletUrl = this.getServerUrl();
        return jQuery.get(suiteletUrl, { 'action': 'get_vendors' }, function (result) {
            console.log('getPartners(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    DataManager.prototype.getEmployeesFromServer = function (callback) {
        var suiteletUrl = this.getServerUrl();
        return jQuery.get(suiteletUrl, { 'action': 'get_employees' }, function (result) {
            console.log('get_employees(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    DataManager.prototype.getDepartmentFromServer = function (callback) {
        var suiteletUrl = this.getServerUrl();
        return jQuery.get(suiteletUrl, { 'action': 'get_departments' }, function (result) {
            console.log('get_departments(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    DataManager.prototype.getPriceLevelsFromServer = function (callback) {
        var suiteletUrl = this.getServerUrl();
        return jQuery.get(suiteletUrl, { 'action': 'get_pricelevels' }, function (result) {
            console.log('get_departments(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    /**
     * Description of method DataManager
     * @param parameter
     */
    DataManager.prototype.getItems = function (params, callback) {
        try {
            var suiteletUrl = this.getServerUrl();
            var options = {
                'action': 'get_items'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(suiteletUrl, options, function (result) {
                console.log('getItems(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());
            callback && callback(null);
        }
    };
    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    DataManager.prototype.getVendors = function (callback) {
        var cacheKey = 'partners';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getVendorsFromServer(function (data) {
                $.jStorage.set(cacheKey, data);
                callback && callback(data);
            });
        }
    };
    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    DataManager.prototype.getEmployees = function (callback) {
        var cacheKey = 'employees';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getEmployeesFromServer(function (data) {
                $.jStorage.set(cacheKey, data);
                callback && callback(data);
            });
        }
    };
    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    DataManager.prototype.getPriceLevels = function (callback) {
        var cacheKey = 'price_levels';
        var data = $.jStorage.get(cacheKey);
        if (!!data) {
            var promise = new Promise(function (resolve, reject) {
                resolve(data);
            });
            callback && callback(data);
            return promise;
        }
        else {
            return this.getPriceLevelsFromServer(function (data) {
                $.jStorage.set(cacheKey, data);
                callback && callback(data);
            });
        }
    };
    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
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
                $.jStorage.set(cacheKey, data);
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
            var suiteletUrl = this.getServerUrl();
            var options = {
                'action': 'get_contacts'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(suiteletUrl, options, function (result) {
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
     * Description of method DataManager
     * @param parameter
     */
    DataManager.prototype.getCustomers = function (params, callback) {
        try {
            var suiteletUrl = this.getServerUrl();
            var options = {
                'action': 'get_customers'
            };
            var filters = {
                'params': JSON.stringify(params)
            };
            $.extend(options, filters);
            return jQuery.get(suiteletUrl, options, function (result) {
                console.log('getCustomers(); // jquery complete: ', arguments);
                callback && callback(result);
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());
            callback && callback(null);
        }
    };
    DataManager.prototype.submit = function (data, callback) {
        var suiteletUrl = this.getServerUrl();
        var options = {
            'action': 'submit'
        };
        $.extend(options, { 'params': JSON.stringify(data) });
        return jQuery.post(suiteletUrl, options, function (result) {
            console.log('submit(); // jquery complete: ', arguments);
            callback && callback(result);
        });
    };
    return DataManager;
})();
//# sourceMappingURL=f3mm-data-manager.js.map