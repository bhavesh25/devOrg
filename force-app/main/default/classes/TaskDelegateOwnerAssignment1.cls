public class TaskDelegateOwnerAssignment1 implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext context) {
      //Date today = Date.today();
      String query = 'SELECT Id, UserId, StartDate, EndDate, User.DelegateDuringPTO__c, User.DelegateDuringPTO__r.DelegateDuringPTO__c FROM OutOfOffice WHERE StartDate <= Today And EndDate >= Today';
  
      return Database.getQueryLocator(query);
    }
  
    public void execute(Database.BatchableContext context, List<sObject> scope) {
      Map<Id, List<Task>> oooOwnerIdToListOfTasks = new Map<Id, List<Task>>();
      Map<Id, Id> userToDelegateUser = new Map<Id, Id>();
      Set<Id> delegateUserIdSet = new Set<Id>();
      Set<Id> todayOooUserIdSet = new Set<Id>();
      Set<Id> taskOwnersIdSet = new Set<Id>();
      List<Task> taskToUpdate = new List<Task>();
  
      for (OutOfOffice ooo : (List<OutOfOffice>) scope) {
          System.debug('====='+ooo);
        taskOwnersIdSet.add(ooo.userId);
  
        //map of user id to delegate user id
        if (ooo.User.DelegateDuringPTO__c != null) {
          userToDelegateUser.put(ooo.UserId, ooo.User.DelegateDuringPTO__c);
          if (ooo.User.DelegateDuringPTO__r.DelegateDuringPTO__c != null) {
            userToDelegateUser.put(
              ooo.User.DelegateDuringPTO__c,
              ooo.User.DelegateDuringPTO__r.DelegateDuringPTO__c
            );
          }
        }
  
        delegateUserIdSet.add(ooo.User.DelegateDuringPTO__c);
        delegateUserIdSet.add(ooo.User.DelegateDuringPTO__r.DelegateDuringPTO__c);
  
        todayOooUserIdSet.add(ooo.UserId);
      }
  
      //get OOO details of delegate user
      for (OutOfOffice ooo : [
        SELECT Id, UserId, StartDate, EndDate, User.DelegateDuringPTO__c
        FROM OutOfOffice
        WHERE
          UserId IN :delegateUserIdSet
          AND StartDate <= Today
          AND EndDate >= Today
      ]) {
        todayOooUserIdSet.add(ooo.UserId);
      }
      for (Task tsk : [
        SELECT
          Id,
          OwnerId,
          ActivityDate,
          Status,
          Delegate__c,
          DelegateOFDeleagte__c
        FROM Task
        WHERE OwnerId IN :taskOwnersIdSet 
        And IsClosed = false
      ]) {
        if (userToDelegateUser.containsKey(tsk.OwnerId)) {
          String delegateUserId = userToDelegateUser.get(tsk.OwnerId);
          if (tsk.Delegate__c == null && tsk.DelegateOFDeleagte__c == null) {
            //if delegate is not OOO
            if (!todayOooUserIdSet.contains(delegateUserId)) {
              tsk.Delegate__c = tsk.OwnerId;
              tsk.OwnerId = delegateUserId;
              taskToUpdate.add(tsk);
            } else if (
              //if delegate of delegate is not ooo
              userToDelegateUser.containsKey(delegateUserId) &&
              !todayOooUserIdSet.contains(userToDelegateUser.get(delegateUserId))
            ) {
              String delegatOfDelegateUserId = userToDelegateUser.get(
                delegateUserId
              );
              tsk.DelegateOFDeleagte__c = tsk.OwnerId;
              tsk.OwnerId = delegateUserId;
              taskToUpdate.add(tsk);
            }
          } else 
          //if owner is already delegated user, that user is ooo today
          if(tsk.Delegate__c != null && tsk.DelegateOFDeleagte__c == null){
              if (!todayOooUserIdSet.contains(delegateUserId)) {
                  tsk.DelegateOFDeleagte__c = tsk.Delegate__c;
                  tsk.Delegate__c = null;
                  tsk.OwnerId = delegateUserId;
                  taskToUpdate.add(tsk);
              }
          }
        }
      }
      if(taskToUpdate.size()>0){
          update taskToUpdate;
      }
    }
  
    public void finish(Database.BatchableContext context) {
      // Optionally, you can add any post-processing logic here
    }
  }
  