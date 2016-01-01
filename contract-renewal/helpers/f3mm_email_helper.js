/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="./f3mm_config.ts" />
/**
 * Created by zshaikh on 31/12/2015.
 */
var EmailHelper = (function () {
    function EmailHelper() {
    }
    EmailHelper.sendQuoteGenerationEmail = function (contract, quoteId) {
        try {
            // TODO : need to fill email body with quote information
            // let quote = nlapiLoadRecord("estimate", quoteId);
            var fields = this._contractDAL.fields;
            var customerId = contract[fields.customer.id].value;
            var contractNumber = contract[fields.contractNumber.id];
            if (!!customerId) {
                var subject = "Quote # " + quoteId + " has been generated from Contract # " + contractNumber + ".";
                var body = "blah blah blah";
                F3.Util.Utility.logDebug("Email sending...", subject);
                nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, subject, body);
                F3.Util.Utility.logDebug("Email sent", "Email sent to customer id: " + customerId);
            }
        }
        catch (e) {
            F3.Util.Utility.logException("Error in getting email", e.toString());
        }
    };
    EmailHelper.sendExpiredEmail = function (contract) {
        try {
            var fields = this._contractDAL.fields;
            var customerId = contract[fields.customer.id].value;
            var contractNumber = contract[fields.contractNumber.id];
            if (!!customerId) {
                var subject = "Contract # " + contractNumber + " has been expired.";
                var body = "blah blah blah";
                F3.Util.Utility.logDebug("Email sending...", subject);
                nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, subject, body);
                F3.Util.Utility.logDebug("Email sent", "Email sent to customer id: " + customerId);
            }
        }
        catch (e) {
            F3.Util.Utility.logException("Error in getting email", e.toString());
        }
    };
    EmailHelper.sendReminderEmail = function (contract, daysRemaining) {
        try {
            var fields = this._contractDAL.fields;
            var customerId = contract[fields.customer.id].value;
            var contractNumber = contract[fields.contractNumber.id];
            if (!!customerId) {
                var subject = "Contract # " + contractNumber + " is expiring after " + daysRemaining + " days";
                var body = "blah blah blah";
                F3.Util.Utility.logDebug("Email sending...", subject);
                nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, subject, body);
                F3.Util.Utility.logDebug("Email sent", "Email sent to customer id: " + customerId);
            }
        }
        catch (e) {
            F3.Util.Utility.logException("Error in getting email", e.toString());
        }
    };
    EmailHelper._contractDAL = new ContractDAL();
    return EmailHelper;
})();
//# sourceMappingURL=f3mm_email_helper.js.map