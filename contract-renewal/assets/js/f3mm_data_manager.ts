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
class DataManager {

    private _serverUrl: string = null;
    private _viewType: string;
    private _cacheTime: number = 0;

    constructor(type: string) {
        this._viewType = type;

        var oneSecond = 1000;
        var oneMinute = 60 * oneSecond;
        var oneHour = 60 * oneMinute;
        var oneDay = oneHour * 24;
        this._cacheTime = oneDay;

        this._serverUrl = window.apiSuiteletUrl;
        this._serverUrl += '&type=' + this._viewType; // append type
    }

    /**
     * Get Vendors from server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    private getVendorsFromServer(callback) {

        var data = {
            'action': 'get_vendors'
        };
        return jQuery.get(this._serverUrl, data, (result) => {
            console.log('getVendorsFromServer(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }

    /**
     * Get Employees from server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    private getEmployeesFromServer(callback) {

        var data = {
            'action': 'get_employees'
        };
        return jQuery.get(this._serverUrl, data, (result) => {
            console.log('getEmployeesFromServer(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }

    /**
     * Get Departments from server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    private getDepartmentFromServer(callback) {

        var data = {
            'action': 'get_departments'
        };
        return jQuery.get(this._serverUrl, data, (result) => {
            console.log('getDepartmentFromServer(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }

    /**
     * Get tax codes from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    private getTaxCodesFromServer(params, callback) {

        var options = {
            'action': 'get_taxcodes'
        };

        var filters = {
            'params': JSON.stringify(params)
        };

        $.extend(options, filters);

        return jQuery.get(this._serverUrl, options, function(result) {
            console.log('getTaxCodesFromServer(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }

    /**
     * Get tax codes from cache or server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getTaxCodes(params, callback) {
        try {
            var cacheKey = 'taxcodes';
            var data = $.jStorage.get(cacheKey);

            if (!!data) {
                callback && callback(data);
            } else {
                return this.getTaxCodesFromServer(params, (data) => {

                    $.jStorage.set(cacheKey, data, {
                        TTL: this._cacheTime
                    });

                    callback && callback(data);
                });
            }

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getTaxCodes()', e.toString());

            callback && callback(null);
        }
    }



    /**
     * Search Contracts from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    searchContracts(params, callback) {
        try {

            var options = {
                'action': 'get_contracts'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(this._serverUrl, options).then((result) => {
                console.log('searchContracts(); // jquery complete: ', arguments);

                callback && callback(result);
                return result;
            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getItems()', e.toString());

            callback && callback(null);
        }
    }


    /**
     * Get Items from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getItems(params, callback) {
        try {

            var options = {
                'action': 'get_items'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(this._serverUrl, options, (result) => {
                console.log('getItems(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getItems()', e.toString());

            callback && callback(null);
        }
    }

    /**
     * Get Vendors from cache or server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getVendors(callback) {

        var cacheKey = 'vendors';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {
            callback && callback(data);
        } else {
            return this.getVendorsFromServer(function(data) {

                $.jStorage.set(cacheKey, data, {
                    TTL: this._cacheTime
                });

                callback && callback(data);
            });
        }

    }

    /**
     * Get Employees from cache or server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getEmployees(callback) {

        var cacheKey = 'employees';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {
            callback && callback(data);
        } else {
            return this.getEmployeesFromServer(function(data) {

                $.jStorage.set(cacheKey, data, {
                    TTL: this._cacheTime
                });

                callback && callback(data);
            });
        }

    }

    /**
     * Get Departments from cache or server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getDepartment(callback) {

        var cacheKey = 'departments';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {
            callback && callback(data);
            return data;
        } else {
            return this.getDepartmentFromServer(function(data) {

                $.jStorage.set(cacheKey, data, {
                    TTL: this._cacheTime
                });

                callback && callback(data);
            });
        }

    }

    /**
     * Description of method DataManager
     * @param parameter
     */
    getPrimaryContacts(params, callback) {
        try {

            var options = {
                'action': 'get_contacts'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(this._serverUrl, options, function(result) {
                console.log('getPrimaryContacts(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getPrimaryContacts()', e.toString());

            callback && callback(null);
        }
    }

    /**
     * Get Customers from server
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getCustomers(params, callback) {
        try {

            var options = {
                'action': 'get_customers'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(this._serverUrl, options, (result) => {
                console.log('getCustomers(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());

            callback && callback(null);
        }
    }

    /**
     * Get Price Levels from server for specific item id
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    getPriceLevels(params, callback) {
        try {

            var options = {
                'action': 'get_pricelevels'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(this._serverUrl, options, (result) => {
                console.log('getPriceLevels(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());

            callback && callback(null);
        }
    }

    /**
     * Generate Quote
     * @param {object} params parameters to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    generateQuote(params, callback) {
        try {

            var options = {
                'action': 'generate_quote'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(this._serverUrl, options, function(result) {
                console.log('generateQuote(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.generateQuote()', e.toString());

            callback && callback(null);
        }
    }

    /**
     * Submit contract information to server
     * @param {object} data contract json object to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    submit(data, callback) {

        var options = {
            'action': 'submit'
        };

        $.extend(options, {
            'params': JSON.stringify(data)
        });

        return jQuery.post(this._serverUrl, options, function(result) {
            console.log('submit(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }


    /**
     * Delete contract
     * @param {object} data contract json object to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    deleteContract(data, callback) {
        var options = {
            'action': 'delete_contract'
        };

        $.extend(options, {
            'params': JSON.stringify(data)
        });

        return jQuery.post(this._serverUrl, options, function(result) {
            console.log('deleteContract(); // jquery complete: ', arguments);

            callback && callback(result);

        });
    }


    /**
     * Update specific properties of contract
     * @param {object} data contract json object to pass to server
     * @param {function} callback callback function to receive data in
     * @returns {void}
     */
    updateContract(data, callback) {
        var options = {
            'action': 'update_contract'
        };

        $.extend(options, {
            'params': JSON.stringify(data)
        });

        return jQuery.post(this._serverUrl, options, function(result) {
            console.log('updateContract(); // jquery complete: ', arguments);

            callback && callback(result);

        });
    }
}