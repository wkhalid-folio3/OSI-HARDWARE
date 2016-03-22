/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../helpers/f3mm_contract_status_enum.ts" />
/// <reference path="./f3mm_list_contracts_ui_suitelet.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by zshaikh on 30/12/2015.
 */
var ApproveContractSuitelet = (function (_super) {
    __extends(ApproveContractSuitelet, _super);
    function ApproveContractSuitelet(request, response) {
        _super.call(this, request, response);
        this.main(request, response);
    }
    /**
     * main method
     */
    ApproveContractSuitelet.prototype.main = function (request, response) {
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "Start");
        try {
            var standaloneParam = request.getParameter("standalone");
            var standalone = standaloneParam === "T" || standaloneParam === "1";
            var standaloneClass = (standalone ? "page-standalone" : "page-inline");
            var templateName = "approve_contracts.html";
            var htmlTemplate = this.getHtmlTemplate(templateName);
            var processedHtml = this.parseHtmlTemplate(htmlTemplate, {
                standaloneClass: standaloneClass,
                title: this.title
            });
            var userid = nlapiGetContext().getUser();
            var userType = request.getParameter("customer") === "T" ? "customer" : "salesrep";
            processedHtml = processedHtml.replace(/{{ userType }}/gi, userType);
            processedHtml = processedHtml.replace(/{{ userid }}/gi, userid);
            F3.Util.Utility.logDebug("ApproveContractSuitelet.main(); // this: ", JSON.stringify(this));
            F3.Util.Utility.logDebug("ApproveContractSuitelet.main(); // typeof this: ", typeof (this));
            F3.Util.Utility.logDebug("ApproveContractSuitelet.main(); // this.parseHtmlTemplate: ", this.parseHtmlTemplate);
            F3.Util.Utility.logDebug("ApproveContractSuitelet.main(); // this.title: ", this.title);
            // no need to create NetSuite form if standalone parameter is true
            if (standalone === true) {
                response.write(processedHtml);
            }
            else {
                var form = nlapiCreateForm(this.title);
                var htmlField = form.addField("inlinehtml", "inlinehtml", "");
                htmlField.setDefaultValue(processedHtml);
                response.writePage(form);
            }
        }
        catch (ex) {
            F3.Util.Utility.logException("ApproveContractSuitelet.main()", ex);
            throw ex;
        }
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "End");
    };
    return ApproveContractSuitelet;
})(ListContractsUISuitelet);
/**
 * This is the main entry point for ListContractsUISuitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function ApproveContractSuiteletMain(request, response) {
    return new ApproveContractSuitelet(request, response);
}
//# sourceMappingURL=f3mm_approve_contract_suitelet.js.map