/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/es6-promise.d.ts" />
/// <reference path="./f3mm-data-manager.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 */


// Reference: https://github.com/hongymagic/jQuery.serializeObject
// Use internal $.serializeArray to get list of form elements which is
// consistent with $.serialize
//
// From version 2.0.0, $.serializeObject will stop converting [name] values
// to camelCase format. This is *consistent* with other serialize methods:
//
//   - $.serialize
//   - $.serializeArray
//
// If you require camel casing, you can either download version 1.0.4 or map
// them yourself.
//
(function($){
    $.fn.serializeObject = function () {
        "use strict";

        var result = {};
        var extend = function (i, element) {
            console.log('extend: ' , element);
            //// CUSTOM HANDLING: added data-key handling to preserve names
            var name = element.name; // element.getAttribute('data-key') ||
            var node = result[name];

            // If node with same name exists already, need to convert it to an array as it
            // is a multi-value field (i.e., checkboxes)
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[name] = [node, element.value];
                }
            } else {
                result[name] = element.value;
            }
        };

        $.each(this.serializeArray(), extend);
        return result;
    };
})(jQuery);




((jsGrid, $, undefined) => {

    var TextField = jsGrid.TextField;

    function DecimalNumberField(config) {
        TextField.call(this, config);
    }

    DecimalNumberField.prototype = new TextField({

        sorter: "number",
        align: "right",

        filterValue: function() {
            return parseFloat(this.filterControl.val() || 0);
        },

        insertValue: function() {
            return parseFloat(this.insertControl.val() || 0);
        },

        editValue: function() {
            return parseFloat(this.editControl.val() || 0);
        },

        _createTextBox: function() {
            return $("<input>").attr("type", "number").attr("step", "0.01");
        }
    });

    jsGrid.fields.decimal_number = jsGrid.DecimalNumberField = DecimalNumberField;

})(jsGrid, jQuery);






$(function () {

    var x = new CreateContractUIManager();

});

//var p = new Promise<string>((resolve, reject) => {
//    resolve('a string');
//});

class CreateContractUIManager {

    private _dataManager: DataManager;
    private _contractInfo: any;
    private _viewType: string;
    private _priceLevels: any[];

    constructor() {

        this._viewType = window.pageType;

        this._dataManager = new DataManager(this._viewType);

        this._contractInfo = window.contractInfo;

        this.setViewMode();

        this.bindDropdown();

        this.fetchPriceLevels().then(()=> {
            this.bindItemsGrid();
        });

        //this.bindItemsGrid();

        this.bindDatePicker();

        $('.btn-submit').on('click', ()=> {
            this.submit();
        });
    }

    private setViewMode() {
        console.log('this.setViewMode(); // this._viewType: ', this._viewType);

        if (this._viewType == 'view') {
            $('.form-horizontal :input, .input-group.date').attr('disabled', 'disabled');
            //$('.input-group.date').datepicker('remove');
            $('.form-actions').hide();
            $('.view-contract-action-buttons').show();
            //$("#jsGrid").jsGrid('option', 'inserting', 'false');
            //$("#jsGrid").jsGrid('option', 'editing', 'false');
        }
        else {
            $('.form-actions').show();
            $('.view-contract-action-buttons').hide();
        }
    }


    private loaded() {
        console.log('this.loaded();');

        var contract = this._contractInfo;

        if (!contract) {
            return;
        }

        $('.contract-number-text').val(contract.custrecord_f3mm_contract_number);
        $('.po-number-text').val(contract.custrecord_f3mm_po_number);

        if( !!contract.custrecord_f3mm_sales_rep) {
            $('.sales-rep-dropdown').val(contract.custrecord_f3mm_sales_rep.value);
        }

        if ( !!contract.custrecord_f3mm_contract_vendor) {
            $('.vendor-dropdown').val(contract.custrecord_f3mm_contract_vendor.value);
        }

        if ( !!contract.custrecord_f3mm_status) {
            $('.status-dropdown').val(contract.custrecord_f3mm_status.value);
        }

        $('.total-quantity-seats-text').val(contract.custrecord_f3mm_total_qty_seats);

        if (!!contract.custrecord_f3mm_department) {
            $('.department-dropdown').val(contract.custrecord_f3mm_department.value);
        }

        $('.memo-text').val(contract.custrecord_f3mm_memo);


        if (!!contract.custrecord_f3mm_customer) {
            $('.customer-dropdown')
                .attr('data-selected-id', contract.custrecord_f3mm_customer.value)
                .attr('data-selected-text', contract.custrecord_f3mm_customer.text)
                .val(contract.custrecord_f3mm_customer.text);


        }

        if (!!contract.custrecord_f3mm_primary_contact) {
            $('.primary-contact-dropdown')
                .attr('data-selected-id', contract.custrecord_f3mm_primary_contact.value)
                .attr('data-selected-text', contract.custrecord_f3mm_primary_contact.text)
                .val(contract.custrecord_f3mm_primary_contact.text);

            if (!!contract.custrecord_f3mm_primary_contact_email) {
                $('.primary-contact-email-text').val(contract.custrecord_f3mm_primary_contact_email);
            }
        }

        if ( this._viewType == 'view') {
            if (!!contract.custrecord_f3mm_start_date) {
                $('.start-date-text').val(contract.custrecord_f3mm_start_date);
            }
            if (!!contract.custrecord_f3mm_end_date) {
                $('.end-date-text').val(contract.custrecord_f3mm_end_date);
            }
        }
        else {
            if (!!contract.custrecord_f3mm_start_date) {
                $('.start-date-text').parent().datepicker('setDate', contract.custrecord_f3mm_start_date);
            }

            if (!!contract.custrecord_f3mm_end_date) {
                $('.end-date-text').parent().datepicker('setDate', contract.custrecord_f3mm_end_date);
            }
        }
    }


    bindDatePicker() {

        if (this._viewType !== 'view') {
            $('.input-group.date').not('[disabled]').datepicker({
                format: "m/d/yyyy",
                clearBtn: true,
                autoclose: true
            });
        }
    }


    /**
     * validateFilters - validate selected customer id
     */
    private validateFields() : any {

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

    submit(){
        try {

            $('#load_jqGrid').html('Submitting Changes...');
            //showLoading();

            var validated = this.validateFields();

            // if not valid then return
            if (validated === false) {
                return;
            }

            var serializedData = $('.form-horizontal :input').serializeObject();

            if(!!this._contractInfo) {
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
            $.each(items, function(index, item){
                serializedData.items.push({
                    item_id: item.itemid,
                    amount: item.amount,
                    price: item.price,
                    quantity: item.quantity,
                    item_description: item.description
                });
            });


            console.log('serializedData: ', serializedData);

            this._dataManager.submit(serializedData, (result) => {

                $('#load_jqGrid').html('Loading...');
                //hideLoading();

                console.log('submit success:', result);

                //_stateManager.clearState();

                //$('#submitChangesSuccessModal').modal('show');

                // rebind grid with cleared state
                //this.fetchGridData({page: 1});
                alert('Record has been submitted successfully');

                var uiSuiteletScriptId = 'customscript_f3mm_create_contract_ui_st';
                var uiSuiteletDeploymentId = 'customdeploy_f3mm_create_contract_ui_st';
                var uiSuiteletUrl = nlapiResolveURL('SUITELET', uiSuiteletScriptId, uiSuiteletDeploymentId, false);
                uiSuiteletUrl = uiSuiteletUrl + '&cid=' + result.data.id;

                window.location.href = uiSuiteletUrl;
            });


        } catch (e) {
            alert('Error during record submission.');
            console.error('ERROR', 'Error during main onSubmit', e.toString());
        }
    }


    fetchPriceLevels() {
        return this._dataManager
            .getPriceLevels()
            .then((priceLevels)=>{
                console.log(priceLevels);
                this._priceLevels = priceLevels.data;
            });
    }

    bindItemsGrid() {

        var contactItems = [];


        if (!!this._contractInfo && !!this._contractInfo.sublists) {
            var contractItemsInfo = this._contractInfo.sublists.recmachcustrecord_f3mm_ci_contract;
            if (!!contractItemsInfo) {
                contractItemsInfo.forEach(contractItem=> {
                    contactItems.push({
                        item: contractItem.custrecord_f3mm_ci_item.text,
                        itemid: contractItem.custrecord_f3mm_ci_item.value,
                        quantity: contractItem.custrecord_f3mm_ci_quantity,
                        price: contractItem.custrecord_f3mm_ci_price,
                        amount: contractItem.custrecord_f3mm_ci_amount,
                        description: contractItem.custrecord_f3mm_ci_item_description
                    });
                });
            }
        }


        var gridController = {
            loadData: function (filter) {
                console.log('contactItems:', contactItems);
                return contactItems;
            },
            insertItem: function (insertingClient) {
                //clients.push(insertingClient);
            },
            updateItem: function (updatingClient) {
            },
            deleteItem: function (deletingClient) {
                //var clientIndex = $.inArray(deletingClient, contactItems);
                //contactItems.splice(clientIndex, 1);
            }
        };


        // $("#jsGrid").jsGrid("refresh");

        //$("#jsGrid").jsGrid("updateItem", clients[1], { Item: "hello" }).done(function() {
        //    console.log("update completed");
        //});

        //window.db = db;
        //window.clients = contactItems;

        var inserting = true;
        var editing = true;
        var gridFields = [
            {title: "Item", name: "item", type: "text", width: 150, css: "item"},
            {
                title: "Description",
                name: "description",
                type: "textarea",
                width: 150,
                css: "description",
                editing: false
            },
            {title: "Quantity", name: "quantity", type: "number", width: 50, css: "quantity"},
            {
                title: "Price Level",
                name: "price_level",
                type: "select",
                textField: "name",
                valueField: "id",
                width: 80,
                css: "price",
                items: this._priceLevels
            },
            {title: "Price", name: "price", type: "decimal_number", width: 50, css: "price"},
            {title: "Amount", name: "amount", type: "decimal_number", width: 50, css: "amount", editing: false}
        ];


        if (this._viewType == 'view') {
            inserting = false;
            editing = false;
        }
        else {
            gridFields.push({type: "control", modeSwitchButton: false, editButton: false});
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

            controller: gridController,


            onDataLoaded: (args) => {
                console.log('onDataLoaded:', args);

                //console.log(this);
                this.loaded();
            },

            onItemUpdating: (args) => {
                console.log('onItemUpdating: ', args);

                var data = args.item;
                data.amount = data.price * data.quantity;

                // TODO : need to handle the case when user does not click on item picker and just edits and saves the record.
                var suggestion = args.row.next().data('data-selected-suggestion');
                console.log('suggestion: ', suggestion);
                if (!!suggestion) {
                    data.itemid = suggestion.id;
                    data.description = suggestion.salesdescription;
                }
            },

            onItemInserting: (args) => {
                // cancel insertion of the item with empty 'name' field

                var $row = $('.jsgrid-insert-row');
                var suggestion = $row.data('data-selected-suggestion');

                if (!!suggestion) {
                    args.item.item = suggestion.displayname;
                    args.item.itemid = suggestion.id;
                    args.item.description = suggestion.salesdescription;
                }

                if (args.item.item === "") {
                    args.cancel = true;
                    alert("Please select an item");
                }

                var existingData = $('#jsGrid').data().JSGrid.data;
                var found = false;

                existingData.forEach(item => {
                    if (item.itemid == args.item.itemid) {
                        found = true;
                    }
                });

                if (found === true) {
                    args.cancel = true;
                    alert("The selected item already exists. Please select another item.");
                }
            },

            fields: gridFields
        });


        $grid.on('focusin', '.jsgrid-edit-row input:first', (ev)=> {
            this.bindItemPicker($(ev.target));
        });

        $grid.on('focusin', '.jsgrid-insert-row input:first', (ev)=> {
            this.bindItemPicker($(ev.target));
        });


        $grid.on('blur', '.jsgrid-insert-row .quantity input, .jsgrid-insert-row .price input', (ev)=> {
            var $input = $(ev.target);
            var $tr = $input.parents('tr:first');
            var $quantity = $tr.find('.quantity input');
            var $price = $tr.find('.price input');
            var suggestion = $tr.data('data-selected-suggestion');
            if (!!suggestion) {
                var quantity = parseInt($quantity.val());
                var price = parseFloat($price.val());
                var totalPrice = price * quantity;
                $tr.find('.amount input').val(totalPrice);
            }
        });

        $grid.on('blur', '.jsgrid-edit-row .quantity input, .jsgrid-edit-row .price input', (ev)=> {
            var $input = $(ev.target);
            var $tr = $input.parents('tr:first');
            var $quantity = $tr.find('.quantity input');
            var $price = $tr.find('.price input');

            var quantity = parseInt($quantity.val());
            var price = parseFloat($price.val());
            var totalPrice = price * quantity;
            $tr.find('.amount').html(totalPrice.toString());
        });
    }



    /**
     * itemsPickerSource - fetch data from server based on provided query
     * @param query {string} the keyword which user has typed
     * @param sync {function} the callback method to invoke synchronously
     * @param async {function} the callback method to invoke asynchronously
     */
    private itemsPickerSource(query, sync, async) {

        console.log(this);

        setTimeout(() => {

            this._dataManager.getItems({query: query}, function (items) {

                try {
                    async(items.data);
                } catch (e) {
                    console.error('ERROR', 'Error during async binding.', e.toString());
                }

            });

        }, 10);

    }



    /**
     * bindItemPicker - Bind item picker control with typeahead autocomplete
     */
    private bindItemPicker($el) {
        //var $el = $(this);

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
                source: (q,s,a)=> {
                    this.itemsPickerSource(q, s, a);
                },
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'unable to find any items that match the current query',
                        '</div>'
                    ].join('\n')
                    //   , suggestion: function (context) {
                    //        var isPerson = context.isperson == 'T';
                    //        var name = isPerson ? (context.firstname + ' ' + context.lastname) : context.companyname;
                    //        return $('<div />').html(name);
                    //    }
                }

            };

            $el.typeahead(options, dataSet);
            $el.bind('typeahead:change', function () {
                console.log('typeahead:change: ', arguments);
                return;
                var $this = $(this);

                var selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr('data-selected-text');
                var val = $this.val();
                var isMatched = selectedText == val;

                console.log('selectedText: ', selectedText);
                console.log('val: ', val);
                console.log('selectedText == val: ', selectedText == val);

                // if it does not match,
                // then remove the last selected value.
                if (isMatched == false) {
                    $this.typeahead('val', selectedText);
                    alert('Selected item does not exist.');
                }

            }).bind('typeahead:select', function (ev, suggestion, extra) {


                var $this = $(this);
                var $tr = $this.parents('tr:first');


                console.log('typeahead:select: ', arguments, $this);

                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-text', suggestion.displayname);

                // only set modified class in case of item pickers inside grid
                //if ($this.is ('.item-picker') === true) {
                    var origValue = $this.attr('data-orig-value');
                    if (origValue === suggestion.displayname) {
                        $tr.removeClass('modified-item');
                    }
                    else {
                        $tr.addClass('modified-item');
                    }
                //}



                $tr.data('data-selected-suggestion', suggestion);
                var quantity = 1;
                var price = parseFloat(suggestion.baseprice);
                $tr.find('.description textarea').val(suggestion.salesdescription);
                $tr.find('.quantity input').val(quantity);
                $tr.find('.price input').val(price).focus().trigger('blur');
                $tr.find('.quantity input').focus();
            });

            $el.data('itempicker_created', true);

            $el.focus();
        }
    }


    bindPrimaryContactDropdown(){

        var _self = this;

        var $customerDropdown = $('.primary-contact-dropdown');
        var typeaheadOptions = {
            hint: false,
            minLength: 3,
            highlight: true
        };
        var customerDataset = {
            name: 'primary-contacts',
            limit: 500,
            display: function (obj) {
                var name = obj.firstname + ' ' + obj.lastname;
                return name;
            },
            source: function (query, sync, async) {

                setTimeout(()=> {
                    _self._dataManager.getPrimaryContacts({
                        query: query
                    }, function (contacts) {
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

        $customerDropdown.typeahead(typeaheadOptions, customerDataset);
        $customerDropdown.bind('typeahead:change', function (ev, val) {
            console.log('typeahead:change: ', arguments);

            var $this = $(this);

            var selectedId = $this.attr('data-selected-id');
            var selectedText = $this.attr('data-selected-text');
            var selectedEntityId = $this.attr('data-selected-entityid');
            var text = selectedText;
            var isMatched = text == val;

            console.log('text: ', text);
            console.log('val: ', val);
            console.log('text == val: ', text == val);

            // if it does not match,
            // then remove the last selected value.
            if (isMatched == false) {
                $this.attr('data-selected-id', '');
                $this.attr('data-selected-text', '');
                $this.attr('data-selected-entityid', '');

                $('.primary-contact-email-text').val('');
            }

        }).bind('typeahead:select', function (ev, suggestion) {
            console.log('typeahead:select: ', arguments);

            var name = suggestion.firstname + ' ' + suggestion.lastname;

            var $this = $(this);
            $this.attr('data-selected-id', suggestion.id);
            $this.attr('data-selected-entityid', suggestion.entityid);
            $this.attr('data-selected-text', name);

            $('.primary-contact-email-text').val(suggestion.email);
        });
    }

    bindCustomerDropdown() {

        var _self = this;

        var $customerDropdown = $('.customer-dropdown');
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
                return name;
            },
            source: function (query, sync, async) {

                setTimeout(()=> {
                    _self._dataManager.getCustomers({
                        query: query
                    }, function (customers) {
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
        $customerDropdown.bind('typeahead:change', function (ev, val) {
            console.log('typeahead:change: ', arguments);

            var $this = $(this);

            var selectedId = $this.attr('data-selected-id');
            var selectedText = $this.attr('data-selected-text');
            var selectedEntityId = $this.attr('data-selected-entityid');
            var text = selectedText;
            var isMatched = text == val;

            console.log('text: ', text);
            console.log('val: ', val);
            console.log('text == val: ', text == val);

            // if it does not match,
            // then remove the last selected value.
            if (isMatched == false) {
                $this.typeahead('val', selectedText);
                alert('Selected item does not exist.');
                //$this.attr('data-selected-id', '');
                //$this.attr('data-selected-text', '');
                //$this.attr('data-selected-entityid', '');
            }

        }).bind('typeahead:select', function (ev, suggestion) {
            console.log('typeahead:select: ', arguments);

            var name = suggestion.isperson == 'T'
                ? (suggestion.firstname + ' ' + suggestion.lastname)
                : suggestion.companyname;

            var $this = $(this);
            $this.attr('data-selected-id', suggestion.id);
            $this.attr('data-selected-entityid', suggestion.entityid);
            $this.attr('data-selected-text', name);
        });
    }


    bindDropdown(){

        // fill partners dropdown
        this._dataManager.getVendors((result) => {

            // make it async
            setTimeout(() => {
                var select = document.getElementById('vendor');
                if (result.status_code === 200) {

                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        var name = item.isperson === 'T' ? (item.firstname + ' ' + item.lastname) : item.companyname;
                        if ( !!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }



                this.loaded();
            }, 10);
        });


        this._dataManager.getEmployees((result) => {

            // make it async
            setTimeout(()=> {
                var select = document.getElementById('sales_rep');
                if (result.status_code === 200) {

                    // add each item on UI
                    $.each(result.data, function (i, item) {
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
                    $.each(result.data, function (i, item) {
                        var name = item.name.trim();
                        if ( !!name) {
                            select.options[select.options.length] = new Option(name, item.id);
                        }
                    });
                }

                this.loaded();
            }, 10);
        });

        this.bindCustomerDropdown();
        this.bindPrimaryContactDropdown();

    }

}


