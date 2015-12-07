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

    private title: string = 'Create Contract';
    private type: string = 'create';

    /**
     * Parse HTML Template and replace variables with required data
     * @returns {string} returns processed html
     */
    private parseHtmlTemplate(html: string, data) {
        var files = this.getDependencyFiles();
        var suiteletScriptId = 'customscript_f3mm_create_contract_api_st';
        var suiteletDeploymentId = 'customdeploy_f3mm_create_contract_api_st';
        var apiSuiteletUrl = nlapiResolveURL('SUITELET', suiteletScriptId, suiteletDeploymentId, false);

        html = html || '';

        for (var i in files) {
            var fileInfo = files[i];
            html = html.replace('{{ ' + fileInfo.name + ' }}', fileInfo.url);
        }

        html = html.replace('{{ type }}', this.type);
        html = html.replace('{{ title }}', this.title);
        html = html.replace('{{ apiSuiteletUrl }}', apiSuiteletUrl);
        html = html.replace(/{{ standaloneClass }}/gi, data.standaloneClass);
        html = html.replace('{{ contractInfo }}', JSON.stringify(data.contract));
        html = html.replace(/{{ viewContractUrl }}/gi, data.uiSuiteletUrl);

        return html;
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
        F3.Util.Utility.logDebug('CreateContractUISuitelet.main()', 'Start');

        try {
            var uiSuiteletScriptId = 'customscript_f3mm_create_contract_ui_st';
            var uiSuiteletDeploymentId = 'customdeploy_f3mm_create_contract_ui_st';
            var uiSuiteletUrl = nlapiResolveURL('SUITELET', uiSuiteletScriptId, uiSuiteletDeploymentId, false);

            var editMode = request.getParameter('e');
            var contractId = request.getParameter('cid');
            var contract = null;

            if (!!contractId) {
                contract = this._contractDAL.getWithDetails(contractId);
                F3.Util.Utility.logDebug('CreateContractUISuitelet.main() // contract: ', JSON.stringify(contract));

                uiSuiteletUrl = uiSuiteletUrl + '&cid=' + contractId;

                if (editMode == 't') {
                    this.title = 'Edit Contract';
                    this.type = 'edit';
                } else {
                    uiSuiteletUrl = uiSuiteletUrl + '&e=t';
                    this.title = 'View Contract';
                    this.type = 'view';
                }
            }

            var standaloneParam = request.getParameter('standalone');
            var standalone = standaloneParam == 'T' || standaloneParam == '1';
            var standaloneClass = (standalone ? 'page-standalone' : 'page-inline');

            var templateName = 'create_contract.html';
            var htmlTemplate = this.getHtmlTemplate(templateName);
            var processedHtml = this.parseHtmlTemplate(htmlTemplate, {
                standaloneClass: standaloneClass,
                uiSuiteletUrl: uiSuiteletUrl,
                contract: contract
            });

            F3.Util.Utility.logDebug('ListContractsUISuitelet.main(); // this: ', JSON.stringify(this));
            F3.Util.Utility.logDebug('CreateContractUISuitelet.main(); // this.title: ', this.title);

            // no need to create NetSuite form if standalone parameter is true
            if (standalone === true) {
                response.write(processedHtml);
            } else {
                var form = nlapiCreateForm(this.title);
                var htmlField = form.addField('inlinehtml', 'inlinehtml', '');
                htmlField.setDefaultValue(processedHtml);
                response.writePage(form);
            }

        } catch (ex) {
            F3.Util.Utility.logException('CreateContractUISuitelet.main()', ex);
            throw ex;
        }

        F3.Util.Utility.logDebug('CreateContractUISuitelet.main()', 'End');
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