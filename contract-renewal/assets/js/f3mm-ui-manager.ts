/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm-data-manager.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 */

$(document).ready(function () {

    var x = new CreateContractUIManager();

});



class CreateContractUIManager {

    private _dataManager: DataManager;

    constructor(){
        this._dataManager = new DataManager(window.pageType);

        this.bindDropdown();

        this.bindItemsGrid();
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
                    return obj.name;
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
                console.log('typeahead:select: ', arguments);

                var $this = $(this);
                var $tr = $this.parents('tr:first');

                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-text', suggestion.name);

                // only set modified class in case of item pickers inside grid
                if ($this.is ('.item-picker') === true) {
                    var origValue = $this.attr('data-orig-value');
                    if (origValue === suggestion.name) {
                        $tr.removeClass('modified-item');
                    }
                    else {
                        $tr.addClass('modified-item');
                    }
                }


            });

            $el.data('itempicker_created', true);

            $el.focus();
        }
    }




    bindItemsGrid() {

        var countries = [
            {Name: "", Id: 0},
            {Name: "United States", Id: 1},
            {Name: "Canada", Id: 2},
            {Name: "United Kingdom", Id: 3},
            {Name: "France", Id: 4},
            {Name: "Brazil", Id: 5},
            {Name: "China", Id: 6},
            {Name: "Russia", Id: 7}
        ];
        var clients = [
            {
                "Item": "Otto Clay",
                "Description": "Otto Clay",
                "Quantity": 2,
                "Price": 200,
                "Amount": 400,
                "Country": 6,
                "Address": "Ap #897-1459 Quam Avenue",
                "Married": false
            },
            {
                "Item": "Connor Johnston",
                "Description": "Otto Clay",
                "Quantity": 4,
                "Price": 200,
                "Amount": 800,
                "Country": 7,
                "Address": "Ap #370-4647 Dis Av.",
                "Married": false
            },
            {
                "Item": "Lacey Hess",
                "Description": "Otto Clay",
                "Quantity": 10,
                "Price": 200,
                "Amount": 2000,
                "Country": 7,
                "Address": "Ap #365-8835 Integer St.",
                "Married": false
            },
            {
                "Item": "Timothy Henson",
                "Description": "Otto Clay",
                "Quantity": 25,
                "Price": 200,
                "Amount": 5000,
                "Country": 1,
                "Address": "911-5143 Luctus Ave",
                "Married": false
            }
        ];


        var db = {

            loadData: function (filter) {
                console.log('clients:', clients);

                var found = $.grep(clients, function(client) {
                    return (!filter.Name || client.Name.indexOf(filter.Name) > -1)
                        && (!filter.Age || client.Age === filter.Age)
                        && (!filter.Address || client.Address.indexOf(filter.Address) > -1)
                        && (!filter.Country || client.Country === filter.Country)
                        && (filter.Married === undefined || client.Married === filter.Married);
                });

                console.log('found:', found);

                return found;
            },

            insertItem: function (insertingClient) {
                clients.push(insertingClient);
            },

            updateItem: function (updatingClient) {
            },

            deleteItem: function (deletingClient) {
                var clientIndex = $.inArray(deletingClient, clients);
                clients.splice(clientIndex, 1);
            }

        };


        // $("#jsGrid").jsGrid("refresh");


        //$("#jsGrid").jsGrid("updateItem", clients[1], { Item: "hello" }).done(function() {
        //    console.log("update completed");
        //});

        window.db = db;
        window.clients = clients;

        var $grid = $("#jsGrid");
        $grid.jsGrid({
            height: "400px",
            width: "100%",

            inserting: true,
            filtering: false,
            editing: true,
            sorting: false,
            paging: false,
            autoload: true,

            pageSize: 15,
            pageButtonCount: 5,

            controller: db,

            fields: [
                {name: "Item", type: "text", width: 150},
                {name: "Description", type: "textarea", width: 150},
                {name: "Quantity", type: "number", width: 50},
                {name: "Price", type: "number", width: 50},
                {name: "Amount", type: "number", width: 50},
                {type: "control", modeSwitchButton: false, editButton: false}
            ]
        });


        $grid.on('focusin', '.jsgrid-insert-row input:first', (ev)=> {
            this.bindItemPicker($(ev.target));
        });

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
                return obj.id + ' - ' + name;
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
            var text = selectedEntityId + ' ' + selectedText;
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

    bindcustomerDropdown() {

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
                return obj.id + ' - ' + name;
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
            var text = selectedEntityId + ' ' + selectedText;
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
        this._dataManager.getVendors(function (result) {

            // make it async
            setTimeout(function () {
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
            }, 10);
        });


        this._dataManager.getEmployees(function (result) {

            // make it async
            setTimeout(function () {
                var select = document.getElementById('sales_rep');
                if (result.status_code === 200) {

                    // add each item on UI
                    $.each(result.data, function (i, item) {
                        var name = (item.firstname + ' ' + item.lastname).trim();
                        if ( !!name) {
                            var displayText = item.id + ' - ' + name;
                            select.options[select.options.length] = new Option(displayText, item.id);
                        }
                    });
                }
            }, 10);
        });






        this._dataManager.getDepartment(function (result) {

            // make it async
            setTimeout(function () {
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
            }, 10);
        });



        this.bindcustomerDropdown();
        this.bindPrimaryContactDropdown();

    }

}


