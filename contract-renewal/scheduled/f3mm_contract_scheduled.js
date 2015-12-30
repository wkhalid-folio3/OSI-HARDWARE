/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/**
 * Created by zshaikh on 29/12/2015.
 */
var ContractStatus;
(function (ContractStatus) {
    ContractStatus[ContractStatus["PENDING_REP_APPROVAL"] = 1] = "PENDING_REP_APPROVAL";
    ContractStatus[ContractStatus["PENDING_CUSTOMER_APPROVAL"] = 2] = "PENDING_CUSTOMER_APPROVAL";
    ContractStatus[ContractStatus["APPROVED"] = 3] = "APPROVED";
    ContractStatus[ContractStatus["EXPIRED"] = 4] = "EXPIRED";
    ContractStatus[ContractStatus["VOID"] = 5] = "VOID";
})(ContractStatus || (ContractStatus = {}));
var ContractScheduled = (function () {
    function ContractScheduled(args) {
        this._contractDAL = new ContractDAL();
        this.scheduled(args);
    }
    ContractScheduled.prototype.dateDifference = function (date1, date2) {
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    };
    ContractScheduled.prototype.sendExpiredEmail = function (contract) {
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
    ContractScheduled.prototype.sendReminderEmail = function (contract, daysRemaining) {
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
    ContractScheduled.prototype.scheduled = function (args) {
        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "START");
        var today = new Date();
        var params = {
            end_date: nlapiDateToString(today),
            end_date_criterion: "onorafter",
            status: [
                ContractStatus.PENDING_REP_APPROVAL,
                ContractStatus.PENDING_CUSTOMER_APPROVAL,
                ContractStatus.APPROVED
            ]
        };
        var contracts = this._contractDAL.search(params).records;
        for (var i in contracts) {
            if (contracts.hasOwnProperty(i)) {
                var contract = contracts[i];
                F3.Util.Utility.logDebug("contract: ", JSON.stringify(contract));
                var contractEndDate = nlapiStringToDate(contract.custrecord_f3mm_end_date);
                var daysRemaining = this.dateDifference(contractEndDate, today);
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
                    var fields = this._contractDAL.fields;
                    var record = {};
                    record.id = contract.id;
                    record[fields.status.id] = ContractStatus.EXPIRED;
                    var contractId = this._contractDAL.upsert(record);
                    F3.Util.Utility.logDebug("contract expired: ", contractId);
                    this.sendExpiredEmail(contract);
                }
            }
        }
        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "END");
        return contracts;
    };
    return ContractScheduled;
})();
function ContractScheduledMain(args) {
    return new ContractScheduled(args);
}
//# sourceMappingURL=f3mm_contract_scheduled.js.map