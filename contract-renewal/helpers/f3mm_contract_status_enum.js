/**
 * Created by zshaikh on 31/12/2015.
 */
var ContractStatus;
(function (ContractStatus) {
    ContractStatus[ContractStatus["PENDING_REP_APPROVAL"] = 1] = "PENDING_REP_APPROVAL";
    ContractStatus[ContractStatus["PENDING_CUSTOMER_APPROVAL"] = 2] = "PENDING_CUSTOMER_APPROVAL";
    ContractStatus[ContractStatus["APPROVED"] = 3] = "APPROVED";
    ContractStatus[ContractStatus["EXPIRED"] = 4] = "EXPIRED";
    ContractStatus[ContractStatus["VOID"] = 5] = "VOID";
})(ContractStatus || (ContractStatus = {}));
//# sourceMappingURL=f3mm_contract_status_enum.js.map