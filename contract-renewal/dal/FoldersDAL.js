// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./BaseTypeDAL.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FoldersDAL = (function (_super) {
    __extends(FoldersDAL, _super);
    function FoldersDAL() {
        _super.apply(this, arguments);
        this.internalId = 'folder';
    }
    FoldersDAL.prototype.getFiles = function (folderId, recursive) {
        if (recursive === void 0) { recursive = false; }
        var filters = [];
        var cols = [];
        filters.push(['internalid', 'anyof', folderId]);
        if (recursive === true) {
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
    };
    FoldersDAL.prototype.getMedia = function (fileIds) {
        var filters = [];
        var cols = [];
        filters.push(new nlobjSearchFilter('internalid', 'file', 'anyof', fileIds));
        cols.push(new nlobjSearchColumn('name', 'file'));
        cols.push(new nlobjSearchColumn('url', 'file'));
        cols.push(new nlobjSearchColumn('filetype', 'file'));
        var result = this.getAll(filters, cols);
        return result;
    };
    return FoldersDAL;
})(BaseTypeDAL);
//# sourceMappingURL=FoldersDAL.js.map