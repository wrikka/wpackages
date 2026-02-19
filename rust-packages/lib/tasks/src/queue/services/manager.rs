//! Task queue manager

use crate::persistence::Persistence;
use crate::types::Task;
use crate::types::TaskId;
use crate::types::{PriorityQueue, QueueConfig, TaskQueue};
use crate::Result;
use std::sync::Arc;
use tokio::sync::broadcast::error::RecvError;
use tokio::sync::{broadcast, mpsc, Notify, Semaphore};

/// Manager for the task queue
pub struct QueueManager {
    task_sender: mpsc::Sender<Task>,
    task_receiver: Arc<tokio::sync::Mutex<mpsc::Receiver<Task>>>,
    notify: Arc<Notify>,
    shutdown: Arc<tokio::sync::Mutex<bool>>,
    _shutdown_sender: broadcast::Sender<()>,
}

impl QueueManager {
    pub fn new(_config: QueueConfig) -> Self {
        let (task_sender, task_receiver) = mpsc::channel(1000);
        let (shutdown_sender, _) = broadcast::channel(1);

        QueueManager {
            task_sender,
            task_receiver: Arc::new(tokio::sync::Mutex::new(task_receiver)),
            notify: Arc::new(Notify::new()),
            shutdown: Arc::new(tokio::sync::Mutex::new(false)),
            _shutdown_sender: shutdown_sender,
        }
    }

    /// Create a new queue manager with persistence
    pub fn with_persistence(_config: QueueConfig, _persistence: Arc<dyn Persistence>) -> Self {
        let (task_sender, task_receiver) = mpsc::channel(1000);
        let (shutdown_sender, _) = broadcast::channel(1);

        QueueManager {
            task_sender,
            task_receiver: Arc::new(tokio::sync::Mutex::new(task_receiver)),
            notify: Arc::new(Notify::new()),
            shutdown: Arc::new(tokio::sync::Mutex::new(false)),
            _shutdown_sender: shutdown_sender,
        }
    }

    /// Add a task to the queue
    pub async fn add_task(&self, task: Task) -> Result<()> {
        self.task_sender.send(task).await.map_err(|e| {
            crate::error::QueueError::Other(anyhow::anyhow!("Failed to send task: {}", e))
        })?;

        self.notify.notify_one();
        Ok(())
    }

    /// Get the next task from the queue
    pub async fn get_next_task(&self) -> Result<Option<Task>> {
        let mut receiver = self.task_receiver.lock().await;
        Ok(receiver.recv().await)
    }

    /// Peek at the next task
    pub async fn peek_next_task(&self) -> Option<Task> {
        let mut receiver = self.task_receiver.lock().await;
        receiver.recv().await
    }

    /// Get queue size (approximate)
    pub fn queue_size(&self) -> usize {
        self.task_sender.max_capacity() - self.task_sender.capacity()
    }

    /// Check if queue is empty (approximate)
    pub fn is_empty(&self) -> bool {
        self.task_sender.capacity() == self.task_sender.max_capacity()
    }

    /// Get a task by ID (not supported in channel-based queue)
    pub fn get_task(&self, _task_id: &TaskId) -> Option<Task> {
        None
    }

    /// Remove a task by ID (not supported in channel-based queue)
    pub fn remove_task(&self, _task_id: &TaskId) -> Result<Task> {
        Err(crate::error::QueueError::Other(anyhow::anyhow!(
            "Remove task not supported in channel-based queue"
        )))
    }

    /// Clear all tasks
    pub async fn clear(&self) -> Result<()> {
        while self.task_sender.try_reserve().is_ok() {
            if let Ok(task) = self.task_receiver.lock().await.try_recv() {
                drop(task);
            } else {
                break;
            }
        }
        Ok(())
    }

    /// Wait for a task to be available
    pub async fn wait_for_task(&self) {
        self.notify.notified().await;
    }

    /// Get the notify arc for external use
    pub fn notify(&self) -> Arc<Notify> {
        self.notify.clone()
    }

    /// Get the task sender for external use
    pub fn task_sender(&self) -> mpsc::Sender<Task> {
        self.task_sender.clone()
    }

    /// Get the task receiver for external use
    pub async fn task_receiver(&self) -> Arc<tokio::sync::Mutex<mpsc::Receiver<Task>>> {
        self.task_receiver.clone()
    }

    /// Check if shutdown is requested
    pub async fn is_shutdown(&self) -> bool {
        *self.shutdown.lock().await
    }

    /// Request graceful shutdown
    pub async fn shutdown(&self) {
        *self.shutdown.lock().await = true;
        self.notify.notify_waiters();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_queue_manager() {
        let manager = QueueManager::new(QueueConfig::default());

        let task = Task::new("test task");
        manager.add_task(task).await.unwrap();

        assert!(!manager.is_empty());

        let next = manager.get_next_task().await.unwrap();
        assert_eq!(next.unwrap().name, "test task");

        assert!(manager.is_empty());
    }

    #[tokio::test]
    async fn test_wait_for_task() {
        let manager = QueueManager::new(QueueConfig::default());
        let notify = manager.notify();

        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            let task = Task::new("async task");
            manager.add_task(task).await.unwrap();
        });

        manager.wait_for_task().await;

        assert!(!manager.is_empty());
    }
}
