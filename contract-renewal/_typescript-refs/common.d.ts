/**
 * Created by zshaikh on 2/18/2016.
 */

interface CreateContractUIManager {}
interface ApproveContractsUIManager {}
interface ListContractsUIManager {}

interface Window {
    createContractUIManager: CreateContractUIManager;
    approveContractsUIManager: ApproveContractsUIManager;
    listContractsUIManager: ListContractsUIManager;
    apiSuiteletUrl: string;
    userType: string;
}
