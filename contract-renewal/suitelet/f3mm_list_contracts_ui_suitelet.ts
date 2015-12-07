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

    private title: string = 'Contracts';

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

        html = html.replace('{{ title }}', this.title);
        html = html.replace('{{ apiSuiteletUrl }}', apiSuiteletUrl);
        html = html.replace(/{{ standaloneClass }}/gi, data.standaloneClass);

        return html;
    }


    /**
     * main method
     */
    main(request: nlobjRequest, response: nlobjResponse) {
        F3.Util.Utility.logDebug('ListContractsUISuitelet.main()', 'Start');

        try {

            var standaloneParam = request.getParameter('standalone');
            var standalone = standaloneParam == 'T' || standaloneParam == '1';
            var standaloneClass = (standalone ? 'page-standalone' : 'page-inline');

            var templateName = 'list_contracts.html';
            var htmlTemplate = this.getHtmlTemplate(templateName);
            var processedHtml = this.parseHtmlTemplate(htmlTemplate, {
                standaloneClass: standaloneClass,
            });

            F3.Util.Utility.logDebug('ListContractsUISuitelet.main(); // this: ', JSON.stringify(this));
            F3.Util.Utility.logDebug('ListContractsUISuitelet.main(); // this.title: ', this.parseHtmlTemplate);
            F3.Util.Utility.logDebug('ListContractsUISuitelet.main(); // this.title: ', this.title);

            // no need to create NetSuite form if standalone parameter is true
            if (standalone === true) {
                response.write(processedHtml);
            } else {
                var form = nlapiCreateForm(this.title || '');
                var htmlField = form.addField('inlinehtml', 'inlinehtml', '');
                htmlField.setDefaultValue(processedHtml);
                response.writePage(form);
            }

        } catch (ex) {
            F3.Util.Utility.logException('ListContractsUISuitelet.main()', ex);
            throw ex;
        }

        F3.Util.Utility.logDebug('ListContractsUISuitelet.main()', 'End');
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