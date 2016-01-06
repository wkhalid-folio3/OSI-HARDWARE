/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../helpers/f3mm_email_helper.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />

/**
 * Created by zshaikh on 29/12/2015.
 */

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

    private scheduled(args: any) {
        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "START");

        let today = new Date();
        let params = {
            // end_date: nlapiDateToString(today),
            // end_date_criterion: "onorafter",
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
                        EmailHelper.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (contract.custrecord_f3mm_notif_5days_prior === "T") {
                    if (daysRemaining === 5) {
                        EmailHelper.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (contract.custrecord_f3mm_notif_3days_prior === "T") {
                    if (daysRemaining === 3) {
                        EmailHelper.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (contract.custrecord_f3mm_notif_1day_prior === "T") {
                    if (daysRemaining === 1) {
                        EmailHelper.sendReminderEmail(contract, daysRemaining);
                    }
                }

                if (daysRemaining <= 0) {
                    let fields = this._contractDAL.fields;
                    let record: any = {};
                    record.id = contract.id;
                    record[fields.status.id] = ContractStatus.EXPIRED;
                    let contractId = this._contractDAL.upsert(record);
                    F3.Util.Utility.logDebug("contract expired: ", contractId);

                    if (contract.custrecord_f3mm_notif_on_expiration === "T") {
                        EmailHelper.sendExpiredEmail(contract);
                    }
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
