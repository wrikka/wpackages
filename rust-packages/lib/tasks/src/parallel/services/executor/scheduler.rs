//! Task scheduler for parallel operations
//!
//! This module provides a thread-safe, async task scheduler using channels
//! for communication and notifications for efficient waiting.

use std::sync::Arc;
use tokio::sync::{mpsc, broadcast, RwLock, Notify};
use std::collections::HashMap;

/// Unique task ID
pub type TaskId = u64;

/// Task definition
pub struct Task<T, R> {
    id: TaskId,
    name: String,
    operation: T,
    _marker: std::marker::PhantomData<R>,
}

impl<T, R> Task<T, R> {
    /// Create a new task with explicit ID
    pub fn new(id: TaskId, name: impl Into<String>, operation: T) -> Self {
        Self {
            id,
            name: name.into(),
            operation,
            _marker: std::marker::PhantomData,
        }
    }

    /// Get task ID
    pub fn id(&self) -> TaskId {
        self.id
    }

    /// Get task name
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Get task operation
    pub fn operation(&self) -> &T {
        &self.operation
    }
}

/// Task scheduler for managing parallel operations
#[derive(Clone)]
pub struct TaskScheduler {
    tasks: Arc<RwLock<HashMap<TaskId, TaskInfo>>>,
    notify: Arc<Notify>,
    status_sender: broadcast::Sender<(TaskId, TaskStatus)>,
    task_sender: mpsc::Sender<ScheduledTask>,
}

/// Task information
struct TaskInfo {
    name: String,
    status: TaskStatus,
    created_at: std::time::Instant,
}

/// Task to be scheduled
struct ScheduledTask {
    id: TaskId,
    name: String,
}

/// Task status
#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed(String),
    Cancelled,
}

impl TaskScheduler {
    /// Create a new task scheduler
    pub fn new() -> Self {
        let (status_sender, _) = broadcast::channel(100);
        let (task_sender, mut task_receiver) = mpsc::channel(100);
        let tasks = Arc::new(RwLock::new(HashMap::new()));
        let notify = Arc::new(Notify::new());
        let tasks_clone = tasks.clone();
        
        // Spawn background worker to process tasks
        tokio::spawn(async move {
            while let Some(scheduled_task) = task_receiver.recv().await {
                let mut tasks = tasks_clone.write().await;
                tasks.insert(scheduled_task.id, TaskInfo {
                    name: scheduled_task.name,
                    status: TaskStatus::Pending,
                    created_at: std::time::Instant::now(),
                });
                drop(tasks);
            }
        });
        
        Self {
            tasks,
            notify,
            status_sender,
            task_sender,
        }
    }

    /// Schedule a task
    pub async fn schedule<T, R>(&self, task: Task<T, R>) -> TaskId
    where
        T: Send + Sync + 'static,
        R: Send + Sync + 'static,
    {
        let id = task.id();
        let name = task.name().to_string();
        
        // Send task to background worker via channel
        let _ = self.task_sender.send(ScheduledTask { id, name }).await;
        
        id
    }

    /// Update task status
    pub async fn update_status(&self, id: TaskId, status: TaskStatus) {
        let mut tasks = self.tasks.write().await;
        if let Some(task) = tasks.get_mut(&id) {
            task.status = status.clone();
            drop(tasks);
            
            // Notify waiters
            self.notify.notify_waiters();
            
            // Broadcast status change
            let _ = self.status_sender.send((id, status));
        }
    }

    /// Get task status
    pub async fn get_status(&self, id: TaskId) -> Option<TaskStatus> {
        let tasks = self.tasks.read().await;
        tasks.get(&id).map(|task| task.status.clone())
    }

    /// Wait for task completion
    pub async fn wait(&self, id: TaskId) -> Result<(), crate::error::ParallelError> {
        loop {
            let status = self.get_status(id).await;
            match status {
                Some(TaskStatus::Completed) => return Ok(()),
                Some(TaskStatus::Failed(reason)) => {
                    return Err(crate::error::ParallelError::TaskFailed(reason))
                }
                Some(TaskStatus::Cancelled) => {
                    return Err(crate::error::ParallelError::TaskFailed("Task cancelled".to_string()))
                }
                Some(_) => {
                    self.notify.notified().await;
                }
                None => {
                    return Err(crate::error::ParallelError::TaskNotFound(id))
                }
            }
        }
    }

    /// Get all tasks
    pub async fn get_all_tasks(&self) -> Vec<(TaskId, String, TaskStatus)> {
        let tasks = self.tasks.read().await;
        tasks.iter()
            .map(|(&id, info)| (id, info.name.clone(), info.status.clone()))
            .collect()
    }

    /// Remove completed tasks
    pub async fn cleanup_completed(&self) {
        let mut tasks = self.tasks.write().await;
        tasks.retain(|_, info| {
            !matches!(info.status, TaskStatus::Completed | TaskStatus::Failed(_) | TaskStatus::Cancelled)
        });
    }

    /// Subscribe to task status changes
    pub fn subscribe_status(&self) -> broadcast::Receiver<(TaskId, TaskStatus)> {
        self.status_sender.subscribe()
    }
}

impl Default for TaskScheduler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_task_scheduler() {
        let scheduler = TaskScheduler::new();
        
        let task = Task::new(1, "test_task", 42);
        let id = scheduler.schedule(task).await;
        
        let status = scheduler.get_status(id).await;
        assert_eq!(status, Some(TaskStatus::Pending));
        
        scheduler.update_status(id, TaskStatus::Completed).await;
        
        let status = scheduler.get_status(id).await;
        assert_eq!(status, Some(TaskStatus::Completed));
    }

    #[tokio::test]
    async fn test_wait_for_completion() {
        let scheduler = TaskScheduler::new();
        
        let task = Task::new(1, "test_task", 42);
        let id = scheduler.schedule(task).await;
        
        let scheduler_clone = scheduler.clone();
        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            scheduler_clone.update_status(id, TaskStatus::Completed).await;
        });
        
        let result = scheduler.wait(id).await;
        assert!(result.is_ok());
    }
}
