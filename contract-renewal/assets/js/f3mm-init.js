/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="./f3mm-ui-manager.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * -
 *
 * Dependencies:
 * - f3mm-ui-manager.ts
 * - underscore-min.js
 * -
 */
/**
 * Application entry point.
 */
$(function () {
    // set underscore template settings
    _.templateSettings = {
        interpolate: /\{\{=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };
    // HACK : store it in global variable for debugging purpose
    window.createContractUIManager = new CreateContractUIManager();
});
//# sourceMappingURL=f3mm-init.js.map