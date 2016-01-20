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
var ContractNotificationType;
(function (ContractNotificationType) {
    ContractNotificationType[ContractNotificationType["QUOTE_GENERATION"] = 1] = "QUOTE_GENERATION";
    ContractNotificationType[ContractNotificationType["CONTRACT_REMINDER"] = 2] = "CONTRACT_REMINDER";
    ContractNotificationType[ContractNotificationType["CONTRACT_EXPIRATION"] = 3] = "CONTRACT_EXPIRATION";
    ContractNotificationType[ContractNotificationType["CONTRACT_RENEWAL"] = 4] = "CONTRACT_RENEWAL";
})(ContractNotificationType || (ContractNotificationType = {}));
//# sourceMappingURL=f3mm_contract_status_enum.js.map