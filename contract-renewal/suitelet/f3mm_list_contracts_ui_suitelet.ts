/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="./f3mm_base_ui_suitelet.ts" />

/**
 * Created by zshaikh on 12/7/2015.
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
class ListContractsUISuitelet extends BaseUISuitelet {

    protected title: string = "Contracts";

    constructor(request: nlobjRequest, response: nlobjResponse) {
        super(request, response);
        this.title = "<i class=\"fa fa-file-text-o\"></i> List Contracts";
        this.main(request, response);
    }

    /**
     * main method
     */
    public main(request: nlobjRequest, response: nlobjResponse) {
        F3.Util.Utility.logDebug("ListContractsUISuitelet.main()", "Start");

        try {

            let standaloneParam = request.getParameter("standalone");
            let standalone = standaloneParam === "T" || standaloneParam === "1";
            let standaloneClass = (standalone ? "page-standalone" : "page-inline");
            let templateName = "list_contracts.html";
            let htmlTemplate = this.getHtmlTemplate(templateName);
            let processedHtml = this.parseHtmlTemplate(htmlTemplate, {
                standaloneClass: standaloneClass,
                title: this.title
            });

            F3.Util.Utility.logDebug("ListContractsUISuitelet.main(); // this: ", JSON.stringify(this));
            F3.Util.Utility.logDebug("ListContractsUISuitelet.main(); // typeof this: ", typeof(this));
            F3.Util.Utility.logDebug("ListContractsUISuitelet.main(); // this.parseHtmlTemplate: ", this.parseHtmlTemplate);
            F3.Util.Utility.logDebug("ListContractsUISuitelet.main(); // this.title: ", this.title);

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
            F3.Util.Utility.logException("ListContractsUISuitelet.main()", ex);
            throw ex;
        }

        F3.Util.Utility.logDebug("ListContractsUISuitelet.main()", "End");
    }

    /**
     * Parse HTML Template and replace variables with required data
     * @returns {string} returns processed html
     */
    protected parseHtmlTemplate(html: string, data) {
        let files = this.getDependencyFiles();
        let suiteletScriptId = "customscript_f3mm_create_contract_api_st";
        let suiteletDeploymentId = "customdeploy_f3mm_create_contract_api_st";
        let apiSuiteletUrl = nlapiResolveURL("SUITELET", suiteletScriptId, suiteletDeploymentId, false);

        let createSuiteletScriptId = "customscript_f3mm_create_contract_ui_st";
        let createSuiteletDeploymentId = "customdeploy_f3mm_create_contract_ui_st";
        let createSuiteletUrl = nlapiResolveURL("SUITELET", createSuiteletScriptId, createSuiteletDeploymentId, false);

        html = html || "";

        for (let i in files) {
            if (files.hasOwnProperty(i)) {
                let fileInfo = files[i];
                html = html.replace("{{ " + fileInfo.name + " }}", fileInfo.url);
            }
        }

        html = html.replace(/{{ title }}/gi, data.title);
        html = html.replace(/{{ apiSuiteletUrl }}/gi, apiSuiteletUrl);
        html = html.replace(/{{ createSuiteletUrl }}/gi, createSuiteletUrl);
        html = html.replace(/{{ standaloneClass }}/gi, data.standaloneClass);

        return html;
    }
}

/**
 * This is the main entry point for ListContractsUISuitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function ListContractsUISuiteletMain(request, response) {
    return new ListContractsUISuitelet(request, response);
}
