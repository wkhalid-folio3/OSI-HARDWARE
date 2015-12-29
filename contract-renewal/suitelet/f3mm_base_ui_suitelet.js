/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_common_dal.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../_typescript-refs/f3.common.d.ts" />
/**
 * Created by zshaikh on 12/7/2015.
 */
/**
 * This class is responsible for creating html of Create, Edit & View Contract Screen
 */
var BaseUISuitelet = (function () {
    function BaseUISuitelet(request, response) {
        this._foldersDAL = new FoldersDAL();
        this._contractDAL = new ContractDAL();
        this._commonDAL = new CommonDAL();
        this._assetsFolderId = Config.ASSETS_FOLDER_ID;
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
    BaseUISuitelet.prototype.main = function (request, response) {
        //
    };
    /**
     * Get HTML template for Create / View / Edit Screen
     * @returns {string} returns the html of template
     */
    BaseUISuitelet.prototype.getHtmlTemplate = function (templateName) {
        var assetsFolderId = this._assetsFolderId;
        var files = this._foldersDAL.getFiles(assetsFolderId);
        var found = null;
        var templateFile = null;
        var html = null;
        files.forEach(function (file) {
            if (file.name === templateName) {
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
     * Load all dependant asset files like js and css
     * @returns {object[]} returns array of files loaded from db
     */
    BaseUISuitelet.prototype.getDependencyFiles = function () {
        var assetsFolderId = this._assetsFolderId;
        var files = this._foldersDAL.getFiles(assetsFolderId, true);
        // TODO : need to fix this, since NetSuite does not provide a way to find all files of a folder recursively
        // TODO : therefore we have to make two calls to fetch all dependant files
        var externalLibs = this._foldersDAL.getFiles(Config.LIBS_FOLDER_ID, true);
        return files.concat(externalLibs);
    };
    return BaseUISuitelet;
})();
//# sourceMappingURL=f3mm_base_ui_suitelet.js.map