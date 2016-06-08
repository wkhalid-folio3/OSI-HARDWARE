/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/**
 * Created by zshaikh on 30/12/2015.
 */
var SalesRepPortlet = (function () {
    function SalesRepPortlet(portlet, column) {
        var suiteletScriptId = "customscript_f3mm_approve_contract_st";
        var suiteletDeploymentId = "customdeploy_f3mm_approve_contract_st";
        var suiteletUrl = nlapiResolveURL("SUITELET", suiteletScriptId, suiteletDeploymentId);
        suiteletUrl = suiteletUrl + "&ifrmcntnr=T"; // dropdown
        var html = "<iframe id=\"salesrepPortlet\" src=\"" + suiteletUrl + "\" style=\"width: 100%; height: 410px;\" frameborder=\"0\"></iframe>";
        portlet.setTitle("Approve Contracts");
        portlet.setHtml(html);
    }
    return SalesRepPortlet;
}());
function SalesRepPortletInit(portletObj, column) {
    return new SalesRepPortlet(portletObj, column);
}
//# sourceMappingURL=f3mm_salesrep_portlet.js.map