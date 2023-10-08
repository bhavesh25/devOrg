public class TaskDelegateOwnerAssignment implements Database.Batchable<sObject> {
  public Database.QueryLocator start(Database.BatchableContext context) {
    String query = 'SELECT Id, OwnerId, ActivityDate, Status, Delegate__c, DelegateOFDeleagte__c FROM Task Where IsClosed = false';
    return Database.getQueryLocator(query);
  }

  public void execute(Database.BatchableContext context, List<sObject> scope) {
    Map<Id, Id> userToDelegateUser = new Map<Id, Id>();
    Set<Id> taskOwnersIdSet = new Set<Id>();
    List<Task> taskToUpdate = new List<Task>();
    Set<Id> todayOooUserIdSet = new Set<Id>();
    Set<Id> userIdToQuery = new Set<Id>();
    //get task owner and task deleate, delegateofdelegate details
    for (Task tsk : (List<Task>) Scope) {
      taskOwnersIdSet.add(tsk.OwnerId);
      userIdToQuery.add(tsk.OwnerId);

      if (String.isNotBlank(tsk.Delegate__c)) {
        taskOwnersIdSet.add(Id.valueOf(tsk.Delegate__c));
        userIdToQuery.add(Id.valueOf(tsk.Delegate__c));
      }
      if (String.isNotBlank(tsk.DelegateOFDeleagte__c)) {
        taskOwnersIdSet.add(Id.valueOf(tsk.DelegateOFDeleagte__c));
        userIdToQuery.add(Id.valueOf(tsk.DelegateOFDeleagte__c));
      }
    }
    //get user, user's delegate and user's delegate's delegate user
    for (User usr : [
      SELECT Id, DelegateDuringPTO__c, DelegateDuringPTO__r.DelegateDuringPTO__c
      FROM User
      WHERE Id IN :userIdToQuery
    ]) {
      if (usr.DelegateDuringPTO__c != null) {
        taskOwnersIdSet.add(usr.DelegateDuringPTO__c);
        userToDelegateUser.put(usr.Id, usr.DelegateDuringPTO__c);
      }
      if (usr.DelegateDuringPTO__r?.DelegateDuringPTO__c != null) {
        taskOwnersIdSet.add(usr.DelegateDuringPTO__r.DelegateDuringPTO__c);
        userToDelegateUser.put(
          usr.DelegateDuringPTO__c,
          usr.DelegateDuringPTO__r.DelegateDuringPTO__c
        );
      }
    }
    //get set of all users who are ooo
    for (OutOfOffice ooo : [
      SELECT
        Id,
        UserId,
        StartDate,
        EndDate,
        User.DelegateDuringPTO__c,
        User.DelegateDuringPTO__r.DelegateDuringPTO__c
      FROM OutOfOffice
      WHERE
        StartDate <= Today
        AND EndDate >= Today
        AND UserId IN :taskOwnersIdSet
    ]) {
      todayOooUserIdSet.add(ooo.UserId);
    }

    for (Task tsk : (List<Task>) Scope) {
        //user case 1- when task is not delegated yet, and checking if owner is not OOO, if owner is ooo then assign the task to deleagted user
        if (
          String.isBlank(tsk.Delegate__c) &&
          String.isBlank(tsk.DelegateOFDeleagte__c)
        ) {
            Id delegateUser = userToDelegateUser.get(tsk.OwnerId);
            Id delegatOfDelegateUserId;
            if (userToDelegateUser.containsKey(delegateUser)) {
                delegatOfDelegateUserId = userToDelegateUser.get(delegateUser);
            }
          //if task owner is not OOO, then continue
          if (!todayOooUserIdSet.contains(tsk.OwnerId)) {
            continue;
          } else {
            if (!userToDelegateUser.containsKey(tsk.OwnerId)) {
                continue;
            }
            if (!todayOooUserIdSet.contains(delegateUser)) {
              tsk.Delegate__c = tsk.OwnerId;
              tsk.OwnerId = delegateUser;
              taskToUpdate.add(tsk);
              continue;
            } else if (
              //if delegate of delegate is not ooo
              delegatOfDelegateUserId != null 
            ) {
              tsk.DelegateOFDeleagte__c = tsk.OwnerId;
              tsk.OwnerId = delegatOfDelegateUserId;
              taskToUpdate.add(tsk);
              continue;
            }
          }
        }
        //use case 2- when task is delegated
        else if (
          String.isNotBlank(tsk.Delegate__c) &&
          String.isBlank(tsk.DelegateOFDeleagte__c)
        ) {
            Id ownerId = Id.valueOf(tsk.Delegate__c);
            Id delegateUser = userToDelegateUser.get(ownerId);
            Id delegatOfDelegateUserId;
            if (userToDelegateUser.containsKey(delegateUser)) {
                delegatOfDelegateUserId = userToDelegateUser.get(delegateUser);
            }

          //first check if original owner is back from ooo
          if (!todayOooUserIdSet.contains(ownerId)) {
            tsk.Delegate__c = null;
            tsk.OwnerId = ownerId;
            taskToUpdate.add(tsk);
            continue;
          }
          //when the delegated owner ( tsk.owner ) is ooo
          else if (
            todayOooUserIdSet.contains(tsk.OwnerId) &&
            delegatOfDelegateUserId != null
          ) {
            tsk.DelegateOFDeleagte__c = tsk.Delegate__c;
            tsk.Delegate__c = null;
            tsk.OwnerId = delegatOfDelegateUserId;
            taskToUpdate.add(tsk);
            continue;
          }
        }
        //use case 3- when task is delegated to owner's delegated's delegated user
        else if (
          String.isBlank(tsk.Delegate__c) &&
          String.isNotBlank(tsk.DelegateOFDeleagte__c)
        ) {
          Id ownerId = Id.valueOf(tsk.DelegateOFDeleagte__c);
          Id delegateUser = userToDelegateUser.get(ownerId);
            Id delegatOfDelegateUserId;
            if (userToDelegateUser.containsKey(delegateUser)) {
                delegatOfDelegateUserId = userToDelegateUser.get(delegateUser);
            }
            //first check if original owner is back from ooo
          if (!todayOooUserIdSet.contains(ownerId)) {
            tsk.DelegateOFDeleagte__c = null;
            tsk.OwnerId = ownerId;
            taskToUpdate.add(tsk);
            continue;
          }
          //check if original owner's delegate is back from oooo
          else if (
            userToDelegateUser.containsKey(ownerId) &&
            !todayOooUserIdSet.contains(userToDelegateUser.get(ownerId))
          ) {
            tsk.DelegateOFDeleagte__c = null;
            tsk.Delegate__c = ownerId;
            tsk.OwnerId = userToDelegateUser.get(ownerId);
            taskToUpdate.add(tsk);
            continue;
          }
        }
      
    }

    if (taskToUpdate.size() > 0) {
      update taskToUpdate;
    }
  }

  public void finish(Database.BatchableContext context) {
    // Optionally, you can add any post-processing logic here
  }
}
