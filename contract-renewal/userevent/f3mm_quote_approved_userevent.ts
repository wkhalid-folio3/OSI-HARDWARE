/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../helpers/f3mm_email_helper.ts" />

/// <reference path="../suitelet/f3mm_base_ui_suitelet.ts" />

/**
 * Created by zshaikh on 2/19/2016.
 */

/**
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
let QuoteApproved = (() => {
    return {

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

            let recordId = nlapiGetRecordId();
            let recordType = nlapiGetRecordType();
            let newRecord = nlapiGetNewRecord();
            let oldRecord = nlapiGetOldRecord();

            nlapiLogExecution("DEBUG", "QuoteApproved.afterSubmit", "STARTED");

            if (type === "create" || type === "edit" || type === "xedit") {

                try {
                    let newStatus = newRecord.getFieldValue("custbody_f3mm_quote_status");
                    let oldStatus = oldRecord.getFieldValue("custbody_f3mm_quote_status");
                    let contractId = newRecord.getFieldValue("custbody_f3mm_quote_contract");
                    let quoteId = newRecord.getFieldValue("internalid");

                    // make sure they are changed
                    if (newStatus !== oldStatus) {

                        // make sure it is approved
                        if (newStatus === "3") {

                            let contractsDAL = new ContractDAL();
                            let contract = contractsDAL.getWithDetails(contractId);
                            EmailHelper.sendQuoteApprovalEmail(contract, quoteId);
                        }
                    }

                } catch (ex) {
                    nlapiLogExecution("ERROR", "Unexpected Error", ex.toString());
                }

            }

            nlapiLogExecution("DEBUG", "QuoteApproved.afterSubmit", "ENDED");
        },

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
function QuoteApprovedBeforeLoad(type, form, request) {
    return QuoteApproved.beforeLoad(type.toString(), form, request);
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
function QuoteApprovedBeforeSubmit(type) {
    return QuoteApproved.beforeSubmit(type.toString());
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
function QuoteApprovedAfterSubmit(type) {
    return QuoteApproved.afterSubmit(type.toString());
}
