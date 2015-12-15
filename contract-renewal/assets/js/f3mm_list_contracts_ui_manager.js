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
        this._loadedCount = 0;
        this._viewType = window.pageType;
        this._priceLevels = window.priceLevels;
        this._contractInfo = window.contractInfo;
        this._dataManager = new DataManager(this._viewType);
        //this.setViewMode();
        this.bindDropdown();
        this.bindContractsGrid();
        this.initDatePicker($('.input-group.date'));
        $('.btn-apply-filter').on('click', this.filter.bind(this));
        // for inactive checkbox
        //$('.form-inline :checkbox').on('click', this.filter.bind(this));
    }
    /**
     * Show Loading Indicator
     */
    ListContractsUIManager.prototype.showLoading = function () {
        var $loading = $('.contract-loading-backdrop,.contract-loading');
        $loading.addClass('in').show();
    };
    /**
     * Hide Loading Indicator
     */
    ListContractsUIManager.prototype.hideLoading = function () {
        var $loading = $('.contract-loading-backdrop,.contract-loading');
        $loading.removeClass('in').hide();
    };
    /**
     * Show Create / View / Edit Screen based on _viewType property
     */
    ListContractsUIManager.prototype.setViewMode = function () {
        console.log('this.setViewMode(); // this._viewType: ', this._viewType);
        if (this._viewType == 'view') {
            $('.form-horizontal :input, .input-group.date').attr('disabled', 'disabled');
            $('.form-actions').hide();
            $('.view-contract-action-buttons').show();
            $('.view-horizontal').show();
        }
        else {
            $('.form-actions').show();
            $('.view-contract-action-buttons').hide();
            $('.form-horizontal').show();
        }
    };
    /**
     * Loaded function called when the page is loaded completely from server.
     * Used to perform after load tasks like binding events and populating ui controls
     * @returns {void}
     */
    ListContractsUIManager.prototype.loaded = function () {
        this._loadedCount++;
        console.log('this.loaded();', this._loadedCount, arguments);
        var contract = this._contractInfo;
        if (!contract) {
            return;
        }
        var quotes = contract.sublists.quotes;
        if (!!quotes && quotes.length > 0) {
            var viewQuoteUrl = nlapiResolveURL('RECORD', 'estimate', quotes[quotes.length - 1].id, false);
            $('.btn-view-quote').attr('href', viewQuoteUrl).show();
        }
        if (this._viewType == 'view') {
            this.bindViewScreen(contract);
        }
        else {
            this.bindEditScreen(contract);
        }
    };
    /**
     * Binds View Contract Screen with page
     * @param {object} contract json representation of contract object
     * @returns {void}
     */
    ListContractsUIManager.prototype.bindViewScreen = function (contract) {
        var viewTemplate = $('#view_template').html();
        var compiledTemplate = _.template(viewTemplate);
        var htmlMarkup = compiledTemplate(contract);
        $('.view-horizontal').html(htmlMarkup);
        if (contract.custrecord_f3mm_status.value == "1") {
            $('.btn-generate-quote').attr('disabled', 'disabled');
        }
        else {
            $('.btn-generate-quote').removeAttr('disabled');
        }
    };
    /**
     * Binds Edit Contract screen with page
     * @param {object} contract json representation of contract object
     * @returns {void}
     */
    ListContractsUIManager.prototype.bindEditScreen = function (contract) {
        var $form = $('.form-horizontal');
        $('.contract-number-text', $form).val(contract.custrecord_f3mm_contract_number);
        $('.po-number-text', $form).val(contract.custrecord_f3mm_po_number);
        if (!!contract.custrecord_f3mm_sales_rep) {
            $('.sales-rep-dropdown', $form).val(contract.custrecord_f3mm_sales_rep.value);
        }
        if (!!contract.custrecord_f3mm_contract_vendor) {
            $('.vendor-dropdown', $form).val(contract.custrecord_f3mm_contract_vendor.value);
        }
        if (!!contract.custrecord_f3mm_status) {
            $('.status-dropdown', $form).val(contract.custrecord_f3mm_status.value);
        }
        $('.total-quantity-seats-text', $form).val(contract.custrecord_f3mm_total_qty_seats);
        if (!!contract.custrecord_f3mm_department) {
            $('.department-dropdown', $form).val(contract.custrecord_f3mm_department.value);
        }
        $('.memo-text', $form).val(contract.custrecord_f3mm_memo);
        if (!!contract.custrecord_f3mm_customer) {
            $('.customer-dropdown', $form)
                .attr('data-selected-id', contract.custrecord_f3mm_customer.value)
                .attr('data-selected-text', contract.custrecord_f3mm_customer.text)
                .val(contract.custrecord_f3mm_customer.text);
        }
        if (!!contract.custrecord_f3mm_primary_contact) {
            $('.primary-contact-dropdown', $form)
                .attr('data-selected-id', contract.custrecord_f3mm_primary_contact.value)
                .attr('data-selected-text', contract.custrecord_f3mm_primary_contact.text)
                .val(contract.custrecord_f3mm_primary_contact.text);
            if (!!contract.custrecord_f3mm_primary_contact_email) {
                $('.primary-contact-email-text', $form).val(contract.custrecord_f3mm_primary_contact_email);
            }
        }
        if (this._viewType == 'view') {
            if (!!contract.custrecord_f3mm_start_date) {
                $('.start-date-text', $form).val(contract.custrecord_f3mm_start_date);
            }
            if (!!contract.custrecord_f3mm_end_date) {
                $('.end-date-text', $form).val(contract.custrecord_f3mm_end_date);
            }
        }
        else {
            if (!!contract.custrecord_f3mm_start_date) {
                $('.start-date-text', $form).parent().datepicker('setDate', contract.custrecord_f3mm_start_date);
            }
            if (!!contract.custrecord_f3mm_end_date) {
                $('.end-date-text', $form).parent().datepicker('setDate', contract.custrecord_f3mm_end_date);
            }
        }
    };
    /**
     * bindDatePicker - Bind date picker control with textboxes
     */
    ListContractsUIManager.prototype.bindDatePicker = function (e) {
        console.log(e);
        var $this = $(e.target).closest('.input-group.date');
        console.log('$this:', $this);
        if ($this.find('input').is(':disabled')) {
            e.cancelBubble = true;
            e.preventDefault();
            return;
        }
        this.initDatePicker($this);
        console.log('show date picker.');
        $this.datepicker('show');
        e.cancelBubble = true;
        e.preventDefault();
    };
    /**
     * Initialize date picker on ui element
     * @returns {void}
     */
    ListContractsUIManager.prototype.initDatePicker = function ($el) {
        if (!$el.data('datepicker_created')) {
            console.log('register date picker control.');
            $el.data('datepicker_created', true);
            $el.datepicker({
                format: "m/d/yyyy",
                clearBtn: true,
                autoclose: true
            });
        }
    };
    /**
     * Validates if selected customer and selected primary contact is valid or not
     * @returns {bool} false if no fields are validated
     */
    ListContractsUIManager.prototype.validateFields = function () {
        var $customerDropdown = $('.customer-dropdown');
        var customerText = $customerDropdown.val();
        var customerId = $customerDropdown.attr('data-selected-id');
        //
        //var $primaryContactDropdown = $('.primary-contact-dropdown');
        //var primaryContactText = $primaryContactDropdown.val();
        //var primaryContactId = $primaryContactDropdown.attr('data-selected-id');
        // validate customer
        if (!customerId && customerText != "") {
            alert('Selected customer is not valid!');
            $customerDropdown.focus();
            return false;
        }
        //// validate customer
        //if (!primaryContactId && primaryContactText != "") {
        //    alert('Selected End User is not valid!');
        //    $primaryContactDropdown.focus();
        //    return false;
        //}
        return {
            customerId: customerId
        };
    };
    ListContractsUIManager.prototype.getFilters = function (filter) {
        var startIndex = (filter.pageIndex - 1) * filter.pageSize;
        var sortField = filter.sortField;
        var serializedData = $('.form-horizontal :input, .form-inline :input').serializeObject();
        var validated = this.validateFields();
        // if not valid then return
        if (validated === false) {
            return;
        }
        var options = {
            startIndex: startIndex,
            pageSize: filter.pageSize,
            sortFields: {}
        };
        $.extend(options, serializedData);
        if (!!sortField) {
            var rootFieldLength = sortField.indexOf('.');
            sortField = sortField.substring(0, rootFieldLength > -1 ? rootFieldLength : sortField.length);
            options.sortFields[sortField] = filter.sortOrder;
        }
        if (!!validated.customerId) {
            options.customer = validated.customerId;
        }
        if (options.isinactive == "on") {
            options.isinactive = true;
        }
        return options;
    };
    /**
     * Search contracts based on the filters passed
     * @returns {Promise} promise object which will be resolved/rejected in future
     */
    ListContractsUIManager.prototype.search = function (filter) {
        var _this = this;
        console.log('filter: ', filter);
        var promise = $.Deferred();
        var options = this.getFilters(filter);
        this._dataManager.searchContracts(options, function (result) {
            console.log('result: ', result);
            var data = _this.prepareGridData(result.data.records);
            console.log('data: ', data);
            //d.resolve(data);
            var label = '1 record';
            if (result.data.total != 1) {
                label = result.data.total + ' records';
            }
            $('.total_records_label').html(label);
            promise.resolve({
                data: data,
                itemsCount: result.data.total
            });
        });
        return promise.promise();
    };
    /**
     * Invoked when Void Selected Contracts button is clicked.
     * Responsible for invoking void contracts api with selected contract ids.
     * @returns {void}
     */
    ListContractsUIManager.prototype.voidSelected = function () {
        var _this = this;
        var $chceckboxes = $("#jsGrid").find('.jsgrid-grid-body .select-item :checkbox:checked');
        var selectedContracts = $chceckboxes.map(function () {
            return $(this).data('contract-id');
        }).toArray();
        if (!selectedContracts.length) {
            alert('Please select at least one contract');
            return;
        }
        var data = {
            contractIds: selectedContracts
        };
        this.showLoading();
        this._dataManager.voidContract(data, function (result) {
            console.log('voided: // ', result);
            _this.hideLoading();
            _this.filter();
        });
    };
    /**
     * Filter records based on the filter elements' values on ui
     * @returns {void}
     */
    ListContractsUIManager.prototype.filter = function () {
        $('#jsGrid').jsGrid("search");
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
                title: "&nbsp;",
                name: "internalid",
                type: "checkbox",
                sorting: false,
                editing: false,
                inserting: false,
                filtering: false,
                width: 25,
                css: 'select-item',
                headerTemplate: function () {
                    return $("<input>").attr("type", "checkbox").addClass('select-all');
                },
                itemTemplate: function (_, item) {
                    if (this.editing == false && this._grid.editing == false) {
                        return $("<input>").attr("type", "checkbox").data('contract-id', _);
                    }
                    else {
                        return $(_);
                    }
                }
            }, {
                title: "Edit | View",
                name: "internalid",
                type: "text",
                sorting: false,
                editing: false,
                inserting: false,
                filtering: false,
                width: 90,
                itemTemplate: function (value) {
                    var viewUrl = window.createSuiteletUrl + '&cid=' + value;
                    var editUrl = window.createSuiteletUrl + '&e=t&cid=' + value;
                    var $links = $('<div />');
                    $links.append('<a href="' + editUrl + '">Edit</a>');
                    $links.append('&nbsp; | &nbsp;');
                    $links.append('<a href="' + viewUrl + '">View</a>');
                    return $links;
                }
            }, {
                title: "Contract #",
                name: "custrecord_f3mm_contract_number",
                type: "text",
                width: 75,
                css: "contract-number"
            }, {
                title: "Company Name",
                name: "custrecord_f3mm_customer.text",
                type: "text",
                width: 120,
                editing: false
            }, {
                title: "Primary Contact",
                name: "custrecord_f3mm_primary_contact.text",
                type: "text",
                width: 120,
                css: "primary-contact"
            }, {
                title: "Primary Contact Email",
                name: "custrecord_f3mm_primary_contact_email",
                type: "text",
                width: 150,
                editing: false
            }, {
                title: "Contract Vendor",
                name: "custrecord_f3mm_contract_vendor.text",
                type: "text",
                width: 90,
                editing: false
            }, {
                title: "Total Qty Seats",
                name: "custrecord_f3mm_total_qty_seats",
                type: "number",
                width: 70,
                editing: false
            }, {
                title: "Start Date",
                name: "custrecord_f3mm_start_date",
                type: "text",
                width: 100,
                editTemplate: function (_, item) {
                    var $html = $('<div class="input-group input-group-sm date start-date">' +
                        '<input type="text" class="form-control" />' +
                        '<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>' +
                        '</div>');
                    this.editControl = $html.find('input');
                    this.editControl.val(_);
                    return $html;
                }
            }, {
                title: "End Date",
                name: "custrecord_f3mm_end_date",
                type: "text",
                width: 100,
                editTemplate: function (_, item) {
                    var $html = $('<div class="input-group input-group-sm date end-date">' +
                        '<input type="text" class="form-control" />' +
                        '<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>' +
                        '</div>');
                    this.editControl = $html.find('input');
                    this.editControl.val(_);
                    return $html;
                }
            }, {
                title: "First Item Description",
                name: "custrecord_f3mm_memo",
                type: "text",
                width: 150,
                editing: false,
                itemTemplate: function (_, item) {
                    //console.log('First Item Description: arguments: ', arguments);
                    var contractItems = item && item.sublists && item.sublists.recmachcustrecord_f3mm_ci_contract;
                    var firstItem = contractItems && contractItems.length && contractItems[0];
                    var description = firstItem && firstItem.custrecord_f3mm_ci_item_description;
                    var itemName = firstItem.custrecord_f3mm_ci_item && firstItem.custrecord_f3mm_ci_item.text;
                    return description || itemName || '';
                }
            }, {
                title: "memo",
                name: "custrecord_f3mm_memo",
                type: "text",
                width: 120
            }];
        if (this._viewType != 'view') {
            gridFields.push({
                type: "control",
                modeSwitchButton: false,
                editButton: false
            });
        }
        return gridFields;
    };
    /**
     * Binds Contract Items with the Grid
     * @returns {void}
     */
    ListContractsUIManager.prototype.bindContractsGrid = function () {
        var _this = this;
        this._priceLevels = [{
                id: 0,
                name: ''
            }];
        var gridFields = this.prepareGridFields();
        var $grid = $("#jsGrid");
        $grid.jsGrid({
            height: "auto",
            width: "100%",
            noDataContent: 'No items added.',
            inserting: false,
            filtering: false,
            editing: false,
            sorting: true,
            selecting: false,
            paging: true,
            pageLoading: true,
            autoload: true,
            pageSize: 10,
            pageButtonCount: 5,
            deleteConfirm: "Are you sure you want to delete this contract?",
            controller: {
                deleteItem: this.deleteContract.bind(this),
                loadData: this.search.bind(this)
            },
            onDataLoaded: this.loaded.bind(this),
            onItemUpdating: this.onGridItemUpdating.bind(this),
            onItemUpdated: this.onGridItemUpdated.bind(this),
            fields: gridFields
        });
        $grid.on('focusin', '.jsgrid-edit-row .primary-contact', function (ev) {
            _this.bindPrimaryContactDropdown($(ev.target));
        });
        $grid.on('focusin click', '.jsgrid-edit-row .start-date, .jsgrid-edit-row .end-date', function (ev) {
            _this.bindDatePicker(ev);
        });
        $grid.on('click', '.select-all', this.selectAll.bind(this));
        $('.edit-grid-checkbox').on('click', this.enableEditing.bind(this));
        $('.btn-void').on('click', this.voidSelected.bind(this));
        $('.export-to-csv-link').on('click', this.exportToCSV.bind(this));
    };
    ListContractsUIManager.prototype.exportToCSV = function (ev) {
        console.log('exportToCSV: ', ev);
        var $link = $(ev.currentTarget);
        var grid = $('#jsGrid').data().JSGrid;
        var filter = grid._sortingParams();
        var data = this.getFilters(filter);
        var options = {
            'action': 'export_to_csv',
            'format': 'csv'
        };
        $.extend(options, {
            'params': JSON.stringify(data)
        });
        var url = window.apiSuiteletUrl + '&';
        url = url + $.param(options);
        $link.attr('href', url);
        $link.attr('target', '_blank');
        //$link.click();
        //this.showLoading();
        //this._dataManager.exportToCSV(options, result=> {
        //    console.log('exported: // ', result);
        //
        //    this.hideLoading();
        //});
    };
    ListContractsUIManager.prototype.enableEditing = function (ev) {
        console.log('enableEditing: ', ev);
        var $input = $(ev.target);
        var checked = $input.is(':checked');
        console.log('$input: ', $input);
        console.log('checked: ', checked);
        $("#jsGrid").jsGrid('option', 'editing', checked);
        $("#jsGrid").jsGrid('option', 'selecting', checked);
        if (checked) {
            $('.select-all').hide();
            $('.btn-void').attr('disabled', 'disabled');
        }
        else {
            $('.select-all').show();
            $('.btn-void').removeAttr('disabled');
        }
    };
    ListContractsUIManager.prototype.selectAll = function (ev) {
        console.log('selectAll: ', ev);
        var $input = $(ev.target);
        //var $grid = $input.parents('table:first');
        var $allCheckboxes = $("#jsGrid").find('tbody .select-item :checkbox');
        console.log('$allCheckboxes: ', $allCheckboxes);
        var checked = $input.is(':checked');
        $allCheckboxes.prop('checked', checked);
        ev.cancelBubble = true;
        ev.stopPropagation();
        //ev.preventDefault();
    };
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    ListContractsUIManager.prototype.deleteContract = function (args) {
        var _this = this;
        console.log('deleteContract: ', JSON.stringify(args));
        var promise = $.Deferred();
        var item = {
            id: args.id
        };
        this.showLoading();
        this._dataManager.deleteContract(item, function (result) {
            console.log('deleted: // ', result);
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
        console.log('onGridItemUpdated: ', JSON.stringify(args.item));
        var item = {
            id: args.item.id,
            custrecord_f3mm_start_date: args.item.custrecord_f3mm_start_date,
            custrecord_f3mm_end_date: args.item.custrecord_f3mm_end_date,
            custrecord_f3mm_contract_number: args.item.custrecord_f3mm_contract_number,
            custrecord_f3mm_primary_contact: args.item.custrecord_f3mm_primary_contact,
            custrecord_f3mm_primary_contact_email: args.item.custrecord_f3mm_primary_contact_email,
            custrecord_f3mm_memo: args.item.custrecord_f3mm_memo
        };
        this.showLoading();
        this._dataManager.updateContract(item, function (result) {
            console.log('updated: // ', result);
            _this.hideLoading();
        });
    };
    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    ListContractsUIManager.prototype.onGridItemUpdating = function (args) {
        console.log('onItemUpdating: ', JSON.stringify(args.item));
        var data = args.item;
        var $updateRow = args.row.next();
        var suggestion = $updateRow.data('data-selected-suggestion');
        console.log('onItemUpdating: ', JSON.stringify(suggestion));
        if (!!suggestion) {
            if (!data.custrecord_f3mm_primary_contact) {
                data.custrecord_f3mm_primary_contact = {};
            }
            var name = suggestion.entityid;
            if (!!suggestion.company && !!suggestion.company.text) {
                name = suggestion.company.text + ' : ' + suggestion.entityid;
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
        //
        //if (parseInt(data.quantity) <= 0) {
        //    args.cancel = true;
        //    alert("Quantity cannot be less than or equal to 0");
        //    return;
        //}
        //
        //var taxCode = $updateRow.data('selected-tax-code');
        //if (!!taxCode) {
        //    data.taxcodeid = taxCode.id;
        //    data.taxcode = taxCode.itemid;
        //    data.taxrate = taxCode.rate + '%';
        //}
        //
        //if (!data.taxcode) {
        //    args.preserve = true;
        //    args.cancel = true;
        //    alert("Please select tax code");
        //    return;
        //}
        //
        //if (data.price_level == "0") {
        //    args.preserve = true;
        //    args.cancel = true;
        //    alert("Please select price level");
        //    return;
        //}
    };
    /**
     * itemsPickerSource - fetch data from server based on provided query
     * @param {string} query the keyword which user has typed
     * @param {function} sync  the callback method to invoke synchronously
     * @param {function} async  the callback method to invoke asynchronously
     */
    ListContractsUIManager.prototype.itemsPickerSource = function (query, sync, async) {
        var _this = this;
        console.log(this);
        setTimeout(function () {
            _this._dataManager.getItems({
                query: query
            }, function (items) {
                try {
                    async(items.data);
                }
                catch (e) {
                    console.error('ERROR', 'Error during async binding.', e.toString());
                }
            });
        }, 10);
    };
    /**
     * Binds typeahead autocomplete component with item picker control
     * @param {object} $el jQuery element
     */
    ListContractsUIManager.prototype.bindItemPicker = function ($el) {
        var _this = this;
        if (!$el.data('itempicker_created')) {
            console.log('bind item picker control.', $el);
            var options = {
                hint: false,
                minLength: 3,
                highlight: true
            };
            var dataSet = {
                name: 'Items',
                limit: 500,
                display: function (obj) {
                    return obj.displayname;
                },
                source: function (q, s, a) {
                    _this.itemsPickerSource(q, s, a);
                },
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'unable to find any items that match the current query',
                        '</div>'
                    ].join('\n')
                }
            };
            $el.typeahead(options, dataSet);
            $el.bind('typeahead:change', function () {
                console.log('typeahead:change: ', arguments);
                var $this = $(this);
                var $tr = $this.parents('tr:first');
                var selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr('data-selected-text');
                var val = $this.val();
                var isMatched = selectedText == val;
                console.log('selectedText: ', selectedText);
                console.log('val: ', val);
                console.log('selectedText == val: ', selectedText == val);
                if (!val) {
                    $this.attr('data-selected-id', '');
                    $this.attr('data-selected-text', '');
                    $tr.data('data-selected-suggestion', null);
                }
                else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched == false) {
                        $this.typeahead('val', selectedText);
                        alert('Selected item does not exist.');
                    }
                }
            }).bind('typeahead:select', function (ev, suggestion) {
                var $this = $(ev.target);
                var $tr = $this.parents('tr:first');
                console.log('typeahead:select: ', arguments, $this);
                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-text', suggestion.displayname);
                $tr.data('data-selected-suggestion', suggestion);
                _this._dataManager.getPriceLevels({
                    recordType: suggestion.recordType,
                    itemId: suggestion.id
                }, function (priceLevels) {
                    var $priceLevelDropdown = $tr.find('.price-level select');
                    $priceLevelDropdown.empty();
                    priceLevels.forEach(function (priceLevel) {
                        $("<option>")
                            .attr("value", priceLevel.id)
                            .text(priceLevel.name)
                            .appendTo($priceLevelDropdown);
                    });
                    var quantity = 1; // default to 1
                    var listPriceId = 1; // default to 1
                    var price = parseFloat(suggestion.baseprice).toFixed(2);
                    $tr.find('.description textarea').val(suggestion.salesdescription);
                    $tr.find('.quantity input').val(quantity);
                    $tr.find('.price input').val(price);
                    $tr.find('.quantity input').focus();
                    $tr.find('.price-level select').val(listPriceId).focus().trigger('change');
                });
            });
            $el.data('itempicker_created', true);
            $el.focus();
        }
    };
    /**
     * Binds typeahead autocomplete component with primary contact control
     * @param {object} $contactsDropdown jQuery element
     */
    ListContractsUIManager.prototype.bindPrimaryContactDropdown = function ($contactsDropdown) {
        var _this = this;
        if (!$contactsDropdown.data('itempicker_created')) {
            var typeaheadOptions = {
                hint: false,
                minLength: 3,
                highlight: true
            };
            var contactsDataset = {
                name: 'primary-contacts',
                limit: 500,
                display: function (obj) {
                    var name = obj.entityid;
                    if (!!obj.company && !!obj.company.text) {
                        name = obj.company.text + ' : ' + obj.entityid;
                    }
                    return name;
                },
                source: function (query, sync, async) {
                    setTimeout(function () {
                        _this._dataManager.getPrimaryContacts({
                            query: query
                        }, function (contacts) {
                            try {
                                async(contacts.data);
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
                        'unable to find any contacts that match the current query',
                        '</div>'
                    ].join('\n')
                }
            };
            $contactsDropdown.typeahead(typeaheadOptions, contactsDataset);
            $contactsDropdown.bind('typeahead:change', function (ev, val) {
                console.log('typeahead:change: ', arguments);
                var $this = $(this);
                var $tr = $this.parents('tr:first');
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
                    // TODO : empty primary contact column
                    //$('.primary-contact-email-text').val('');
                    $tr.data('data-selected-suggestion', null);
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
                var $tr = $this.parents('tr:first');
                $this.attr('data-selected-id', obj.id);
                $this.attr('data-selected-text', name);
                $tr.data('data-selected-suggestion', obj);
                // TODO : set email on primary contact email column
                //$('.primary-contact-email-text').val(obj.email);
            });
            $contactsDropdown.data('itempicker_created', true);
            $contactsDropdown.focus();
        }
    };
    /**
     * Binds typeahead autocomplete component with customer control
     * @param {object} $customerDropdown jQuery element
     */
    ListContractsUIManager.prototype.bindCustomerDropdown = function ($customerDropdown) {
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
                        $this.typeahead('val', selectedText);
                        alert('Selected customer does not exist.');
                    }
                }
            }).bind('typeahead:select', function (ev, suggestion) {
                console.log('typeahead:select: ', arguments);
                var text = suggestion.entityid;
                if (!!suggestion.altname) {
                    text = text + ' ' + suggestion.altname;
                }
                var $this = $(this);
                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-text', text);
            });
            $customerDropdown.data('itempicker_created', true);
            $customerDropdown.focus();
        }
    };
    /**
     * Binds All Dropdowns with required data
     */
    ListContractsUIManager.prototype.bindDropdown = function () {
        var _this = this;
        $(document.body).on('focusin', '.customer-dropdown', function (ev) {
            _this.bindCustomerDropdown($(ev.target));
        });
        //$(document.body).on('focusin', '.primary-contact-dropdown', (ev) => {
        //    this.bindPrimaryContactDropdown($(ev.target));
        //});
    };
    return ListContractsUIManager;
})();
//# sourceMappingURL=f3mm_list_contracts_ui_manager.js.map