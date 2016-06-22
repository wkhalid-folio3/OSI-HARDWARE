/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm_data_manager.ts" />
/// <reference path="./f3mm_list_contracts_ui_manager.ts" />

declare var apiSuiteletUrl: string;

/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - f3mm-init
 *
 * Dependencies:
 * - f3mm_data_manager.ts
 * - f3mm_jquery_validation.ts
 * - f3mm_jquery_plugins.ts
 * - f3mm_jsgrid_fields.ts
 *
 * External Library Dependencies:
 * - jsgrid_customized.js (with some customizations)
 * - underscore-min.js
 * - jquery-1.11.0.min.js
 * - typeahead.jquery.min.js
 * - bootstrap-datepicker.min.js
 */
/**
 * User Interface Manager class
 * Responsible for:
 *  - Building UI
 *  - Populating different UI controls with required data
 *  - Capturing data from user actions (click, filed change) and performing respective actions
 *  - Sending captured data to DataManager class if required.
 *  - Manipulating User Interface based on server response.
 */
class ApproveContractsUIManager extends ListContractsUIManager {

    public data: any[];

    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    constructor() {

        $(document.body).addClass("contracts-approval-page");

        if (window.userType !== "customer") {
            $(".form-group-customer, .form-group-status").removeClass("hidden");
        }


        let $modal = $(".modal-notifications");
        $modal.on("show.bs.modal", (ev) => {
            let $button = $(ev.relatedTarget);
            let contractId = $button.data("id");
            let contracts = this.data;
            let contract = _(contracts).find((c) => c.id == contractId);
            console.log("contract:", contract);

            $modal.data("contract-id", contractId);
            $modal.find(".notification-1-day").prop("checked", contract.custrecord_f3mm_notif_1day_prior === "T");
            $modal.find(".notification-3-days").prop("checked", contract.custrecord_f3mm_notif_3days_prior === "T");
            $modal.find(".notification-5-days").prop("checked", contract.custrecord_f3mm_notif_5days_prior === "T");
            $modal.find(".notification-expiration").prop("checked", contract.custrecord_f3mm_notif_on_expiration === "T");
            $modal.find(".notification-quote-approval").prop("checked", contract.custrecord_f3mm_notif_on_quote_approval === "T");
            $modal.find(".notification-renewal").prop("checked", contract.custrecord_f3mm_notif_on_renewal === "T");
        });

        let self = this;
        $modal.find(".btn-submit").on("click", (ev) => {
            self.showLoading();
            let serializedData = $modal.find(".form-horizontal :input").serializeObject();
            let contractId = $modal.data("contract-id");
            serializedData.id = contractId;
            self._dataManager.updateNotifications(serializedData, (result) => {
                console.log("submit success:", result);

                if (!!result.data) {
                    self.hideLoading();
                    window.location.reload();
                } else {
                    alert(result.message);
                    this.hideLoading();
                }
            });
        });

        super();
    }


    /**
     * Search contracts based on the filters passed
     * @returns {Promise} promise object which will be resolved/rejected in future
     */
    public search(filter) {
        let promise = $.Deferred();

        let options = this.getFilters(filter);
        console.log('User Type: ', options.userType);

        if (options.userType === "salesrep" || options.userType === "customer") {
            if (jQuery.isEmptyObject(options.sortFields)) {
                options.sortFields["custrecord_f3mm_end_date"] = "asc";
            }
        }

        this._dataManager.searchContracts(options, result => {
            let data = this.prepareGridData(result.data.records);
            this.data = data;

            let label = "1 record";
            if (result.data.total !== 1) {
                label = result.data.total + " records";
            }
            $(".total_records_label").html(label);

            promise.resolve({
                data: data,
                itemsCount: result.data.total
            });
        });

        return promise.promise();
    }

    /**
     * Filter records based on the filter elements' values on ui
     * @returns {void}
     */
    public filter() {
        $("#jsGrid").jsGrid("search");
    }




    /**
     * Binds Contract Items with the Grid
     * @returns {void}
     */
    public bindContractsGrid() {

        this._priceLevels = [{
            id: 0,
            name: ""
        }];

        let gridFields = this.prepareGridFields();
        let $grid = $("#jsGrid");

        $grid.jsGrid({
            autoload: true,
            controller: {
                deleteItem: this.deleteContract.bind(this),
                loadData: this.search.bind(this)
            },
            deleteConfirm: "Are you sure you want to delete this contract?",
            editing: false,
            fields: gridFields,
            filtering: false,
            height: "auto",
            inserting: false,
            noDataContent: "No items added.",
            onItemUpdated: this.onGridItemUpdated.bind(this),
            onItemUpdating: this.onGridItemUpdating.bind(this),
            pageLoading: true,
            paging: false,
            selecting: false,
            sorting: true,
            width: "100%"
        });

        $grid.on("focusin", ".jsgrid-edit-row .primary-contact", (ev) => {
            this.bindPrimaryContactDropdown($(ev.target));
        });
        $grid.on("focusin click", ".jsgrid-edit-row .start-date, .jsgrid-edit-row .end-date", (ev) => {
            this.bindDatePicker(ev);
        });

        $grid.on("click", ".select-all", this.selectAll.bind(this));
        $(".edit-grid-checkbox").on("click", this.enableEditing.bind(this));
        $(".btn-void").on("click", this.voidSelected.bind(this));
        $(".export-to-csv-link").on("click", this.exportToCSV.bind(this));


        let self = this;
        $(".jsgrid").on("click", ".btn-approve", function (e) {
            let contractId = $(this).data("id");
            let type = $(this).data("type");

            if (type === "salesrep") {
                if (!confirm("Approving this quote will send an email to customer. Are you sure you want to do it?")) {
                    e.preventDefault();
                    return false;
                }
            }

            self.showLoading();
            let status = type === "customer" ? 3 : 2; // 2 = customer approval pending, 3 = approved
            let params = {cid: contractId, status: status};
            $.getJSON(`${window.apiSuiteletUrl}&action=changeStatus`, {
                params: JSON.stringify(params)
            }, function (result) {
                self.hideLoading();
                window.location.reload();
            });
        });


        $(".jsgrid").on("click", ".btn-generate-quote", function () {
            self.showLoading();
            let contractId = $(this).data("id");
            let params = {contractId: contractId};
            $.getJSON(`${window.apiSuiteletUrl}&action=generate_quote`, {
                params: JSON.stringify(params)
            }, function (result) {
                self.hideLoading();
                window.location.reload();
            });
        });

    }

    /**
     * Binds All Dropdowns with required data
     */
    public bindDropdown() {

        //// fill partners dropdown
        // this._dataManager.getVendors((result) => {
        //    // make it async
        //    setTimeout(() => {
        //        var select = document.getElementById('vendor');
        //        if (result.status_code === 200) {
        //
        //            // add each item on UI
        //            $.each(result.data, function(i, item) {
        //                var name = item.isperson === 'T' ? (item.firstname + ' ' + item.lastname) : item.companyname;
        //                if (!!name) {
        //                    select.options[select.options.length] = new Option(name, item.id);
        //                }
        //            });
        //        }
        //    }, 10);
        // });

        $(document.body).on("focusin", ".customer-dropdown", (ev) => {
            this.bindCustomerDropdown($(ev.target));
        });

    }

    protected getFilters(filter) {
        let startIndex = (filter.pageIndex - 1) * filter.pageSize;
        let sortField = filter.sortField;

        let serializedData = $(".form-horizontal :input, .form-inline :input").serializeObject();
        let validated = this.validateFields();

        // if not valid then return
        if (validated === false) {
            return;
        }

        let options:any = {
            pageSize: filter.pageSize,
            sortFields: {},
            startIndex: startIndex
        };

        $.extend(options, serializedData);

        if (!!sortField) {
            let rootFieldLength = sortField.indexOf(".");
            sortField = sortField.substring(0, rootFieldLength > -1 ? rootFieldLength : sortField.length);
            options.sortFields[sortField] = filter.sortOrder;
        }




        if (!!validated.customerId) {
            options.customer = validated.customerId;
        }

        if (options.isinactive === "on") {
            options.isinactive = true;
        }

        options.userType = window.userType;

        // override some filters
        // these are set from approve contracts suitelet
        if (options.userType === "salesrep") {
            options.sales_rep = window.userid;
            // options.status = [1,2,3];
        } else if (options.userType === "customer") {
            options.customer = window.userid;
            options.status = [2,3];
        }

        return options;
    }

    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    protected prepareGridData(contractsInfo): any[] {
        return contractsInfo;
    }

    /**
     * Prepares Grid fields before initializing the grid
     * @returns {object[]} returns array of fields
     */
    protected prepareGridFields(): any[] {

        let gridFields = [{
            css: "contract-number",
            itemTemplate: (_, item) => {
                if (window.userType === "customer") {
                    return _;
                } else {
                    return `<a href="${window.createSuiteletUrl}&cid=${item.id}" target="_blank">${_}</a>`;
                }
            },
            name: "custrecord_f3mm_contract_number",
            title: "Contract #",
            type: "text",
            width: 150
        }, {
            editing: false,
            name: "custrecord_f3mm_customer.text",
            title: "Customer",
            type: "text",
            width: 120
        }, {
            css: "primary-contact",
            name: "custrecord_f3mm_primary_contact.text",
            title: "Primary Contact",
            type: "text",
            width: 120
        }, /*{
            editing: false,
            name: "custrecord_f3mm_primary_contact_email",
            title: "Primary Contact Email",
            type: "text",
            width: 150,
        }, */ {
            editing: false,
            name: "custrecord_f3mm_contract_vendor.text",
            title: "Contract Vendor",
            type: "text",
            width: 90
        }, {
            editTemplate: function (_, item) {

                let $html = $(`<div class="input-group input-group-sm date start-date">
                    <input type="text" class="form-control" />
                    <span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>
                    </div>`);

                this.editControl = $html.find("input");

                this.editControl.val(_);

                return $html;
            },
            name: "custrecord_f3mm_start_date",
            title: "Start Date",
            type: "text",
            width: 100,

        }, {
            editTemplate: function (_, item) {

                let $html = $(`<div class="input-group input-group-sm date end-date">
                    <input type="text" class="form-control" />
                    <span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>
                    </div>`);

                this.editControl = $html.find("input");

                this.editControl.val(_);

                return $html;
            },
            name: "custrecord_f3mm_end_date",
            title: "End Date",
            type: "text",
            width: 100
        }, {
            editing: false,
            name: "custrecord_f3mm_status.text",
            title: "Status",
            type: "text",
            width: 100
        }, {
            css: "action-buttons",
            editing: false,
            itemTemplate: (_, item) => {
                let contractItems = item && item.sublists && item.sublists.recmachcustrecord_f3mm_ci_contract;
                let firstItem = contractItems && contractItems.length && contractItems[0];
                let description = firstItem && firstItem.custrecord_f3mm_ci_item_description;
                let itemName = firstItem.custrecord_f3mm_ci_item && firstItem.custrecord_f3mm_ci_item.text;
                let html = "";

                if (window.userType === "salesrep") {
                    html += `<a href="javascript:;"
                            data-id="${item.internalid}"
                            title="Generate Quote"
                            class="btn btn-sm btn-primary btn-generate-quote">
                            <i class="fa fa-plus-square-o"></i>
                        </a>`;
                } else {
                    html += `<a href="#" data-toggle="modal" data-target=".modal-notifications"
                            data-id="${item.internalid}"
                            title="Notifications"
                            class="btn btn-sm btn-primary btn-change-notifications">
                            <i class="fa fa-bell"></i>
                        </a>`;
                }

                let quotes = item.sublists.quotes;
                if (!!quotes && quotes.length > 0) {
                    let lastQuote = quotes[quotes.length - 1];
                    let viewQuoteUrl = nlapiResolveURL("RECORD", "estimate", lastQuote.id, false);
                    html += `<a href="${viewQuoteUrl}"
                            target="_blank"
                            title="View Quote"
                            class="btn btn-sm btn-primary btn-view-quote">
                            <i class="fa fa-file-text-o"></i>
                        </a>`;

                    if (window.userType === "customer") {
                        if (item.custrecord_f3mm_status.value === "2") {
                            html += `<a href="javascript:;"
                                    data-type="customer"
                                    data-id="${item.internalid}"
                                    title="Approve Quote"
                                    class="btn btn-sm btn-primary btn-approve">
                                    <i class="fa fa-check"></i>
                                </a>`;
                        }
                    } else if (window.userType === "salesrep") {
                        if (item.custrecord_f3mm_status.value === "1") {
                            html += `<a href="javascript:;"
                                    data-type="salesrep"
                                    data-id="${item.internalid}"
                                    title="Approve Quote"
                                    class="btn btn-sm btn-primary btn-approve">
                                    <i class="fa fa-check"></i>
                                </a>`;
                        }
                    }
                }

                return html;
            },
            name: "internalid",
            sorting: false,
            title: "Actions",
            type: "text",
            width: 120
        }];

        return gridFields;
    }


}
