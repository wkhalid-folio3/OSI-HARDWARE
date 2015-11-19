// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/BaseTypeDAL.ts" />
/// <reference path="../dal/ContractDAL.ts" />
/// <reference path="../dal/FoldersDAL.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */
/**
 * CreateContractUI class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
//import {ContractDAL} from '../dal/ContractDAL';
var CreateContractUISuitelet = (function () {
    function CreateContractUISuitelet(request, response) {
        this.title = 'Create Contract';
        this.type = 'create';
        this.foldersDAL = new FoldersDAL();
        this.main(request, response);
    }
    CreateContractUISuitelet.prototype.getFileUrl = function () {
        return "SuiteScripts/ContractRenewal/assets/create_contract.html";
    };
    CreateContractUISuitelet.prototype.getDependencyFiles = function () {
        var jsFolderId = 2754;
        var files = this.foldersDAL.getFiles(jsFolderId, true);
        return files;
    };
    /**
     * main method
     */
    CreateContractUISuitelet.prototype.main = function (request, response) {
        F3.Util.Utility.logDebug('CreateContractUISuitelet.main()', 'Start');
        try {
            var standaloneParam = request.getParameter('standalone');
            var standalone = standaloneParam == 'T' || standaloneParam == '1';
            var standaloneClass = (standalone ? 'page-standalone' : 'page-inline');
            var suiteletScriptId = 'customscript_f3mm_create_contract_api_st';
            var suiteletDeploymentId = 'customdeploy_f3mm_create_contract_api_st';
            var apiSuiteletUrl = nlapiResolveURL('SUITELET', suiteletScriptId, suiteletDeploymentId, false);
            var data = nlapiLoadFile(this.getFileUrl());
            var files = this.getDependencyFiles();
            var indexPageValue = data.getValue();
            for (var i in files) {
                var fileInfo = files[i];
                indexPageValue = indexPageValue.replace('{{ ' + fileInfo.name + ' }}', fileInfo.url);
            }
            indexPageValue = indexPageValue.replace('{{ type }}', this.type);
            indexPageValue = indexPageValue.replace('{{ title }}', this.title);
            indexPageValue = indexPageValue.replace('{{ apiSuiteletUrl }}', apiSuiteletUrl);
            indexPageValue = indexPageValue.replace(/{{ standaloneClass }}/gi, standaloneClass);
            if (standalone === true) {
                response.write(indexPageValue);
            }
            else {
                var form = nlapiCreateForm(this.title);
                var htmlField = form.addField('inlinehtml', 'inlinehtml', '');
                htmlField.setDefaultValue(indexPageValue);
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