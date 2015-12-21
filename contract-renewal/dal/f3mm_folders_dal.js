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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * This class is responsible for performing DB operations related to File / Folder Search
 * Following are the responsibilities of this class:
 *  - Gets files withing specified folderId
 *  - Gets files with specified file ids
 */
var FoldersDAL = (function (_super) {
    __extends(FoldersDAL, _super);
    function FoldersDAL() {
        _super.apply(this, arguments);
        this.internalId = "folder";
    }
    /**
     * Gets files withing specified folderId
     * @param {number} folderId to search files within
     * @param {boolean} recursive default to false
     * @returns {object[]} array of files object
     */
    FoldersDAL.prototype.getFiles = function (folderId, recursive) {
        if (recursive === void 0) { recursive = false; }
        var filters = [];
        var cols = [];
        filters.push(["internalid", "anyof", folderId]);
        if (recursive === true) {
            filters.push("or");
            filters.push(["parent", "anyof", folderId]);
        }
        cols.push(new nlobjSearchColumn("name", "file"));
        cols.push(new nlobjSearchColumn("url", "file"));
        cols.push(new nlobjSearchColumn("internalid", "file"));
        cols.push(new nlobjSearchColumn("filetype", "file"));
        cols.push(new nlobjSearchColumn("parent"));
        var result = this.getAll(filters, cols);
        F3.Util.Utility.logDebug("FoldersDAL.getFiles()", JSON.stringify(result));
        return result;
    };
    /**
     * Gets files with specified file ids
     * @param {string[]} fileIds array of file ids
     * @returns {object[]} array of files object
     */
    FoldersDAL.prototype.getMedia = function (fileIds) {
        var filters = [];
        var cols = [];
        filters.push(new nlobjSearchFilter("internalid", "file", "anyof", fileIds));
        cols.push(new nlobjSearchColumn("name", "file"));
        cols.push(new nlobjSearchColumn("url", "file"));
        cols.push(new nlobjSearchColumn("filetype", "file"));
        var result = this.getAll(filters, cols);
        return result;
    };
    return FoldersDAL;
})(BaseDAL);
//# sourceMappingURL=f3mm_folders_dal.js.map