public with sharing class knowledgeUnitGraphHelper {
    @AuraEnabled
    public static List<nolegyChartImageIcons__c> getImageUrls(){
        return [SELECT Id, Name, Image_Link__c FROM nolegyChartImageIcons__c];
    }

    @AuraEnabled
    public static List<Object> getDataJson(String recordID)
    {
        Account acc = [Select Name from Account where ID = :recordID];

        HTTP h = new HTTP();
        HTTPRequest req = new HTTPRequest();

        req.setEndpoint('http://flask-env.eba-3gg2pav6.us-west-2.elasticbeanstalk.com/get_json?account_name='+acc.Name);
        req.setMethod('GET');
        HTTPResponse res = h.send(req);

        List<Object> jsonBody = (List<Object>)Json.deserializeUntyped(res.getBody());

        return jsonBody;
    }
}