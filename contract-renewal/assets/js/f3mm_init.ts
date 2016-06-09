/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/common.d.ts" />
/// <reference path="../../_typescript-refs/underscore.d.ts" />
/// <reference path="./f3mm_create_contract_ui_manager.ts" />
/// <reference path="./f3mm_list_contracts_ui_manager.ts" />
/// <reference path="./f3mm_approve_contracts_ui_manager.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Dependencies:
 * - f3mm_create_contract_ui_manager.ts
 * - underscore-min.js
 * -
 */
/**
 * Application entry point.
 */
$(() => {

    // set underscore template settings
    _.templateSettings = {
        evaluate: /\{\{(.+?)\}\}/g,
        interpolate: /\{\{=(.+?)\}\}/g
    };

    if (typeof CreateContractUIManager !== "undefined") {
        // HACK : store it in global variable for debugging purpose
        window.createContractUIManager = new CreateContractUIManager();

    } else if (typeof ApproveContractsUIManager !== "undefined") {

        // HACK : store it in global variable for debugging purpose
        window.approveContractsUIManager = new ApproveContractsUIManager();

    } else if (typeof ListContractsUIManager !== "undefined") {
        // HACK : store it in global variable for debugging purpose
        window.listContractsUIManager = new ListContractsUIManager();
    }

    var alertMsg = decodeURIComponent(window.location.href.match(/alert-msg=([^&]*)/)[1]);
    var alertClass = decodeURIComponent(window.location.href.match(/alert-class=([^&]*)/)[1]);
    window.location.hash="";
    if (alertMsg) {
        jQuery("#success").html('<div id="success2" class="alert '+ alertClass+'"><a href="#" onclick="jQuery(this).parent().slideUp(500)" class="close" aria-label="close">&times;</a><strong>'+ alertMsg+'</strong></div><br>');

    }

});
