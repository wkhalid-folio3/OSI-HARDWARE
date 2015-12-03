/// <reference path="../../_typescript-refs/jquery.d.ts" />
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
(function ($) {
    $.fn.serializeObject = function () {
        "use strict";
        var result = {};
        var extend = function (i, element) {
            // CUSTOM HANDLING: added data-key handling to preserve names
            var name = element.name;
            var node = result[name];
            // If node with same name exists already, need to convert it to an array as it
            // is a multi-value field (i.e., checkboxes)
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                }
                else {
                    result[name] = [node, element.value];
                }
            }
            else {
                result[name] = element.value;
            }
        };
        $.each(this.serializeArray(), extend);
        return result;
    };
})(jQuery);
//# sourceMappingURL=f3mm-jquery-plugins.js.map