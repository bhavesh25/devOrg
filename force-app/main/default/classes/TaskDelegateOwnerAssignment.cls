public class TaskDelegateOwnerAssignment implements Database.Batchable<sObject> {
  public Database.QueryLocator start(Database.BatchableContext context) {
    String query = 'SELECT Id, OwnerId, ActivityDate, Status, Delegate__c, DelegateOFDeleagte__c FROM Task Where IsClosed = false';
    return Database.getQueryLocator(query);
  }

  public void execute(Database.BatchableContext context, List<sObject> scope) {
    Map<Id, Id> userToDelegateUser = new Map<Id, Id>();
    Set<Id> taskOwnersIdSet = new Set<Id>();
    List<Task> taskToUpdate = new List<Task>();
    Map<Id, OutOfOffice> userToOooMap = new Map<Id, OutOfOffice>();
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
        User.DelegateDuringPTO__r.DelegateDuringPTO__c,
        User.TimeZoneSidKey
      FROM OutOfOffice
      WHERE
        StartDate <= Today
        AND EndDate >= Today
        AND UserId IN :taskOwnersIdSet
    ]) {
      userToOooMap.put(ooo.UserId, OOO);
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
          //if task owner is  OOO,
          if (userToOooMap.containsKey(tsk.OwnerId) && validateActivityDateBetweenOwnerOutOfOfficeDates(tsk.ActivityDate, userToOooMap.get(tsk.OwnerId))) {
            //when Delegate is not set on User record
            if (!userToDelegateUser.containsKey(tsk.OwnerId)) {
                continue;
            }
            //check if delegate user is not OOO during task activity date
            if (!userToOooMap.containsKey(delegateUser) || (userToOooMap.containsKey(delegateUser) && !validateActivityDateBetweenOwnerOutOfOfficeDates(tsk.ActivityDate, userToOooMap.get(delegateUser)))) {
              tsk.Delegate__c = tsk.OwnerId;
              tsk.OwnerId = delegateUser;
              taskToUpdate.add(tsk);
              continue;
            } else if (
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
          if (!userToOooMap.containsKey(ownerId) || (userToOooMap.containsKey(ownerId) && !validateActivityDateBetweenOwnerOutOfOfficeDates(tsk.ActivityDate, userToOooMap.get(ownerId)))) {
            tsk.Delegate__c = null;
            tsk.OwnerId = ownerId;
            taskToUpdate.add(tsk);
            continue;
          }
          //when the delegated owner ( tsk.owner ) is ooo
          else if (
            userToOooMap.containsKey(tsk.OwnerId) &&
            delegatOfDelegateUserId != null && validateActivityDateBetweenOwnerOutOfOfficeDates(tsk.ActivityDate, userToOooMap.get(tsk.OwnerId))
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
          if (!userToOooMap.containsKey(ownerId) || (userToOooMap.containsKey(ownerId) && !validateActivityDateBetweenOwnerOutOfOfficeDates(tsk.ActivityDate, userToOooMap.get(ownerId)))) {
            tsk.DelegateOFDeleagte__c = null;
            tsk.OwnerId = ownerId;
            taskToUpdate.add(tsk);
            continue;
          }
          //check if original owner's delegate is back from oooo
          else if (
            userToDelegateUser.containsKey(ownerId) &&
            !userToOooMap.containsKey(userToDelegateUser.get(ownerId)) || (userToOooMap.containsKey(ownerId) && !validateActivityDateBetweenOwnerOutOfOfficeDates(tsk.ActivityDate, userToOooMap.get(userToDelegateUser.get(ownerId))))
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

  private static Boolean validateActivityDateBetweenOwnerOutOfOfficeDates(Date activityDate, OutOfOffice oooRec){
    System.debug(oooRec);
    TimeZone userTimeZone = TimeZone.getTimeZone(oooRec.User.TimeZoneSidKey);
    Date startdate = oooRec.StartDate.addSeconds(userTimeZone.getOffset(oooRec.StartDate) / 1000).Date();
    Date endDate = oooRec.EndDate.addSeconds(userTimeZone.getOffset(oooRec.EndDate) / 1000).Date();

    if(activityDate >= startdate && activityDate <= endDate){ 
        return true;
    } else {
        return false;
    }
  }

  public void finish(Database.BatchableContext context) {
  }
}
