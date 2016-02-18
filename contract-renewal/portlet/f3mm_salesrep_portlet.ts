/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />

/**
 * Created by zshaikh on 30/12/2015.
 */

class SalesRepPortlet {
    constructor(portlet: any, column: any) {
        let suiteletScriptId = "customscript_f3mm_approve_contract_st";
        let suiteletDeploymentId = "customdeploy_f3mm_approve_contract_st";
        let suiteletUrl = nlapiResolveURL("SUITELET", suiteletScriptId, suiteletDeploymentId);

        suiteletUrl = suiteletUrl + "&ifrmcntnr=T"; // dropdown

        let html = `<iframe id="salesrepPortlet" src="${suiteletUrl}" style="width: 100%; height: 410px;" frameborder="0"></iframe>`;

        portlet.setTitle("Approve Contracts");
        portlet.setHtml(html);
    }
}


function SalesRepPortletInit(portletObj: any, column: any) {
    return new SalesRepPortlet(portletObj, column);
}
