/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
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
var CreateContractUISuitelet = (function () {
    function CreateContractUISuitelet(request, response) {
        this.title = 'Create Contract';
        this.type = 'create';
        this._foldersDAL = new FoldersDAL();
        this._contractDAL = new ContractDAL();
        this._commonDAL = new CommonDAL();
        var context = nlapiGetContext();
        var assetsFolderId = context.getSetting('SCRIPT', 'custscript_f3mm_st_assetsfolderid');
        this._assetsFolderId = parseInt(assetsFolderId);
        this.main(request, response);
    }
    /**
     * Get HTML template for Create / View / Edit Screen
     */
    CreateContractUISuitelet.prototype.getHtmlTemplate = function () {
        var assetsFolderId = this._assetsFolderId;
        var files = this._foldersDAL.getFiles(assetsFolderId);
        var found = null;
        var templateName = 'create_contract.html';
        var templateFile = null;
        var html = null;
        files.forEach(function (file) {
            if (file.name == templateName) {
                found = file;
            }
        });
        if (!!found) {
            templateFile = nlapiLoadFile(found.internalid);
            html = templateFile.getValue();
        }
        return html;
    };
    /**
     * Parse HTML Template and replace variables with required data
     */
    CreateContractUISuitelet.prototype.parseHtmlTemplate = function (html, data) {
        var files = this.getDependencyFiles();
        var suiteletScriptId = 'customscript_f3mm_create_contract_api_st';
        var suiteletDeploymentId = 'customdeploy_f3mm_create_contract_api_st';
        var apiSuiteletUrl = nlapiResolveURL('SUITELET', suiteletScriptId, suiteletDeploymentId, false);
        var priceLevels = this._commonDAL.getPriceLevels();
        html = html || '';
        priceLevels.forEach(function (priceLevel) {
            priceLevel.id = parseInt(priceLevel.id);
        });
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
        html = html.replace(/{{ priceLevels }}/gi, JSON.stringify(priceLevels));
        return html;
    };
    /**
     * Load all dependant asset files like js and css
     */
    CreateContractUISuitelet.prototype.getDependencyFiles = function () {
        var assetsFolderId = this._assetsFolderId;
        var files = this._foldersDAL.getFiles(assetsFolderId, true);
        return files;
    };
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
                }
                else {
                    uiSuiteletUrl = uiSuiteletUrl + '&e=t';
                    this.title = 'View Contract';
                    this.type = 'view';
                }
            }
            var standaloneParam = request.getParameter('standalone');
            var standalone = standaloneParam == 'T' || standaloneParam == '1';
            var standaloneClass = (standalone ? 'page-standalone' : 'page-inline');
            var htmlTemplate = this.getHtmlTemplate();
            var processedHtml = this.parseHtmlTemplate(htmlTemplate, {
                standaloneClass: standaloneClass,
                uiSuiteletUrl: uiSuiteletUrl,
                contract: contract
            });
            // no need to create NetSuite form if standalone parameter is trur
            if (standalone === true) {
                response.write(processedHtml);
            }
            else {
                var form = nlapiCreateForm(this.title);
                var htmlField = form.addField('inlinehtml', 'inlinehtml', '');
                htmlField.setDefaultValue(processedHtml);
                response.writePage(form);
            }
        }
        catch (ex) {
            F3.Util.Utility.logException('CreateContractUISuitelet.main()', ex);
            throw ex;
        }
        F3.Util.Utility.logDebug('CreateContractUISuitelet.main()', 'End');
    };
    return CreateContractUISuitelet;
})();
/**
 * This is the main entry point for CreateContractUI suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function CreateContractUISuiteletMain(request, response) {
    new CreateContractUISuitelet(request, response);
}
//# sourceMappingURL=f3mm_create_contract_ui_suitelet.js.map