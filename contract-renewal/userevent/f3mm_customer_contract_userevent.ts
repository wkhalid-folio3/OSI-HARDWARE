/**
 * Created by snawaz on 5/17/2016.
 */
/**
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
let CustomerContract = (() => {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        beforeLoad: function (type, form, request) {
            var currentContext = nlapiGetContext();
            if(currentContext.getExecutionContext() == 'userinterface') {
                var field1 = form.addField("custpage_customfilesscript","inlinehtml");
                var script = "<script type='text/javascript' language='javascript' src='https://system.na1.netsuite.com/c.3322018/suitebundle101070/ContractRenewal/assets/js/libs/arrive.min.js'></script>";
                script += "<script type='text/javascript' language='javascript'>";
                script += "document.arrive('table#recmachcustrecord_f3mm_customer__tab thead tr td:nth-child(1) div.listheader', function() {";
                script += "var edit = document.querySelectorAll('table#recmachcustrecord_f3mm_customer__tab thead tr td:nth-child(1) div.listheader')[0];";
                script += "edit.innerText = 'Edit | View';";
                script += "var tag = document.querySelectorAll('table#recmachcustrecord_f3mm_customer__tab tbody tr td:nth-child(1)');";
                script += "var viewTag;";
                script += "for(var i=0; i<tag.length; i++){";
                script += "tag[i].appendChild((document.createTextNode(' | ')));";
                script += "tag[i].appendChild((document.createElement('a')));";
                script += "viewTag = tag[i].getElementsByTagName('a');";
                script += "viewTag[1].innerHTML = 'view';";
                script += "viewTag[1].className = 'dottedlink';";
                script += "viewTag[1].target = '_self';";
                script += "viewTag[1].href = viewTag[0].href.replace('&e=T','');";
                script += "}";
                script += "});";
                script += "</script>";
                field1.setDefaultValue(script);
            }
        },
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit
         *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF)
         *                      markcomplete (Call, Task)
         *                      reassign (Case)
         *                      editforecast (Opp, Estimate)
         * @returns {Void}
         */
        beforeSubmit: function (type) {
            // TODO: Write Your code here
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit,
         *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF only)
         *                      dropship, specialorder, orderitems (PO only)
         *                      paybills (vendor payments)
         * @returns {Void}
         */
        afterSubmit: function (type) {
            // TODO: Write Your code here
        }
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function CustomerContractBeforeLoad(type, form, request) {
    return CustomerContract.beforeLoad(type.toString(), form, request);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function CustomerContractBeforeSubmit(type) {
    return CustomerContract.beforeSubmit(type.toString());
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function CustomerContractAfterSubmit(type) {
    return CustomerContract.afterSubmit(type.toString());
}
