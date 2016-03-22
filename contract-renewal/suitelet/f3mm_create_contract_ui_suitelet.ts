/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="./f3mm_base_ui_suitelet.ts" />

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
class CreateContractUISuitelet extends BaseUISuitelet {

    public title: string = "Create Contract";
    public type: string = "create";

    constructor(request: nlobjRequest, response: nlobjResponse) {
        super(request, response);
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
    protected main(request: nlobjRequest, response: nlobjResponse) {
        F3.Util.Utility.logDebug("CreateContractUISuitelet.main()", "Start");

        try {
            let uiSuiteletScriptId = "customscript_f3mm_create_contract_ui_st";
            let uiSuiteletDeploymentId = "customdeploy_f3mm_create_contract_ui_st";
            let uiSuiteletUrl = nlapiResolveURL("SUITELET", uiSuiteletScriptId, uiSuiteletDeploymentId, false);

            let editMode = request.getParameter("e") || request.getParameter("edit");
            let contractId = request.getParameter("cid");
            let contract = null;

            if (!!contractId) {
                contract = this._contractDAL.getWithDetails(contractId);
                F3.Util.Utility.logDebug("CreateContractUISuitelet.main() // contract: ", JSON.stringify(contract));

                if (!contract) {
                    throw new Error("That record does not exist.");
                }

                uiSuiteletUrl = uiSuiteletUrl + "&cid=" + contractId;

                if (editMode === "T" || editMode === "t") {
                    this.title = "Edit Contract";
                    this.type = "edit";
                } else {
                    uiSuiteletUrl = uiSuiteletUrl + "&e=t";
                    this.title = "View Contract";
                    this.type = "view";
                }
            } else {
                this.title = "Create Contract";
                this.type = "create";
            }

            this.title = "<i class='fa fa-file-text-o'></i> " + this.title;

            let standaloneParam = request.getParameter("standalone");
            let standalone = standaloneParam === "T" || standaloneParam === "1";
            let standaloneClass = (standalone ? "page-standalone" : "page-inline");

            let templateName = "create_contract.html";
            let htmlTemplate = this.getHtmlTemplate(templateName);
            let processedHtml = this.parseHtmlTemplate(htmlTemplate, {
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
            } else {
                let form = nlapiCreateForm(this.title);
                let htmlField = form.addField("inlinehtml", "inlinehtml", "");
                htmlField.setDefaultValue(processedHtml);
                response.writePage(form);
            }

        } catch (ex) {
            F3.Util.Utility.logException("CreateContractUISuitelet.main()", ex);
            throw ex;
        }

        F3.Util.Utility.logDebug("CreateContractUISuitelet.main()", "End");
    }

    /**
     * Parse HTML Template and replace variables with required data
     * @returns {string} returns processed html
     */
    private parseHtmlTemplate(html: string, data) {
        let files = this.getDependencyFiles();
        let suiteletScriptId = "customscript_f3mm_create_contract_api_st";
        let suiteletDeploymentId = "customdeploy_f3mm_create_contract_api_st";
        let apiSuiteletUrl = nlapiResolveURL("SUITELET", suiteletScriptId, suiteletDeploymentId, false);

        let contractListingScriptId = "customscript_f3mm_list_contracts_ui_st";
        let contractListingDeploymentId = "customdeploy_f3mm_list_contracts_ui_st";
        let contractListingUrl = nlapiResolveURL("SUITELET", contractListingScriptId, contractListingDeploymentId, false);

        html = html || "";

        for (let i in files) {
            let fileInfo = files[i];
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
    }

}


/**
 * This is the main entry point for CreateContractUI suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function CreateContractUISuiteletMain(request, response) {
    new CreateContractUISuitelet(request, response);
}
