public with sharing class RelatedListController {
    public static final String FIELDS_PARAM = 'fields';
    public static final String NUMBER_OF_RECORDS_PARAM = 'numberOfRecords';
    public static final String RECORD_ID_PARAM = 'recordId';
    public static final String SOBJECT_API_NAME_PARAM = 'sobjectApiName';
    public static final String SOBJECT_LABEL_PARAM = 'sobjectLabel';
    public static final String SOBJECT_LABEL_PLURAL_PARAM = 'sobjectLabelPlural';
    public static final String PARENT_RELATIONSHIP_API_NAME_PARAM = 'parentRelationshipApiName';
    public static final String RELATED_FIELD_API_NAME_PARAM = 'relatedFieldApiName';
    public static final String SORTED_DIRECTION_PARAM = 'sortedDirection';
    public static final String SORTED_BY_PARAM = 'sortedBy';
    public static final String RECORDS_PARAM = 'records';
    public static final String ICON_NAME_PARAM = 'iconName';
    public static final String FIELD_LABEL_PARAM = 'fieldLabel';
    public static final String FILTER_CONDITION_PARAM = 'filterCondition';
    public static final String IS_VIEW_ALL_PARAM = 'isViewAll';
    public static final String OFFSET_PARAM = 'offsetNumber';
    public static final String TOTAL_RECORD_COUNT_PARAM = 'totalCount';

    public static String dynamicSoql = '';

    @AuraEnabled
    public static String initData(String jsonData){
        system.debug(jsonData);
        Map<String, Object> requestMap = (Map<String, Object>)JSON.deserializeUntyped(jsonData);  
        String fields = (String)requestMap.get(FIELDS_PARAM);
        String sobjectApiName = (String)requestMap.get(SOBJECT_API_NAME_PARAM);
        String fieldLabel = '';//getFieldLabel(fields, sobjectApiName);
        String parentObjNameField = (String)requestMap.get('parentObjNameField');
        Map<String, Object> responseMap = new Map<String, Object>();
        responseMap.put(RECORDS_PARAM, getRecords(jsonData));
        
        
        responseMap.put(ICON_NAME_PARAM, getIconName(sobjectApiName));
        Id recordId = (Id)requestMap.get(RECORD_ID_PARAM);
        String relatedFieldApiName = (String)requestMap.get(RELATED_FIELD_API_NAME_PARAM);
        responseMap.put(PARENT_RELATIONSHIP_API_NAME_PARAM, getParentRelationshipName(recordId, sobjectApiName, relatedFieldApiName));
        String sObjName = recordId.getSObjectType().getDescribe().getName();
        String pluralLabel = recordId.getSObjectType().getDescribe().getLabelPlural();
        responseMap.put('sObjName', sObjName);
        responseMap.put('pluralLabel', pluralLabel);
        Schema.SObjectType sobjectType = Schema.getGlobalDescribe().get(sobjectApiName);
        Schema.DescribeSObjectResult sobjectDescribe = sobjectType.getDescribe();
        responseMap.put(SOBJECT_LABEL_PARAM, sobjectDescribe.getLabel());
        responseMap.put(SOBJECT_LABEL_PLURAL_PARAM, sobjectDescribe.getLabelPlural());
        responseMap.put(FIELD_LABEL_PARAM, fieldLabel);
        responseMap.put(TOTAL_RECORD_COUNT_PARAM, getTotalRecordsCount(recordId));
        responseMap.put('parentRecordName', getParentRecordName(recordId, sObjName, parentObjNameField));
        return JSON.serialize(responseMap);
    }

    public static String getParentRecordName(String recordId, String sObjName, String parentObjNameField){
        if(parentObjNameField == null || parentObjNameField == 'null'){
            return '';
        }
        String stringQuery = 'Select '+parentObjNameField+' FROM '+sObjName+' WHERE Id =: recordId LIMIT 1';
        System.debug('name query : '+stringQuery);
        SObject sobj = Database.query(stringQuery);
        System.debug('name=='+ (String)sobj.get(parentObjNameField));
        return (String)sobj.get(parentObjNameField);
    }

    /*public static String getFieldLabel(String fields, String objectApiName){
        fields = fields.trim();
        fields = fields.replaceAll('\\s+',''); 
        String fieldLabel = '';
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType objSchema = schemaMap.get(objectApiName);
        Map<String, Schema.SObjectField> fieldMap = objSchema.getDescribe().fields.getMap();
        if(fields.contains(',')){
            for(String fld : fields.split(',')){
                if(fieldLabel == ''){
                    fieldLabel = fieldMap.get(fld).getDescribe().getLabel();
                } else {
                    fieldLabel += ','+fieldMap.get(fld).getDescribe().getLabel();
                }
                
            }
        }else {
            fieldLabel = fieldMap.get(fields).getDescribe().getLabel();
        }
        return fieldLabel;
    }*/
    
	@AuraEnabled
    public static List<Sobject> getRecords(String jsonData){
		Map<String, Object> root = (Map<String, Object>)JSON.deserializeUntyped(jsonData);  
        String filterCondition = (String)root.get(FILTER_CONDITION_PARAM);
        String fields = (String)root.get(FIELDS_PARAM);
        Integer numberOfRecords;
        System.debug('number of records '+ root.get(NUMBER_OF_RECORDS_PARAM));
        try{
            numberOfRecords = (Integer)root.get(NUMBER_OF_RECORDS_PARAM);
        } catch(Exception e){
            numberOfRecords = Integer.valueOf((String)root.get(NUMBER_OF_RECORDS_PARAM));
        }
		
        String recordId = (String)root.get(RECORD_ID_PARAM);
		String relatedFieldApiName = (String)root.get(RELATED_FIELD_API_NAME_PARAM);
		String sobjectApiName = (String)root.get(SOBJECT_API_NAME_PARAM);        
		String orderBy = (String)root.get(SORTED_BY_PARAM) + ' ' + (String)root.get(SORTED_DIRECTION_PARAM);  
        String query = '';      
        if(String.isNotBlank(filterCondition) && filterCondition != null){
            query = 'Select '+fields+' From '+sobjectApiName+' WHERE ' +relatedFieldApiName+ '= :recordId'+' AND ('+filterCondition+') ORDER BY ' +orderBy+' Limit :numberOfRecords';
        } else {
            query = 'Select '+fields+' From '+sobjectApiName+' WHERE ' +relatedFieldApiName+ '= :recordId ORDER BY ' +orderBy+' Limit :numberOfRecords';
        }
        dynamicSoql = query;
        System.debug('Soql: : : '+ query);
        String escapedQuery = String.escapeSingleQuotes(query);
        System.debug('escapedQuery: : : '+ escapedQuery);
        return Database.query(query);
	}

    public static Integer getTotalRecordsCount(String recordId){
        dynamicSoql = dynamicSoql.substringBefore('Limit');
        System.debug(dynamicSoql);
        return Database.query(dynamicSoql).size();
    }

    @AuraEnabled
    public static String loadMoreData(String jsonData){
        Map<String, Object> responseMap = new Map<String, Object>();
        responseMap.put(RECORDS_PARAM, getRecordsLoadMore(jsonData));
        return JSON.serialize(responseMap);
    }

    @AuraEnabled
    public static List<Sobject> getRecordsLoadMore(String jsonData){
		Map<String, Object> root = (Map<String, Object>)JSON.deserializeUntyped(jsonData);  
        String filterCondition = (String)root.get(FILTER_CONDITION_PARAM);
        String fields = (String)root.get(FIELDS_PARAM);
		Integer numberOfRecords;
        try{
            numberOfRecords = (Integer)root.get(NUMBER_OF_RECORDS_PARAM);
        } catch(Exception e){
            numberOfRecords = Integer.valueOf((String)root.get(NUMBER_OF_RECORDS_PARAM));
        }

        String recordId = (String)root.get(RECORD_ID_PARAM);
		String relatedFieldApiName = (String)root.get(RELATED_FIELD_API_NAME_PARAM);
		String sobjectApiName = (String)root.get(SOBJECT_API_NAME_PARAM);        
		String orderBy = (String)root.get(SORTED_BY_PARAM) + ' ' + (String)root.get(SORTED_DIRECTION_PARAM);
        Integer offsetNumber = (Integer)root.get(OFFSET_PARAM);  
        String query = '';      
        if(String.isNotBlank(filterCondition) && filterCondition != null){
            query = 'Select '+fields+' From '+sobjectApiName+' WHERE ' +relatedFieldApiName+ '= :recordId'+' AND ('+filterCondition+') ORDER BY ' +orderBy+' Limit :numberOfRecords Offset :offsetNumber';
        } else {
            query = 'Select '+fields+' From '+sobjectApiName+' WHERE ' +relatedFieldApiName+ '= :recordId ORDER BY ' +orderBy+' Limit :numberOfRecords Offset :offsetNumber';
        }
        
        System.debug('Soql: Offset: : '+offsetNumber+' : '+ query);
        String escapedQuery = String.escapeSingleQuotes(query);
        return Database.query(query);
	}
        
    private static String getParentRelationshipName(Id recordId, String childSobjectApiName, String relatedFieldApiName){
        Schema.DescribeSObjectResult descrRes = recordId.getSObjectType().getDescribe();
        String name;
        for (Schema.ChildRelationship cr: descrRes.getChildRelationships()){ 
            if(cr.getChildSObject().getDescribe().getName() == childSobjectApiName
            && cr.getField().getDescribe().getName() == relatedFieldApiName){
          	 	name = cr.getRelationshipName();
                break;
            }
        }     
        return name;
    }      
    
    @AuraEnabled
    public static String getIconName(String sobjectApiName){
        String iconName;
        List<Schema.DescribeTabSetResult> tabSetDesc = Schema.DescribeTabs();
        List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
        List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

        for(Schema.DescribeTabSetResult tsr : tabSetDesc) { 
            tabDesc.addAll(tsr.getTabs()); 
        }

        for(Schema.DescribeTabResult tr : tabDesc) {
            if( sobjectApiName == tr.getSobjectName() ) {
                if( tr.isCustom() ) {
                    iconDesc.addAll(tr.getIcons());
                } else {
                    iconName = 'standard:' + sobjectApiName.toLowerCase();
                }
            }
        }
        for (Schema.DescribeIconResult ir : iconDesc) {
            if (ir.getContentType() == 'image/svg+xml'){
                iconName = 'custom:' + ir.getUrl().substringBetween('custom/','.svg').substringBefore('_');
                break;
            }
        }
        return iconName;
    }    
    
}