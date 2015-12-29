/**
 * Created by zshaikh on 29/12/2015.
 */
var ContractScheduled = (function () {
    function ContractScheduled(args) {
        this.scheduled(args);
    }
    ContractScheduled.prototype.dateDifference = function (date1, date2) {
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    };
    ContractScheduled.prototype.scheduled = function (args) {
        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "START");
        var today = new Date();
        var contractDAL = new ContractDAL();
        var params = {
            end_date: nlapiDateToString(today),
            status: [1, 2, 3]
        };
        var contracts = contractDAL.search(params).records;
        for (var i in contracts) {
            if (contracts.hasOwnProperty(i)) {
                var contract = contracts[i];
                var contractEndDate = nlapiStringToDate(contract.custrecord_f3mm_end_date);
                var daysRemaining = this.dateDifference(contractEndDate, today);
                if (!!contract.custrecord_f3mm_notif_days_prior) {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_days_prior, 10)) {
                    }
                }
                if (contract.custrecord_f3mm_notif_5days_prior === "T") {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_5days_prior, 10)) {
                    }
                }
                if (contract.custrecord_f3mm_notif_3days_prior === "T") {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_3days_prior, 10)) {
                    }
                }
                if (contract.custrecord_f3mm_notif_1day_prior === "T") {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_1day_prior, 10)) {
                    }
                }
                if (daysRemaining === 0) {
                }
                F3.Util.Utility.logDebug("contract: ", JSON.stringify(contract));
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