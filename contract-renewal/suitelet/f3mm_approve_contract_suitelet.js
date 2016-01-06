/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../helpers/f3mm_contract_status_enum.ts" />
/**
 * Created by zshaikh on 30/12/2015.
 */
var ApproveContractSuitelet = (function () {
    function ApproveContractSuitelet(request, response) {
        this.main(request, response);
    }
    /**
     * main method
     */
    ApproveContractSuitelet.prototype.main = function (request, response) {
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "START");
        var context = nlapiGetContext();
        var userId = context.getUser();
        var isCustomer = request.getParameter('customer') === "T";
        var apiSuiteletScriptId = "customscript_f3mm_create_contract_api_st";
        var apiSuiteletDeploymentId = "customdeploy_f3mm_create_contract_api_st";
        var apiSuiteletUrl = nlapiResolveURL("SUITELET", apiSuiteletScriptId, apiSuiteletDeploymentId);
        var foldersDAL = new FoldersDAL();
        var contractDAL = new ContractDAL();
        var files = foldersDAL.getFiles(Config.ASSETS_FOLDER_ID, true);
        var externalLibs = foldersDAL.getFiles(Config.LIBS_FOLDER_ID, true);
        files = files.concat(externalLibs);
        var options = {};
        if (isCustomer === true) {
            options = {
                customer: userId,
                status: [
                    ContractStatus.PENDING_CUSTOMER_APPROVAL,
                    ContractStatus.APPROVED
                ]
            };
        }
        else {
            options = {
                sales_rep: userId,
                status: [
                    ContractStatus.PENDING_REP_APPROVAL,
                    ContractStatus.PENDING_CUSTOMER_APPROVAL,
                    ContractStatus.APPROVED
                ]
            };
        }
        var pendingContracts = contractDAL.search(options).records;
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main(); // pendingContracts: ", JSON.stringify(pendingContracts));
        var html = "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css\"\n          integrity=\"sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ==\"\n          crossorigin=\"anonymous\"/>\n            <link rel=\"stylesheet\" type=\"text/css\" media=\"screen\" href=\"{{ styles.css }}\" />\n            <div class=\"f3mm-contract-renewal f3mm-contract-approval\">\n                <h3>Contracts</h3>\n                <div class=\"contracts-container\">\n                    <div class=\"jsgrid\">\n                        <table class=\"table\">\n                            <thead>\n                                <tr class=\"active\">\n                                    <th style=\"width: 12%\">Contract #</th>\n                                    <th style=\"width: 16%\">Customer</th>\n                                    <th style=\"width: 14%\">Primary Contact</th>\n                                    <th style=\"width: 8%\">Start Date</th>\n                                    <th style=\"width: 8%\">End Date</th>\n                                    <th style=\"width: 18%\">Status</th>\n                                    <th style=\"width: 10%\">Action</th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                {{ContractsHTML}}\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </div>\n            <div class=\"contract-loading-backdrop modal-backdrop fade in\"></div>\n            <div class=\"contract-loading in\">\n                <div class=\"contract-loading-text\"><img src=\"{{ loading.gif }}\"/></div>\n            </div>\n            <script src=\"https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js\"></script>\n            <script>\n\n                function showLoading() {\n                    var $loading = $(\".contract-loading-backdrop,.contract-loading\");\n                    $loading.addClass(\"in\").show();\n                }\n\n                function hideLoading() {\n                    var $loading = $(\".contract-loading-backdrop,.contract-loading\");\n                    $loading.removeClass(\"in\").hide();\n                }\n\n                $(function() {\n                    $('.jsgrid').on('click', '.btn-approve', function() {\n                        showLoading();\n                        var contractId = $(this).data('id');\n                        var type = $(this).data('type');\n                        var status = type === 'customer' ? 3 : 2; // 2 = customer approval pending, 3 = approved\n                        var params = {cid: contractId, status : status};\n                        $.getJSON('" + apiSuiteletUrl + "&action=changeStatus', { params: JSON.stringify(params) }, function(result) {\n                            hideLoading();\n                            window.location.reload();\n                        });\n                    });\n\n                    $('.jsgrid').on('click', '.btn-generate-quote', function() {\n                        showLoading();\n                        var contractId = $(this).data('id');\n                        var params = { contractId: contractId };\n                        $.getJSON('" + apiSuiteletUrl + "&action=generate_quote', { params: JSON.stringify(params) }, function(result) {\n                            hideLoading();\n                            window.location.reload();\n                        });\n                    });\n                });\n            </script>\n        ";
        // replace file names in template
        for (var i in files) {
            if (files.hasOwnProperty(i)) {
                var fileInfo = files[i];
                html = html.replace("{{ " + fileInfo.name + " }}", fileInfo.url);
            }
        }
        var contractSuiteletScriptId = "customscript_f3mm_create_contract_ui_st";
        var contractSuiteletDeploymentId = "customdeploy_f3mm_create_contract_ui_st";
        var contractSuiteletUrl = nlapiResolveURL("SUITELET", contractSuiteletScriptId, contractSuiteletDeploymentId);
        var contractFields = contractDAL.fields;
        var contractRowsHtml = "";
        if (pendingContracts && pendingContracts.length) {
            for (var i in pendingContracts) {
                if (pendingContracts.hasOwnProperty(i)) {
                    var contract = pendingContracts[i];
                    var contractStatusId = parseInt(contract[contractFields.status.id].value, 10);
                    var customerId = contract[contractFields.customer.id].value;
                    var vendorId = contract[contractFields.contractVendor.id].value;
                    var primaryContactId = contract[contractFields.primaryContact.id].value;
                    var buttonHtml = "";
                    if (isCustomer === true) {
                        if (contractStatusId === ContractStatus.APPROVED) {
                            buttonHtml = "Approved";
                        }
                        else if (contractStatusId === ContractStatus.PENDING_CUSTOMER_APPROVAL) {
                            buttonHtml = "<a href=\"javascript:;\"\n                                    data-type=\"customer\"\n                                    data-id=\"" + contract.internalid + "\"\n                                    class=\"btn btn-sm btn-primary btn-approve\">\n                                    Approve\n                                </a>";
                        }
                        contractRowsHtml += "<tr class=\"jsgrid-row\">\n                            <td>\n                                " + contract[contractFields.contractNumber.id] + "\n                            </td>\n                            <td>\n                                " + contract[contractFields.customer.id].text + "\n                            </td>\n                            <td>\n                                " + contract[contractFields.primaryContact.id].text + "\n                            </td>\n                            <td>" + contract[contractFields.startDate.id] + "</td>\n                            <td>" + contract[contractFields.endDate.id] + "</td>\n                            <td>" + contract[contractFields.status.id].text + "</td>\n                            <td>\n                                " + buttonHtml + "\n                            </td>\n                        </tr>";
                    }
                    else {
                        if (contractStatusId === ContractStatus.APPROVED) {
                            buttonHtml = "Approved";
                        }
                        else if (contractStatusId === ContractStatus.PENDING_CUSTOMER_APPROVAL) {
                            buttonHtml = "<a href=\"javascript:;\"\n                                    data-type=\"customer\"\n                                    data-id=\"" + contract.internalid + "\"\n                                    class=\"btn btn-sm btn-primary btn-generate-quote\">\n                                    Generate Quote\n                                </a>";
                        }
                        else {
                            buttonHtml = "<a href=\"javascript:;\"\n                                    data-type=\"salesrep\"\n                                    data-id=\"" + contract.internalid + "\"\n                                    class=\"btn btn-sm btn-primary btn-approve\">\n                                    Approve\n                                </a>";
                        }
                        contractRowsHtml += "<tr class=\"jsgrid-row\">\n                            <td>\n                                <a href=\"" + contractSuiteletUrl + "&cid=" + contract.internalid + "\" target=\"_blank\">\n                                    " + contract[contractFields.contractNumber.id] + "\n                                </a>\n                            </td>\n                            <td>\n                                <a href=\"/app/common/entity/custjob.nl?id=" + customerId + "\" target=\"_blank\">\n                                    " + contract[contractFields.customer.id].text + "\n                                </a>\n                            </td>\n                            <td>\n                                <a href=\"/app/common/entity/contact.nl?id=" + primaryContactId + "\" target=\"_blank\">\n                                    " + contract[contractFields.primaryContact.id].text + "\n                                </a>\n                            </td>\n                            <!--td>\n                                <a href=\"/app/common/entity/vendor.nl?id=" + vendorId + "\" target=\"_blank\">\n                                    " + contract[contractFields.contractVendor.id].text + "\n                                </a>\n                            </td-->\n                            <td>" + contract[contractFields.startDate.id] + "</td>\n                            <td>" + contract[contractFields.endDate.id] + "</td>\n                            <td>" + contract[contractFields.status.id].text + "</td>\n                            <td>\n                                " + buttonHtml + "\n                            </td>\n                        </tr>";
                    }
                }
            }
        }
        else {
            contractRowsHtml = "<tr><td colspan=\"8\">no contracts found</td></tr>";
        }
        html = html.replace("{{ContractsHTML}}", contractRowsHtml);
        response.write(html);
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "END");
    };
    return ApproveContractSuitelet;
})();
/**
 * This is the main entry point for ListContractsUISuitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function ApproveContractSuiteletMain(request, response) {
    return new ApproveContractSuitelet(request, response);
}
//# sourceMappingURL=f3mm_approve_contract_suitelet.js.map