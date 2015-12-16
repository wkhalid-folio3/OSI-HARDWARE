/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./f3mm_base_dal.ts" />
/// <reference path="./f3mm_common_dal.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - f3mm_create_contract_api_suitelet.ts
 * - f3mm_create_contract_ui_suitelet.ts
 * -
 * Dependencies:
 * - f3mm_base_dal.ts
 * -
 */

/**
 * This class handles all operations related to Contracts.
 * Following are the responsibilities of this class:
 *  - Load Contracts from Database
 *  - Update / Create Contracts along with its line items
 *  - Generate Quote from Contract
 */
class ContractDAL extends BaseDAL {
    internalId: string = 'customrecord_f3mm_contract';

    fields = {
        id: {
            id: 'internalid',
            type: 'number'
        },
        name: {
            id: 'name',
            type: 'string'
        },
        customer: {
            id: 'custrecord_f3mm_customer',
            type: 'list'
        },
        primaryContact: {
            id: 'custrecord_f3mm_primary_contact',
            type: 'list'
        },
        primaryContactEmail: {
            id: 'custrecord_f3mm_primary_contact_email',
            type: 'text'
        },
        contractVendor: {
            id: 'custrecord_f3mm_contract_vendor',
            type: 'list'
        },
        totalQuantitySeats: {
            id: 'custrecord_f3mm_total_qty_seats',
            type: 'number'
        },
        startDate: {
            id: 'custrecord_f3mm_start_date',
            type: 'date'
        },
        endDate: {
            id: 'custrecord_f3mm_end_date',
            type: 'date'
        },
        duration: {
            id: 'custrecord_f3mm_contract_duration',
            type: 'list'
        },
        memo: {
            id: 'custrecord_f3mm_memo',
            type: 'text'
        },
        salesRep: {
            id: 'custrecord_f3mm_sales_rep',
            type: 'list'
        },
        department: {
            id: 'custrecord_f3mm_department',
            type: 'list'
        },
        contractNumber: {
            id: 'custrecord_f3mm_contract_number',
            type: 'text'
        },
        status: {
            id: 'custrecord_f3mm_status',
            type: 'list'
        },
        poNumber: {
            id: 'custrecord_f3mm_po_number',
            type: 'text'
        },
        deleted: {
            id: 'custrecord_f3mm_deleted',
            type: 'checkbox'
        }
    };

    /**
     * Gets contract with specified id including details of Items and related Quote
     * @param {string} contractId
     * @returns {object} json representation of contract obejct along with contract items and quotes
     */
    getHistory(contractId: string) {
        var filters = [],
            columns = [];

        //filters.push(new nlobjSearchFilter('type', null, 'anyof', 'SalesOrd'));
        //if(!!lastSyncDate)
        //    filters.push(new nlobjSearchFilter('date', 'systemNotes', 'After', lastSyncDate));
        filters.push(new nlobjSearchFilter('internalid', null, 'is', contractId));

        columns.push(new nlobjSearchColumn('date', 'systemNotes', 'group'));
        columns.push(new nlobjSearchColumn('field', 'systemNotes', 'group'));
        columns.push(new nlobjSearchColumn('type', 'systemNotes', 'group'));
        columns.push(new nlobjSearchColumn('oldvalue', 'systemNotes', 'group'));
        columns.push(new nlobjSearchColumn('newvalue', 'systemNotes', 'group'));
        //sorting on date field
        columns[0].setSort();

        var history = this.getAll(filters, columns);

        return history;
    }


    /**
     * Gets contract with specified id including details of Items and related Quote
     * @param {string} id
     * @returns {object} json representation of contract obejct along with contract items and quotes
     */
    getWithDetails(id: string) {

        var contract = null;

        try {
            var commonDAL = new CommonDAL();
            contract = this.get(id);

            if (contract[this.fields.deleted.id] == 'T') {
                var err = new Error('the record is deleted');
                F3.Util.Utility.logException('ContractDAL.getWithDetails(id); // id = ' + id, err);
                return null;
            }

            var contractItems = contract.sublists.recmachcustrecord_f3mm_ci_contract;
            var items = [];
            var itemIds = contractItems
                .filter(ci=> !!ci.custrecord_f3mm_ci_item)
                .map(ci=>parseInt(ci.custrecord_f3mm_ci_item.value));

            if (itemIds && itemIds.length) {
                items = commonDAL.getItems({
                    itemIds: itemIds
                });

                items.forEach(item=> {
                    item.priceLevels = commonDAL.getPriceLevels({
                        recordType: item.recordType,
                        itemId: item.id
                    });
                });
            }

            var quotes = commonDAL.getQuotes({
                contractId: id
            });

            contract.sublists.quotes = quotes;

            contract.history = this.getHistory(id);

            contractItems.forEach(contractItem => {
                if (!!contractItem.custrecord_f3mm_ci_item) {
                    var itemId = contractItem.custrecord_f3mm_ci_item.value;
                    var foundItem = items.filter(item => item.id == itemId)[0];
                    if (!!foundItem) {
                        contractItem.custrecord_f3mm_ci_item.baseprice = foundItem.baseprice;
                        contractItem.custrecord_f3mm_ci_item.displayname = foundItem.displayname;
                        contractItem.custrecord_f3mm_ci_item.itemid = foundItem.itemid;
                        contractItem.custrecord_f3mm_ci_item.priceLevels = foundItem.priceLevels;
                    }
                }
            });
        } catch (ex) {
            F3.Util.Utility.logException('ContractDAL.getWithDetails(id); // id = ' + id, ex);
            throw ex;
        }

        return contract;
    }

    /**
     * Search contracts with specified filters
     * @param {object} params json object contain filters data
     * @returns {object[]} array of json representation of contract objects
     */
    searchContractItems(params) {
        var filters = [];
        var cols = [];
        var contractItemInternalId = 'customrecord_f3mm_contract_item';

        if ( !!params) {
            if (!!params.contractIds) {
                filters.push(new nlobjSearchFilter('custrecord_f3mm_ci_contract', null, 'anyof', params.contractIds));
            }
        }

        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_quantity'));
        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_item'));
        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_price'));
        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_amount'));
        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_item_description'));
        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_price_level'));
        cols.push(new nlobjSearchColumn('custrecord_f3mm_ci_contract'));

        var records = super.getAll(filters, cols, contractItemInternalId);
        return records;
    }

    /**
     * Search contracts with specified filters
     * @param {object} params json object contain filters data
     * @returns {object[]} array of json representation of contract objects
     */
    search(params) {
        var result = {
            total: 0,
            records: null
        };
        var filters = [];

        if (!!params) {
            if (!F3.Util.Utility.isBlankOrNull(params.contract_number)) {
                filters.push(new nlobjSearchFilter(this.fields.contractNumber.id, null, 'contains', params.contract_number));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.status)) {
                filters.push(new nlobjSearchFilter(this.fields.status.id, null, 'anyof', params.status));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.customer)) {
                filters.push(new nlobjSearchFilter(this.fields.customer.id, null, 'anyof', params.customer));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.start_date)) {
                filters.push(new nlobjSearchFilter(this.fields.startDate.id, null, 'onorafter', params.start_date));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.end_date)) {
                filters.push(new nlobjSearchFilter(this.fields.endDate.id, null, 'onorbefore', params.end_date));
            }

            // exclude deleted & inactive records
            filters.push(new nlobjSearchFilter('isinactive', null, 'is', params.isinactive == true ? 'T' : 'F'));
        }

        filters.push(new nlobjSearchFilter(this.fields.deleted.id, null, 'is', 'F'));

        result.records = super.getAll(filters, null, null, params);

        if (!!result.records) {
            var contractIds = result.records.map(record=> record.id);
            var contractItems = this.searchContractItems({contractIds: contractIds});
            result.records.forEach(record=> {
                record.sublists = record.sublists || {};
                var filtered = contractItems.filter(ci=> ci.custrecord_f3mm_ci_contract.value == record.id);
                record.sublists.recmachcustrecord_f3mm_ci_contract = filtered;
            });
        }


        // count records
        var columns = [new nlobjSearchColumn('internalid', null, 'count').setLabel('total')];
        var count = super.getAll(filters, columns)[0];
        result.total = count.total;

        return result;
    }

    /**
     * Generates a Quote from Contract. the contract is loaded based on specified contractId parameter.
     * @param {string} contractId id of the contract to generate contract from
     * @returns {number} id of quote generated from contract
     */
    generateQuote(params) {

        var result: {
            id: any
        } = null;

        try {
            var contractId = params.contractId;
            var contract = this.getWithDetails(contractId);
            var quote = nlapiCreateRecord('estimate');

            var tranDate = new Date();
            var expectedClosingDate = new Date();
            expectedClosingDate.setDate(expectedClosingDate.getDate() + 30); // add 7 days
            var dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // add 7 days

            // TODO : need to set due date base on customer requirement
            //var dueDate = new Date();
            //dueDate.setDate(dueDate.getDate() + 7); // add 7 days

            quote.setFieldValue('expectedclosedate', nlapiDateToString(expectedClosingDate)); // mandatory field
            quote.setFieldValue('trandate', nlapiDateToString(tranDate)); // mandatory field
            quote.setFieldValue('duedate', nlapiDateToString(dueDate)); // mandatory field

            // entityStatuses for references
            var proposalStatusId = "10";
            quote.setFieldValue('entitystatus', proposalStatusId); // proposal
            quote.setFieldValue('salesrep', contract[this.fields.salesRep.id].value);
            quote.setFieldValue('entity', contract[this.fields.customer.id].value);
            quote.setFieldValue('custbody_f3mm_quote_contract', contractId); // attach contract record
            quote.setFieldValue('department', contract[this.fields.department.id].value);

            quote.setFieldValue('custbody_estimate_end_user', contract[this.fields.primaryContact.id].value);
            quote.setFieldValue('custbody_end_user_email', contract[this.fields.primaryContactEmail.id]);
            quote.setFieldValue('memo', contract[this.fields.memo.id]);

            var contractItems = contract.sublists.recmachcustrecord_f3mm_ci_contract;
            if (!!contractItems) {
                contractItems.forEach(contractItem => {
                    quote.selectNewLineItem('item');
                    quote.setCurrentLineItemValue('item', 'item', contractItem.custrecord_f3mm_ci_item.value);
                    quote.setCurrentLineItemValue('item', 'quantity', contractItem.custrecord_f3mm_ci_quantity);
                    quote.setCurrentLineItemValue('item', 'price', contractItem.custrecord_f3mm_ci_price_level.value);
                    quote.setCurrentLineItemValue('item', 'rate', contractItem.custrecord_f3mm_ci_price);
                    //quote.setCurrentLineItemValue('item', 'taxcode', contractItem.custrecord_f3mm_ci_taxcode.value);
                    quote.commitLineItem('item');
                });
            }

            var quoteId = nlapiSubmitRecord(quote);

            result = {
                id: quoteId
            };

        } catch (e) {
            F3.Util.Utility.logException('ContractDAL.generateQuote', e.toString());
            throw e;
        }

        return result;
    }

    /**
     * Prepare record to insert in db
     * @param {object} contract json object containing data for contract
     * @returns {object} prepared record object to insert in db
     */
    private prepareDataToUpsert(contract: any) {

        var record: any = {};
        record.id = contract.id;
        record[this.fields.customer.id] = contract.customer;
        record[this.fields.primaryContact.id] = contract.primary_contact;
        record[this.fields.primaryContactEmail.id] = contract.primary_contact_email;
        record[this.fields.contractVendor.id] = contract.vendor;
        record[this.fields.totalQuantitySeats.id] = contract.total_quantity_seats || 0;
        record[this.fields.startDate.id] = contract.start_date;
        record[this.fields.endDate.id] = contract.end_date;
        record[this.fields.memo.id] = contract.memo;
        record[this.fields.salesRep.id] = contract.sales_rep;
        record[this.fields.department.id] = contract.department;
        record[this.fields.contractNumber.id] = contract.contract_number;
        record[this.fields.name.id] = contract.contract_number;
        record[this.fields.status.id] = contract.status;
        record[this.fields.poNumber.id] = contract.po_number;
        record[this.fields.duration.id] = contract.duration;

        if (!!contract.items) {

            var contractItemsSublist = {
                internalId: 'recmachcustrecord_f3mm_ci_contract',
                keyField: 'custrecord_f3mm_ci_item',
                lineitems: []
            };

            contract.items.forEach(item => {
                var lineitem = {};
                lineitem['custrecord_f3mm_ci_quantity'] = item.quantity;
                lineitem['custrecord_f3mm_ci_item'] = item.item_id;
                lineitem['custrecord_f3mm_ci_price'] = item.price == "-1" ? "" : item.price;
                lineitem['custrecord_f3mm_ci_amount'] = item.amount;
                lineitem['custrecord_f3mm_ci_item_description'] = item.item_description || '';
                lineitem['custrecord_f3mm_ci_price_level'] = item.price_level;
                //lineitem['custrecord_f3mm_ci_taxcode'] = item.tax_code;
                //lineitem['custrecord_f3mm_ci_taxrate'] = item.tax_rate;

                contractItemsSublist.lineitems.push(lineitem);
            });

            record['sublists'] = [];
            record['sublists'].push(contractItemsSublist);
        }

        return record;
    }

    /**
     * Delete Contract
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    delete(contract): {
        id: any
    } {
        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        var record: any = {};
        record.id = contract.id;
        record[this.fields.deleted.id] = 'T';

        var id = this.upsert(record);
        var result = {
            id: id
        };
        return result;
    }


    /**
     * Void Selected Contracts
     * @param {object} contractIds array containing ids of contracts to void
     * @returns {number} id of created / updated contract
     */
    void(contractIds): any[] {
        if (!contractIds) {
            throw new Error("contractIds cannot be null.");
        }

        var result = [];
        var voidStatusId = 5;

        contractIds.forEach(contractId=> {
            try {
                var record: any = {};
                record.id = contractId;
                record[this.fields.status.id] = voidStatusId; // void

                var id = this.upsert(record);
                result[contractId] = true;
            } catch (e) {
                F3.Util.Utility.logException('ContractDAL.void', e.toString());
                result[contractId] = false;
            }
        });

        return result;
    }


    /**
     * Export records in csv format
     * @param {object} params json object contain filters data
     * @returns {object[]} array of json representation of contract objects
     */
    exportToCSV(params) {
        var searchResult = this.search(params);
        var records = searchResult.records;
        var includeHeader = true;
        var contents = '';

        var content = [];
        var temp = [];
        var keysToExclude = ['recordType', 'custrecord_f3mm_deleted'];
        var keyObjects = [
            'custrecord_f3mm_contract_vendor',
            'custrecord_f3mm_customer',
            'custrecord_f3mm_department',
            'custrecord_f3mm_primary_contact',
            'custrecord_f3mm_sales_rep',
            'custrecord_f3mm_status'
        ];

        if (includeHeader === true && records.length > 0) {
            var record = records[0];
            for (var key in record) {
                if (keysToExclude.indexOf(key) > -1) {
                    continue;
                }

                var columnName = key;
                columnName = columnName.replace('custrecord_f3mm_', '');
                columnName = columnName.replace(/_/gi, ' ');

                if (typeof record[key] == 'object' || keyObjects.indexOf(key) > -1) {
                    temp.push(columnName + ' id');
                    temp.push(columnName + ' name');
                }
                else {
                    temp.push(columnName);
                }
            }

            content.push(temp);
        }

        // Looping through the search Results
        for (var i = 0; i < records.length; i++) {
            temp = [];
            var record = records[i];

            // Looping through each column and assign it to the temp array
            for (var key in record) {
                if (keysToExclude.indexOf(key) > -1) {
                    continue;
                }

                if (typeof record[key] == 'object' || keyObjects.indexOf(key) > -1) {
                    var obj = record[key] || {};
                    temp.push(obj.value);
                    temp.push(obj.text);
                }
                else {
                    temp.push(record[key]);
                }
            }

            content.push(temp);
        }

        // Looping through the content array and assigning it to the contents string variable.
        for (var z = 0; z < content.length; z++) {
            contents += content[z].toString() + '\n';
        }

        return contents;
    }


    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    update(contract): {
        id: any
    } {

        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        var record: any = {};
        record.id = contract.id;
        record[this.fields.primaryContact.id] = contract.custrecord_f3mm_primary_contact.value;
        record[this.fields.primaryContactEmail.id] = contract.custrecord_f3mm_primary_contact_email;
        record[this.fields.startDate.id] = contract.custrecord_f3mm_start_date;
        record[this.fields.endDate.id] = contract.custrecord_f3mm_end_date;
        record[this.fields.contractNumber.id] = contract.custrecord_f3mm_contract_number;
        record[this.fields.name.id] = contract.custrecord_f3mm_contract_number;
        record[this.fields.memo.id] = contract.custrecord_f3mm_memo;

        var id = this.upsert(record);
        var result = {
            id: id
        };
        return result;
    }


    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    updateOrCreate(contract): {
        id: any
    } {

        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        var removeExistingLineItems = true;
        var record = this.prepareDataToUpsert(contract);

        var id = this.upsert(record, removeExistingLineItems);
        var result = {
            id: id
        };
        return result;
    }
}