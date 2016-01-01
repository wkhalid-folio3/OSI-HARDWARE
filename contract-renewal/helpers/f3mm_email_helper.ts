/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="./f3mm_config.ts" />

/**
 * Created by zshaikh on 31/12/2015.
 */

class EmailHelper {

    private static _contractDAL: ContractDAL = new ContractDAL();

    public static sendQuoteGenerationEmail(contract: any, quoteId: string) {

        try {
            // TODO : need to fill email body with quote information
            // let quote = nlapiLoadRecord("estimate", quoteId);
            let fields = this._contractDAL.fields;
            let customerId = contract[fields.customer.id].value;
            let contractNumber = contract[fields.contractNumber.id];
            if (!!customerId ) {

                let subject = `Quote # ${quoteId} has been generated from Contract # ${contractNumber}.`;
                let body = `blah blah blah`;

                F3.Util.Utility.logDebug("Email sending...", subject);
                nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, subject, body);
                F3.Util.Utility.logDebug("Email sent", `Email sent to customer id: ${customerId}`);
            }

        } catch (e) {
            F3.Util.Utility.logException("Error in getting email", e.toString());
        }
    }

    public static sendExpiredEmail(contract: any) {

        try {
            let fields = this._contractDAL.fields;
            let customerId = contract[fields.customer.id].value;
            let contractNumber = contract[fields.contractNumber.id];
            if (!!customerId ) {

                let subject = `Contract # ${contractNumber} has been expired.`;
                let body = `blah blah blah`;

                F3.Util.Utility.logDebug("Email sending...", subject);
                nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, subject, body);
                F3.Util.Utility.logDebug("Email sent", `Email sent to customer id: ${customerId}`);
            }

        } catch (e) {
            F3.Util.Utility.logException("Error in getting email", e.toString());
        }
    }

    public static sendReminderEmail(contract: any, daysRemaining: number) {

        try {
            let fields = this._contractDAL.fields;
            let customerId = contract[fields.customer.id].value;
            let contractNumber = contract[fields.contractNumber.id];
            if (!!customerId) {

                let subject = `Contract # ${contractNumber} is expiring after ${daysRemaining} days`;
                let body = `blah blah blah`;

                F3.Util.Utility.logDebug("Email sending...", subject);
                nlapiSendEmail(Config.FROM_EMAIL_ID, customerId, subject, body);
                F3.Util.Utility.logDebug("Email sent", `Email sent to customer id: ${customerId}`);
            }

        } catch (e) {
            F3.Util.Utility.logException("Error in getting email", e.toString());
        }
    }
}
