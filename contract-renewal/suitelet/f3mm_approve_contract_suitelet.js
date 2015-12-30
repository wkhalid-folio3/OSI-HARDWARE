/**
 * Created by zshaikh on 30/12/2015.
 */
var ApproveContractSuitelet = (function () {
    function ApproveContractSuitelet(request, response) {
        this.main(request, response);
    }
    /**
     * main method
     */
    ApproveContractSuitelet.prototype.main = function (request, response) {
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "Start");
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "End");
    };
    return ApproveContractSuitelet;
})();
/**
 * This is the main entry point for ListContractsUISuitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function ApproveContractSuiteletMain(request, response) {
    return new ApproveContractSuitelet(request, response);
}
//# sourceMappingURL=f3mm_approve_contract_suitelet.js.map