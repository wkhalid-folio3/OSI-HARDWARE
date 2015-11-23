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
            contactNumber: { id: 'custrecord_f3mm_contact_number', type: 'text' },
            contractVendor: { id: 'custrecord_f3mm_contract_vendor', type: 'list' },
            totalQuantitySeats: { id: 'custrecord_f3mm_total_qty_seats', type: 'number' },
            startDate: { id: 'custrecord_f3mm_start_date', type: 'date' },
            endDate: { id: 'custrecord_f3mm_end_date', type: 'date' },
            memo: { id: 'custrecord_f3mm_memo', type: 'text' },
            salesRep: { id: 'custrecord_f3mm_sales_rep', type: 'list' },
            department: { id: 'custrecord_f3mm_department', type: 'list' },
            contractNumber: { id: 'custrecord_f3mm_contract_number', type: 'text' },
            status: { id: 'custrecord_f3mm_status', type: 'list' },
            poNumber: { id: 'custrecord_f3mm_po_number', type: 'text' },
            endUser: { id: 'custrecord_f3mm_end_user', type: 'list' } // TODO : delete this column
        };
    }
    ContractDAL.prototype.create = function (item) {
        var record = {};
        record.id = item.id;
        record[this.fields.customer.id] = item.customer;
        record[this.fields.primaryContact.id] = item.primary_contact;
        record[this.fields.contractVendor.id] = item.vendor;
        record[this.fields.totalQuantitySeats.id] = item.total_quantity_seats || 0;
        record[this.fields.startDate.id] = item.start_date;
        record[this.fields.endDate.id] = item.end_date;
        record[this.fields.memo.id] = item.memo;
        record[this.fields.salesRep.id] = item.sales_rep;
        record[this.fields.department.id] = item.department;
        record[this.fields.contractNumber.id] = item.contract_number;
        record[this.fields.status.id] = item.status;
        record[this.fields.poNumber.id] = item.po_number;
        return this.upsert(record);
    };
    return ContractDAL;
})(BaseTypeDAL);
//# sourceMappingURL=ContractDAL.js.map