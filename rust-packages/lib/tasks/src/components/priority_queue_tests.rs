#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_priority_queue_order() {
        let mut queue = TaskPriorityQueue::new();

        // Add tasks with different priorities
        let task1 = Task::new("low-priority").with_priority(TaskPriority::Low);
        let task2 = Task::new("critical-priority").with_priority(TaskPriority::Critical);
        let task3 = Task::new("normal-priority").with_priority(TaskPriority::Normal);
        let task4 = Task::new("high-priority").with_priority(TaskPriority::High);

        queue.push(task1).unwrap();
        queue.push(task2).unwrap();
        queue.push(task3).unwrap();
        queue.push(task4).unwrap();

        // Should pop in priority order: Critical, High, Normal, Low
        let first = queue.pop().unwrap();
        assert_eq!(first.priority, TaskPriority::Critical);

        let second = queue.pop().unwrap();
        assert_eq!(second.priority, TaskPriority::High);

        let third = queue.pop().unwrap();
        assert_eq!(third.priority, TaskPriority::Normal);

        let fourth = queue.pop().unwrap();
        assert_eq!(fourth.priority, TaskPriority::Low);
    }

    #[test]
    fn test_priority_queue_same_priority_fifo() {
        let mut queue = TaskPriorityQueue::new();

        let task1 = Task::new("task1").with_priority(TaskPriority::Normal);
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;

        let task2 = Task::new("task2").with_priority(TaskPriority::Normal);

        queue.push(task1).unwrap();
        queue.push(task2).unwrap();

        // First task should be popped first (FIFO for same priority)
        let first = queue.pop().unwrap();
        assert_eq!(first.name, "task1");

        let second = queue.pop().unwrap();
        assert_eq!(second.name, "task2");
    }

    #[test]
    fn test_priority_queue_remove() {
        let mut queue = TaskPriorityQueue::new();

        let task1 = Task::new("task1").with_priority(TaskPriority::High);
        let task2 = Task::new("task2").with_priority(TaskPriority::Low);

        queue.push(task1.clone()).unwrap();
        queue.push(task2).unwrap();

        // Remove task1
        let removed = queue.remove(&task1.id).unwrap();
        assert_eq!(removed.id, task1.id);

        // Should only have task2 left
        assert_eq!(queue.len(), 1);
        let remaining = queue.pop().unwrap();
        assert_eq!(remaining.id, task2.id);
    }

    #[test]
    fn test_priority_queue_update_priority() {
        let mut queue = TaskPriorityQueue::new();

        let task1 = Task::new("task1").with_priority(TaskPriority::Low);
        let task2 = Task::new("task2").with_priority(TaskPriority::High);

        queue.push(task1.clone()).unwrap();
        queue.push(task2).unwrap();

        // Update task1 priority to Critical
        queue
            .update_priority(&task1.id, TaskPriority::Critical)
            .unwrap();

        // Task1 should now be popped first
        let first = queue.pop().unwrap();
        assert_eq!(first.id, task1.id);
        assert_eq!(first.priority, TaskPriority::Critical);
    }

    #[test]
    fn test_priority_queue_stats() {
        let mut queue = TaskPriorityQueue::new();

        queue
            .push(Task::new("task1").with_priority(TaskPriority::Critical))
            .unwrap();
        queue
            .push(Task::new("task2").with_priority(TaskPriority::High))
            .unwrap();
        queue
            .push(Task::new("task3").with_priority(TaskPriority::High))
            .unwrap();
        queue
            .push(Task::new("task4").with_priority(TaskPriority::Normal))
            .unwrap();
        queue
            .push(Task::new("task5").with_priority(TaskPriority::Low))
            .unwrap();

        let stats = queue.stats();
        assert_eq!(stats.total_tasks, 5);
        assert_eq!(stats.critical, 1);
        assert_eq!(stats.high, 2);
        assert_eq!(stats.normal, 1);
        assert_eq!(stats.low, 1);
    }

    #[test]
    fn test_priority_queue_duplicate() {
        let mut queue = TaskPriorityQueue::new();

        let task = Task::new("task1").with_priority(TaskPriority::High);
        queue.push(task.clone()).unwrap();

        // Should fail to add duplicate
        let result = queue.push(task.clone());
        assert!(result.is_err());
    }
}
