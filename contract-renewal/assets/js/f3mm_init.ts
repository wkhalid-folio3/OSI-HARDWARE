/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm_ui_manager.ts" />

/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Dependencies:
 * - f3mm_ui_manager.ts
 * - underscore-min.js
 * -
 */

/**
 * Application entry point.
 */
$(() => {

    // set underscore template settings
    _.templateSettings = {
        interpolate: /\{\{=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
    };

    // HACK : store it in global variable for debugging purpose
    window.createContractUIManager = new CreateContractUIManager();

});