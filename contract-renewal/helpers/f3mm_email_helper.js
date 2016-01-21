/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="./f3mm_config.ts" />
/**
 * Created by zshaikh on 31/12/2015.
 */
var EmailHelper = (function () {
    function EmailHelper() {
    }
    EmailHelper.sendRenewEmail = function (contract) {
        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // contract:", JSON.stringify(contract));
        try {
            // TODO : need to fill email body with quote information
            // let quote = nlapiLoadRecord("estimate", quoteId);
            var fields = this._contractDAL.fields;
            var emailEnabled = contract[fields.notificationOnRenewal.id] === "T";
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_RENEWAL);
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendRenewEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // END", null);
    };
    EmailHelper.sendQuoteGenerationEmail = function (contract, quoteId) {
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // contract:", JSON.stringify(contract));
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // quoteId:", quoteId);
        try {
            var fields = this._contractDAL.fields;
            var emailEnabled = contract[fields.notificationOnQuoteGenerate.id] === "T";
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.QUOTE_GENERATION, quoteId);
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendQuoteGenerationEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // END", null);
    };
    EmailHelper.sendExpiredEmail = function (contract) {
        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // contract:", JSON.stringify(contract));
        try {
            var fields = this._contractDAL.fields;
            var emailEnabled = contract[fields.notificationOnExpiration.id] === "T";
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_EXPIRATION);
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendExpiredEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // END", null);
    };
    EmailHelper.sendReminderEmail = function (contract, daysRemaining) {
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // contract:", JSON.stringify(contract));
        try {
            this.sendEmail(contract, ContractNotificationType.CONTRACT_REMINDER);
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendReminderEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // END", null);
    };
    EmailHelper.sendEmail = function (contract, type, quoteId) {
        var fields = this._contractDAL.fields;
        var customerId = contract[fields.customer.id].value;
        var vendorId = contract[fields.contractVendor.id].value;
        if (!!customerId) {
            var templateMapping = this._commonDAL.getEmailTemplate(type, vendorId)[0];
            if (!templateMapping) {
                templateMapping = this._commonDAL.getDefaultEmailTemplate(type)[0];
            }
            F3.Util.Utility.logDebug("Email sending...", JSON.stringify(templateMapping));
            var emailMerger = nlapiCreateEmailMerger(templateMapping.custrecord_f3mm_template.value);
            // setting custom record in email merge
            emailMerger.setCustomRecord("customrecord_f3mm_contract", contract.id);
            if (!!quoteId) {
                emailMerger.setTransaction(quoteId);
            }
            var mergeResult = emailMerger.merge();
            var emailSubject = mergeResult.getSubject();
            var emailBody = mergeResult.getBody();
            nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, emailSubject, emailBody);
            F3.Util.Utility.logDebug("Email sent", "Email sent to customer id: " + customerId);
        }
    };
    EmailHelper._contractDAL = new ContractDAL();
    EmailHelper._commonDAL = new CommonDAL();
    return EmailHelper;
})();
//# sourceMappingURL=f3mm_email_helper.js.map