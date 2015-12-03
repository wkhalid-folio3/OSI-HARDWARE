/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../dal/BaseTypeDAL.ts" />
/// <reference path="../dal/ContractDAL.ts" />
/// <reference path="../dal/CommonDAL.ts" />

/**
 * Created by zshaikh on 11/19/2015.
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * - BaseTypeDAL.ts
 * - ContractDAL.ts
 * - CommonDAL.ts
 */

interface ExecutableAction {
    (params: {}) : any;
}

class APIFactory {

    static getAction(action:string):ExecutableAction {

        var commonDAL = new CommonDAL();
        var contractDAL = new ContractDAL();
        var executableAction:ExecutableAction = null;

        if (action === 'get_customers') {
            executableAction = commonDAL.getCustomers;
        }
        else if (action === 'get_contacts') {
            executableAction = commonDAL.getContacts;
        }
        else if (action === 'get_vendors') {
            executableAction = commonDAL.getVendors;
        }
        else if (action === 'get_departments') {
            executableAction = commonDAL.getDepartments;
        }

        return executableAction;
    }
}