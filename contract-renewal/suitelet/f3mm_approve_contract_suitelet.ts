/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="../dal/f3mm_contract_dal.ts" />
/// <reference path="../dal/f3mm_folders_dal.ts" />
/// <reference path="../helpers/f3mm_config.ts" />
/// <reference path="../helpers/f3mm_contract_status_enum.ts" />

/**
 * Created by zshaikh on 30/12/2015.
 */

class ApproveContractSuitelet {
    constructor(request:nlobjRequest, response:nlobjResponse) {
        this.main(request, response);
    }

    /**
     * main method
     */
    public main(request:nlobjRequest, response:nlobjResponse) {
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "START");

        let context = nlapiGetContext();
        let userId = context.getUser();
        let isCustomer = request.getParameter('customer') === "T";
        let apiSuiteletScriptId = "customscript_f3mm_create_contract_api_st";
        let apiSuiteletDeploymentId = "customdeploy_f3mm_create_contract_api_st";
        let apiSuiteletUrl = nlapiResolveURL("SUITELET", apiSuiteletScriptId, apiSuiteletDeploymentId);
        let foldersDAL = new FoldersDAL();
        let contractDAL = new ContractDAL();
        let files = foldersDAL.getFiles(Config.ASSETS_FOLDER_ID, true);
        let externalLibs = foldersDAL.getFiles(Config.LIBS_FOLDER_ID, true);
        files = files.concat(externalLibs);

        let options = {};
        if (isCustomer === true ) {
            options = {
                customer: userId,
                status: [
                    ContractStatus.PENDING_CUSTOMER_APPROVAL,
                    ContractStatus.APPROVED
                ]
            }
        } else {
            options = {
                sales_rep: userId,
                status: [
                    ContractStatus.PENDING_REP_APPROVAL,
                    ContractStatus.PENDING_CUSTOMER_APPROVAL,
                    ContractStatus.APPROVED
                ]
            }
        }

        let pendingContracts = contractDAL.search(options).records;
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main(); // pendingContracts: ", JSON.stringify(pendingContracts));

        let html = `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"
          integrity="sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ=="
          crossorigin="anonymous"/>
            <link rel="stylesheet" type="text/css" media="screen" href="{{ styles.css }}" />
            <div class="f3mm-contract-renewal f3mm-contract-approval">
                <h3>Contracts</h3>
                <div class="contracts-container">
                    <div class="jsgrid">
                        <table class="table">
                            <thead>
                                <tr class="active">
                                    <th style="width: 12%">Contract #</th>
                                    <th style="width: 16%">Customer</th>
                                    <th style="width: 14%">Primary Contact</th>
                                    <th style="width: 8%">Start Date</th>
                                    <th style="width: 8%">End Date</th>
                                    <th style="width: 18%">Status</th>
                                    <th style="width: 10%">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{ContractsHTML}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="contract-loading-backdrop modal-backdrop fade in"></div>
            <div class="contract-loading in">
                <div class="contract-loading-text"><img src="{{ loading.gif }}"/></div>
            </div>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
            <script>

                function showLoading() {
                    var $loading = $(".contract-loading-backdrop,.contract-loading");
                    $loading.addClass("in").show();
                }

                function hideLoading() {
                    var $loading = $(".contract-loading-backdrop,.contract-loading");
                    $loading.removeClass("in").hide();
                }

                $(function() {
                    $('.jsgrid').on('click', '.btn-approve', function() {
                        showLoading();
                        var contractId = $(this).data('id');
                        var type = $(this).data('type');
                        var status = type === 'customer' ? 3 : 2; // 2 = customer approval pending, 3 = approved
                        var params = {cid: contractId, status : status};
                        $.getJSON('${apiSuiteletUrl}&action=changeStatus', { params: JSON.stringify(params) }, function(result) {
                            hideLoading();
                            window.location.reload();
                        });
                    });

                    $('.jsgrid').on('click', '.btn-generate-quote', function() {
                        showLoading();
                        var contractId = $(this).data('id');
                        var params = { contractId: contractId };
                        $.getJSON('${apiSuiteletUrl}&action=generate_quote', { params: JSON.stringify(params) }, function(result) {
                            hideLoading();
                            window.location.reload();
                        });
                    });
                });
            </script>
        `;

        // replace file names in template
        for (let i in files) {
            if (files.hasOwnProperty(i)) {
                let fileInfo = files[i];
                html = html.replace("{{ " + fileInfo.name + " }}", fileInfo.url);
            }
        }

        let contractSuiteletScriptId = "customscript_f3mm_create_contract_ui_st";
        let contractSuiteletDeploymentId = "customdeploy_f3mm_create_contract_ui_st";
        let contractSuiteletUrl = nlapiResolveURL("SUITELET", contractSuiteletScriptId, contractSuiteletDeploymentId);
        let contractFields = contractDAL.fields;
        let contractRowsHtml = "";
        if (pendingContracts && pendingContracts.length) {
            for (let i in pendingContracts) {
                if (pendingContracts.hasOwnProperty(i)) {
                    let contract = pendingContracts[i];
                    let contractStatusId = parseInt(contract[contractFields.status.id].value, 10);
                    let customerId = contract[contractFields.customer.id].value;
                    let vendorId = contract[contractFields.contractVendor.id].value;
                    let primaryContactId = contract[contractFields.primaryContact.id].value;
                    let buttonHtml = "";

                    if (isCustomer === true) {
                        if (contractStatusId === ContractStatus.APPROVED) {
                            buttonHtml = "Approved";
                        } else if (contractStatusId === ContractStatus.PENDING_CUSTOMER_APPROVAL) {
                            buttonHtml = `<a href="javascript:;"
                                    data-type="customer"
                                    data-id="${contract.internalid}"
                                    class="btn btn-sm btn-primary btn-approve">
                                    Approve
                                </a>`;
                        }

                        contractRowsHtml += `<tr class="jsgrid-row">
                            <td>
                                ${contract[contractFields.contractNumber.id]}
                            </td>
                            <td>
                                ${contract[contractFields.customer.id].text}
                            </td>
                            <td>
                                ${contract[contractFields.primaryContact.id].text}
                            </td>
                            <td>${contract[contractFields.startDate.id]}</td>
                            <td>${contract[contractFields.endDate.id]}</td>
                            <td>${contract[contractFields.status.id].text}</td>
                            <td>
                                ${buttonHtml}
                            </td>
                        </tr>`;

                    } else {
                        if (contractStatusId === ContractStatus.APPROVED) {
                            buttonHtml = "Approved";
                        } else if (contractStatusId === ContractStatus.PENDING_CUSTOMER_APPROVAL) {
                            buttonHtml = `<a href="javascript:;"
                                    data-type="customer"
                                    data-id="${contract.internalid}"
                                    class="btn btn-sm btn-primary btn-generate-quote">
                                    Generate Quote
                                </a>`;
                        } else {
                            buttonHtml = `<a href="javascript:;"
                                    data-type="salesrep"
                                    data-id="${contract.internalid}"
                                    class="btn btn-sm btn-primary btn-approve">
                                    Approve
                                </a>`;
                        }


                        contractRowsHtml += `<tr class="jsgrid-row">
                            <td>
                                <a href="${contractSuiteletUrl}&cid=${contract.internalid}" target="_blank">
                                    ${contract[contractFields.contractNumber.id]}
                                </a>
                            </td>
                            <td>
                                <a href="/app/common/entity/custjob.nl?id=${customerId}" target="_blank">
                                    ${contract[contractFields.customer.id].text}
                                </a>
                            </td>
                            <td>
                                <a href="/app/common/entity/contact.nl?id=${primaryContactId}" target="_blank">
                                    ${contract[contractFields.primaryContact.id].text}
                                </a>
                            </td>
                            <!--td>
                                <a href="/app/common/entity/vendor.nl?id=${vendorId}" target="_blank">
                                    ${contract[contractFields.contractVendor.id].text}
                                </a>
                            </td-->
                            <td>${contract[contractFields.startDate.id]}</td>
                            <td>${contract[contractFields.endDate.id]}</td>
                            <td>${contract[contractFields.status.id].text}</td>
                            <td>
                                ${buttonHtml}
                            </td>
                        </tr>`;
                    }


                }
            }
        } else {
            contractRowsHtml = `<tr><td colspan="8">no contracts found</td></tr>`;
        }

        html = html.replace("{{ContractsHTML}}", contractRowsHtml);

        response.write(html);
        F3.Util.Utility.logDebug("ApproveContractSuitelet.main()", "END");
    }
}

/**
 * This is the main entry point for ListContractsUISuitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function ApproveContractSuiteletMain(request, response) {
    return new ApproveContractSuitelet(request, response);
}
