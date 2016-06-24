/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm_data_manager.ts" />
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
var ListContractsUIManager = (function () {
    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    function ListContractsUIManager() {
        this._viewType = window.pageType;
        this._priceLevels = window.priceLevels;
        this._contractInfo = window.contractInfo;
        this._dataManager = new DataManager(this._viewType);
        this.bindDropdown();
        this.bindContractsGrid();
        this.initDatePicker($(".input-group.date"));
        $(".btn-apply-filter").on("click", this.filter.bind(this));
    }
    /**
     * Search contracts based on the filters passed
     * @returns {Promise} promise object which will be resolved/rejected in future
     */
    ListContractsUIManager.prototype.search = function (filter) {
        var _this = this;
        var promise = $.Deferred();
        var options = this.getFilters(filter);
        if (jQuery.isEmptyObject(options.sortFields)) {
            options.sortFields["custrecord_f3mm_end_date"] = "asc";
        }
        this._dataManager.searchContracts(options, function (result) {
            var data = _this.prepareGridData(result.data.records);
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
    ListContractsUIManager.prototype.filter = function () {
        $("#jsGrid").jsGrid("search");
    };
    /**
     * Binds Contract Items with the Grid
     * @returns {void}
     */
    ListContractsUIManager.prototype.bindContractsGrid = function () {
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
            pageButtonCount: 5,
            pageLoading: true,
            pageSize: 25,
            paging: true,
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
    };
    /**
     * Binds typeahead autocomplete component with primary contact control
     * @param {object} $contactsDropdown jQuery element
     */
    ListContractsUIManager.prototype.bindPrimaryContactDropdown = function ($contactsDropdown) {
        var _this = this;
        if (!$contactsDropdown.data("itempicker_created")) {
            var typeaheadOptions = {
                highlight: true,
                hint: false,
                minLength: 3
            };
            var contactsDataset = {
                display: function (obj) {
                    var name = obj.entityid;
                    if (!!obj.company && !!obj.company.text) {
                        name = obj.company.text + " : " + obj.entityid;
                    }
                    return name;
                },
                limit: 500,
                name: "primary-contacts",
                source: function (query, sync, async) {
                    setTimeout(function () {
                        _this._dataManager.getPrimaryContacts({
                            query: query
                        }, function (contacts) {
                            try {
                                async(contacts.data);
                            }
                            catch (e) {
                                console.error("ERROR", "Error during async binding.", e.toString());
                            }
                        });
                    }, 10);
                },
                templates: {
                    empty: [
                        "<div class=\"empty-message\">",
                        "unable to find any contacts that match the current query",
                        "</div>"
                    ].join("\n")
                }
            };
            $contactsDropdown.typeahead(typeaheadOptions, contactsDataset);
            $contactsDropdown.bind("typeahead:change", function (ev, val) {
                console.log("typeahead:change: ", arguments);
                var $this = $(this);
                var $tr = $this.parents("tr:first");
                // let selectedId = $this.attr("data-selected-id");
                var selectedText = $this.attr("data-selected-text");
                var text = selectedText;
                var isMatched = text === val;
                if (!val) {
                    $this.attr("data-selected-id", "");
                    $this.attr("data-selected-text", "");
                    $tr.data("data-selected-suggestion", null);
                }
                else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched === false) {
                        $this.typeahead("val", selectedText);
                        alert("Selected tax code does not exist.");
                    }
                }
            }).bind("typeahead:select", function (ev, obj) {
                console.log("typeahead:select: ", arguments);
                var name = obj.entityid;
                if (!!obj.company && !!obj.company.text) {
                    name = obj.company.text + " : " + obj.entityid;
                }
                var $this = $(this);
                var $tr = $this.parents("tr:first");
                $this.attr("data-selected-id", obj.id);
                $this.attr("data-selected-text", name);
                $tr.data("data-selected-suggestion", obj);
            });
            $contactsDropdown.data("itempicker_created", true);
            $contactsDropdown.focus();
        }
    };
    /**
     * Binds typeahead autocomplete component with customer control
     * @param {object} $customerDropdown jQuery element
     */
    ListContractsUIManager.prototype.bindCustomerDropdown = function ($customerDropdown) {
        var _this = this;
        if (!$customerDropdown.data("itempicker_created")) {
            var typeaheadOptions = {
                highlight: true,
                hint: false,
                minLength: 3
            };
            var customerDataset = {
                display: function (obj) {
                    // let isPerson = obj.isperson === "T";
                    // let name = isPerson ? (obj.firstname + ' ' + obj.lastname) : obj.companyname;
                    var text = obj.entityid;
                    if (!!obj.altname) {
                        text = text + " " + obj.altname;
                    }
                    return text;
                },
                limit: 500,
                name: "customers",
                source: function (query, sync, async) {
                    setTimeout(function () {
                        _this._dataManager.getCustomers({
                            query: query
                        }, function (customers) {
                            try {
                                async(customers.data);
                            }
                            catch (e) {
                                console.error("ERROR", "Error during async binding.", e.toString());
                            }
                        });
                    }, 10);
                },
                templates: {
                    empty: "<div class=\"empty-message\">\n                            unable to find any customers that match the current query\n                            </div>"
                }
            };
            $customerDropdown.typeahead(typeaheadOptions, customerDataset);
            $customerDropdown.bind("typeahead:change", function (ev, val) {
                console.log("typeahead:change: ", arguments);
                var $this = $(this);
                // let selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr("data-selected-text");
                var text = selectedText;
                var isMatched = text === val;
                if (!val) {
                    $this.attr("data-selected-id", "");
                    $this.attr("data-selected-text", "");
                }
                else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched === false) {
                        $this.typeahead("val", selectedText);
                        alert("Selected customer does not exist.");
                    }
                }
            }).bind("typeahead:select", function (ev, suggestion) {
                console.log("typeahead:select: ", arguments);
                var text = suggestion.entityid;
                if (!!suggestion.altname) {
                    text = text + " " + suggestion.altname;
                }
                var $this = $(this);
                $this.attr("data-selected-id", suggestion.id);
                $this.attr("data-selected-text", text);
            });
            $customerDropdown.data("itempicker_created", true);
            $customerDropdown.focus();
        }
    };
    /**
     * Binds All Dropdowns with required data
     */
    ListContractsUIManager.prototype.bindDropdown = function () {
        var _this = this;
        // fill partners dropdown
        this._dataManager.getVendors(function (result) {
            // make it async
            setTimeout(function () {
                var select = document.getElementById('vendor');
                if (result.status_code === 200) {
                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        var name = item.isperson === 'T' ? (item.firstname + ' ' + item.lastname) : item.companyname;
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }
            }, 10);
        });
        $(document.body).on("focusin", ".customer-dropdown", function (ev) {
            _this.bindCustomerDropdown($(ev.target));
        });
    };
    /**
     * Show Loading Indicator
     */
    ListContractsUIManager.prototype.showLoading = function () {
        var $loading = $(".contract-loading-backdrop,.contract-loading");
        $loading.addClass("in").show();
    };
    /**
     * Hide Loading Indicator
     */
    ListContractsUIManager.prototype.hideLoading = function () {
        var $loading = $(".contract-loading-backdrop,.contract-loading");
        $loading.removeClass("in").hide();
    };
    /**
     * bindDatePicker - Bind date picker control with textboxes
     */
    ListContractsUIManager.prototype.bindDatePicker = function (e) {
        console.log(e);
        var $this = $(e.target).closest('.input-group.date');
        console.log("$this:", $this);
        if ($this.find("input").is(":disabled")) {
            e.cancelBubble = true;
            e.preventDefault();
            return;
        }
        this.initDatePicker($this);
        console.log("show date picker.");
        $this.datepicker("show");
        e.cancelBubble = true;
        e.preventDefault();
    };
    /**
     * Initialize date picker on ui element
     * @returns {void}
     */
    ListContractsUIManager.prototype.initDatePicker = function ($el) {
        if (!$el.data("datepicker_created")) {
            console.log("register date picker control.");
            $el.data("datepicker_created", true);
            $el.datepicker({
                autoclose: true,
                clearBtn: true,
                format: "m/d/yyyy"
            });
        }
    };
    /**
     * Validates if selected customer and selected primary contact is valid or not
     * @returns {bool} false if no fields are validated
     */
    ListContractsUIManager.prototype.validateFields = function () {
        var $customerDropdown = $(".customer-dropdown");
        var customerText = $customerDropdown.val();
        var customerId = $customerDropdown.attr("data-selected-id");
        // validate customer
        if (!customerId && customerText !== "") {
            alert("Selected customer is not valid!");
            $customerDropdown.focus();
            return false;
        }
        return {
            customerId: customerId
        };
    };
    ListContractsUIManager.prototype.getFilters = function (filter) {
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
        return options;
    };
    /**
     * Invoked when Void Selected Contracts button is clicked.
     * Responsible for invoking void contracts api with selected contract ids.
     * @returns {void}
     */
    ListContractsUIManager.prototype.voidSelected = function () {
        var _this = this;
        var $chceckboxes = $("#jsGrid").find(".jsgrid-grid-body .select-item :checkbox:checked");
        var selectedContracts = $chceckboxes.map(function () {
            return $(this).data("contract-id");
        }).toArray();
        if (!selectedContracts.length) {
            alert("Please select at least one contract");
            return;
        }
        var data = {
            contractIds: selectedContracts
        };
        this.showLoading();
        this._dataManager.voidContract(data, function (result) {
            _this.hideLoading();
            _this.filter();
        });
    };
    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    ListContractsUIManager.prototype.prepareGridData = function (contractsInfo) {
        return contractsInfo;
    };
    /**
     * Prepares Grid fields before initializing the grid
     * @returns {object[]} returns array of fields
     */
    ListContractsUIManager.prototype.prepareGridFields = function () {
        var gridFields = [{
                css: "select-item",
                editing: false,
                filtering: false,
                headerTemplate: function () {
                    return $("<input>").attr("type", "checkbox").addClass("select-all");
                },
                inserting: false,
                itemTemplate: function (_, item) {
                    if (this.editing === false && this._grid.editing === false) {
                        return $("<input>").attr("type", "checkbox").data("contract-id", _);
                    }
                    else {
                        return $(_);
                    }
                },
                name: "internalid",
                sorting: false,
                title: "&nbsp;",
                type: "checkbox",
                width: 25
            }, {
                editing: false,
                filtering: false,
                inserting: false,
                itemTemplate: function (value) {
                    var viewUrl = window.createSuiteletUrl + "&cid=" + value;
                    var editUrl = window.createSuiteletUrl + "&e=t&cid=" + value;
                    var linksHtml = "<a href=\"" + editUrl + "\">Edit</a>&nbsp; | &nbsp;<a href=\"" + viewUrl + "\">View</a>";
                    return $("<div />").append(linksHtml);
                },
                name: "internalid",
                sorting: false,
                title: "Edit | View",
                type: "text",
                width: 90
            }, {
                css: "contract-number",
                name: "custrecord_f3mm_contract_number",
                title: "Contract #",
                type: "text",
                width: 110
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
            }, {
                editing: false,
                name: "custrecord_f3mm_primary_contact_email",
                title: "Primary Contact Email",
                type: "text",
                width: 190
            }, {
                editing: false,
                name: "custrecord_f3mm_contract_vendor.text",
                title: "Contract Vendor",
                type: "text",
                width: 90
            }, {
                editing: false,
                name: "custrecord_f3mm_total_qty_seats",
                title: "Total Qty Seats",
                type: "number",
                width: 70
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
                itemTemplate: function (_, item) {
                    var contractItems = item && item.sublists && item.sublists.recmachcustrecord_f3mm_ci_contract;
                    var firstItem = contractItems && contractItems.length && contractItems[0];
                    var description = firstItem && firstItem.custrecord_f3mm_ci_item_description;
                    var itemName = firstItem.custrecord_f3mm_ci_item && firstItem.custrecord_f3mm_ci_item.text;
                    return description || itemName || "";
                },
                name: "custrecord_f3mm_memo",
                title: "First Item Description",
                type: "text",
                width: 150
            }, {
                name: "custrecord_f3mm_memo",
                title: "memo",
                type: "text",
                width: 120
            }];
        if (this._viewType !== "view") {
            gridFields.push({
                editButton: false,
                modeSwitchButton: false,
                type: "control"
            });
        }
        return gridFields;
    };
    ListContractsUIManager.prototype.exportToCSV = function (ev) {
        console.log("exportToCSV: ", ev);
        var $link = $(ev.currentTarget);
        var grid = $("#jsGrid").data().JSGrid;
        var filter = grid._sortingParams();
        var data = this.getFilters(filter);
        var options = {
            "action": "export_to_csv",
            "format": "csv"
        };
        $.extend(options, {
            "params": JSON.stringify(data)
        });
        var url = window.apiSuiteletUrl + "&";
        url = url + $.param(options);
        $link.attr("href", url);
        $link.attr("target", "_blank");
    };
    ListContractsUIManager.prototype.enableEditing = function (ev) {
        console.log("enableEditing: ", ev);
        var $input = $(ev.target);
        var checked = $input.is(":checked");
        console.log("$input: ", $input);
        console.log("checked: ", checked);
        $("#jsGrid").jsGrid("option", "editing", checked);
        $("#jsGrid").jsGrid("option", "selecting", checked);
        if (checked) {
            $(".select-all").hide();
            $(".btn-void").attr("disabled", "disabled");
        }
        else {
            $(".select-all").show();
            $(".btn-void").removeAttr("disabled");
        }
    };
    ListContractsUIManager.prototype.selectAll = function (ev) {
        console.log("selectAll: ", ev);
        var $input = $(ev.target);
        var $allCheckboxes = $("#jsGrid").find("tbody .select-item :checkbox");
        console.log("$allCheckboxes: ", $allCheckboxes);
        var checked = $input.is(":checked");
        $allCheckboxes.prop("checked", checked);
        ev.cancelBubble = true;
        ev.stopPropagation();
    };
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    ListContractsUIManager.prototype.deleteContract = function (args) {
        var _this = this;
        console.log("deleteContract: ", JSON.stringify(args));
        var promise = $.Deferred();
        var item = {
            id: args.id
        };
        this.showLoading();
        this._dataManager.deleteContract(item, function (result) {
            console.log("deleted: // ", result);
            promise.resolve();
            _this.hideLoading();
        });
        return promise.promise();
    };
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    ListContractsUIManager.prototype.onGridItemUpdated = function (args) {
        var _this = this;
        console.log("onGridItemUpdated: ", JSON.stringify(args.item));
        var item = {
            custrecord_f3mm_contract_number: args.item.custrecord_f3mm_contract_number,
            custrecord_f3mm_end_date: args.item.custrecord_f3mm_end_date,
            custrecord_f3mm_memo: args.item.custrecord_f3mm_memo,
            custrecord_f3mm_primary_contact: args.item.custrecord_f3mm_primary_contact,
            custrecord_f3mm_primary_contact_email: args.item.custrecord_f3mm_primary_contact_email,
            custrecord_f3mm_start_date: args.item.custrecord_f3mm_start_date,
            id: args.item.id
        };
        this.showLoading();
        this._dataManager.updateContract(item, function (result) {
            console.log("updated: // ", result);
            _this.hideLoading();
        });
    };
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    ListContractsUIManager.prototype.onGridItemUpdating = function (args) {
        console.log("onItemUpdating: ", JSON.stringify(args.item));
        var data = args.item;
        var $updateRow = args.row.next();
        var suggestion = $updateRow.data("data-selected-suggestion");
        console.log("onItemUpdating: ", JSON.stringify(suggestion));
        if (!!suggestion) {
            if (!data.custrecord_f3mm_primary_contact) {
                data.custrecord_f3mm_primary_contact = {};
            }
            var name_1 = suggestion.entityid;
            if (!!suggestion.company && !!suggestion.company.text) {
                name_1 = suggestion.company.text + " : " + suggestion.entityid;
            }
            data.custrecord_f3mm_primary_contact.text = name_1;
            data.custrecord_f3mm_primary_contact.value = suggestion.id;
            data.custrecord_f3mm_primary_contact_email = suggestion.email;
        }
        // validate primary contact
        if (!data.custrecord_f3mm_primary_contact || !data.custrecord_f3mm_primary_contact.value) {
            args.preserve = true;
            args.cancel = true;
            alert("Please select a primary contact");
            return;
        }
        if (!data.custrecord_f3mm_contract_number) {
            args.preserve = true;
            args.cancel = true;
            alert("Please enter contract number");
            return;
        }
        if (!data.custrecord_f3mm_start_date) {
            args.preserve = true;
            args.cancel = true;
            alert("Please select Start Date");
            return;
        }
        if (!data.custrecord_f3mm_end_date) {
            args.preserve = true;
            args.cancel = true;
            alert("Please select End Date");
            return;
        }
    };
    return ListContractsUIManager;
}());
//# sourceMappingURL=f3mm_list_contracts_ui_manager.js.map