public with sharing class AccountHelper {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList() {
        return [SELECT Id, Name, ShippingCountry, BillingCountry, Rating FROM Account];
    }
}