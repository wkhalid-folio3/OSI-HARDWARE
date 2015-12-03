/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./BaseTypeDAL.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 */

class FoldersDAL extends BaseTypeDAL {

    internalId:string = 'folder';

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