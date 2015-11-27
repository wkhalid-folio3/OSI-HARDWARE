// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./BaseTypeDAL.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
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
    ContractDAL.prototype.create = function (contract) {
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
                lineitem['custrecord_f3mm_ci_price'] = item.price;
                lineitem['custrecord_f3mm_ci_amount'] = item.amount;
                lineitem['custrecord_f3mm_ci_item_description'] = item.item_description || '';
                lineitem['custrecord_f3mm_ci_price_level'] = item.price_level;
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