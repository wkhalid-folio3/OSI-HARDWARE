/**
 * Created by zshaikh on 30/12/2015.
 */
var CustomerPortlet = (function () {
    function CustomerPortlet(portlet, column) {
        var suiteletScriptId = "customscript_f3mm_approve_contract_st";
        var suiteletDeploymentId = "customdeploy_f3mm_approve_contract_st";
        var suiteletUrl = nlapiResolveURL("SUITELET", suiteletScriptId, suiteletDeploymentId);
        suiteletUrl = suiteletUrl + "&ifrmcntnr=T&customer=T"; // dropdown
        var html = "<iframe id=\"customerPortlet\" src=\"" + suiteletUrl + "\" style=\"width: 100%; height: 410px;\" frameborder=\"0\"></iframe>";
        portlet.setTitle("Approve Contracts");
        portlet.setHtml(html);
    }
    return CustomerPortlet;
}());
function CustomerPortletInit(portletObj, column) {
    return new CustomerPortlet(portletObj, column);
}
//# sourceMappingURL=f3mm_customer_portlet.js.map