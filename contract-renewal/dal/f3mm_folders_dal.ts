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

/**
 * This class is responsing for performing DB operations related to File / Folder Search
 * Following are the responsibilities of this class:
 *  - Load Contracts from Database
 *  - Update / Create Contracts along with its line items
 *  - Generate Quote from Contract
 */
class FoldersDAL extends BaseDAL {

    internalId:string = 'folder';

    /**
     * Gets files withing specified folderId
     * @param {number} folderId to search files within
     * @param {boolean} recursive default to false
     * @returns {object[]} array of files object
     */
    getFiles(folderId: number, recursive: boolean = false) : {}[] {

        var filters = [];
        var cols = [];

        filters.push(['internalid', 'anyof', folderId]);
        if( recursive === true) {
            filters.push('or');
            filters.push(['parent', 'anyof', folderId]);
        }

        cols.push(new nlobjSearchColumn('name', 'file'));
        cols.push(new nlobjSearchColumn('url', 'file'));
        cols.push(new nlobjSearchColumn('internalid', 'file'));
        cols.push(new nlobjSearchColumn('filetype', 'file'));
        cols.push(new nlobjSearchColumn('parent'));

        var result = this.getAll(filters, cols);

        return result;
    }

    /**
     * Gets files with specified file ids
     * @param {string[]} fileIds array of file ids
     * @returns {object[]} array of files object
     */
    getMedia (fileIds: string[]) : {}[] {

        var filters = [];
        var cols = [];

        filters.push(new nlobjSearchFilter('internalid', 'file', 'anyof', fileIds));

        cols.push(new nlobjSearchColumn('name', 'file'));
        cols.push(new nlobjSearchColumn('url', 'file'));
        cols.push(new nlobjSearchColumn('filetype', 'file'));

        var result = this.getAll(filters, cols);

        return result;
    }

}