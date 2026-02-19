//! Priority queue for task execution

mod priority_queue_tests;

use crate::error::{Result, TaskError};
use crate::types::{Task, TaskPriority};
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::BinaryHeap;

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
            return Err(TaskError::Other(format!(
                "Task {} already in queue",
                task.id
            )));
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
            Err(TaskError::Other(format!(
                "Task {} not found in queue",
                task_id
            )))
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
