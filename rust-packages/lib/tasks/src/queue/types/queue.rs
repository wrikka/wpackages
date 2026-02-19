//! Queue types and errors

use crate::types::Task;
use crate::types::TaskId;
use crate::{QueueError, Result};
use serde::{Deserialize, Serialize};

/// Configuration for the task queue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueConfig {
    pub max_size: usize,
    pub timeout_seconds: u64,
}

impl Default for QueueConfig {
    fn default() -> Self {
        QueueConfig {
            max_size: 1000,
            timeout_seconds: 300,
        }
    }
}

/// A task queue that manages pending tasks
pub trait TaskQueue: Send + Sync {
    /// Add a task to the queue
    fn enqueue(&mut self, task: Task) -> Result<()>;

    /// Remove and return the next task
    fn dequeue(&mut self) -> Result<Task>;

    /// Peek at the next task without removing it
    fn peek(&self) -> Option<&Task>;

    /// Get the number of tasks in the queue
    fn len(&self) -> usize;

    /// Check if the queue is empty
    fn is_empty(&self) -> bool;

    /// Get a task by ID
    fn get_task(&self, task_id: &TaskId) -> Option<&Task>;

    /// Remove a task by ID
    fn remove_task(&mut self, task_id: &TaskId) -> Result<Task>;

    /// Clear all tasks
    fn clear(&mut self);
}

/// Priority-based task queue implementation
pub struct PriorityQueue {
    tasks: Vec<Task>,
    config: QueueConfig,
}

impl PriorityQueue {
    pub fn new(config: QueueConfig) -> Self {
        PriorityQueue {
            tasks: Vec::with_capacity(config.max_size),
            config,
        }
    }
}

impl TaskQueue for PriorityQueue {
    fn enqueue(&mut self, task: Task) -> Result<()> {
        if self.tasks.len() >= self.config.max_size {
            return Err(QueueError::QueueFull {
                max_size: self.config.max_size,
            });
        }

        self.tasks.push(task);
        self.tasks.sort_by(|a, b| {
            b.priority
                .cmp(&a.priority)
                .then_with(|| a.created_at.cmp(&b.created_at))
        });

        Ok(())
    }

    fn dequeue(&mut self) -> Result<Task> {
        self.tasks.pop().ok_or(QueueError::QueueEmpty)
    }

    fn peek(&self) -> Option<&Task> {
        self.tasks.last()
    }

    fn len(&self) -> usize {
        self.tasks.len()
    }

    fn is_empty(&self) -> bool {
        self.tasks.is_empty()
    }

    fn get_task(&self, task_id: &TaskId) -> Option<&Task> {
        self.tasks.iter().find(|t| &t.id == task_id)
    }

    fn remove_task(&mut self, task_id: &TaskId) -> Result<Task> {
        let pos =
            self.tasks
                .iter()
                .position(|t| &t.id == task_id)
                .ok_or(QueueError::TaskNotFound {
                    task_id: task_id.clone(),
                })?;

        Ok(self.tasks.remove(pos))
    }

    fn clear(&mut self) {
        self.tasks.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use task_types::{Task, TaskPriority};

    #[test]
    fn test_queue_config_default() {
        let config = QueueConfig::default();
        assert_eq!(config.max_size, 1000);
        assert_eq!(config.timeout_seconds, 300);
    }

    #[test]
    fn test_priority_queue_enqueue_dequeue() {
        let mut queue = PriorityQueue::new(QueueConfig::default());

        let task1 = Task::new("low priority").with_priority(TaskPriority::Low);
        let task2 = Task::new("high priority").with_priority(TaskPriority::High);
        let task3 = Task::new("normal priority").with_priority(TaskPriority::Normal);

        queue.enqueue(task1).unwrap();
        queue.enqueue(task2).unwrap();
        queue.enqueue(task3).unwrap();

        assert_eq!(queue.len(), 3);
        assert!(!queue.is_empty());

        let first = queue.dequeue().unwrap();
        assert_eq!(first.priority, TaskPriority::High);

        let second = queue.dequeue().unwrap();
        assert_eq!(second.priority, TaskPriority::Normal);

        let third = queue.dequeue().unwrap();
        assert_eq!(third.priority, TaskPriority::Low);
    }

    #[test]
    fn test_queue_full() {
        let config = QueueConfig {
            max_size: 2,
            timeout_seconds: 300,
        };
        let mut queue = PriorityQueue::new(config);

        queue.enqueue(Task::new("task1")).unwrap();
        queue.enqueue(Task::new("task2")).unwrap();

        let result = queue.enqueue(Task::new("task3"));
        assert!(result.is_err());
    }

    #[test]
    fn test_queue_empty() {
        let mut queue = PriorityQueue::new(QueueConfig::default());

        let result = queue.dequeue();
        assert!(matches!(result, Err(QueueError::QueueEmpty)));
    }

    #[test]
    fn test_get_remove_task() {
        let mut queue = PriorityQueue::new(QueueConfig::default());

        let task = Task::new("test task");
        let task_id = task.id.clone();
        queue.enqueue(task).unwrap();

        let found = queue.get_task(&task_id);
        assert!(found.is_some());

        let removed = queue.remove_task(&task_id).unwrap();
        assert_eq!(removed.id, task_id);

        let not_found = queue.get_task(&task_id);
        assert!(not_found.is_none());
    }
}
