/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm-ui-manager.ts" />

/**
 * Created by zshaikh on 12/3/2015.
 */


$(function () {

    // set underscore template settings
    _.templateSettings = {
        interpolate: /\{\{=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
    };

    // store it in global variable for debugging purpose
    window.createContractUIManager = new CreateContractUIManager();

});