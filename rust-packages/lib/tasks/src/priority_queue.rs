//! Priority queue for task execution

use crate::types::{Task, TaskPriority};
use crate::error::{Result, TaskError};
use std::collections::BinaryHeap;
use std::cmp::Ordering;
use serde::{Deserialize, Serialize};

/// Priority queue item
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PriorityQueueItem {
    task: Task,
    priority: TaskPriority,
    created_at: i64,
}

impl PartialEq for PriorityQueueItem {
    fn eq(&self, other: &Self) -> bool {
        self.task.id == other.task.id
    }
}

impl Eq for PriorityQueueItem {}

impl PartialOrd for PriorityQueueItem {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for PriorityQueueItem {
    fn cmp(&self, other: &Self) -> Ordering {
        // Higher priority first (Critical > High > Normal > Low)
        match other.priority.cmp(&self.priority) {
            Ordering::Equal => {
                // If same priority, older tasks first
                self.created_at.cmp(&other.created_at)
            }
            ordering => ordering,
        }
    }
}

/// Task priority queue
pub struct TaskPriorityQueue {
    heap: BinaryHeap<PriorityQueueItem>,
    task_ids: std::collections::HashSet<String>,
}

impl TaskPriorityQueue {
    /// Create a new priority queue
    pub fn new() -> Self {
        Self {
            heap: BinaryHeap::new(),
            task_ids: std::collections::HashSet::new(),
        }
    }

    /// Add a task to the queue
    pub fn push(&mut self, task: Task) -> Result<()> {
        if self.task_ids.contains(&task.id) {
            return Err(TaskError::Other(format!("Task {} already in queue", task.id)));
        }

        let item = PriorityQueueItem {
            priority: task.priority,
            created_at: task.created_at.timestamp(),
            task,
        };

        self.heap.push(item);
        Ok(())
    }

    /// Pop the highest priority task
    pub fn pop(&mut self) -> Option<Task> {
        if let Some(item) = self.heap.pop() {
            self.task_ids.remove(&item.task.id);
            Some(item.task)
        } else {
            None
        }
    }

    /// Peek at the highest priority task without removing it
    pub fn peek(&self) -> Option<&Task> {
        self.heap.peek().map(|item| &item.task)
    }

    /// Remove a task from the queue
    pub fn remove(&mut self, task_id: &str) -> Result<Task> {
        let mut found_index = None;
        for (i, item) in self.heap.iter().enumerate() {
            if item.task.id == task_id {
                found_index = Some(i);
                break;
            }
        }

        if let Some(index) = found_index {
            let item = self.heap.remove(index);
            self.task_ids.remove(task_id);
            Ok(item.task)
        } else {
            Err(TaskError::Other(format!("Task {} not found in queue", task_id)))
        }
    }

    /// Get the number of tasks in the queue
    pub fn len(&self) -> usize {
        self.heap.len()
    }

    /// Check if the queue is empty
    pub fn is_empty(&self) -> bool {
        self.heap.is_empty()
    }

    /// Clear all tasks from the queue
    pub fn clear(&mut self) {
        self.heap.clear();
        self.task_ids.clear();
    }

    /// Get tasks by priority
    pub fn get_by_priority(&self, priority: TaskPriority) -> Vec<Task> {
        self.heap
            .iter()
            .filter(|item| item.priority == priority)
            .map(|item| item.task.clone())
            .collect()
    }

    /// Get count of tasks by priority
    pub fn count_by_priority(&self, priority: TaskPriority) -> usize {
        self.heap
            .iter()
            .filter(|item| item.priority == priority)
            .count()
    }

    /// Update task priority
    pub fn update_priority(&mut self, task_id: &str, new_priority: TaskPriority) -> Result<()> {
        let task = self.remove(task_id)?;
        let mut updated_task = task;
        updated_task.priority = new_priority;
        self.push(updated_task)
    }

    /// Get all tasks in the queue
    pub fn all_tasks(&self) -> Vec<Task> {
        self.heap.iter().map(|item| item.task.clone()).collect()
    }

    /// Get queue statistics
    pub fn stats(&self) -> QueueStats {
        QueueStats {
            total_tasks: self.len(),
            critical: self.count_by_priority(TaskPriority::Critical),
            high: self.count_by_priority(TaskPriority::High),
            normal: self.count_by_priority(TaskPriority::Normal),
            low: self.count_by_priority(TaskPriority::Low),
        }
    }
}

impl Default for TaskPriorityQueue {
    fn default() -> Self {
        Self::new()
    }
}

/// Queue statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueStats {
    pub total_tasks: usize,
    pub critical: usize,
    pub high: usize,
    pub normal: usize,
    pub low: usize,
}

impl QueueStats {
    pub fn new() -> Self {
        Self {
            total_tasks: 0,
            critical: 0,
            high: 0,
            normal: 0,
            low: 0,
        }
    }
}

impl Default for QueueStats {
    fn default() -> Self {
        Self::new()
    }
}

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
        queue.update_priority(&task1.id, TaskPriority::Critical).unwrap();

        // Task1 should now be popped first
        let first = queue.pop().unwrap();
        assert_eq!(first.id, task1.id);
        assert_eq!(first.priority, TaskPriority::Critical);
    }

    #[test]
    fn test_priority_queue_stats() {
        let mut queue = TaskPriorityQueue::new();

        queue.push(Task::new("task1").with_priority(TaskPriority::Critical)).unwrap();
        queue.push(Task::new("task2").with_priority(TaskPriority::High)).unwrap();
        queue.push(Task::new("task3").with_priority(TaskPriority::High)).unwrap();
        queue.push(Task::new("task4").with_priority(TaskPriority::Normal)).unwrap();
        queue.push(Task::new("task5").with_priority(TaskPriority::Low)).unwrap();

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
