/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/underscore.d.ts" />
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
var CreateContractUIManager = (function () {
    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    function CreateContractUIManager() {
        this._loadedCount = 0;
        this._viewType = window.pageType;
        this._contractInfo = window.contractInfo;
        this._dataManager = new DataManager(this._viewType);
        this.setViewMode();
        this.bindDropdown();
        this.bindItemsGrid();
        this.bindHistoryGrid();
        this.bindDatePicker();
        this.applyValidation();
        $(".btn-generate-quote").on("click", this.generateQuote.bind(this));
        $("#entity_popup_link").on("click", this.openExistingCustomerWindow.bind(this));
        $("#entity_popup_new").on("click", this.openNewCustomerWindow.bind(this));
        $("#contact_popup_link").on("click", this.openExistingContactWindow.bind(this));
        $("#contact_popup_new").on("click", this.openNewContactWindow.bind(this));
        $(".duration-dropdown").on("change", this.durationDropdownChanged.bind(this));
        $(".start-date-text").parent().on("changeDate", this.durationDropdownChanged.bind(this));
        $("#delete-btn").on("click", this.deleteContract.bind(this));
        // whenever tab is switched, refresh the grid
        $("a[data-toggle='tab']").click(function (e) {
            e.preventDefault();
            $(this).tab("show");
        });
        $("a[data-toggle='tab']").on("shown.bs.tab", function (e) {
            $("#history_grid").jsGrid("refresh");
        });
        $("[data-toggle='popover']").popover({
            container: "body",
            html: true
        });
    }
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    CreateContractUIManager.prototype.deleteContract = function (args) {
        var _this = this;
        if (confirm("Are you sure you want to delete this record?") == true) {
            var promise_1 = $.Deferred();
            var item = {
                id: this._contractInfo.id
            };
            this.showLoading();
            this._dataManager.deleteContract(item, function (result) {
                console.log("deleted: // ", result);
                if (result.message == "success") {
                    var uiSuiteletScriptId = 'customscript_f3mm_list_contracts_ui_st';
                    var uiSuiteletDeploymentId = 'customdeploy_f3mm_list_contracts_ui_st';
                    var uiSuiteletUrl = nlapiResolveURL('SUITELET', uiSuiteletScriptId, uiSuiteletDeploymentId, false);
                    //uiSuiteletUrl = uiSuiteletUrl + '&cid=' + result.data.id;
                    var alertMessage = "The record has been deleted successfully";
                    var alertClass = "alert-success";
                    window.location.href = uiSuiteletUrl + "#/?alert-msg=" + alertMessage + "&alert-class=" + alertClass;
                    console.log("uiSuiteletUrl: // ", uiSuiteletUrl);
                }
                else {
                    alert(result.message);
                    _this.hideLoading();
                }
                promise_1.resolve();
                _this.hideLoading();
            });
            return promise_1.promise();
        }
        else {
        }
    };
    /**
     * Submits contract information (extracted from ui elements) to server
     * @returns {void}
     */
    CreateContractUIManager.prototype.submit = function () {
        var _this = this;
        try {
            var validated = this.validateFields();
            // if not valid then return
            if (validated === false) {
                return;
            }
            var serializedData_1 = $(".form-horizontal :input").serializeObject();
            if (!!this._contractInfo) {
                serializedData_1.id = this._contractInfo.id;
            }
            if (!!validated.customerId) {
                serializedData_1.customer = validated.customerId;
            }
            if (!!validated.primaryContactId) {
                serializedData_1.primary_contact = validated.primaryContactId;
            }
            serializedData_1.items = [];
            var items = $("#jsGrid").data().JSGrid.data;
            $.each(items, function (index, item) {
                serializedData_1.items.push({
                    amount: item.amount,
                    id: item.id,
                    item_description: item.description,
                    longname: item.longname,
                    item_id: item.itemid,
                    price: item.price,
                    price_level: item.price_level,
                    quantity: item.quantity
                });
            });
            if (serializedData_1.items.length <= 0) {
                alert("You must enter at least one line item for this transaction.");
                return;
            }
            console.log("serializedData: ", serializedData_1);
            this.showLoading();
            this._dataManager.submit(serializedData_1, function (result) {
                console.log("submit success:", result);
                if (!!result.data) {
                    var uiSuiteletScriptId = 'customscript_f3mm_create_contract_ui_st';
                    var uiSuiteletDeploymentId = 'customdeploy_f3mm_create_contract_ui_st';
                    var uiSuiteletUrl = nlapiResolveURL('SUITELET', uiSuiteletScriptId, uiSuiteletDeploymentId, false);
                    uiSuiteletUrl = uiSuiteletUrl + '&cid=' + result.data.id;
                    window.location.href = uiSuiteletUrl;
                }
                else {
                    alert(result.message);
                    _this.hideLoading();
                }
            });
        }
        catch (e) {
            console.error('ERROR', 'Error during main onSubmit', e.toString());
            alert('Error during record submission.');
            this.hideLoading();
        }
    };
    /**
     * Binds Contract History with the Grid
     * @returns {void}
     */
    CreateContractUIManager.prototype.bindHistoryGrid = function () {
        var _this = this;
        var $grid = $("#history_grid");
        $grid.jsGrid({
            autoload: true,
            controller: {
                loadData: function (filter) {
                    var historyItems = _this.prepareHistoryData();
                    return historyItems;
                }
            },
            editing: false,
            fields: [{
                    name: "date",
                    sorter: function (val1, val2) {
                        var date1 = new Date(val1);
                        var date2 = new Date(val2);
                        return date1 - date2;
                    },
                    title: "Date",
                    type: "date",
                    width: 50
                }, {
                    name: "name.text",
                    title: "User",
                    type: "text",
                    width: 70
                }, {
                    name: "type",
                    title: "Type",
                    type: "text",
                    width: 50
                }, {
                    name: "field",
                    title: "Field",
                    type: "text",
                    width: 50
                }, {
                    itemTemplate: function (val) {
                        return val === "- None -" ? "" : val;
                    },
                    name: "oldvalue",
                    title: "Old Value",
                    type: "text",
                    width: 80
                }, {
                    name: "newvalue",
                    title: "New Value",
                    type: "text",
                    width: 80
                }],
            filtering: false,
            height: "auto",
            inserting: false,
            noDataContent: "No history.",
            paging: false,
            selecting: false,
            sorting: true,
            width: "100%"
        });
    };
    /**
     * Binds Contract Items with the Grid
     * @returns {void}
     */
    CreateContractUIManager.prototype.bindItemsGrid = function () {
        var _this = this;
        var contactItems = this.prepareGridData();
        var gridFields = this.prepareGridFields();
        var inserting = true;
        var editing = true;
        if (this._viewType === "view") {
            inserting = false;
            editing = false;
        }
        var $grid = $("#jsGrid");
        $grid.jsGrid({
            autoload: true,
            controller: {
                loadData: function (filter) {
                    return contactItems;
                }
            },
            deleteConfirm: "Are you sure you want to delete this item?",
            editing: editing,
            fields: gridFields,
            filtering: false,
            height: "auto",
            inserting: inserting,
            noDataContent: "No items added.",
            onDataLoaded: this.loaded.bind(this),
            onItemDeleted: this.itemsChanged.bind(this),
            onItemInserted: this.itemsChanged.bind(this),
            onItemInserting: this.onGridItemInserting.bind(this),
            onItemUpdated: this.itemsChanged.bind(this),
            onItemUpdating: this.onGridItemUpdating.bind(this),
            pageButtonCount: 5,
            pageSize: 15,
            paging: false,
            sorting: false,
            width: "100%"
        });
        // bind grid events
        var gridRowClass = [
            ".jsgrid-insert-row .quantity input",
            ".jsgrid-insert-row .price input",
            ".jsgrid-edit-row .quantity input",
            ".jsgrid-edit-row .price input"
        ];
        $grid.on("focusin", ".jsgrid-insert-row input:first, .jsgrid-edit-row input:first", function (ev) {
            _this.bindItemPicker($(ev.target));
        });
        $grid.on("blur", gridRowClass.join(", "), this.onPriceOrQuantityChanged.bind(this));
        $grid.on("change", ".jsgrid-insert-row .price-level select", this.onPriceLevelChangedInInsertRow.bind(this));
        $grid.on("change", ".jsgrid-edit-row .price-level select", this.onPriceLevelChangedInEditRow.bind(this));
    };
    /**
     * Binds typeahead autocomplete component with primary contact control
     * @param {object} $contactsDropdown jQuery element
     */
    CreateContractUIManager.prototype.bindPrimaryContactDropdown = function ($contactsDropdown) {
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
                    empty: "<div class=\"empty-message\">\n                        unable to find any contacts that match the current query\n                        </div>"
                }
            };
            $contactsDropdown.typeahead(typeaheadOptions, contactsDataset);
            $contactsDropdown.bind('typeahead:change', function (ev, val) {
                console.log('typeahead:change: ', arguments);
                var $this = $(this);
                var selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr('data-selected-text');
                var text = selectedText;
                var isMatched = text === val;
                console.log('text: ', text);
                console.log('val: ', val);
                console.log('text == val: ', text == val);
                if (!val) {
                    $this.attr('data-selected-id', '');
                    $this.attr('data-selected-text', '');
                    $('.primary-contact-email-text').val('');
                }
                else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched == false) {
                        $this.typeahead('val', selectedText);
                        alert('Selected tax code does not exist.');
                    }
                }
            }).bind('typeahead:select', function (ev, obj) {
                console.log('typeahead:select: ', arguments);
                var name = obj.entityid;
                if (!!obj.company && !!obj.company.text) {
                    name = obj.company.text + ' : ' + obj.entityid;
                }
                var $this = $(this);
                $this.attr('data-selected-id', obj.id);
                $this.attr('data-selected-text', name);
                $('.primary-contact-email-text').val(obj.email);
            });
            $contactsDropdown.data('itempicker_created', true);
            $contactsDropdown.focus();
        }
    };
    /**
     * Binds typeahead autocomplete component with customer control
     * @param {object} $customerDropdown jQuery element
     */
    CreateContractUIManager.prototype.bindCustomerDropdown = function ($customerDropdown) {
        var _this = this;
        if (!$customerDropdown.data('itempicker_created')) {
            var typeaheadOptions = {
                hint: false,
                minLength: 3,
                highlight: true
            };
            var customerDataset = {
                name: 'customers',
                limit: 500,
                display: function (obj) {
                    var isPerson = obj.isperson === 'T';
                    var name = isPerson ? (obj.firstname + ' ' + obj.lastname) : obj.companyname;
                    var text = obj.entityid;
                    if (!!obj.altname) {
                        text = text + ' ' + obj.altname;
                    }
                    return text;
                },
                source: function (query, sync, async) {
                    setTimeout(function () {
                        _this._dataManager.getCustomers({
                            query: query
                        }, function (customers) {
                            try {
                                async(customers.data);
                            }
                            catch (e) {
                                console.error('ERROR', 'Error during async binding.', e.toString());
                            }
                        });
                    }, 10);
                },
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'unable to find any customers that match the current query',
                        '</div>'
                    ].join('\n')
                }
            };
            $customerDropdown.typeahead(typeaheadOptions, customerDataset);
            $customerDropdown.bind('typeahead:change', function (ev, val) {
                console.log('typeahead:change: ', arguments);
                var $this = $(this);
                var selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr('data-selected-text');
                var text = selectedText;
                var isMatched = text == val;
                console.log('text: ', text);
                console.log('val: ', val);
                console.log('text == val: ', text == val);
                if (!val) {
                    $this.attr('data-selected-id', '');
                    $this.attr('data-selected-text', '');
                }
                else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched == false) {
                        $this.typeahead("val", selectedText);
                        alert("Selected customer does not exist.");
                    }
                }
            }).bind("typeahead:select", function (ev, suggestion) {
                console.log("typeahead:select: ", arguments);
                var name = suggestion.isperson === "T" ? (suggestion.firstname + " " + suggestion.lastname) : suggestion.companyname;
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
    CreateContractUIManager.prototype.bindDropdown = function () {
        var _this = this;
        // fill partners dropdown
        this._dataManager.getVendors(function (result) {
            // make it async
            setTimeout(function () {
                var select = document.getElementById("vendor");
                if (result.status_code === 200) {
                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        var name = item.isperson === "T" ? (item.firstname + " " + item.lastname) : item.companyname;
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }
                _this.loaded();
            }, 10);
        });
        // fill partners dropdown
        this._dataManager.getDiscountItems(function (result) {
            // make it async
            setTimeout(function () {
                var select = document.getElementById("discount");
                if (result.status_code === 200) {
                    var discountItemId_1 = _this._contractInfo && _this._contractInfo.custrecord_f3mm_discount_item_id || null;
                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        if (item.id === discountItemId_1) {
                            _this._contractInfo.custrecord_f3mm_discount_item_text = item.itemid;
                        }
                        select.options[select.options.length] = new Option(item.itemid, item.id);
                    });
                }
                _this.loaded();
            }, 10);
        });
        this._dataManager.getEmployees(function (result) {
            // make it async
            setTimeout(function () {
                var select = document.getElementById("sales_rep");
                if (result.status_code === 200) {
                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        var name = (item.firstname + " " + item.lastname).trim();
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }
                _this.loaded();
            }, 10);
        });
        this._dataManager.getDepartment(function (result) {
            // make it async
            setTimeout(function () {
                var select = document.getElementById("department");
                if (result.status_code === 200) {
                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        var name = item.name.trim();
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }
                _this.loaded();
            }, 10);
        });
        $(document.body).on("focusin", ".customer-dropdown", function (ev) {
            _this.bindCustomerDropdown($(ev.target));
        });
        $(document.body).on("focusin", ".primary-contact-dropdown", function (ev) {
            _this.bindPrimaryContactDropdown($(ev.target));
        });
    };
    /**
     * Invoked by JSGrid whenever any item is inserted or changed or removed from Grid.
     * @returns {void}
     */
    CreateContractUIManager.prototype.itemsChanged = function () {
        var existingData = $("#jsGrid").data().JSGrid.data;
        var quantities = _.pluck(existingData, "quantity");
        // calculate quantity from all items
        var totalQuantitySeats = _.reduce(quantities, function (memo, num) { return memo + parseInt(num, 10); }, 0);
        // set quantity in total quantity seats textbox
        $(".total-quantity-seats-text").val(totalQuantitySeats);
    };
    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    CreateContractUIManager.prototype.prepareHistoryData = function () {
        var historyItems = [];
        if (!!this._contractInfo && !!this._contractInfo.history) {
            var historyItemsInfo = this._contractInfo.history;
            if (!!historyItemsInfo) {
                historyItemsInfo.forEach(function (historyItem) {
                    if (!!historyItem.field) {
                        historyItems.push({
                            date: historyItem.date,
                            field: historyItem.field.text,
                            name: historyItem.name,
                            newvalue: historyItem.newvalue,
                            oldvalue: historyItem.oldvalue,
                            type: historyItem.type
                        });
                    }
                });
            }
        }
        return historyItems;
    };
    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    CreateContractUIManager.prototype.prepareGridData = function () {
        var contactItems = [];
        if (!!this._contractInfo && !!this._contractInfo.sublists) {
            var contractItemsInfo = this._contractInfo.sublists.recmachcustrecord_f3mm_ci_contract;
            if (!!contractItemsInfo) {
                contractItemsInfo.forEach(function (contractItem) {
                    // only add if item is not null
                    if (!!contractItem.custrecord_f3mm_ci_item) {
                        var priceLevel = contractItem.custrecord_f3mm_ci_price_level;
                        contactItems.push({
                            amount: contractItem.custrecord_f3mm_ci_amount,
                            baseprice: contractItem.custrecord_f3mm_ci_item.baseprice,
                            description: contractItem.custrecord_f3mm_ci_item_description,
                            id: contractItem.id,
                            item: contractItem.custrecord_f3mm_ci_item.itemid + " : " + contractItem.custrecord_f3mm_ci_item.displayname,
                            itemid: contractItem.custrecord_f3mm_ci_item.value,
                            longname: contractItem.custrecord_f3mm_ci_item_long_name,
                            price: contractItem.custrecord_f3mm_ci_price,
                            priceLevels: contractItem.custrecord_f3mm_ci_item.priceLevels,
                            price_level: (priceLevel && priceLevel.value) || "0",
                            quantity: contractItem.custrecord_f3mm_ci_quantity
                        });
                    }
                });
            }
        }
        return contactItems;
    };
    /**
     * Prepares Grid fields before initializing the grid
     * @returns {object[]} returns array of fields
     */
    CreateContractUIManager.prototype.prepareGridFields = function () {
        var gridFields = [{
                css: "item",
                name: "item",
                title: "Item <span class='mandatory'>*</span>",
                type: "text",
                width: 150
            }, {
                css: "description",
                editing: false,
                name: "description",
                title: "Description",
                type: "textarea",
                width: 150
            }, {
                css: "quantity",
                min: 0,
                name: "quantity",
                title: "Quantity  <span class='mandatory'>*</span>",
                type: "number",
                width: 50
            }, {
                css: "price-level",
                filtering: false,
                getItems: function (item) {
                    console.log("getItems();", item);
                    return (item || {}).priceLevels;
                },
                items: null,
                name: "price_level",
                textField: "pricelevelname",
                title: "Price Level <span class='mandatory'>*</span>",
                type: "custom_select",
                valueField: "pricelevel",
                width: 80
            }, {
                css: "price",
                name: "price",
                title: "Price",
                type: "decimal_number",
                width: 50
            }, {
                css: "amount",
                editing: false,
                name: "amount",
                title: "Amount",
                type: "decimal_number",
                width: 50
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
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    CreateContractUIManager.prototype.onGridItemUpdating = function (args) {
        console.log("onItemUpdating: ", JSON.stringify(args.item));
        var data = args.item;
        data.price = parseFloat(data.price).toFixed(2);
        data.amount = parseFloat(args.row.next().find(".amount").html()).toFixed(2);
        var $updateRow = args.row.next();
        var suggestion = $updateRow.data("data-selected-suggestion");
        console.log("onItemUpdating: ", JSON.stringify(suggestion));
        if (!!suggestion) {
            data.item = suggestion.displaylabel;
            data.itemid = suggestion.id;
            data.description = suggestion.salesdescription;
            data.longname = suggestion.custitem_long_name;
            data.baseprice = suggestion.baseprice;
        }
        if (data.item === "") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select an item");
            return;
        }
        if (parseInt(data.quantity, 10) <= 0) {
            args.cancel = true;
            alert("Quantity cannot be less than or equal to 0");
            return;
        }
        if (data.price_level === "0") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select price level");
            return;
        }
        else {
            // make it string
            data.price_level = data.price_level + "";
        }
    };
    /**
     * Invoked by JSGrid whenever any item is inserting in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    CreateContractUIManager.prototype.onGridItemInserting = function (args) {
        console.log("onItemInserting:", args);
        var $row = $(".jsgrid-insert-row");
        var suggestion = $row.data("data-selected-suggestion");
        var priceLevels = $row.data("price-levels");
        args.item.priceLevels = priceLevels;
        if (!!suggestion) {
            args.item.item = suggestion.displaylabel;
            args.item.itemid = suggestion.id;
            args.item.baseprice = suggestion.baseprice;
            args.item.description = suggestion.salesdescription;
            args.item.longname = suggestion.custitem_long_name;
        }
        if (args.item.item === "") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select an item");
            return;
        }
        if (parseInt(args.item.quantity, 10) <= 0) {
            args.preserve = true;
            args.cancel = true;
            alert("Quantity cannot be less than or equal to 0");
            return;
        }
        if (args.item.price_level === "0") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select price level");
            return;
        }
        else {
            // make it string
            args.item.price_level = args.item.price_level + "";
        }
        var existingData = $("#jsGrid").data().JSGrid.data;
        var found = false;
        existingData.forEach(function (item) {
            if (item.itemid === args.item.itemid) {
                found = true;
            }
        });
        if (found === true) {
            args.preserve = true;
            args.cancel = true;
            alert("The selected item already exists. Please select another item.");
        }
    };
    /**
     * Invoked whenever price or quantity is changed in any row of grid
     * Responsible for calculating total amount based on price and quantity
     * @param {Event} ev contains json object of item and html element of grid row
     * @returns {void}
     */
    CreateContractUIManager.prototype.onPriceOrQuantityChanged = function (ev) {
        var $input = $(ev.target);
        var $tr = $input.parents("tr:first");
        var $quantity = $tr.find(".quantity input");
        var $price = $tr.find(".price input");
        var isEditing = $tr.hasClass("jsgrid-edit-row");
        var quantity = parseInt($quantity.val(), 10);
        var price = parseFloat($price.val());
        var totalPrice = (price * quantity).toFixed(2);
        if (isEditing) {
            $tr.find(".amount").html(totalPrice);
        }
        else {
            $tr.find(".amount input").val(totalPrice);
        }
    };
    /**
     * Invoked whenever price level field is changed in insert row of grid
     * Responsible for calculating total amount based on price level, price and quantity
     * @param {Event} ev contains json object of item and html element of grid row
     * @returns {void}
     */
    CreateContractUIManager.prototype.onPriceLevelChangedInInsertRow = function (ev) {
        var $priceLevelDropdown = $(ev.target);
        var $row = $priceLevelDropdown.parents("tr:first");
        var $priceTextbox = $row.find(".price input");
        var priceLevels = $row.data("price-levels");
        var suggestion = $row.data("data-selected-suggestion");
        var selectedPriceLevelId = $priceLevelDropdown.val();
        // let price = $priceTextbox.val();
        if (selectedPriceLevelId === "0" || selectedPriceLevelId === "-1") {
            $priceTextbox.removeAttr("disabled");
            if (!!suggestion) {
                $priceTextbox.val(suggestion.baseprice);
            }
            else {
                $priceTextbox.val("");
            }
        }
        else {
            $priceTextbox.attr("disabled", "disabled");
            var selectedPriceLevel = _.find(priceLevels, function (priceLevel) {
                return priceLevel.pricelevel === selectedPriceLevelId;
            });
            if (!!suggestion && selectedPriceLevel != null) {
                var discountPercent = Math.abs(parseFloat(selectedPriceLevel.discount || 0));
                var discount = (suggestion.baseprice / 100) * discountPercent;
                var discountedPrice = (suggestion.baseprice - discount).toFixed(2);
                $priceTextbox.val(discountedPrice);
            }
        }
        $priceTextbox.focus().trigger("blur");
    };
    /**
     * Invoked whenever price level field is changed in any editing row of grid
     * Responsible for calculating total amount based on price level, price and quantity
     * @param {Event} ev contains json object of item and html element of grid row
     * @returns {void}
     */
    CreateContractUIManager.prototype.onPriceLevelChangedInEditRow = function (ev) {
        var $priceLevelDropdown = $(ev.target);
        var $row = $priceLevelDropdown.parents("tr:first");
        var $priceTextbox = $row.find(".price input");
        var jsGridItem = $row.prev().data("JSGridItem");
        var suggestion = jsGridItem;
        var selectedPriceLevelId = $priceLevelDropdown.val();
        // let price = $priceTextbox.val();
        if (selectedPriceLevelId === "0" || selectedPriceLevelId === "-1") {
            $priceTextbox.removeAttr("disabled");
            if (!!suggestion) {
                $priceTextbox.val(suggestion.baseprice);
            }
            else {
                $priceTextbox.val("");
            }
        }
        else {
            $priceTextbox.attr("disabled", "disabled");
            var priceLevels = jsGridItem.priceLevels;
            var selectedPriceLevel = _.find(priceLevels, function (priceLevel) {
                return priceLevel.pricelevel === selectedPriceLevelId;
            });
            if (!!suggestion && selectedPriceLevel != null) {
                var discountPercent = Math.abs(parseFloat(selectedPriceLevel.discount || 0));
                var discount = (suggestion.baseprice / 100) * discountPercent;
                var discountedPrice = (suggestion.baseprice - discount).toFixed(2);
                $priceTextbox.val(discountedPrice);
            }
        }
        $priceTextbox.focus().trigger("blur");
    };
    /**
     * itemsPickerSource - fetch data from server based on provided query
     * @param {string} query the keyword which user has typed
     * @param {function} sync  the callback method to invoke synchronously
     * @param {function} async  the callback method to invoke asynchronously
     */
    CreateContractUIManager.prototype.itemsPickerSource = function (query, sync, async) {
        var _this = this;
        console.log("itemsPickerSource", arguments);
        setTimeout(function () {
            _this._dataManager.getItems({
                query: query
            }, function (items) {
                try {
                    async(items.data);
                }
                catch (e) {
                    console.error("ERROR", "Error during async binding.", e.toString());
                }
            });
        }, 10);
    };
    /**
     * Binds typeahead autocomplete component with item picker control
     * @param {object} $el jQuery element
     */
    CreateContractUIManager.prototype.bindItemPicker = function ($el) {
        var _this = this;
        if (!$el.data("itempicker_created")) {
            console.log("bind item picker control.", $el);
            var self_1 = this;
            var options = {
                highlight: true,
                hint: false,
                minLength: 3
            };
            var dataSet = {
                display: function (obj) {
                    // obj.displaylabel = obj.custitem_long_name || obj.displayname || obj.itemid;
                    var labelFields = [];
                    if (!!obj.itemid) {
                        labelFields.push(obj.itemid);
                    }
                    if (!!obj.displayname) {
                        labelFields.push(obj.displayname);
                    }
                    obj.displaylabel = labelFields.join(" : ");
                    return obj.displaylabel;
                },
                limit: 500,
                name: "Items",
                source: function (q, s, a) {
                    console.log("dataSet.source", this);
                    self_1.itemsPickerSource(q, s, a);
                },
                templates: {
                    empty: "<div class=\"empty-message\">\n                        unable to find any items that match the current query\n                        </div>"
                }
            };
            $el.typeahead(options, dataSet);
            $el.bind("typeahead:change", function () {
                console.log("typeahead:change: ", arguments);
                var $this = $(this);
                var $tr = $this.parents("tr:first");
                // let selectedId = $this.attr("data-selected-id");
                var selectedText = $this.attr("data-selected-text");
                var val = $this.val();
                var isMatched = selectedText === val;
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
                        alert("Selected item does not exist.");
                    }
                }
            }).bind("typeahead:select", function (ev, suggestion) {
                var $this = $(ev.target);
                var $tr = $this.parents("tr:first");
                $this.attr("data-selected-id", suggestion.id);
                $this.attr("data-selected-text", suggestion.displaylabel);
                $tr.data("data-selected-suggestion", suggestion);
                _this._dataManager.getPriceLevels({
                    itemId: suggestion.id,
                    recordType: suggestion.recordType
                }, function (result) {
                    var priceLevels = result.data;
                    var $priceLevelDropdown = $tr.find(".price-level select");
                    $priceLevelDropdown.empty();
                    _.each(priceLevels, function (priceLevel) {
                        console.log(priceLevel);
                        $("<option>")
                            .attr("value", priceLevel.pricelevel)
                            .text(priceLevel.pricelevelname)
                            .appendTo($priceLevelDropdown);
                    });
                    var quantity = 1; // default to 1
                    var listPriceId = 1; // default to 1
                    var price = parseFloat(suggestion.baseprice).toFixed(2);
                    $tr.data("price-levels", priceLevels);
                    $tr.find(".description textarea").val(suggestion.salesdescription);
                    $tr.find(".quantity input").val(quantity);
                    $tr.find(".price input").val(price);
                    $tr.find(".quantity input").focus();
                    $tr.find(".price-level select").val(listPriceId).focus().trigger("change");
                });
            });
            $el.data("itempicker_created", true);
            $el.focus();
        }
    };
    CreateContractUIManager.prototype.getSelectedContact = function () {
        var result = null;
        var $primaryContactDropdown = $(".primary-contact-dropdown");
        var contactText = $primaryContactDropdown.val();
        var contactId = $primaryContactDropdown.attr("data-selected-id");
        // validate customer
        if (!!contactId && contactText !== "") {
            result = contactId;
        }
        return result;
    };
    CreateContractUIManager.prototype.getSelectedCustomer = function () {
        var result = null;
        var $customerDropdown = $(".customer-dropdown");
        var customerText = $customerDropdown.val();
        var customerId = $customerDropdown.attr("data-selected-id");
        // validate customer
        if (!!customerId && customerText !== "") {
            result = customerId;
        }
        return result;
    };
    CreateContractUIManager.prototype.openNewContactWindow = function () {
        var url = "/app/common/entity/contact.nl?target=main:contact&label=Primary+Contact";
        // setSelectValue(document.forms['main_form'].elements['entity'], -1);
        // document.forms['main_form'].elements['entity_display'].value = '';
        // document.forms['main_form'].elements['entity_display'].isvalid = true;
        // NS.form.setValid(true);
        // Syncentity(true);
        nlOpenWindow(url, "_blank", "");
        return false;
    };
    CreateContractUIManager.prototype.openExistingContactWindow = function () {
        var selectValue = this.getSelectedContact();
        if (!!selectValue) {
            nlOpenWindow("/app/common/entity/contact.nl?id=" + selectValue + "", "_blank", "");
        }
        else {
            alert("Please choose an entry first.");
        }
        return false;
    };
    CreateContractUIManager.prototype.openNewCustomerWindow = function () {
        var url = "/app/common/entity/custjob.nl?target=main:entity&label=Customer&stage=prospect";
        // setSelectValue(document.forms['main_form'].elements['entity'], -1);
        // document.forms['main_form'].elements['entity_display'].value = '';
        // document.forms['main_form'].elements['entity_display'].isvalid = true;
        // NS.form.setValid(true);
        // Syncentity(true);
        nlOpenWindow(url, "_blank", "");
        return false;
    };
    CreateContractUIManager.prototype.openExistingCustomerWindow = function () {
        var selectValue = this.getSelectedCustomer();
        if (!!selectValue) {
            nlOpenWindow("/app/common/entity/custjob.nl?id=" + selectValue + "", "_blank", "");
        }
        else {
            alert("Please choose an entry first.");
        }
        return false;
    };
    CreateContractUIManager.prototype.durationDropdownChanged = function (ev) {
        var $dropdown = $(".duration-dropdown");
        var selected = $dropdown.val();
        var $startDateElement = $(".start-date-text").parent();
        var $endDateElement = $(".end-date-text").parent();
        var startDate = $startDateElement.datepicker("getDate");
        var endDate = null;
        if (!!startDate) {
            if (selected === "1") {
                endDate = startDate;
                endDate.setMonth(startDate.getMonth() + 1); // add one month
                endDate.setDate(endDate.getDate() - 1); // substract one day
            }
            else if (selected === "2") {
                endDate = startDate;
                endDate.setMonth(startDate.getMonth() + 3);
                endDate.setDate(endDate.getDate() - 1); // substract one day
            }
            else if (selected === "3") {
                endDate = startDate;
                endDate.setMonth(startDate.getMonth() + 12);
                endDate.setDate(endDate.getDate() - 1); // substract one day
            }
            else if (selected === "4") {
                endDate = startDate;
                endDate.setMonth(startDate.getMonth() + 24);
                endDate.setDate(endDate.getDate() - 1); // substract one day
            }
            else if (selected === "5") {
                endDate = startDate;
                endDate.setMonth(startDate.getMonth() + 36);
                endDate.setDate(endDate.getDate() - 1); // substract one day
            }
        }
        if (!!endDate) {
            $endDateElement.datepicker("setDate", endDate);
        }
    };
    /**
     * Show Loading Indicator
     */
    CreateContractUIManager.prototype.showLoading = function () {
        var $loading = $(".contract-loading-backdrop,.contract-loading");
        $loading.addClass("in").show();
    };
    /**
     * Hide Loading Indicator
     */
    CreateContractUIManager.prototype.hideLoading = function () {
        var $loading = $(".contract-loading-backdrop,.contract-loading");
        $loading.removeClass("in").hide();
    };
    /**
     * Apply validation on form elements
     */
    CreateContractUIManager.prototype.applyValidation = function () {
        var _this = this;
        var $form = $(".f3mm-contract-renewal").parents("form:first");
        $form.removeAttr("onsubmit");
        $form.validate({
            errorPlacement: function ($error, $element) {
                var $parent = $element.parent();
                var isGroup = $parent.is(".input-group");
                if (isGroup === true) {
                    $parent.after($error);
                }
                else {
                    $element.after($error);
                }
            },
            rules: {
                contract_number: {
                    required: true
                },
                customer: {
                    requiredTypeahead: true
                },
                department: {
                    required: true
                },
                end_date: {
                    required: true
                },
                primary_contact: {
                    requiredTypeahead: true
                },
                sales_rep: {
                    required: true
                },
                start_date: {
                    required: true
                },
                status: {
                    required: true
                },
                vendor: {
                    required: true
                }
            },
            submitHandler: function (form) {
                _this.submit();
                return false;
            }
        });
    };
    /**
     * Show Create / View / Edit Screen based on _viewType property
     */
    CreateContractUIManager.prototype.setViewMode = function () {
        console.log("this.setViewMode(); // this._viewType: ", this._viewType);
        if (this._viewType === "view") {
            $(".form-horizontal :input, .input-group.date").attr("disabled", "disabled");
            $(".form-actions").hide();
            $(".view-contract-action-buttons").show();
            $(".view-horizontal").show();
        }
        else {
            $(".form-actions").show();
            $(".view-contract-action-buttons").hide();
            $(".form-horizontal").show();
        }
    };
    /**
     * Generate Quote when user clicks on Generate Quote button
     * @param {Event} ev the event object injected by browser containing the event information
     */
    CreateContractUIManager.prototype.generateQuote = function (ev) {
        var _this = this;
        var $button = $(ev.target);
        if ($button.attr("disabled") === "disabled") {
            return false;
        }
        $button.val("Generating...");
        this.showLoading();
        var data = {
            contractId: this._contractInfo.id
        };
        this._dataManager.generateQuote(data, function (result) {
            if (!!result.data && !!result.data.id) {
                $button.val("Generated!");
                var viewRecordUrl = nlapiResolveURL("RECORD", "estimate", result.data.id, false);
                window.location.href = viewRecordUrl;
            }
            else {
                alert(result.message);
                _this.hideLoading();
            }
        });
    };
    /**
     * Loaded function called when the page is loaded completely from server.
     * Used to perform after load tasks like binding events and populating ui controls
     * @returns {void}
     */
    CreateContractUIManager.prototype.loaded = function () {
        this._loadedCount++;
        console.log("this.loaded();", this._loadedCount);
        // donot go ahead before 2
        if (this._loadedCount < 3) {
            return;
        }
        var contract = this._contractInfo;
        if (!contract) {
            return;
        }
        var quotes = contract.sublists.quotes;
        if (!!quotes && quotes.length > 0) {
            var viewQuoteUrl = nlapiResolveURL("RECORD", "estimate", quotes[quotes.length - 1].id, false);
            $(".btn-view-quote").attr("href", viewQuoteUrl).show();
        }
        if (this._viewType === "view") {
            this.bindViewScreen(contract);
        }
        else {
            this.bindEditScreen(contract);
        }
        $("#notification_days").val(contract.custrecord_f3mm_notif_days_prior);
        $(".notification-5-days").prop("checked", contract.custrecord_f3mm_notif_5days_prior === "T");
        $(".notification-3-days").prop("checked", contract.custrecord_f3mm_notif_3days_prior === "T");
        $(".notification-1-day").prop("checked", contract.custrecord_f3mm_notif_1day_prior === "T");
        $(".notification-expiration").prop("checked", contract.custrecord_f3mm_notif_on_expiration === "T");
        $(".notification-renewal").prop("checked", contract.custrecord_f3mm_notif_on_renewal === "T");
        $(".notification-quote-generation").prop("checked", contract.custrecord_f3mm_notif_on_quote_generate === "T");
        $(".notification-quote-approval").prop("checked", contract.custrecord_f3mm_notif_on_quote_approval === "T");
    };
    /**
     * Binds View Contract Screen with page
     * @param {object} contract json representation of contract object
     * @returns {void}
     */
    CreateContractUIManager.prototype.bindViewScreen = function (contract) {
        var viewTemplate = $("#view_template").html();
        var compiledTemplate = _.template(viewTemplate);
        var htmlMarkup = compiledTemplate(contract);
        $(".view-horizontal").html(htmlMarkup);
    };
    /**
     * Binds Edit Contract screen with page
     * @param {object} contract json representation of contract object
     * @returns {void}
     */
    CreateContractUIManager.prototype.bindEditScreen = function (contract) {
        var $form = $(".form-horizontal");
        $(".contract-number-text", $form).val(contract.custrecord_f3mm_contract_number);
        $(".po-number-text", $form).val(contract.custrecord_f3mm_po_number);
        $(".system-id-text", $form).val(contract.custrecord_f3mm_system_id);
        if (!!contract.id) {
            $(".form-group-is-renew").show();
        }
        else {
            $(".form-group-is-renew").hide();
        }
        if (!!contract.custrecord_f3mm_sales_rep) {
            $(".sales-rep-dropdown", $form).val(contract.custrecord_f3mm_sales_rep.value);
        }
        if (!!contract.custrecord_f3mm_contract_vendor) {
            $(".vendor-dropdown", $form).val(contract.custrecord_f3mm_contract_vendor.value);
        }
        if (!!contract.custrecord_f3mm_status) {
            $(".status-dropdown", $form).val(contract.custrecord_f3mm_status.value);
        }
        $(".total-quantity-seats-text", $form).val(contract.custrecord_f3mm_total_qty_seats);
        $(".discount-dropdown", $form).val(contract.custrecord_f3mm_discount_item_id);
        if (!!contract.custrecord_f3mm_department) {
            $(".department-dropdown", $form).val(contract.custrecord_f3mm_department.value);
        }
        $(".memo-text", $form).val(contract.custrecord_f3mm_memo);
        if (!!contract.custrecord_f3mm_customer) {
            $(".customer-dropdown", $form)
                .attr("data-selected-id", contract.custrecord_f3mm_customer.value)
                .attr("data-selected-text", contract.custrecord_f3mm_customer.text)
                .val(contract.custrecord_f3mm_customer.text);
        }
        if (!!contract.custrecord_f3mm_primary_contact) {
            $(".primary-contact-dropdown", $form)
                .attr("data-selected-id", contract.custrecord_f3mm_primary_contact.value)
                .attr("data-selected-text", contract.custrecord_f3mm_primary_contact.text)
                .val(contract.custrecord_f3mm_primary_contact.text);
            if (!!contract.custrecord_f3mm_primary_contact_email) {
                $(".primary-contact-email-text", $form).val(contract.custrecord_f3mm_primary_contact_email);
            }
        }
        if (this._viewType === "view") {
            if (!!contract.custrecord_f3mm_start_date) {
                $(".start-date-text", $form).val(contract.custrecord_f3mm_start_date);
            }
            if (!!contract.custrecord_f3mm_end_date) {
                $(".end-date-text", $form).val(contract.custrecord_f3mm_end_date);
            }
        }
        else {
            if (!!contract.custrecord_f3mm_contract_duration) {
                $(".duration-dropdown", $form).val(contract.custrecord_f3mm_contract_duration.value);
            }
            if (!!contract.custrecord_f3mm_start_date) {
                $(".start-date-text", $form).parent().datepicker("setDate", contract.custrecord_f3mm_start_date);
            }
            if (!!contract.custrecord_f3mm_end_date) {
                $(".end-date-text", $form).parent().datepicker("setDate", contract.custrecord_f3mm_end_date);
            }
        }
    };
    /**
     * Binds Date Picker component with specific fields
     * @returns {void}
     */
    CreateContractUIManager.prototype.bindDatePicker = function () {
        if (this._viewType !== "view") {
            $(".input-group.date").not("[disabled]").datepicker({
                autoclose: true,
                clearBtn: true,
                format: "m/d/yyyy"
            });
        }
    };
    /**
     * Validates if selected customer and selected primary contact is valid or not
     * @returns {bool|object}
     */
    CreateContractUIManager.prototype.validateFields = function () {
        var $customerDropdown = $(".customer-dropdown");
        var customerText = $customerDropdown.val();
        var customerId = $customerDropdown.attr("data-selected-id");
        var $primaryContactDropdown = $(".primary-contact-dropdown");
        var primaryContactText = $primaryContactDropdown.val();
        var primaryContactId = $primaryContactDropdown.attr("data-selected-id");
        // validate customer
        if (!customerId && customerText !== "") {
            alert("Selected customer is not valid!");
            $customerDropdown.focus();
            return false;
        }
        // validate customer
        if (!primaryContactId && primaryContactText !== "") {
            alert("Selected End User is not valid!");
            $primaryContactDropdown.focus();
            return false;
        }
        return {
            customerId: customerId,
            primaryContactId: primaryContactId
        };
    };
    return CreateContractUIManager;
}());
//# sourceMappingURL=f3mm_create_contract_ui_manager.js.map