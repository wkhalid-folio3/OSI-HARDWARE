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
class CreateContractUIManager {

    private _dataManager: DataManager;
    private _contractInfo: any;
    private _viewType: string;
    private _loadedCount: number = 0;

    /**
     * constructor of ui manager class
     * responsible for initializing dropdown elements and items grid.
     */
    constructor() {

        this._viewType = window.pageType;
        this._contractInfo = window.contractInfo;
        this._dataManager = new DataManager(this._viewType);

        this.setViewMode();

        this.bindDropdown();

        this.bindItemsGrid();

        this.bindDatePicker();

        this.applyValidation();

        $('.btn-generate-quote').on('click', this.generateQuote.bind(this));
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
        console.log('this.loaded();', this._loadedCount);

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

        if (contract.custrecord_f3mm_status && contract.custrecord_f3mm_status.value == "1") {
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

    /**
     * Binds Date Picker component with specific fields
     * @returns {void}
     */
    private bindDatePicker() {
        if (this._viewType !== 'view') {
            $('.input-group.date').not('[disabled]').datepicker({
                format: "m/d/yyyy",
                clearBtn: true,
                autoclose: true
            });
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
                    price_level: item.price_level
                    //,
                    //tax_code: item.taxcodeid,
                    //tax_rate: item.taxrate
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
     * Invoked by JSGrid whenever any item is inserted or changed or removed from Grid.
     * @returns {void}
     */
    private itemsChanged() {
        var existingData = $('#jsGrid').data().JSGrid.data;

        var quantities = _.pluck(existingData, 'quantity');

        // calculate quantity from all items
        var totalQuantitySeats = _.reduce(quantities, (memo, num) => memo + parseInt(num), 0);

        // set quantity in total quantity seats textbox
        $('.total-quantity-seats-text').val(totalQuantitySeats);
    }

    /**
     * Prepares items data before binding with the grid
     * @returns {object[]} returns array of objects containing contract items data
     */
    private prepareGridData(): any[] {
        var contactItems = [];

        if (!!this._contractInfo && !!this._contractInfo.sublists) {
            var contractItemsInfo = this._contractInfo.sublists.recmachcustrecord_f3mm_ci_contract;
            if (!!contractItemsInfo) {
                contractItemsInfo.forEach(contractItem => {
                    // only add if item is not null
                    if (!!contractItem.custrecord_f3mm_ci_item) {
                        var priceLevel = contractItem.custrecord_f3mm_ci_price_level;
                        //var taxCode = contractItem.custrecord_f3mm_ci_taxcode;
                        contactItems.push({
                            item: contractItem.custrecord_f3mm_ci_item.text,
                            itemid: contractItem.custrecord_f3mm_ci_item.value,
                            baseprice: contractItem.custrecord_f3mm_ci_item.baseprice,
                            quantity: contractItem.custrecord_f3mm_ci_quantity,
                            price: contractItem.custrecord_f3mm_ci_price,
                            amount: contractItem.custrecord_f3mm_ci_amount,
                            description: contractItem.custrecord_f3mm_ci_item_description,
                            price_level: (priceLevel && priceLevel.value) || "0",
                            priceLevels: contractItem.custrecord_f3mm_ci_item.priceLevels // used for dropdown
                            //,taxcode: taxCode && taxCode.text,
                            //taxcodeid: taxCode && taxCode.value,
                            //taxrate: contractItem.custrecord_f3mm_ci_taxrate
                        });
                    }
                });
            }
        }

        return contactItems;
    }

    /**
     * Prepares Grid fields before initializing the grid
     * @returns {object[]} returns array of fields
     */
    private prepareGridFields(): any[] {

        var gridFields = [{
            title: "Item <span class='mandatory'>*</span>",
            name: "item",
            type: "text",
            width: 150,
            css: "item"
        }, {
            title: "Description",
            name: "description",
            type: "textarea",
            width: 150,
            css: "description",
            editing: false
        }, {
            title: "Quantity  <span class='mandatory'>*</span>",
            name: "quantity",
            type: "number",
            width: 50,
            css: "quantity",
            min: 0
        }, {
            title: "Price Level <span class='mandatory'>*</span>",
            name: "price_level",
            type: "custom_select",
            textField: "pricelevelname",
            valueField: "pricelevel",
            width: 80,
            css: "price-level",
            items: null,
            filtering: false,
            getItems: function(item) {
                console.log('getItems(); ',item);
                return (item || {}).priceLevels;
            }
        }, {
            title: "Price",
            name: "price",
            type: "decimal_number",
            width: 50,
            css: "price"
        }, {
            title: "Amount",
            name: "amount",
            type: "decimal_number",
            width: 50,
            css: "amount",
            editing: false
        }
        //    , {
        //    title: "Tax Code <span class='mandatory'>*</span>",
        //    name: "taxcode",
        //    type: "text",
        //    width: 150,
        //    css: "taxcode"
        //}, {
        //    title: "Tax",
        //    name: "taxrate",
        //    type: "decimal_number",
        //    width: 50,
        //    css: "taxrate",
        //    editing: false,
        //    inserting: false
        //}
        ];


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
    bindItemsGrid() {

        var contactItems = this.prepareGridData();
        var gridFields = this.prepareGridFields();
        var inserting = true;
        var editing = true;

        if (this._viewType == 'view') {
            inserting = false;
            editing = false;
        }

        var $grid = $("#jsGrid");
        $grid.jsGrid({
            height: "auto",
            width: "100%",
            noDataContent: 'No items added.',
            inserting: inserting,
            filtering: false,
            editing: editing,
            sorting: false,
            paging: false,
            autoload: true,
            pageSize: 15,
            pageButtonCount: 5,
            controller: {
                loadData: (filter) => {
                    return contactItems;
                }
            },
            onItemInserted: this.itemsChanged.bind(this),
            onItemUpdated: this.itemsChanged.bind(this),
            onItemDeleted: this.itemsChanged.bind(this),
            onDataLoaded: this.loaded.bind(this),
            onItemUpdating: this.onGridItemUpdating.bind(this),
            onItemInserting: this.onGridItemInserting.bind(this),
            fields: gridFields
        });


        // bind grid events
        var gridRowClass = [
            '.jsgrid-insert-row .quantity input',
            '.jsgrid-insert-row .price input',
            '.jsgrid-edit-row .quantity input',
            '.jsgrid-edit-row .price input'
        ];
        $grid.on('focusin', '.jsgrid-insert-row input:first, .jsgrid-edit-row input:first', (ev) => {
            this.bindItemPicker($(ev.target));
        });
        //$grid.on('focusin', '.jsgrid-insert-row .taxcode input, .jsgrid-edit-row .taxcode input', (ev) => {
        //    this.bindTaxCodePicker($(ev.target));
        //});
        $grid.on('blur', gridRowClass.join(', '), this.onPriceOrQuantityChanged.bind(this));
        $grid.on('change', '.jsgrid-insert-row .price-level select', this.onPriceLevelChangedInInsertRow.bind(this));
        $grid.on('change', '.jsgrid-edit-row .price-level select', this.onPriceLevelChangedInEditRow.bind(this));
    }

    /**
     * Invoked by JSGrid whenever any item is updating in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    private onGridItemUpdating(args) {
        console.log('onItemUpdating: ', JSON.stringify(args.item));

        var data = args.item;
        data.price = parseFloat(data.price).toFixed(2);
        data.amount = parseFloat(args.row.next().find('.amount').html()).toFixed(2);

        var $updateRow = args.row.next();
        var suggestion = $updateRow.data('data-selected-suggestion');

        console.log('onItemUpdating: ', JSON.stringify(suggestion));

        if (!!suggestion) {
            data.item = suggestion.displayname;
            data.itemid = suggestion.id;
            data.description = suggestion.salesdescription;
            data.baseprice = suggestion.baseprice;
        }

        if (data.item === "") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select an item");
            return;
        }

        if (parseInt(data.quantity) <= 0) {
            args.cancel = true;
            alert("Quantity cannot be less than or equal to 0");
            return;
        }

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

        if (data.price_level == "0") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select price level");
            return;
        }
        else {
            // make it string
            data.price_level = data.price_level + "";
        }
    }

    /**
     * Invoked by JSGrid whenever any item is inserting in the grid
     * @param {object} args contains json object of item and html element of grid row
     * @returns {void}
     */
    private onGridItemInserting(args) {
        console.log('onItemInserting:', args);

        var $row = $('.jsgrid-insert-row');
        var suggestion = $row.data('data-selected-suggestion');
        var priceLevels = $row.data('price-levels');

        args.item.priceLevels = priceLevels;

        if (!!suggestion) {
            args.item.item = suggestion.displayname;
            args.item.itemid = suggestion.id;
            args.item.baseprice = suggestion.baseprice;
            args.item.description = suggestion.salesdescription;
        }


        //var taxCode = $row.data('selected-tax-code');
        //if (!!taxCode) {
        //    args.item.taxcodeid = taxCode.id;
        //    args.item.taxcode = taxCode.itemid;
        //    args.item.taxrate = taxCode.rate + '%';
        //}


        if (args.item.item === "") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select an item");
            return;
        }

        if (parseInt(args.item.quantity) <= 0) {
            args.preserve = true;
            args.cancel = true;
            alert("Quantity cannot be less than or equal to 0");
            return;
        }

        //if (!args.item.taxcode) {
        //    args.preserve = true;
        //    args.cancel = true;
        //    alert("Please select tax code");
        //    return;
        //}


        if (args.item.price_level == "0") {
            args.preserve = true;
            args.cancel = true;
            alert("Please select price level");
            return;
        } else {
            // make it string
            args.item.price_level = args.item.price_level + "";
        }


        var existingData = $('#jsGrid').data().JSGrid.data;
        var found = false;

        existingData.forEach(item => {
            if (item.itemid == args.item.itemid) {
                found = true;
            }
        });

        if (found === true) {
            args.preserve = true;
            args.cancel = true;
            alert("The selected item already exists. Please select another item.");
        }
    }

    /**
     * Invoked whenever price or quantity is changed in any row of grid
     * Responsible for calculating total amount based on price and quantity
     * @param {Event} ev contains json object of item and html element of grid row
     * @returns {void}
     */
    private onPriceOrQuantityChanged(ev) {
        var $input = $(ev.target);
        var $tr = $input.parents('tr:first');
        var $quantity = $tr.find('.quantity input');
        var $price = $tr.find('.price input');

        var isEditing = $tr.hasClass('jsgrid-edit-row');
        var quantity = parseInt($quantity.val());
        var price = parseFloat($price.val());
        var totalPrice = (price * quantity).toFixed(2);

        if (isEditing) {
            $tr.find('.amount').html(totalPrice);
        } else {
            $tr.find('.amount input').val(totalPrice);
        }
    }

    /**
     * Invoked whenever price level field is changed in insert row of grid
     * Responsible for calculating total amount based on price level, price and quantity
     * @param {Event} ev contains json object of item and html element of grid row
     * @returns {void}
     */
    private onPriceLevelChangedInInsertRow(ev) {
        var $priceLevelDropdown = $(ev.target);
        var $row = $priceLevelDropdown.parents('tr:first');
        var $priceTextbox = $row.find('.price input');

        var priceLevels = $row.data('price-levels');
        var suggestion = $row.data('data-selected-suggestion');
        var selectedPriceLevelId = $priceLevelDropdown.val();
        var price = $priceTextbox.val();

        if (selectedPriceLevelId == "0" || selectedPriceLevelId == "-1") {
            $priceTextbox.removeAttr('disabled');

            if (!!suggestion) {
                $priceTextbox.val(suggestion.baseprice);
            } else {
                $priceTextbox.val('');
            }
        } else {
            $priceTextbox.attr('disabled', 'disabled');

            var selectedPriceLevel = _.find(priceLevels, priceLevel => {
                return priceLevel.pricelevel == selectedPriceLevelId
            });

            if (!!suggestion && selectedPriceLevel != null) {
                var discountPercent = Math.abs(parseFloat(selectedPriceLevel.discount || 0));
                var discount = (suggestion.baseprice / 100) * discountPercent;
                var discountedPrice = (suggestion.baseprice - discount).toFixed(2);
                $priceTextbox.val(discountedPrice);
            }
        }


        $priceTextbox.focus().trigger('blur')
    }

    /**
     * Invoked whenever price level field is changed in any editing row of grid
     * Responsible for calculating total amount based on price level, price and quantity
     * @param {Event} ev contains json object of item and html element of grid row
     * @returns {void}
     */
    private onPriceLevelChangedInEditRow(ev) {
        var $priceLevelDropdown = $(ev.target);
        var $row = $priceLevelDropdown.parents('tr:first');
        var $priceTextbox = $row.find('.price input');
        //var priceLevels = $row.data('price-levels');

        var jsGridItem = $row.prev().data('JSGridItem');
        var suggestion = jsGridItem;
        var selectedPriceLevelId = $priceLevelDropdown.val();
        var price = $priceTextbox.val();

        if (selectedPriceLevelId == "0" || selectedPriceLevelId == "-1") {
            $priceTextbox.removeAttr('disabled');

            if (!!suggestion) {
                $priceTextbox.val(suggestion.baseprice);
            } else {
                $priceTextbox.val('');
            }
        } else {
            $priceTextbox.attr('disabled', 'disabled');

            var priceLevels = jsGridItem.priceLevels;
            var selectedPriceLevel = _.find(priceLevels, priceLevel => {
                return priceLevel.pricelevel == selectedPriceLevelId
            });

            if (!!suggestion && selectedPriceLevel != null) {
                var discountPercent = Math.abs(parseFloat(selectedPriceLevel.discount || 0));
                var discount = (suggestion.baseprice / 100) * discountPercent;
                var discountedPrice = (suggestion.baseprice - discount).toFixed(2);
                $priceTextbox.val(discountedPrice);
            }
        }


        $priceTextbox.focus().trigger('blur');
    }

    ///**
    // * itemsPickerSource - fetch data from server based on provided query
    // * @param {string} query the keyword which user has typed
    // * @param {function} sync  the callback method to invoke synchronously
    // * @param {function} async  the callback method to invoke asynchronously
    // */
    //private taxcodePickerSource(query, sync, async) {
    //
    //    console.log(this);
    //
    //    setTimeout(() => {
    //
    //        // {query: query}
    //        this._dataManager.getTaxCodes(null, function(items) {
    //
    //            try {
    //
    //                var loweredCaseQuery = query.toLowerCase();
    //                var filteredItems = _.filter(items.data, item => {
    //                    return item.itemid.toLowerCase().indexOf(loweredCaseQuery) == 0
    //                });
    //
    //                async(filteredItems);
    //            } catch (e) {
    //                console.error('ERROR', 'Error during async binding.', e.toString());
    //            }
    //
    //        });
    //
    //    }, 10);
    //
    //}

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

    ///**
    // * Binds typeahead autocomplete component with Tax Code control
    // * @param {object} $el jQuery element
    // */
    //private bindTaxCodePicker($el) {
    //
    //    if (!$el.data('itempicker_created')) {
    //
    //        console.log('bind item picker control.', $el);
    //
    //        var options = {
    //            hint: false,
    //            minLength: 0,
    //            highlight: true
    //        };
    //
    //        var dataSet = {
    //            name: 'TaxCodes',
    //            limit: 500,
    //            display: (obj) => {
    //                return obj.itemid;
    //            },
    //            source: (q, s, a) => {
    //                this.taxcodePickerSource(q, s, a);
    //            },
    //            templates: {
    //                empty: [
    //                    '<div class="empty-message">',
    //                    'unable to find any items that match the current query',
    //                    '</div>'
    //                ].join('\n')
    //            }
    //
    //        };
    //
    //        $el.typeahead(options, dataSet);
    //        $el.bind('typeahead:change', function() {
    //            console.log('typeahead:change: ', arguments);
    //            var $this = $(this);
    //            var $tr = $this.parents('tr:first');
    //
    //            var selectedId = $this.attr('data-selected-id');
    //            var selectedText = $this.attr('data-selected-text');
    //            var val = $this.val();
    //            var isMatched = selectedText == val;
    //
    //            console.log('selectedText: ', selectedText);
    //            console.log('val: ', val);
    //            console.log('selectedText == val: ', selectedText == val);
    //
    //            if (!val) {
    //                $this.attr('data-selected-id', '');
    //                $this.attr('data-selected-text', '');
    //                $tr.data('selected-tax-code', null);
    //            } else {
    //                // if it does not match,
    //                // then remove the last selected value.
    //                if (isMatched == false) {
    //                    $this.typeahead('val', selectedText);
    //                    alert('Selected tax code does not exist.');
    //                }
    //            }
    //
    //        }).bind('typeahead:select', function(ev, suggestion, extra) {
    //
    //            var $this = $(this);
    //            var $tr = $this.parents('tr:first');
    //
    //            console.log('typeahead:select: ', arguments, $this);
    //
    //            $this.attr('data-selected-id', suggestion.id);
    //            $this.attr('data-selected-text', suggestion.itemid);
    //
    //            // only set modified class in case of item pickers inside grid
    //            //if ($this.is ('.item-picker') === true) {
    //            var origValue = $this.attr('data-orig-value');
    //            if (origValue === suggestion.itemid) {
    //                $tr.removeClass('modified-item');
    //            } else {
    //                $tr.addClass('modified-item');
    //            }
    //            //}
    //
    //
    //            $tr.data('selected-tax-code', suggestion);
    //            $tr.find('.taxrate').html(suggestion.rate + '%');
    //        });
    //
    //        $el.data('itempicker_created', true);
    //
    //        $el.focus();
    //    }
    //}

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
                }, function(result) {

                    var priceLevels = result.data;
                    var $priceLevelDropdown = $tr.find('.price-level select');
                    $priceLevelDropdown.empty();

                    _.each(priceLevels, priceLevel => {
                        console.log(priceLevel);
                        $("<option>")
                            .attr("value", priceLevel.pricelevel)
                            .text(priceLevel.pricelevelname)
                            .appendTo($priceLevelDropdown);
                    });

                    var quantity = 1; // default to 1
                    var listPriceId = 1; // default to 1
                    var price = parseFloat(suggestion.baseprice).toFixed(2);
                    $tr.data('price-levels', priceLevels);
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
                    $('.primary-contact-email-text').val('');
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
                $this.attr('data-selected-id', obj.id);
                $this.attr('data-selected-text', name);

                $('.primary-contact-email-text').val(obj.email);
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