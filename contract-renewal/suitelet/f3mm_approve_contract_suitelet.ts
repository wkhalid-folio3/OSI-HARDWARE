/**
 * Created by zshaikh on 30/12/2015.
 */

class ApproveContractSuitelet {
    constructor(request: nlobjRequest, response: nlobjResponse) {
        this.main(request, response);
    }

    /**
     * main method
     */
    public main(request: nlobjRequest, response: nlobjResponse) {
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "Start");

        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "End");

    }
}

/**
 * This is the main entry point for ListContractsUISuitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function ApproveContractSuiteletMain(request, response) {
    return new ApproveContractSuitelet(request, response);
}
