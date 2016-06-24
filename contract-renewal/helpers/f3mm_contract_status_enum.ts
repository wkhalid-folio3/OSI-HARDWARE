/**
 * Created by zshaikh on 31/12/2015.
 */

enum ContractStatus {
    PENDING_REP_APPROVAL = 1,
    PENDING_CUSTOMER_APPROVAL = 2,
    APPROVED = 3,
    EXPIRED = 4,
    VOID = 5,
}


enum ContractNotificationType {
    QUOTE_GENERATION = 1,
    CONTRACT_REMINDER,
    CONTRACT_EXPIRATION,
    CONTRACT_RENEWAL,
    QUOTE_APPROVAL,
    QUOTE_APPROVAL_BY_CUSTOMER
}
