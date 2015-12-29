/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/underscore.d.ts" />
/// <reference path="./f3mm_create_contract_ui_manager.ts" />
/// <reference path="./f3mm_list_contracts_ui_manager.ts" />
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
$(function () {
    // set underscore template settings
    _.templateSettings = {
        evaluate: /\{\{(.+?)\}\}/g,
        interpolate: /\{\{=(.+?)\}\}/g
    };
    if (typeof CreateContractUIManager !== "undefined") {
        // HACK : store it in global variable for debugging purpose
        window.createContractUIManager = new CreateContractUIManager();
    }
    else if (typeof ListContractsUIManager !== "undefined") {
        // HACK : store it in global variable for debugging purpose
        window.listContractsUIManager = new ListContractsUIManager();
    }
});
//# sourceMappingURL=f3mm_init.js.map