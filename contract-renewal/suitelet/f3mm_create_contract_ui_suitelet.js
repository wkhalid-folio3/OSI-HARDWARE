/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="./f3mm_base_ui_suitelet.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Dependencies:
 * - f3mm_common_dal.ts
 * - f3mm_contract_dal.ts
 * - f3mm_folders_dal.ts
 * -
 */
/**
 * This class is responsible for creating html of Create, Edit & View Contract Screen
 */
var CreateContractUISuitelet = (function (_super) {
    __extends(CreateContractUISuitelet, _super);
    function CreateContractUISuitelet(request, response) {
        _super.call(this, request, response);
        this.title = "Create Contract";
        this.type = "create";
        this.title = "Create Contract";
        this.main(request, response);
    }
    /**
     * Entry point for Request. Operations:
     *  - Process request
     *  - load contract information
     *  - load html template
     *  - Gather other required data
     *  - Merge contract information and other required data with html
     *  - send response
     */
    CreateContractUISuitelet.prototype.main = function (request, response) {
        F3.Util.Utility.logDebug("CreateContractUISuitelet.main()", "Start");
        try {
            var uiSuiteletScriptId = "customscript_f3mm_create_contract_ui_st";
            var uiSuiteletDeploymentId = "customdeploy_f3mm_create_contract_ui_st";
            var uiSuiteletUrl = nlapiResolveURL("SUITELET", uiSuiteletScriptId, uiSuiteletDeploymentId, false);
            var editMode = request.getParameter("e");
            var contractId = request.getParameter("cid");
            var contract = null;
            if (!!contractId) {
                contract = this._contractDAL.getWithDetails(contractId);
                F3.Util.Utility.logDebug("CreateContractUISuitelet.main() // contract: ", JSON.stringify(contract));
                if (!contract) {
                    throw new Error("that record does not exist.");
                }
                uiSuiteletUrl = uiSuiteletUrl + "&cid=" + contractId;
                if (editMode === "t") {
                    this.title = "Edit Contract";
                    this.type = "edit";
                }
                else {
                    uiSuiteletUrl = uiSuiteletUrl + "&e=t";
                    this.title = "View Contract";
                    this.type = "view";
                }
            }
            else {
                this.title = "Create Contract";
                this.type = "create";
            }
            this.title = "<i class='fa fa-file-text-o'></i> " + this.title;
            var standaloneParam = request.getParameter("standalone");
            var standalone = standaloneParam === "T" || standaloneParam === "1";
            var standaloneClass = (standalone ? "page-standalone" : "page-inline");
            var templateName = "create_contract.html";
            var htmlTemplate = this.getHtmlTemplate(templateName);
            var processedHtml = this.parseHtmlTemplate(htmlTemplate, {
                contract: contract,
                standaloneClass: standaloneClass,
                title: this.title,
                uiSuiteletUrl: uiSuiteletUrl
            });
            F3.Util.Utility.logDebug("CreateContractUISuitelet.main(); // this: ", JSON.stringify(this));
            F3.Util.Utility.logDebug("CreateContractUISuitelet.main(); // this.title: ", this.title);
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
            F3.Util.Utility.logException("CreateContractUISuitelet.main()", ex);
            throw ex;
        }
        F3.Util.Utility.logDebug("CreateContractUISuitelet.main()", "End");
    };
    /**
     * Parse HTML Template and replace variables with required data
     * @returns {string} returns processed html
     */
    CreateContractUISuitelet.prototype.parseHtmlTemplate = function (html, data) {
        var files = this.getDependencyFiles();
        var suiteletScriptId = "customscript_f3mm_create_contract_api_st";
        var suiteletDeploymentId = "customdeploy_f3mm_create_contract_api_st";
        var apiSuiteletUrl = nlapiResolveURL("SUITELET", suiteletScriptId, suiteletDeploymentId, false);
        var contractListingScriptId = "customscript_f3mm_list_contracts_ui_st";
        var contractListingDeploymentId = "customdeploy_f3mm_list_contracts_ui_st";
        var contractListingUrl = nlapiResolveURL("SUITELET", contractListingScriptId, contractListingDeploymentId, false);
        html = html || "";
        for (var i in files) {
            var fileInfo = files[i];
            html = html.replace("{{ " + fileInfo.name + " }}", fileInfo.url);
        }
        html = html.replace("{{ type }}", this.type);
        html = html.replace(/{{ title }}/gi, data.title);
        html = html.replace("{{ apiSuiteletUrl }}", apiSuiteletUrl);
        html = html.replace(/{{ standaloneClass }}/gi, data.standaloneClass);
        html = html.replace("{{ contractInfo }}", JSON.stringify(data.contract));
        html = html.replace(/{{ viewContractUrl }}/gi, data.uiSuiteletUrl);
        html = html.replace(/{{ contractListingUrl }}/gi, contractListingUrl);
        return html;
    };
    return CreateContractUISuitelet;
})(BaseUISuitelet);
/**
 * This is the main entry point for CreateContractUI suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function CreateContractUISuiteletMain(request, response) {
    new CreateContractUISuitelet(request, response);
}
//# sourceMappingURL=f3mm_create_contract_ui_suitelet.js.map