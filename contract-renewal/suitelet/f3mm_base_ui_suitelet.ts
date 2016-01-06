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
class BaseUISuitelet {

    protected _contractDAL: ContractDAL;
    protected _foldersDAL: FoldersDAL;
    protected _commonDAL: CommonDAL;
    protected _assetsFolderId: number;

    constructor(request: nlobjRequest, response: nlobjResponse) {
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
    protected main(request: nlobjRequest, response: nlobjResponse) {
        //
    }

    /**
     * Get HTML template for Create / View / Edit Screen
     * @returns {string} returns the html of template
     */
    protected getHtmlTemplate(templateName: string) {
        let assetsFolderId = this._assetsFolderId;
        let files = this._foldersDAL.getFiles(assetsFolderId);
        let found = null;
        let templateFile = null;
        let html = null;

        files.forEach(file => {
            if (file.name === templateName) {
                found = file;
            }
        });

        if (!!found) {
            templateFile = nlapiLoadFile(found.internalid);
            html = templateFile.getValue();
        }

        return html;
    }

    /**
     * Load all dependant asset files like js and css
     * @returns {object[]} returns array of files loaded from db
     */
    protected getDependencyFiles(): IFile[] {
        let assetsFolderId = this._assetsFolderId;
        let files = this._foldersDAL.getFiles(assetsFolderId, true);

        // TODO : need to fix this, since NetSuite does not provide a way to find all files of a folder recursively
        // TODO : therefore we have to make two calls to fetch all dependant files
        let externalLibs = this._foldersDAL.getFiles(Config.LIBS_FOLDER_ID, true);
        return files.concat(externalLibs);
    }
}
