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

class CreateContractUISuitelet {

    private contractDAL : ContractDAL;
    private foldersDAL : FoldersDAL;
    private assetsFolderId: number;
    title: string = 'Create Contract';
    type: string = 'create';

    constructor(request:nlobjRequest, response:nlobjResponse) {

        this.foldersDAL = new FoldersDAL();
        this.contractDAL = new ContractDAL();

        var context = nlapiGetContext();
        var assetsFolderId = context.getSetting('SCRIPT', 'custscript_f3mm_st_assetsfolderid');
        this.assetsFolderId = parseInt(assetsFolderId);

        this.main(request, response);
    }

    getFileUrl () {
        var assetsFolderId = this.assetsFolderId;
        var files = this.foldersDAL.getFiles(assetsFolderId);
        var found = null;
        files.forEach(file=> {
            if (file.name == "create_contract.html") {
                found = file;
            }
        });

        return found.internalid;
        //return "SuiteScripts/ContractRenewal/assets/create_contract.html";
    }

    getDependencyFiles() {
        var assetsFolderId = this.assetsFolderId;
        var files = this.foldersDAL.getFiles(assetsFolderId, true);
        return files;
    }

    /**
     * main method
     */
    main(request:nlobjRequest, response:nlobjResponse) {
        F3.Util.Utility.logDebug('CreateContractUISuitelet.main()', 'Start');

        try {
            var uiSuiteletScriptId = 'customscript_f3mm_create_contract_ui_st';
            var uiSuiteletDeploymentId = 'customdeploy_f3mm_create_contract_ui_st';
            var uiSuiteletUrl = nlapiResolveURL('SUITELET', uiSuiteletScriptId, uiSuiteletDeploymentId, false);

            var editMode = request.getParameter('e');
            var contractId = request.getParameter('cid');
            var contract = null;

            if (!!contractId) {
                contract = this.contractDAL.get(contractId);
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
            indexPageValue = indexPageValue.replace('{{ contractInfo }}', JSON.stringify(contract));
            indexPageValue = indexPageValue.replace(/{{ ViewContractUrl }}/gi, uiSuiteletUrl);

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