/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../dal/f3mm_base_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/**
 * Created by zshaikh on 11/19/2015.
 * -
 * Dependencies:
 * - f3mm_base_dal.ts
 * - f3mm_contract_dal.ts
 * - f3mm_common_dal.ts
 */
/**
 * IResult interface
 * - Restricts developer to only output data of type IResult
 */
interface IResult {
    data: any;
    status_code: number;
    status: string;
    message: string;
}


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
class CreateContractAPISuitelet {

    constructor(request: nlobjRequest, response: nlobjResponse) {
        this.main(request, response);
    }

    /**
     * entry point for api call
     * @param {nlobjRequest} request request object to get information about incoming request
     * @param {nlobjResponse} response response object to write information to outgoing request
     * @returns {void}
     */
    main(request: nlobjRequest, response: nlobjResponse) {

        F3.Util.Utility.logDebug('CreateContractAPISuitelet.main();', null);
        var mainRequestTimer = F3.Util.StopWatch.start('CreateContractAPISuitelet.main();');

        var action = request.getParameter('action');
        var params = request.getParameter('params');
        var callback = request.getParameter('callback');

        if (!!params) {
            params = JSON.parse(params);
        }

        F3.Util.Utility.logDebug('CreateContractAPISuitelet.main(); // action = ', action);
        F3.Util.Utility.logDebug('CreateContractAPISuitelet.main(); // params = ', JSON.stringify(params));

        var result: IResult = this.executeAction(action, params);
        var json = JSON.stringify(result);
        F3.Util.Utility.logDebug('Response: ', json);

        if (!!callback) {
            json = callback + '(' + json + ')';
        }

        response.setContentType('JSON');
        response.writeLine(json);

        mainRequestTimer.stop();
    }

    /**
     * Responsible for executing action
     * @param {string} action the string representation of action to execute
     * @param {object} params json representation of params object to pass to executing action
     * @returns {IResult} returns json representation of result of executed action
     */
    private executeAction(action: string, params: {}): IResult {

        var commonDAL = new CommonDAL();
        var contractDAL = new ContractDAL();

        var result: IResult = {
            data: null,
            status_code: 200,
            status: 'OK',
            message: ''
        };

        try {

            var executedActionResult = null;
            var actionExecuted = true;

            switch (action) {
                case 'get_customers':
                    executedActionResult = commonDAL.getCustomers(params);
                    break;
                case 'get_contacts':
                    executedActionResult = commonDAL.getContacts(params);
                    break;
                case 'get_vendors':
                    executedActionResult = commonDAL.getVendors(params);
                    break;
                case 'get_departments':
                    executedActionResult = commonDAL.getDepartments(params);
                    break;
                case 'get_employees':
                    executedActionResult = commonDAL.getEmployees(params);
                    break;
                case 'get_pricelevels':
                    executedActionResult = commonDAL.getPriceLevels(params);
                    break;
                case 'get_taxcodes':
                    executedActionResult = commonDAL.getTaxItems(params);
                    break;
                case 'get_items':
                    executedActionResult = commonDAL.getItems(params);
                    break;
                case 'generate_quote':
                    executedActionResult = contractDAL.generateQuote(params);
                    break;
                case 'submit':
                    executedActionResult = contractDAL.updateOrCreate(params);
                    break;
                default:
                    actionExecuted = false;
                    break;
            }

            if (actionExecuted === true) {
                result.data = executedActionResult;
                result.status_code = 200;
                result.status = 'OK';
                result.message = 'success';
            } else {
                result.status_code = 400;
                result.status = 'Bad Request';
                result.message = "invalid parameters";
            }

        } catch (ex) {
            F3.Util.Utility.logException('CreateContractAPISuitelet.executeAction();', ex.toString());

            result.status_code = 500;
            result.status = 'Internal server error';
            result.message = ex.toString();
        }

        return result;
    }
}

/**
 * This is the main entry point for CreateContractAPI suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function CreateContractAPISuiteletMain(request, response) {
    return new CreateContractAPISuitelet(request, response);
}