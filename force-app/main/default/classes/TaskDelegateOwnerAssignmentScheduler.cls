global class TaskDelegateOwnerAssignmentScheduler implements Schedulable {
    global void execute(SchedulableContext sc) {
        // Create an instance of your batch class
        TaskDelegateOwnerAssignment batchJob = new TaskDelegateOwnerAssignment();
        
        // Start the batch job
        Database.executeBatch(batchJob);
    }
}
