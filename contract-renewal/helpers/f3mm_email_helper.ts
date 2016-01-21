/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="./f3mm_config.ts" />

/**
 * Created by zshaikh on 31/12/2015.
 */

class EmailHelper {

    private static _contractDAL: ContractDAL = new ContractDAL();
    private static _commonDAL: CommonDAL = new CommonDAL();

    public static sendRenewEmail(contract: any) {
        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // contract:", JSON.stringify(contract));

        try {
            // TODO : need to fill email body with quote information
            // let quote = nlapiLoadRecord("estimate", quoteId);
            let fields = this._contractDAL.fields;
            let emailEnabled = contract[fields.notificationOnRenewal.id] === "T";

            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_RENEWAL);
            }

        } catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendRenewEmail();", e.toString());
        }

        F3.Util.Utility.logDebug("EmailHelper.sendRenewEmail(); // END", null);
    }

    public static sendQuoteGenerationEmail(contract: any, quoteId: string) {
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // contract:", JSON.stringify(contract));
        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // quoteId:", quoteId);

        try {
            let fields = this._contractDAL.fields;
            let emailEnabled = contract[fields.notificationOnQuoteGenerate.id] === "T";

            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.QUOTE_GENERATION, quoteId);
            }

        } catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendQuoteGenerationEmail();", e.toString());
        }

        F3.Util.Utility.logDebug("EmailHelper.sendQuoteGenerationEmail(); // END", null);
    }

    public static sendExpiredEmail(contract: any) {
        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // contract:", JSON.stringify(contract));

        try {
            let fields = this._contractDAL.fields;
            let emailEnabled = contract[fields.notificationOnExpiration.id] === "T";
            if (emailEnabled === true) {
                this.sendEmail(contract, ContractNotificationType.CONTRACT_EXPIRATION);
            }
        } catch (e) {
            F3.Util.Utility.logException("EmailHelper.sendExpiredEmail();", e.toString());
        }

        F3.Util.Utility.logDebug("EmailHelper.sendExpiredEmail(); // END", null);
    }

    public static sendReminderEmail(contract: any, daysRemaining: number) {
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // START", null);
        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // contract:", JSON.stringify(contract));

        try {
            this.sendEmail(contract, ContractNotificationType.CONTRACT_REMINDER);
        } catch (e) {

            F3.Util.Utility.logException("EmailHelper.sendReminderEmail();", e.toString());
        }

        F3.Util.Utility.logDebug("EmailHelper.sendReminderEmail(); // END", null);
    }

    private static sendEmail(contract: any, type: ContractNotificationType, quoteId?) {
        let fields = this._contractDAL.fields;
        let customerId = contract[fields.customer.id].value;
        let vendorId = contract[fields.contractVendor.id].value;

        if (!!customerId) {
            let templateMapping = this._commonDAL.getEmailTemplate(type, vendorId)[0];

            if (!templateMapping) {
                templateMapping = this._commonDAL.getDefaultEmailTemplate(type)[0];
            }

            F3.Util.Utility.logDebug("Email sending...", JSON.stringify(templateMapping));
            let emailMerger = nlapiCreateEmailMerger(templateMapping.custrecord_f3mm_template.value);

            // setting custom record in email merge
            emailMerger.setCustomRecord("customrecord_f3mm_contract", contract.id);
            if (!!quoteId) {
                emailMerger.setTransaction(quoteId);
            }

            let mergeResult = emailMerger.merge();
            let emailSubject = mergeResult.getSubject();
            let emailBody = mergeResult.getBody();
            nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, emailSubject, emailBody);
            F3.Util.Utility.logDebug("Email sent", `Email sent to customer id: ${customerId}`);
        }
    }
}
