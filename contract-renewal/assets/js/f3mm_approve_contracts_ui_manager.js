/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm_data_manager.ts" />
/// <reference path="./f3mm_list_contracts_ui_manager.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var ApproveContractsUIManager = (function (_super) {
    __extends(ApproveContractsUIManager, _super);
    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    function ApproveContractsUIManager() {
        var _this = this;
        $(document.body).addClass("contracts-approval-page");
        if (window.userType !== "customer") {
            $(".form-group-customer, .form-group-status").removeClass("hidden");
        }
        var $modal = $(".modal-notifications");
        $modal.on("show.bs.modal", function (ev) {
            var $button = $(ev.relatedTarget);
            var contractId = $button.data("id");
            var contracts = _this.data;
            var contract = _(contracts).find(function (c) { return c.id == contractId; });
            console.log("contract:", contract);
            $modal.data("contract-id", contractId);
            $modal.find(".notification-1-day").prop("checked", contract.custrecord_f3mm_notif_1day_prior === "T");
            $modal.find(".notification-3-days").prop("checked", contract.custrecord_f3mm_notif_3days_prior === "T");
            $modal.find(".notification-5-days").prop("checked", contract.custrecord_f3mm_notif_5days_prior === "T");
            $modal.find(".notification-expiration").prop("checked", contract.custrecord_f3mm_notif_on_expiration === "T");
            $modal.find(".notification-quote-approval").prop("checked", contract.custrecord_f3mm_notif_on_quote_approval === "T");
            $modal.find(".notification-renewal").prop("checked", contract.custrecord_f3mm_notif_on_renewal === "T");
        });
        var self = this;
        $modal.find(".btn-submit").on("click", function (ev) {
            self.showLoading();
            var serializedData = $modal.find(".form-horizontal :input").serializeObject();
            var contractId = $modal.data("contract-id");
            serializedData.id = contractId;
            self._dataManager.updateNotifications(serializedData, function (result) {
                console.log("submit success:", result);
                if (!!result.data) {
                    self.hideLoading();
                    window.location.reload();
                }
                else {
                    alert(result.message);
                    _this.hideLoading();
                }
            });
        });
        _super.call(this);
    }
    /**
     * Search contracts based on the filters passed
     * @returns {Promise} promise object which will be resolved/rejected in future
     */
    ApproveContractsUIManager.prototype.search = function (filter) {
        var _this = this;
        var promise = $.Deferred();
        var options = this.getFilters(filter);
        this._dataManager.searchContracts(options, function (result) {
            var data = _this.prepareGridData(result.data.records);
            _this.data = data;
            var label = "1 record";
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
    };
    /**
     * Filter records based on the filter elements' values on ui
     * @returns {void}
     */
    ApproveContractsUIManager.prototype.filter = function () {
        $("#jsGrid").jsGrid("search");
    };
    /**
     * Binds Contract Items with the Grid
     * @returns {void}
     */
    ApproveContractsUIManager.prototype.bindContractsGrid = function () {
        var _this = this;
        this._priceLevels = [{
                id: 0,
                name: ""
            }];
        var gridFields = this.prepareGridFields();
        var $grid = $("#jsGrid");
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
        $grid.on("focusin", ".jsgrid-edit-row .primary-contact", function (ev) {
            _this.bindPrimaryContactDropdown($(ev.target));
        });
        $grid.on("focusin click", ".jsgrid-edit-row .start-date, .jsgrid-edit-row .end-date", function (ev) {
            _this.bindDatePicker(ev);
        });
        $grid.on("click", ".select-all", this.selectAll.bind(this));
        $(".edit-grid-checkbox").on("click", this.enableEditing.bind(this));
        $(".btn-void").on("click", this.voidSelected.bind(this));
        $(".export-to-csv-link").on("click", this.exportToCSV.bind(this));
        var self = this;
        $(".jsgrid").on("click", ".btn-approve", function (e) {
            var contractId = $(this).data("id");
            var type = $(this).data("type");
            if (type === "salesrep") {
                if (!confirm("Approving this quote will send an email to customer. Are you sure you want to do it?")) {
                    e.preventDefault();
                    return false;
                }
            }
            self.showLoading();
            var status = type === "customer" ? 3 : 2; // 2 = customer approval pending, 3 = approved
            var params = { cid: contractId, status: status };
            $.getJSON(window.apiSuiteletUrl + "&action=changeStatus", {
                params: JSON.stringify(params)
            }, function (result) {
                self.hideLoading();
                window.location.reload();
            });
        });
        $(".jsgrid").on("click", ".btn-generate-quote", function () {
            self.showLoading();
            var contractId = $(this).data("id");
            var params = { contractId: contractId };
            $.getJSON(window.apiSuiteletUrl + "&action=generate_quote", {
                params: JSON.stringify(params)
            }, function (result) {
                self.hideLoading();
                window.location.reload();
            });
        });
    };
    /**
     * Binds All Dropdowns with required data
     */
    ApproveContractsUIManager.prototype.bindDropdown = function () {
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
        var _this = this;
        $(document.body).on("focusin", ".customer-dropdown", function (ev) {
            _this.bindCustomerDropdown($(ev.target));
        });
    };
    ApproveContractsUIManager.prototype.getFilters = function (filter) {
        var startIndex = (filter.pageIndex - 1) * filter.pageSize;
        var sortField = filter.sortField;
        var serializedData = $(".form-horizontal :input, .form-inline :input").serializeObject();
        var validated = this.validateFields();
        // if not valid then return
        if (validated === false) {
            return;
        }
        var options = {
            pageSize: filter.pageSize,
            sortFields: {},
            startIndex: startIndex
        };
        $.extend(options, serializedData);
        if (!!sortField) {
            var rootFieldLength = sortField.indexOf(".");
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
        }
        else if (options.userType === "customer") {
            options.customer = window.userid;
            options.status = [2, 3];
        }
        return options;
    };
    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    ApproveContractsUIManager.prototype.prepareGridData = function (contractsInfo) {
        return contractsInfo;
    };
    /**
     * Prepares Grid fields before initializing the grid
     * @returns {object[]} returns array of fields
     */
    ApproveContractsUIManager.prototype.prepareGridFields = function () {
        var gridFields = [{
                css: "contract-number",
                itemTemplate: function (_, item) {
                    if (window.userType === "customer") {
                        return _;
                    }
                    else {
                        return "<a href=\"" + window.createSuiteletUrl + "&cid=" + item.id + "\" target=\"_blank\">" + _ + "</a>";
                    }
                },
                name: "custrecord_f3mm_contract_number",
                title: "Contract #",
                type: "text",
                width: 75
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
            },
            {
                editing: false,
                name: "custrecord_f3mm_contract_vendor.text",
                title: "Contract Vendor",
                type: "text",
                width: 90
            }, {
                editTemplate: function (_, item) {
                    var $html = $("<div class=\"input-group input-group-sm date start-date\">\n                    <input type=\"text\" class=\"form-control\" />\n                    <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-calendar\"></i></span>\n                    </div>");
                    this.editControl = $html.find("input");
                    this.editControl.val(_);
                    return $html;
                },
                name: "custrecord_f3mm_start_date",
                title: "Start Date",
                type: "text",
                width: 100
            }, {
                editTemplate: function (_, item) {
                    var $html = $("<div class=\"input-group input-group-sm date end-date\">\n                    <input type=\"text\" class=\"form-control\" />\n                    <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-calendar\"></i></span>\n                    </div>");
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
                itemTemplate: function (_, item) {
                    var contractItems = item && item.sublists && item.sublists.recmachcustrecord_f3mm_ci_contract;
                    var firstItem = contractItems && contractItems.length && contractItems[0];
                    var description = firstItem && firstItem.custrecord_f3mm_ci_item_description;
                    var itemName = firstItem.custrecord_f3mm_ci_item && firstItem.custrecord_f3mm_ci_item.text;
                    var html = "";
                    if (window.userType === "salesrep") {
                        html += "<a href=\"javascript:;\"\n                            data-id=\"" + item.internalid + "\"\n                            title=\"Generate Quote\"\n                            class=\"btn btn-sm btn-primary btn-generate-quote\">\n                            <i class=\"fa fa-plus-square-o\"></i>\n                        </a>";
                    }
                    else {
                        html += "<a href=\"#\" data-toggle=\"modal\" data-target=\".modal-notifications\"\n                            data-id=\"" + item.internalid + "\"\n                            title=\"Notifications\"\n                            class=\"btn btn-sm btn-primary btn-change-notifications\">\n                            <i class=\"fa fa-bell\"></i>\n                        </a>";
                    }
                    var quotes = item.sublists.quotes;
                    if (!!quotes && quotes.length > 0) {
                        var lastQuote = quotes[quotes.length - 1];
                        var viewQuoteUrl = nlapiResolveURL("RECORD", "estimate", lastQuote.id, false);
                        html += "<a href=\"" + viewQuoteUrl + "\"\n                            target=\"_blank\"\n                            title=\"View Quote\"\n                            class=\"btn btn-sm btn-primary btn-view-quote\">\n                            <i class=\"fa fa-file-text-o\"></i>\n                        </a>";
                        if (window.userType === "customer") {
                            if (item.custrecord_f3mm_status.value === "2") {
                                html += "<a href=\"javascript:;\"\n                                    data-type=\"customer\"\n                                    data-id=\"" + item.internalid + "\"\n                                    title=\"Approve Quote\"\n                                    class=\"btn btn-sm btn-primary btn-approve\">\n                                    <i class=\"fa fa-check\"></i>\n                                </a>";
                            }
                        }
                        else if (window.userType === "salesrep") {
                            if (item.custrecord_f3mm_status.value === "1") {
                                html += "<a href=\"javascript:;\"\n                                    data-type=\"salesrep\"\n                                    data-id=\"" + item.internalid + "\"\n                                    title=\"Approve Quote\"\n                                    class=\"btn btn-sm btn-primary btn-approve\">\n                                    <i class=\"fa fa-check\"></i>\n                                </a>";
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
    };
    return ApproveContractsUIManager;
})(ListContractsUIManager);
//# sourceMappingURL=f3mm_approve_contracts_ui_manager.js.map