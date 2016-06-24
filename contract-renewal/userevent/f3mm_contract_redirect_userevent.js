/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/**
 * Created by zshaikh on 2/19/2016.
 */
/**
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var ContractRedirect = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        beforeLoad: function (type, form, request) {
            // TODO: Write Your code here
            var context = nlapiGetContext();
            var execContext = context.getExecutionContext();
            if (execContext === "userinterface") {
                var scriptId = "customscript_f3mm_create_contract_ui_st";
                var deploymentId = "customdeploy_f3mm_create_contract_ui_st";
                var contractId = request.getParameter("id");
                var isEditing = request.getParameter("e");
                nlapiSetRedirectURL("SUITELET", scriptId, deploymentId, null, {
                    cid: contractId,
                    edit: isEditing
                });
            }
        },
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit
         *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF)
         *                      markcomplete (Call, Task)
         *                      reassign (Case)
         *                      editforecast (Opp, Estimate)
         * @returns {Void}
         */
        beforeSubmit: function (type) {
            // TODO: Write Your code here
        },
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit,
         *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF only)
         *                      dropship, specialorder, orderitems (PO only)
         *                      paybills (vendor payments)
         * @returns {Void}
         */
        afterSubmit: function (type) {
            // TODO: Write Your code here
        }
    };
})();
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function ContractRedirectBeforeLoad(type, form, request) {
    return ContractRedirect.beforeLoad(type.toString(), form, request);
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function ContractRedirectBeforeSubmit(type) {
    return ContractRedirect.beforeSubmit(type.toString());
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function ContractRedirectAfterSubmit(type) {
    return ContractRedirect.afterSubmit(type.toString());
}
//# sourceMappingURL=f3mm_contract_redirect_userevent.js.map