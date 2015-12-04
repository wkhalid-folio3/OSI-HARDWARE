/// <reference path="../../_typescript-refs/jquery.d.ts" />

/**
 * Created by zshaikh on 11/26/2015.
 */

/**
 * A Custom jQuery Validation function for validating typeahead components
 */
var typeaheadValidationMessage : string = 'This field is required.';

$.validator.addMethod('requiredTypeahead', (value, element, param) => {
    var isValid: boolean = false;
    var $element = $(element);

    var selectedId = $element.attr('data-selected-id');
    var selectedText = $element.attr('data-selected-text');
    var val = $element.val();

    // if value is empty then field is not valid
    if (!val) {
        isValid = false;
    }
    else {
        // if selectedText matches value then field is valid.
        isValid = selectedText == val;
    }

    return isValid;

}, typeaheadValidationMessage);