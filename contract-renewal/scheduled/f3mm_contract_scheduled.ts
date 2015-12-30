/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />

/**
 * Created by zshaikh on 29/12/2015.
 */
enum ContractStatus {
    PENDING_REP_APPROVAL = 1,
    PENDING_CUSTOMER_APPROVAL = 2,
    APPROVED = 3,
    EXPIRED = 4,
    VOID = 5,
}

class ContractScheduled {

    private _contractDAL: ContractDAL;

    constructor(args: any) {
        this._contractDAL = new ContractDAL();
        this.scheduled(args);
    }

    private dateDifference(date1, date2) {
        let timeDiff = Math.abs(date2.getTime() - date1.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    }

    private sendExpiredEmail(contract: any) {

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

    private sendReminderEmail(contract: any, daysRemaining: number) {

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

    private scheduled(args: any) {
        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "START");

        let today = new Date();
        let params = {
            end_date: nlapiDateToString(today),
            end_date_criterion: "onorafter",
            status: [
                ContractStatus.PENDING_REP_APPROVAL,
                ContractStatus.PENDING_CUSTOMER_APPROVAL,
                ContractStatus.APPROVED
            ]
        };
        let contracts = this._contractDAL.search(params).records;

        for (let i in contracts) {
            if (contracts.hasOwnProperty(i)) {
                let contract = contracts[i];
                F3.Util.Utility.logDebug("contract: ", JSON.stringify(contract));

                let contractEndDate = nlapiStringToDate(contract.custrecord_f3mm_end_date);
                let daysRemaining = this.dateDifference(contractEndDate, today);
                F3.Util.Utility.logDebug("contract days remaining: ", daysRemaining);

                if (!!contract.custrecord_f3mm_notif_days_prior) {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_days_prior, 10)) {
                        this.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (contract.custrecord_f3mm_notif_5days_prior === "T") {
                    if (daysRemaining === 5) {
                        this.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (contract.custrecord_f3mm_notif_3days_prior === "T") {
                    if (daysRemaining === 3) {
                        this.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (contract.custrecord_f3mm_notif_1day_prior === "T") {
                    if (daysRemaining === 1) {
                        this.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (daysRemaining <= 0) {
                    let fields = this._contractDAL.fields;
                    let record: any = {};
                    record.id = contract.id;
                    record[fields.status.id] = ContractStatus.EXPIRED;
                    let contractId = this._contractDAL.upsert(record);
                    F3.Util.Utility.logDebug("contract expired: ", contractId);

                    this.sendExpiredEmail(contract);
                }
            }
        }

        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "END");
        return contracts;
    }
}

function ContractScheduledMain(args) {
    return new ContractScheduled(args);
}
