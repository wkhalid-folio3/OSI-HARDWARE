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
class ListContractsUIManager {

    private _dataManager: DataManager;
    private _contractInfo: any;
    private _viewType: string;
    private _priceLevels: any[];
    private _loadedCount: number = 0;

    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    constructor() {

        this._viewType = window.pageType;
        this._priceLevels = window.priceLevels;
        this._contractInfo = window.contractInfo;
        this._dataManager = new DataManager(this._viewType);

        //this.setViewMode();

        //this.bindDropdown();

        this.bindContractsGrid();

        //this.bindDatePicker();

        //this.applyValidation();

        //$('.btn-generate-quote').on('click', this.generateQuote.bind(this));
    }

    /**
     * Show Loading Indicator
     */
    private showLoading() {
        var $loading = $('.contract-loading-backdrop,.contract-loading');
        $loading.addClass('in').show();
    }

    /**
     * Hide Loading Indicator
     */
    private hideLoading() {
        var $loading = $('.contract-loading-backdrop,.contract-loading');
        $loading.removeClass('in').hide();
    }

    /**
     * Apply validation on form elements
     */
    private applyValidation() {

        var $form = $(".f3mm-contract-renewal").parents('form:first');
        $form.removeAttr('onsubmit');
        $form.validate({
            rules: {
                contract_number: {
                    required: true
                },
                customer: {
                    requiredTypeahead: true
                },
                primary_contact: {
                    requiredTypeahead: true
                },
                department: {
                    required: true
                },
                vendor: {
                    required: true
                },
                sales_rep: {
                    required: true
                },
                status: {
                    required: true
                },
                end_date: {
                    required: true
                },
                start_date: {
                    required: true
                }
            },
            errorPlacement: ($error, $element) => {
                var $parent = $element.parent();
                var isGroup = $parent.is('.input-group');

                if (isGroup === true) {
                    $parent.after($error);
                } else {
                    $element.after($error);
                }
            },
            submitHandler: (form) => {
                this.submit();
                return false;
            }
        });
    }

    /**
     * Show Create / View / Edit Screen based on _viewType property
     */
    private setViewMode() {
        console.log('this.setViewMode(); // this._viewType: ', this._viewType);

        if (this._viewType == 'view') {
            $('.form-horizontal :input, .input-group.date').attr('disabled', 'disabled');
            $('.form-actions').hide();
            $('.view-contract-action-buttons').show();
            $('.view-horizontal').show();
        } else {
            $('.form-actions').show();
            $('.view-contract-action-buttons').hide();
            $('.form-horizontal').show();
        }
    }

    /**
     * Generate Quote when user clicks on Generate Quote button
     * @param {Event} ev the event object injected by browser containing the event information
     */
    private generateQuote(ev) {
        var $button = $(ev.target);

        if ($button.attr('disabled') == 'disabled') {
            return false;
        }

        $button.val('Generating...');

        this.showLoading();
        var data = {
            contractId: this._contractInfo.id
        };
        this._dataManager.generateQuote(data, (result) => {

            if (!!result.data && !!result.data.id) {
                $button.val('Generated!');
                var viewRecordUrl = nlapiResolveURL('RECORD', 'estimate', result.data.id, false);
                window.location.href = viewRecordUrl;
            } else {
                alert(result.message);
                this.hideLoading();
            }
        });
    }

    /**
     * Loaded function called when the page is loaded completely from server.
     * Used to perform after load tasks like binding events and populating ui controls
     * @returns {void}
     */
    private loaded() {
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
        } else {
            this.bindEditScreen(contract);
        }

    }

    /**
     * Binds View Contract Screen with page
     * @param {object} contract json representation of contract object
     * @returns {void}
     */
    private bindViewScreen(contract) {

        var viewTemplate = $('#view_template').html();
        var compiledTemplate = _.template(viewTemplate);
        var htmlMarkup = compiledTemplate(contract);
        $('.view-horizontal').html(htmlMarkup);

        if (contract.custrecord_f3mm_status.value == "1") {
            $('.btn-generate-quote').attr('disabled', 'disabled');
        } else {
            $('.btn-generate-quote').removeAttr('disabled');
        }
    }

    /**
     * Binds Edit Contract screen with page
     * @param {object} contract json representation of contract object
     * @returns {void}
     */
    private bindEditScreen(contract) {

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
        } else {
            if (!!contract.custrecord_f3mm_start_date) {
                $('.start-date-text', $form).parent().datepicker('setDate', contract.custrecord_f3mm_start_date);
            }

            if (!!contract.custrecord_f3mm_end_date) {
                $('.end-date-text', $form).parent().datepicker('setDate', contract.custrecord_f3mm_end_date);
            }
        }
    }

    ///**
    // * Binds Date Picker component with specific fields
    // * @returns {void}
    // */
    //private bindDatePicker() {
    //    if (this._viewType !== 'view') {
    //        $('.input-group.date').not('[disabled]').datepicker({
    //            format: "m/d/yyyy",
    //            clearBtn: true,
    //            autoclose: true
    //        });
    //    }
    //}

    /**
     * bindDatePicker - Bind date picker control with textboxes
     */
    private bindDatePicker(e) {
        var $this = $(e.target);

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
    }


    private initDatePicker($el) {
        if (!$el.data('datepicker_created')) {
            console.log('register date picker control.');

            $el.data('datepicker_created', true);

            $el.datepicker({
                format: "m/d/yyyy",
                clearBtn: true,
                autoclose: true
            });

            //if ($el.is('.ship-date')) {
            //    $el.on('changeDate', onShipDateChanged);
            //}
            //else if ($el.is('.cancel-date')) {
            //    $el.on('changeDate', onCancelDateChanged);
            //}
        }
    }

    /**
     * Validates if selected customer and selected primary contact is valid or not
     * @returns {bool}
     */
    private validateFields(): any {

        var $customerDropdown = $('.customer-dropdown');
        var customerText = $customerDropdown.val();
        var customerId = $customerDropdown.attr('data-selected-id');

        var $primaryContactDropdown = $('.primary-contact-dropdown');
        var primaryContactText = $primaryContactDropdown.val();
        var primaryContactId = $primaryContactDropdown.attr('data-selected-id');

        // validate customer
        if (!customerId && customerText != "") {
            alert('Selected customer is not valid!');
            $customerDropdown.focus();
            return false;
        }

        // validate customer
        if (!primaryContactId && primaryContactText != "") {
            alert('Selected End User is not valid!');
            $primaryContactDropdown.focus();
            return false;
        }

        return {
            customerId: customerId,
            primaryContactId: primaryContactId
        };
    }

    /**
     * Submits contract information (extracted from ui elements) to server
     * @returns {void}
     */
    submit() {

        try {

            var validated = this.validateFields();

            // if not valid then return
            if (validated === false) {
                return;
            }

            var serializedData = $('.form-horizontal :input').serializeObject();

            if (!!this._contractInfo) {
                serializedData.id = this._contractInfo.id;
            }

            if (!!validated.customerId) {
                serializedData.customer = validated.customerId;
            }

            if (!!validated.primaryContactId) {
                serializedData.primary_contact = validated.primaryContactId;
            }

            serializedData.items = [];
            var items = $('#jsGrid').data().JSGrid.data;
            $.each(items, function(index, item) {
                serializedData.items.push({
                    item_id: item.itemid,
                    amount: item.amount,
                    price: item.price,
                    quantity: item.quantity,
                    item_description: item.description,
                    price_level: item.price_level,
                    tax_code: item.taxcodeid,
                    tax_rate: item.taxrate
                });
            });


            if (serializedData.items.length <= 0) {
                alert('You must enter at least one line item for this transaction.');
                return;
            }

            console.log('serializedData: ', serializedData);

            this.showLoading();

            this._dataManager.submit(serializedData, (result) => {

                console.log('submit success:', result);

                if (!!result.data) {
                    var uiSuiteletScriptId = 'customscript_f3mm_create_contract_ui_st';
                    var uiSuiteletDeploymentId = 'customdeploy_f3mm_create_contract_ui_st';
                    var uiSuiteletUrl = nlapiResolveURL('SUITELET', uiSuiteletScriptId, uiSuiteletDeploymentId, false);
                    uiSuiteletUrl = uiSuiteletUrl + '&cid=' + result.data.id;

                    window.location.href = uiSuiteletUrl;
                } else {
                    alert(result.message);
                    this.hideLoading();
                }

            });

        } catch (e) {
            console.error('ERROR', 'Error during main onSubmit', e.toString());
            alert('Error during record submission.');
            this.hideLoading();
        }
    }

    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    private prepareGridData(contractsInfo): any[] {
        var contacts = [];

        if (!!contractsInfo) {
            contractsInfo.forEach(contract => {
                contacts.push({
                    customer: contract.custrecord_f3mm_customer.text,
                    customerId: contract.custrecord_f3mm_customer.value,
                    primaryContact: contract.custrecord_f3mm_primary_contact.text,
                    primaryContactId: contract.custrecord_f3mm_primary_contact.value,
                    primaryContactEmail: contract.custrecord_f3mm_primary_contact_email,
                    contractNumber: contract.custrecord_f3mm_contract_number,
                    vendor: contract.custrecord_f3mm_contract_vendor.text,
                    vendorId: contract.custrecord_f3mm_contract_vendor.value,
                    totalQtySeats: contract.custrecord_f3mm_total_qty_seats,
                    startDate: contract.custrecord_f3mm_start_date,
                    endDate: contract.custrecord_f3mm_end_date,
                    memo: contract.custrecord_f3mm_memo,
                    firstItemDescription: contract.custrecord_f3mm_memo
                });
            });
        }

        return contractsInfo;
    }

    /**
     * Prepares Grid fields before initializing the grid
     * @returns {object[]} returns array of fields
     */
    private prepareGridFields(): any[] {

        var gridFields = [{
            title: "",
            name: "internalid",
            type: "text",
            width: 70,
            itemTemplate: function() {
                var $links = $('<div />');

                $links.append('<a href="#">View</a>');
                $links.append('&nbsp; | &nbsp;');
                $links.append('<a href="#">Edit</a>');

                return $links;
            },
            editing: false
        },{
            title: "ID",
            name: "internalid",
            type: "text",
            width: 20,
            editing: false
        },{
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
            title: "Contract #",
            name: "custrecord_f3mm_contract_number",
            type: "text",
            width: 70,
            css: "contract-number"
        }, {
            title: "Vendor",
            name: "custrecord_f3mm_contract_vendor.text",
            type: "text",
            width: 80,
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
            width: 70,
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
            width: 70,
            editTemplate: function(_, item) {

                var $html = $('<div class="input-group input-group-sm date start-date">' +
                    '<input type="text" class="form-control" />' +
                    '<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>' +
                    '</div>');

                this.editControl = $html.find('input');

                this.editControl.val(_);

                return $html;
            }
        }, {
            title: "memo",
            name: "custrecord_f3mm_memo",
            type: "text",
            width: 120,
            editing: false
        }];


        if (this._viewType != 'view') {
            gridFields.push({
                type: "control",
                modeSwitchButton: false,
                editButton: false
            });
        }

        return gridFields;
    }

    /**
     * Binds Contract Items with the Grid
     * @returns {void}
     */
    bindContractsGrid() {

        this._priceLevels = [{
            id: 0,
            name: ''
        }];

        //var contracts = this.prepareGridData();
        var gridFields = this.prepareGridFields();
        var inserting = false;
        var editing = true;
        var $grid = $("#jsGrid");

        $grid.jsGrid({
            height: "auto",
            width: "100%",
            noDataContent: 'No items added.',
            inserting: inserting,
            filtering: false,
            editing: editing,
            sorting: true,
            paging: true,
            pageLoading: true,
            autoload: true,
            pageSize: 10,
            pageButtonCount: 5,
            controller: {
                loadData: (filter) => {

                    console.log('filter: ', filter);
                    var promise = $.Deferred();
                    var startIndex = (filter.pageIndex - 1) * filter.pageSize;
                    var sortField = filter.sortField;

                    var options: any = {
                        startIndex: startIndex,
                        pageSize: filter.pageSize,
                        sortFields: {}
                    };

                    if (!!sortField) {
                        var rootFieldLength = sortField.indexOf('.');
                        sortField = sortField.substring(0, rootFieldLength > -1 ? rootFieldLength : sortField.length);
                        options.sortFields[sortField] = filter.sortOrder;
                    }

                    this._dataManager.searchContracts(options, result=> {
                        console.log('result: ', result);
                        var data = this.prepareGridData(result.data.records);
                        console.log('data: ', data);
                        //d.resolve(data);
                        promise.resolve({
                            data: data,
                            itemsCount: result.data.total
                        });
                    });

                    return promise.promise();
                }
            },
            onDataLoaded: this.loaded.bind(this),
            onItemUpdating: this.onGridItemUpdating.bind(this),
            fields: gridFields
        });


        $grid.on('focusin', '.jsgrid-edit-row .primary-contact', (ev) => {
            this.bindPrimaryContactDropdown($(ev.target));
        });
        $grid.on('focusin', '.jsgrid-edit-row .start-date, .jsgrid-edit-row .end-date', (ev) => {
            this.bindDatePicker(ev);
        });

    }

    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    private onGridItemUpdating(args) {
        console.log('onItemUpdating: ', JSON.stringify(args.item));

        var data = args.item;
        //data.price = parseFloat(data.price).toFixed(2);
        //data.amount = parseFloat(args.row.next().find('.amount').html()).toFixed(2);

        var $updateRow = args.row.next();
        var suggestion = $updateRow.data('data-selected-suggestion');

        console.log('onItemUpdating: ', JSON.stringify(suggestion));

        if (!!suggestion) {
            if (!!data.custrecord_f3mm_primary_contact) {
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
            alert("Please select an item");
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

    }



    /**
     * itemsPickerSource - fetch data from server based on provided query
     * @param {string} query the keyword which user has typed
     * @param {function} sync  the callback method to invoke synchronously
     * @param {function} async  the callback method to invoke asynchronously
     */
    private itemsPickerSource(query, sync, async) {

        console.log(this);

        setTimeout(() => {

            this._dataManager.getItems({
                query: query
            }, function(items) {

                try {
                    async(items.data);
                } catch (e) {
                    console.error('ERROR', 'Error during async binding.', e.toString());
                }

            });

        }, 10);

    }

    /**
     * Binds typeahead autocomplete component with item picker control
     * @param {object} $el jQuery element
     */
    private bindItemPicker($el) {

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
                display: function(obj) {
                    return obj.displayname;
                },
                source: (q, s, a) => {
                    this.itemsPickerSource(q, s, a);
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
            $el.bind('typeahead:change', function() {
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
                } else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched == false) {
                        $this.typeahead('val', selectedText);
                        alert('Selected item does not exist.');
                    }
                }

            }).bind('typeahead:select', (ev, suggestion) => {

                var $this = $(ev.target);
                var $tr = $this.parents('tr:first');

                console.log('typeahead:select: ', arguments, $this);

                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-text', suggestion.displayname);
                $tr.data('data-selected-suggestion', suggestion);

                this._dataManager.getPriceLevels({
                    recordType: suggestion.recordType,
                    itemId: suggestion.id
                }, function(priceLevels) {

                    var $priceLevelDropdown = $tr.find('.price-level select');
                    $priceLevelDropdown.empty();
                    priceLevels.forEach(priceLevel => {
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
    }

    /**
     * Binds typeahead autocomplete component with primary contact control
     * @param {object} $contactsDropdown jQuery element
     */
    bindPrimaryContactDropdown($contactsDropdown) {

        if (!$contactsDropdown.data('itempicker_created')) {

            var typeaheadOptions = {
                hint: false,
                minLength: 3,
                highlight: true
            };
            var contactsDataset = {
                name: 'primary-contacts',
                limit: 500,
                display: (obj) => {
                    var name = obj.entityid;
                    if (!!obj.company && !!obj.company.text) {
                        name = obj.company.text + ' : ' + obj.entityid;
                    }
                    return name;
                },
                source: (query, sync, async) => {

                    setTimeout(() => {
                        this._dataManager.getPrimaryContacts({
                            query: query
                        }, (contacts) => {
                            try {
                                async(contacts.data);
                            } catch (e) {
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
            $contactsDropdown.bind('typeahead:change', function(ev, val) {
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
                } else {

                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched == false) {
                        $this.typeahead('val', selectedText);
                        alert('Selected tax code does not exist.');
                    }
                }

            }).bind('typeahead:select', function(ev, obj) {
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
    }

    /**
     * Binds typeahead autocomplete component with customer control
     * @param {object} $customerDropdown jQuery element
     */
    bindCustomerDropdown($customerDropdown) {

        if (!$customerDropdown.data('itempicker_created')) {

            var typeaheadOptions = {
                hint: false,
                minLength: 3,
                highlight: true
            };
            var customerDataset = {
                name: 'customers',
                limit: 500,
                display: (obj) => {
                    var isPerson = obj.isperson === 'T';
                    var name = isPerson ? (obj.firstname + ' ' + obj.lastname) : obj.companyname;

                    var text = obj.entityid;
                    if (!!obj.altname) {
                        text = text + ' ' + obj.altname;
                    }
                    return text;
                },
                source: (query, sync, async) => {

                    setTimeout(() => {
                        this._dataManager.getCustomers({
                            query: query
                        }, (customers) => {
                            try {
                                async(customers.data);
                            } catch (e) {
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
            $customerDropdown.bind('typeahead:change', function(ev, val) {
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
                } else {
                    // if it does not match,
                    // then remove the last selected value.
                    if (isMatched == false) {
                        $this.typeahead('val', selectedText);
                        alert('Selected customer does not exist.');
                        //$this.attr('data-selected-id', '');
                    }
                }

            }).bind('typeahead:select', function(ev, suggestion) {
                console.log('typeahead:select: ', arguments);

                var name = suggestion.isperson === 'T' ? (suggestion.firstname + ' ' + suggestion.lastname) : suggestion.companyname;
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
    }

    /**
     * Binds All Dropdowns with required data
     */
    bindDropdown() {

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


                this.loaded();
            }, 10);
        });

        this._dataManager.getEmployees((result) => {

            // make it async
            setTimeout(() => {
                var select = document.getElementById('sales_rep');
                if (result.status_code === 200) {

                    // add each item on UI
                    $.each(result.data, function(i, item) {
                        var name = (item.firstname + ' ' + item.lastname).trim();
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }

                this.loaded();
            }, 10);
        });

        this._dataManager.getDepartment((result) => {

            // make it async
            setTimeout(() => {
                var select = document.getElementById('department');
                if (result.status_code === 200) {

                    // add each item on UI
                    $.each(result.data, function(i, item) {
                        var name = item.name.trim();
                        if (!!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }

                this.loaded();
            }, 10);
        });


        $(document.body).on('focusin', '.customer-dropdown', (ev) => {
            this.bindCustomerDropdown($(ev.target));
        });

        $(document.body).on('focusin', '.primary-contact-dropdown', (ev) => {
            this.bindPrimaryContactDropdown($(ev.target));
        });

    }

}