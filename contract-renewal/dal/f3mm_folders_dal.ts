/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./f3mm_base_dal.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - f3mm_create_contract_ui_suitelet.ts
 * -
 * Dependencies:
 * - f3mm_base_dal.ts
 * -
 */

interface IFile {
    name: string;
    url: string;
    filetype: string;
    parent: string;
}

/**
 * This class is responsible for performing DB operations related to File / Folder Search
 * Following are the responsibilities of this class:
 *  - Gets files withing specified folderId
 *  - Gets files with specified file ids
 */
class FoldersDAL extends BaseDAL {

    public internalId: string = "folder";

    /**
     * Gets files withing specified folderId
     * @param {number} folderId to search files within
     * @param {boolean} recursive default to false
     * @returns {object[]} array of files object
     */
    public getFiles(folderId: number, recursive = false): IFile[] {

        let filters = [];
        let cols = [];

        filters.push(["internalid", "anyof", folderId]);
        if (recursive === true) {
            filters.push("or");
            filters.push(["parent", "anyof", folderId]);
            // filters.push('or');
            // filters.push(['folder', 'file', 'anyof', folderId]);
        }

        cols.push(new nlobjSearchColumn("name", "file"));
        cols.push(new nlobjSearchColumn("url", "file"));
        cols.push(new nlobjSearchColumn("internalid", "file"));
        cols.push(new nlobjSearchColumn("filetype", "file"));
        cols.push(new nlobjSearchColumn("parent"));

        let result = this.getAll(filters, cols) as IFile[];

        F3.Util.Utility.logDebug("FoldersDAL.getFiles()", JSON.stringify(result));

        return result;
    }

    /**
     * Gets files with specified file ids
     * @param {string[]} fileIds array of file ids
     * @returns {object[]} array of files object
     */
    public getMedia(fileIds: string[]): {}[] {

        let filters = [];
        let cols = [];

        filters.push(new nlobjSearchFilter("internalid", "file", "anyof", fileIds));

        cols.push(new nlobjSearchColumn("name", "file"));
        cols.push(new nlobjSearchColumn("url", "file"));
        cols.push(new nlobjSearchColumn("filetype", "file"));

        let result = this.getAll(filters, cols);

        return result;
    }

}
