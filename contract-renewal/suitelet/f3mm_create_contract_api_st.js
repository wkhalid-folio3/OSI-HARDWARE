/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../dal/BaseTypeDAL.ts" />
/// <reference path="../dal/ContractDAL.ts" />
/// <reference path="../dal/CommonDAL.ts" />
/**
 * This class is responsible for handling all REST API calls
 * Following are the operations performed by this class:
 *  - Create / Update Contract
 *  - Generate Quote from Contract
 *  - Get Customers
 *  - Get Contacts
 *  - Get Vendors
 *  - Get Departments
 *  - Get Employees
 *  - Get Price Levels
 *  - Get Tax Items
 *  - Get Items (Inventory Item / Assembly Item / Kit Package / Group Item)
 */
var CreateContractAPISuitelet = (function () {
    function CreateContractAPISuitelet(request, response) {
        this.main(request, response);
    }
    /**
     * entry point for api call
     * @param {nlobjRequest} request request object to get information about incoming request
     * @param {nlobjResponse} response response object to write information to outgoing request
     * @returns {void}
     */
    CreateContractAPISuitelet.prototype.main = function (request, response) {
        F3.Util.Utility.logDebug('CreateContractAPISuitelet.main();', null);
        var mainRequestTimer = F3.Util.StopWatch.start('F3_PPT_API_Suitelet.main();');
        var action = request.getParameter('action');
        var params = request.getParameter('params');
        var callback = request.getParameter('callback');
        if (!!params) {
            params = JSON.parse(params);
        }
        F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main(); // action = ', action);
        F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main(); // params = ', JSON.stringify(params));
        var result = this.executionAction(action, params);
        var json = JSON.stringify(result);
        F3.Util.Utility.logDebug('Response: ', json);
        if (!!callback) {
            json = callback + '(' + json + ')';
        }
        response.setContentType('JSON');
        response.writeLine(json);
        mainRequestTimer.stop();
    };
    /**
     * Responsing for executing action
     * @param {string} action the string representation of action to execute
     * @param {object} params json represntation of params object to pass to executing action
     * @returns {IResult} returns json representation of result of executed action
     */
    CreateContractAPISuitelet.prototype.executionAction = function (action, params) {
        var commonDAL = new CommonDAL();
        var contractDAL = new ContractDAL();
        var result = {
            data: null,
            status_code: 200,
            status: 'OK',
            message: ''
        };
        try {
            if (action === 'get_customers') {
                var customers = commonDAL.getCustomers(params);
                result.data = customers;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_contacts') {
                var contacts = commonDAL.getContacts(params);
                result.data = contacts;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_vendors') {
                var vendors = commonDAL.getVendors(params);
                result.data = vendors;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_departments') {
                var departments = commonDAL.getDepartments(params);
                result.data = departments;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_employees') {
                var employees = commonDAL.getEmployees(params);
                result.data = employees;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_pricelevels') {
                var priceLevels = commonDAL.getPriceLevels(params);
                result.data = priceLevels;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_taxcodes') {
                var taxCodes = commonDAL.getTaxItems(params);
                result.data = taxCodes;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'get_items') {
                var items = commonDAL.getItems(params);
                result.data = items;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'generate_quote') {
                var quote = contractDAL.generateQuote(params);
                result.data = quote;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else if (action === 'submit') {
                var record = contractDAL.updateOrCreate(params);
                result.data = record;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            }
            else {
                result.status_code = 400;
                result.status = 'Bad Request';
                result.message = "invalid parameters";
            }
        }
        catch (ex) {
            F3.Util.Utility.logException('F3_PPT_API_Suitelet.main();', ex.toString());
            result.status_code = 500;
            result.status = 'Internal server error';
            result.message = ex.toString();
        }
        return result;
    };
    return CreateContractAPISuitelet;
})();
/**
 * This is the main entry point for CreateContractAPI suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function CreateContractAPISuiteletMain(request, response) {
    return new CreateContractAPISuitelet(request, response);
}
//# sourceMappingURL=f3mm_create_contract_api_st.js.map