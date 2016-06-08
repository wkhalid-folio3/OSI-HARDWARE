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
            var primaryContactId = contract[fields.primaryContact.id].value;
            var salesRepId = contract[fields.salesRep.id].value;
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_RENEWAL, primaryContactId, null, {
                    from: salesRepId
                });
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendRenewEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // END", null);
    };
    EmailHelper.sendQuoteApprovalEmail = function (contract, quoteId) {
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalEmail(); // contract:", JSON.stringify(contract));
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalEmail(); // quoteId:", quoteId);
        try {
            var fields = this._contractDAL.fields;
            var emailEnabled = contract[fields.notificationOnQuoteApproval.id] === "T";
            var primaryContactId = contract[fields.primaryContact.id].value;
            var salesRepId = contract[fields.salesRep.id].value;
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.QUOTE_APPROVAL, primaryContactId, quoteId, {
                    from: salesRepId
                });
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendQuoteApprovalEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalEmail(); // END", null);
    };
    EmailHelper.sendQuoteApprovalByCustomerEmail = function (contract, quoteId) {
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalByCustomerEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalByCustomerEmail(); // contract:", JSON.stringify(contract));
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalByCustomerEmail(); // quoteId:", quoteId);
        try {
            var fields = this._contractDAL.fields;
            // let emailEnabled = contract[fields.notificationOnQuoteApproval.id] === "T";
            var salesRepId = contract[fields.salesRep.id].value;
            // if (emailEnabled === true) {
            this.sendEmail(contract, ContractNotificationType.QUOTE_APPROVAL_BY_CUSTOMER, salesRepId, quoteId);
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendQuoteApprovalByCustomerEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteApprovalByCustomerEmail(); // END", null);
    };
    EmailHelper.sendQuoteGenerationEmail = function (contract, quoteId) {
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // contract:", JSON.stringify(contract));
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // quoteId:", quoteId);
        try {
            var fields = this._contractDAL.fields;
            var emailEnabled = contract[fields.notificationOnQuoteGenerate.id] === "T";
            var salesRepId = contract[fields.salesRep.id].value;
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.QUOTE_GENERATION, salesRepId, quoteId);
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
            var primaryContactId = contract[fields.primaryContact.id].value;
            var salesRepId = contract[fields.salesRep.id].value;
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_EXPIRATION, primaryContactId, null, {
                    from: salesRepId
                });
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendExpiredEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // END", null);
    };
    EmailHelper.sendReminderEmail = function (contract, daysRemaining, isCustom, quoteId) {
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // contract:", JSON.stringify(contract));
        try {
            var fields = this._contractDAL.fields;
            var salesRepId = contract[fields.salesRep.id].value;
            var primaryContactId = contract[fields.primaryContact.id].value;
            if (isCustom === true) {
                this.sendEmail(contract, ContractNotificationType.QUOTE_GENERATION, salesRepId, quoteId);
            }
            else {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_REMINDER, primaryContactId, null, {
                    from: salesRepId
                });
            }
        }
        catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendReminderEmail();", e.toString());
        }
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // END", null);
    };
    EmailHelper.sendEmail = function (contract, type, to, quoteId, options) {
        var fields = this._contractDAL.fields;
        var vendorId = contract[fields.contractVendor.id].value;
        options = options || {};
        if (!!to) {
            var quotePdf = null;
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
                quotePdf = nlapiPrintRecord("TRANSACTION", quoteId, "PDF");
            }
            var mergeResult = emailMerger.merge();
            var emailSubject = mergeResult.getSubject();
            var emailBody = mergeResult.getBody();
            nlapiSendEmail(options.from || Config.FROM_EMAIL_ID, to, emailSubject, emailBody, null, null, null, quotePdf);
            F3.Util.Utility.logDebug("Email sent", "Email sent to customer id: " + to);
        }
    };
    EmailHelper._contractDAL = new ContractDAL();
    EmailHelper._commonDAL = new CommonDAL();
    return EmailHelper;
}());
//# sourceMappingURL=f3mm_email_helper.js.map