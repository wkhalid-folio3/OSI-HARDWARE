/**
 * Created by zshaikh on 29/12/2015.
 */

class ContractScheduled {

    constructor(args: any) {
        this.scheduled(args);
    }

    private dateDifference(date1, date2){
        let timeDiff = Math.abs(date2.getTime() - date1.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    }

    private scheduled(args: any) {
        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "START");

        let today = new Date();
        let contractDAL: ContractDAL = new ContractDAL();
        let params = {
            end_date: nlapiDateToString(today),
            status: [1, 2, 3]
        };
        let contracts = contractDAL.search(params).records;
        for (let i in contracts) {
            if (contracts.hasOwnProperty(i)) {
                let contract = contracts[i];
                let contractEndDate = nlapiStringToDate(contract.custrecord_f3mm_end_date);
                let daysRemaining = this.dateDifference(contractEndDate, today);

                if (!!contract.custrecord_f3mm_notif_days_prior) {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_days_prior, 10)) {
                        // TODO : send email here
                    }
                }

                if (contract.custrecord_f3mm_notif_5days_prior === "T") {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_5days_prior, 10)) {
                        // TODO : send email here
                    }
                }

                if (contract.custrecord_f3mm_notif_3days_prior === "T") {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_3days_prior, 10)) {
                        // TODO : send email here
                    }
                }

                if (contract.custrecord_f3mm_notif_1day_prior === "T") {
                    if (daysRemaining === parseInt(contract.custrecord_f3mm_notif_1day_prior, 10)) {
                        // TODO : send email here
                    }
                }

                if (daysRemaining === 0) {
                    // TODO : expire contract
                    // TODO : send expiration email
                }

                F3.Util.Utility.logDebug("contract: ", JSON.stringify(contract));
            }
        }

        F3.Util.Utility.logDebug("ContractScheduled.scheduled()", "END");
        return contracts;
    }
}

function ContractScheduledMain(args) {
    return new ContractScheduled(args);
}
