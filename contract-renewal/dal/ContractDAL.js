/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./BaseTypeDAL.ts" />
/// <reference path="./CommonDAL.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - f3mm_create_contract_api_st.ts
 * - f3mm_create_contract_ui_suitelet.ts
 * -
 * Dependencies:
 * - BaseTypeDAL.ts
 * -
 */
/**
 * This class handles all operations related to Contracts.
 * Following are the responsibilities of this class:
 *  - Load Contracts from Database
 *  - Update / Create Contracts along with its line items
 *  - Generate Quote from Contract
 */
var ContractDAL = (function (_super) {
    __extends(ContractDAL, _super);
    function ContractDAL() {
        _super.apply(this, arguments);
        this.internalId = 'customrecord_f3mm_contract';
        this.fields = {
            id: { id: 'internalid', type: 'number' },
            customer: { id: 'custrecord_f3mm_customer', type: 'list' },
            primaryContact: { id: 'custrecord_f3mm_primary_contact', type: 'list' },
            primaryContactEmail: { id: 'custrecord_f3mm_primary_contact_email', type: 'text' },
            contractVendor: { id: 'custrecord_f3mm_contract_vendor', type: 'list' },
            totalQuantitySeats: { id: 'custrecord_f3mm_total_qty_seats', type: 'number' },
            startDate: { id: 'custrecord_f3mm_start_date', type: 'date' },
            endDate: { id: 'custrecord_f3mm_end_date', type: 'date' },
            memo: { id: 'custrecord_f3mm_memo', type: 'text' },
            salesRep: { id: 'custrecord_f3mm_sales_rep', type: 'list' },
            department: { id: 'custrecord_f3mm_department', type: 'list' },
            contractNumber: { id: 'custrecord_f3mm_contract_number', type: 'text' },
            status: { id: 'custrecord_f3mm_status', type: 'list' },
            poNumber: { id: 'custrecord_f3mm_po_number', type: 'text' }
        };
    }
    /**
     * Gets contract with specified id including details of Items and related Quote
     * @param {string} id
     * @returns {object}
     */
    ContractDAL.prototype.getWithDetails = function (id) {
        var commonDAL = new CommonDAL();
        var contract = this.get(id);
        var contractItems = contract.sublists.recmachcustrecord_f3mm_ci_contract;
        var itemIds = contractItems.map(function (ci) { return parseInt(ci.custrecord_f3mm_ci_item.value); });
        var items = commonDAL.getItems({ itemIds: itemIds });
        var quotes = commonDAL.getQuotes({ contractId: id });
        contract.sublists.quotes = quotes;
        contractItems.forEach(function (contractItem) {
            var itemId = contractItem.custrecord_f3mm_ci_item.value;
            var foundItem = items.filter(function (item) { return item.id == itemId; })[0];
            if (!!foundItem) {
                contractItem.custrecord_f3mm_ci_item.baseprice = foundItem.baseprice;
                contractItem.custrecord_f3mm_ci_item.displayname = foundItem.displayname;
                contractItem.custrecord_f3mm_ci_item.itemid = foundItem.itemid;
            }
        });
        return contract;
    };
    /**
     * Generates a Quote from Contract. the contract is loaded based on specified contractId parameter.
     * @param {string} contractId id of the contract to generate contract from
     * @returns {number} id of quote generated from contract
     */
    ContractDAL.prototype.generateQuote = function (contractId) {
        var contract = this.getWithDetails(contractId);
        var quote = nlapiCreateRecord('estimate');
        var tranDate = new Date();
        var expectedClosingDate = new Date();
        expectedClosingDate.setDate(expectedClosingDate.getDate() + 7); // add 7 days
        // TODO : need to set due date base on customer requirement
        //var dueDate = new Date();
        //dueDate.setDate(dueDate.getDate() + 7); // add 7 days
        quote.setFieldValue('expectedclosedate', nlapiDateToString(expectedClosingDate)); // mandatory field
        quote.setFieldValue('trandate', nlapiDateToString(tranDate)); // mandatory field
        quote.setFieldValue('duedate', nlapiDateToString(tranDate)); // mandatory field
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
            contractItems.forEach(function (contractItem) {
                quote.selectNewLineItem('item');
                quote.setCurrentLineItemValue('item', 'item', contractItem.custrecord_f3mm_ci_item.value);
                quote.setCurrentLineItemValue('item', 'quantity', contractItem.custrecord_f3mm_ci_quantity);
                quote.setCurrentLineItemValue('item', 'price', contractItem.custrecord_f3mm_ci_price_level.value);
                quote.setCurrentLineItemValue('item', 'rate', contractItem.custrecord_f3mm_ci_price);
                quote.setCurrentLineItemValue('item', 'taxcode', contractItem.custrecord_f3mm_ci_taxcode.value);
                quote.commitLineItem('item');
            });
        }
        var quoteId = nlapiSubmitRecord(quote);
        return quoteId;
    };
    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    ContractDAL.prototype.updateOrCreate = function (contract) {
        if (!contract) {
            throw new Error("contract cannot be null.");
        }
        var record = {};
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
        record[this.fields.status.id] = contract.status;
        record[this.fields.poNumber.id] = contract.po_number;
        if (!!contract.items) {
            var contractItemsSublist = {
                internalId: 'recmachcustrecord_f3mm_ci_contract',
                keyField: 'custrecord_f3mm_ci_item',
                lineitems: []
            };
            contract.items.forEach(function (item) {
                var lineitem = {};
                lineitem['custrecord_f3mm_ci_quantity'] = item.quantity;
                lineitem['custrecord_f3mm_ci_item'] = item.item_id;
                lineitem['custrecord_f3mm_ci_price'] = item.price == "-1" ? "" : item.price;
                lineitem['custrecord_f3mm_ci_amount'] = item.amount;
                lineitem['custrecord_f3mm_ci_item_description'] = item.item_description || '';
                lineitem['custrecord_f3mm_ci_price_level'] = item.price_level;
                lineitem['custrecord_f3mm_ci_taxcode'] = item.tax_code;
                lineitem['custrecord_f3mm_ci_taxrate'] = item.tax_rate;
                contractItemsSublist.lineitems.push(lineitem);
            });
            record['sublists'] = [];
            record['sublists'].push(contractItemsSublist);
        }
        return this.upsert(record, true);
    };
    return ContractDAL;
})(BaseTypeDAL);
//# sourceMappingURL=ContractDAL.js.map