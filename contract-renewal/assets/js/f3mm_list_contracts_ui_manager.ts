/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm_data_manager.ts" />

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
class ListContractsUIManager {

    protected _dataManager: DataManager;
    protected _contractInfo: any;
    protected _viewType: string;
    private _priceLevels: any[];

    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    constructor() {

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
    public search(filter) {
        let promise = $.Deferred();

        let options = this.getFilters(filter);

        this._dataManager.searchContracts(options, result => {
            let data = this.prepareGridData(result.data.records);

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
            pageButtonCount: 5,
            pageLoading: true,
            pageSize: 25,
            paging: true,
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


    }


    /**
     * Binds typeahead autocomplete component with primary contact control
     * @param {object} $contactsDropdown jQuery element
     */
    public bindPrimaryContactDropdown($contactsDropdown) {

        if (!$contactsDropdown.data("itempicker_created")) {

            let typeaheadOptions = {
                highlight: true,
                hint: false,
                minLength: 3
            };
            let contactsDataset = {
                display: (obj) => {
                    let name = obj.entityid;
                    if (!!obj.company && !!obj.company.text) {
                        name = obj.company.text + " : " + obj.entityid;
                    }
                    return name;
                },
                limit: 500,
                name: "primary-contacts",
                source: (query, sync, async) => {

                    setTimeout(() => {
                        this._dataManager.getPrimaryContacts({
                            query: query
                        }, (contacts) => {
                            try {
                                async(contacts.data);
                            } catch (e) {
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

                let $this = $(this);
                let $tr = $this.parents("tr:first");

                // let selectedId = $this.attr("data-selected-id");
                let selectedText = $this.attr("data-selected-text");
                let text = selectedText;
                let isMatched = text === val;

                if (!val) {
                    $this.attr("data-selected-id", "");
                    $this.attr("data-selected-text", "");
                    $tr.data("data-selected-suggestion", null);
                } else {

                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched === false) {
                        $this.typeahead("val", selectedText);
                        alert("Selected tax code does not exist.");
                    }
                }

            }).bind("typeahead:select", function (ev, obj) {
                console.log("typeahead:select: ", arguments);

                let name = obj.entityid;
                if (!!obj.company && !!obj.company.text) {
                    name = obj.company.text + " : " + obj.entityid;
                }

                let $this = $(this);
                let $tr = $this.parents("tr:first");

                $this.attr("data-selected-id", obj.id);
                $this.attr("data-selected-text", name);
                $tr.data("data-selected-suggestion", obj);
            });

            $contactsDropdown.data("itempicker_created", true);

            $contactsDropdown.focus();

        }
    }

    /**
     * Binds typeahead autocomplete component with customer control
     * @param {object} $customerDropdown jQuery element
     */
    public bindCustomerDropdown($customerDropdown) {

        if (!$customerDropdown.data("itempicker_created")) {

            let typeaheadOptions = {
                highlight: true,
                hint: false,
                minLength: 3
            };
            let customerDataset = {
                display: (obj) => {
                    // let isPerson = obj.isperson === "T";
                    // let name = isPerson ? (obj.firstname + ' ' + obj.lastname) : obj.companyname;

                    let text = obj.entityid;
                    if (!!obj.altname) {
                        text = text + " " + obj.altname;
                    }
                    return text;
                },
                limit: 500,
                name: "customers",
                source: (query, sync, async) => {

                    setTimeout(() => {
                        this._dataManager.getCustomers({
                            query: query
                        }, (customers) => {
                            try {
                                async(customers.data);
                            } catch (e) {
                                console.error("ERROR", "Error during async binding.", e.toString());
                            }
                        });
                    }, 10);

                },
                templates: {
                    empty: `<div class="empty-message">
                            unable to find any customers that match the current query
                            </div>`
                }
            };

            $customerDropdown.typeahead(typeaheadOptions, customerDataset);
            $customerDropdown.bind("typeahead:change", function (ev, val) {
                console.log("typeahead:change: ", arguments);

                let $this = $(this);

                // let selectedId = $this.attr('data-selected-id');
                let selectedText = $this.attr("data-selected-text");
                let text = selectedText;
                let isMatched = text === val;

                if (!val) {
                    $this.attr("data-selected-id", "");
                    $this.attr("data-selected-text", "");
                } else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched === false) {
                        $this.typeahead("val", selectedText);
                        alert("Selected customer does not exist.");
                    }
                }

            }).bind("typeahead:select", function (ev, suggestion) {
                console.log("typeahead:select: ", arguments);

                let text = suggestion.entityid;
                if (!!suggestion.altname) {
                    text = text + " " + suggestion.altname;
                }

                let $this = $(this);
                $this.attr("data-selected-id", suggestion.id);
                $this.attr("data-selected-text", text);
            });


            $customerDropdown.data("itempicker_created", true);

            $customerDropdown.focus();

        }
    }

    /**
     * Binds All Dropdowns with required data
     */
    public bindDropdown() {

        // fill partners dropdown
        this._dataManager.getVendors((result) => {
            // make it async
            setTimeout(() => {
                var select = document.getElementById('vendor');
                if (result.status_code === 200) {

                    // add each item on UI
                    $.each(result.data, function(i, item) {
                        var name = item.isperson === 'T' ? (item.firstname + ' ' + item.lastname) : item.companyname;
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }
            }, 10);
        });

        $(document.body).on("focusin", ".customer-dropdown", (ev) => {
            this.bindCustomerDropdown($(ev.target));
        });

    }


    /**
     * Show Loading Indicator
     */
    protected showLoading() {
        let $loading = $(".contract-loading-backdrop,.contract-loading");
        $loading.addClass("in").show();
    }

    /**
     * Hide Loading Indicator
     */
    protected hideLoading() {
        let $loading = $(".contract-loading-backdrop,.contract-loading");
        $loading.removeClass("in").hide();
    }


    /**
     * bindDatePicker - Bind date picker control with textboxes
     */
    private bindDatePicker(e) {
        console.log(e);
        let $this = $(e.target).closest('.input-group.date');
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
    }

    /**
     * Initialize date picker on ui element
     * @returns {void}
     */
    private initDatePicker($el) {
        if (!$el.data("datepicker_created")) {
            console.log("register date picker control.");

            $el.data("datepicker_created", true);

            $el.datepicker({
                autoclose: true,
                clearBtn: true,
                format: "m/d/yyyy"
            });
        }
    }

    /**
     * Validates if selected customer and selected primary contact is valid or not
     * @returns {bool} false if no fields are validated
     */
    private validateFields(): any {

        let $customerDropdown = $(".customer-dropdown");
        let customerText = $customerDropdown.val();
        let customerId = $customerDropdown.attr("data-selected-id");

        // validate customer
        if (!customerId && customerText !== "") {
            alert("Selected customer is not valid!");
            $customerDropdown.focus();
            return false;
        }

        return {
            customerId: customerId
        };
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

        let options: any = {
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

        return options;
    }




    /**
     * Invoked when Void Selected Contracts button is clicked.
     * Responsible for invoking void contracts api with selected contract ids.
     * @returns {void}
     */
    private voidSelected() {
        let $chceckboxes = $("#jsGrid").find(".jsgrid-grid-body .select-item :checkbox:checked");
        let selectedContracts = $chceckboxes.map(function () {
            return $(this).data("contract-id");
        }).toArray();

        if (!selectedContracts.length) {
            alert("Please select at least one contract");
            return;
        }

        let data = {
            contractIds: selectedContracts
        };
        this.showLoading();
        this._dataManager.voidContract(data, result => {

            this.hideLoading();
            this.filter();
        });
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
                } else {
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
                let viewUrl = `${window.createSuiteletUrl}&cid=${value}`;
                let editUrl = `${window.createSuiteletUrl}&e=t&cid=${value}`;
                let linksHtml = `<a href="${editUrl}">Edit</a>&nbsp; | &nbsp;<a href="${viewUrl}">View</a>`;

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
        }, {
            editing: false,
            name: "custrecord_f3mm_primary_contact_email",
            title: "Primary Contact Email",
            type: "text",
            width: 150,
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
            itemTemplate: (_, item) => {
                let contractItems = item && item.sublists && item.sublists.recmachcustrecord_f3mm_ci_contract;
                let firstItem = contractItems && contractItems.length && contractItems[0];
                let description = firstItem && firstItem.custrecord_f3mm_ci_item_description;
                let itemName = firstItem.custrecord_f3mm_ci_item && firstItem.custrecord_f3mm_ci_item.text;
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
    }



    private exportToCSV(ev) {
        console.log("exportToCSV: ", ev);

        let $link = $(ev.currentTarget);
        let grid = $("#jsGrid").data().JSGrid;
        let filter = grid._sortingParams();
        let data = this.getFilters(filter);

        let options = {
            "action": "export_to_csv",
            "format": "csv"
        };

        $.extend(options, {
            "params": JSON.stringify(data)
        });

        let url = window.apiSuiteletUrl + "&";
        url = url + $.param(options);

        $link.attr("href", url);
        $link.attr("target", "_blank");
    }

    private enableEditing(ev) {
        console.log("enableEditing: ", ev);
        let $input = $(ev.target);
        let checked = $input.is(":checked");

        console.log("$input: ", $input);
        console.log("checked: ", checked);
        $("#jsGrid").jsGrid("option", "editing", checked);
        $("#jsGrid").jsGrid("option", "selecting", checked);

        if (checked) {
            $(".select-all").hide();
            $(".btn-void").attr("disabled", "disabled");
        } else {
            $(".select-all").show();
            $(".btn-void").removeAttr("disabled");
        }
    }

    private selectAll(ev) {
        console.log("selectAll: ", ev);

        let $input = $(ev.target);
        let $allCheckboxes = $("#jsGrid").find("tbody .select-item :checkbox");

        console.log("$allCheckboxes: ", $allCheckboxes);

        let checked = $input.is(":checked");
        $allCheckboxes.prop("checked", checked);

        ev.cancelBubble = true;
        ev.stopPropagation();
    }


    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    private deleteContract(args) {
        console.log("deleteContract: ", JSON.stringify(args));
        let promise = $.Deferred();

        let item = {
            id: args.id
        };

        this.showLoading();
        this._dataManager.deleteContract(item, result => {
            console.log("deleted: // ", result);

            promise.resolve();
            this.hideLoading();
        });

        return promise.promise();
    }

    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    private onGridItemUpdated(args) {
        console.log("onGridItemUpdated: ", JSON.stringify(args.item));

        let item = {
            custrecord_f3mm_contract_number: args.item.custrecord_f3mm_contract_number,
            custrecord_f3mm_end_date: args.item.custrecord_f3mm_end_date,
            custrecord_f3mm_memo: args.item.custrecord_f3mm_memo,
            custrecord_f3mm_primary_contact: args.item.custrecord_f3mm_primary_contact,
            custrecord_f3mm_primary_contact_email: args.item.custrecord_f3mm_primary_contact_email,
            custrecord_f3mm_start_date: args.item.custrecord_f3mm_start_date,
            id: args.item.id
        };

        this.showLoading();
        this._dataManager.updateContract(item, result => {
            console.log("updated: // ", result);
            this.hideLoading();
        });

    }

    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    private onGridItemUpdating(args) {
        console.log("onItemUpdating: ", JSON.stringify(args.item));

        let data = args.item;
        let $updateRow = args.row.next();
        let suggestion = $updateRow.data("data-selected-suggestion");

        console.log("onItemUpdating: ", JSON.stringify(suggestion));

        if (!!suggestion) {
            if (!data.custrecord_f3mm_primary_contact) {
                data.custrecord_f3mm_primary_contact = {};
            }

            let name = suggestion.entityid;
            if (!!suggestion.company && !!suggestion.company.text) {
                name = suggestion.company.text + " : " + suggestion.entityid;
            }

            data.custrecord_f3mm_primary_contact.text = name;
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


    }


}
