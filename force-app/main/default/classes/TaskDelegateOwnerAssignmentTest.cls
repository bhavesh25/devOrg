@isTest
public class TaskDelegateOwnerAssignmentTest {
    @TestSetup
    static void makeData(){
        Id profileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id;
        User ownerUser = new User(
            Alias = 'u1',
            Email = 'user1@example.com1',
            EmailEncodingKey = 'UTF-8',
            LastName = 'ownerUser',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = profileId,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'user1@example.com3'
        );
        User delegateUser = new User(
            Alias = 'u2',
            Email = 'user2@example.com2',
            EmailEncodingKey = 'UTF-8',
            LastName = 'delegateUser',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = profileId,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'user2@example.com2'
        );
        User delegatesDelegateUser = new User(
            Alias = 'u3',
            Email = 'user3@example.com3',
            EmailEncodingKey = 'UTF-8',
            LastName = 'delegatesDelegateUser',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = profileId,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'user3@example.com1'
        );
        
        // Insert the test users
        insert new List<User>{ownerUser, delegatesDelegateUser, delegateUser};
        ownerUser.DelegateDuringPTO__c = delegateUser.Id;
        delegateUser.DelegateDuringPTO__c = delegatesDelegateUser.Id;
        update new List<User>{ownerUser, delegateUser};
        Task testTask = new Task(
            Subject = 'Test Task 12345',
            Priority = 'Normal',
            Status = 'Not Started',
            ActivityDate = Date.today() + 1, // Set the date for tomorrow
            OwnerId = ownerUser.Id
        );
        insert testTask;
    }

    @isTest
    public static void testWhenOwnerIsNotOoo(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;
        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertEquals(ownerId, tsk.OwnerId, 'Owner should not change when owner is available');

    }

    @isTest
    public static void testWhenOwnerIsOoo(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;

        OutOfOffice ooo = new OutOfOffice(
            UserId = ownerId,
            IsEnabled = true,
            StartDate=Date.Today().addDays(-2),
            EndDate=Date.Today().addDays(+2),
            message='test');
            insert ooo;
        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertNotEquals(ownerId, tsk.OwnerId, 'Owner should not equal to original owner when owner is ooo');
        System.assertEquals(delegateUserId, tsk.OwnerId, 'Owner should change to Delegate user id');

    }

    @isTest
    public static void testWhenOwnerAndDelegateUserIsOoo(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;

        OutOfOffice ooo = new OutOfOffice(
            UserId = ownerId,
            IsEnabled = true,
            StartDate=Date.Today().addDays(-2),
            EndDate=Date.Today().addDays(+2),
            message='test');
        OutOfOffice ooo1 = new OutOfOffice(
            UserId = delegateUserId,
            IsEnabled = true,
            StartDate=Date.Today().addDays(-2),
            EndDate=Date.Today().addDays(+2),
            message='test');
        insert new List<OutOfOffice>{ooo, ooo1};
        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertNotEquals(ownerId, tsk.OwnerId, 'Owner should not equal to original owner when owner is ooo');
        System.assertEquals(delegatesDelegateUserId, tsk.OwnerId, 'Owner should change to Delegate\'s Delegate user id');
    }

    @isTest
    public static void testWhenOriginalOwnerIsBackFromOoo(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;
        
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        tsk.OwnerId = delegateUserId;
        tsk.Delegate__c = ownerId;
        update tsk;

        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();

        tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertEquals(ownerId, tsk.OwnerId, 'Owner should be assigned back when owner is back from OOO');
    }

    @isTest
    public static void testWhenOriginalOwnerIsBackFromOooAndOwnerIsDelegatesDelegateUser(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;
        
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        tsk.OwnerId = delegatesDelegateUserId;
        tsk.DelegateOFDeleagte__c = ownerId;
        update tsk;

        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();

        tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertEquals(ownerId, tsk.OwnerId, 'Owner should be assigned back when owner is back from OOO');
    }

    @isTest
    public static void testDelegateIsBackFromOooAndOwnerIsDelegatesDelegateUser(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;

        
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        tsk.OwnerId = delegatesDelegateUserId;
        tsk.DelegateOFDeleagte__c = ownerId;
        update tsk;
        OutOfOffice ooo = new OutOfOffice(
            UserId = ownerId,
            IsEnabled = true,
            StartDate=Date.Today().addDays(-2),
            EndDate=Date.Today().addDays(+2),
            message='test');
            insert ooo;
        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();
        tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertEquals(delegateUserId, tsk.OwnerId, 'Delegate should be assigned back ');
    }

    @isTest
    public static void testDelegateAndOwnerBothOOOAndOwnerIsDelegateUser(){
        Id ownerId = [Select Id From User Where LastName = 'ownerUser' Limit 1].Id;
        Id delegateUserId = [Select Id From User Where LastName = 'delegateUser' Limit 1].Id;
        Id delegatesDelegateUserId = [Select Id From User Where LastName = 'delegatesDelegateUser' Limit 1].Id;

        
        Task tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        tsk.OwnerId = delegateUserId;
        tsk.Delegate__c = ownerId;
        update tsk;
        OutOfOffice ooo = new OutOfOffice(
            UserId = ownerId,
            IsEnabled = true,
            StartDate=Date.Today().addDays(-2),
            EndDate=Date.Today().addDays(+2),
            message='test');
        OutOfOffice ooo1 = new OutOfOffice(
            UserId = delegateUserId,
            IsEnabled = true,
            StartDate=Date.Today().addDays(-2),
            EndDate=Date.Today().addDays(+2),
            message='test');
        insert new List<OutOfOffice>{ooo, ooo1};
        Test.startTest();
        Database.executeBatch(new TaskDelegateOwnerAssignment());
        Test.stopTest();
        tsk = [Select Id, OwnerId From Task Where Subject = 'Test Task 12345'];
        System.assertEquals(delegatesDelegateUserId, tsk.OwnerId, 'Delegate\' delegate should be assigned as owner');
    }

    @isTest
    static void testBatchScheduler() {
        // Schedule the batch job for immediate execution
        Test.startTest();
        TaskDelegateOwnerAssignmentScheduler scheduler = new TaskDelegateOwnerAssignmentScheduler();
        String sch = '0 0 0 * * ?'; // Schedule for daily execution at midnight
        System.schedule('TaskDelegateOwnerAssignmentScheduler', sch, scheduler);
        Test.stopTest();

        // Optionally, you can query and assert on scheduled jobs to ensure it was scheduled as expected
        CronTrigger scheduledJob = [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = 'TaskDelegateOwnerAssignmentScheduler'];
        System.assertNotEquals(null, scheduledJob);

        // Add any additional assertions as needed
    }
}