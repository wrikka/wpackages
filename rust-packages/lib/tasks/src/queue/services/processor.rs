//! Task processor

use crate::manager::QueueManager;
use crate::retry::RetryManager;
use crate::types::Task;
use crate::types::TaskResult;
use crate::utils::measure_async_duration;
use crate::Result;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Semaphore;
use tokio::task::JoinSet;
use tokio::time::timeout;

/// Worker pool for parallel task processing
pub struct WorkerPool<F, Fut>
where
    F: Fn(&Task) -> Fut + Clone + Send + 'static + std::marker::Sync,
    Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
{
    manager: Arc<QueueManager>,
    handler: Arc<F>,
    max_workers: usize,
    timeout_seconds: u64,
    shutdown: Arc<tokio::sync::Mutex<bool>>,
}

impl<F, Fut> WorkerPool<F, Fut>
where
    F: Fn(&Task) -> Fut + Clone + Send + 'static + std::marker::Sync,
    Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
{
    /// Create a new worker pool
    pub fn new(
        manager: Arc<QueueManager>,
        handler: F,
        max_workers: usize,
        timeout_seconds: u64,
    ) -> Self {
        Self {
            manager,
            handler: Arc::new(handler),
            max_workers,
            timeout_seconds,
            shutdown: Arc::new(tokio::sync::Mutex::new(false)),
        }
    }

    /// Start processing tasks with the worker pool
    pub async fn run(&self) -> Result<()> {
        let semaphore = Arc::new(Semaphore::new(self.max_workers));
        let mut join_set = JoinSet::new();

        loop {
            // Check for shutdown
            if *self.shutdown.lock().await {
                break;
            }

            // Wait for a task to be available
            if self.manager.is_empty() {
                self.manager.wait_for_task().await;
                continue;
            }

            // Try to get a task
            if let Some(task) = self.manager.get_next_task().await? {
                let permit = semaphore.clone().acquire_owned().await.map_err(|e| {
                    crate::error::QueueError::Other(anyhow::anyhow!(
                        "Failed to acquire permit: {}",
                        e
                    ))
                })?;

                let handler = self.handler.clone();
                let timeout_seconds = self.timeout_seconds;
                let shutdown = self.shutdown.clone();

                join_set.spawn(async move {
                    let _permit = permit;

                    if *shutdown.lock().await {
                        return None;
                    }

                    let mut task = task;
                    let task_id = task.id.clone();

                    let result = timeout(
                        Duration::from_secs(timeout_seconds),
                        Self::process_single_task(&mut task, &handler),
                    )
                    .await;

                    match result {
                        Ok(Ok(task_result)) => Some(task_result),
                        Ok(Err(e)) => Some(TaskResult::failure(task_id, e.to_string(), 0)),
                        Err(_) => {
                            task.fail(format!("Task timed out after {}s", timeout_seconds));
                            Some(TaskResult::failure(
                                task_id,
                                format!("Task timed out after {}s", timeout_seconds),
                                0,
                            ))
                        }
                    }
                });
            }

            // Cleanup completed tasks
            while let Some(result) = join_set.join_next().await {
                if let Ok(Some(task_result)) = result {
                    if !task_result.success {
                        eprintln!(
                            "Task {} failed: {:?}",
                            task_result.task_id.to_string(),
                            task_result.error
                        );
                    }
                }
            }
        }

        // Wait for remaining tasks to complete
        while let Some(_) = join_set.join_next().await {}

        Ok(())
    }

    /// Process a single task
    async fn process_single_task(task: &mut Task, handler: &F) -> Result<TaskResult> {
        let task_id = task.id.clone();
        task.start();

        let (result, duration) = measure_async_duration(|| handler(task)).await;

        match result {
            Ok(output) => {
                task.complete();
                Ok(TaskResult::success(
                    task_id,
                    output,
                    duration.as_millis() as u64,
                ))
            }
            Err(e) => {
                task.fail(e.to_string());
                Ok(TaskResult::failure(
                    task_id,
                    e.to_string(),
                    duration.as_millis() as u64,
                ))
            }
        }
    }

    /// Request graceful shutdown
    pub async fn shutdown(&self) {
        *self.shutdown.lock().await = true;
    }
}

/// Process a single task
pub async fn process_task<F, Fut>(task: &mut Task, handler: F) -> Result<TaskResult>
where
    F: FnOnce(&Task) -> Fut,
    Fut: std::future::Future<Output = Result<serde_json::Value>>,
{
    let task_id = task.id.clone();
    task.start();

    let (result, duration) = measure_async_duration(|| handler(task)).await;

    match result {
        Ok(output) => {
            task.complete();
            Ok(TaskResult::success(
                task_id,
                output,
                duration.as_millis() as u64,
            ))
        }
        Err(e) => {
            task.fail(e.to_string());
            Ok(TaskResult::failure(
                task_id,
                e.to_string(),
                duration.as_millis() as u64,
            ))
        }
    }
}

/// Process the next task from the queue
pub async fn process_next<F, Fut>(
    manager: &QueueManager,
    timeout_seconds: u64,
    handler: F,
) -> Result<Option<TaskResult>>
where
    F: Fn(&Task) -> Fut + Clone,
    Fut: std::future::Future<Output = Result<serde_json::Value>>,
{
    if manager.is_empty() {
        return Ok(None);
    }

    let mut task = manager.get_next_task().await?.unwrap();
    let task_id = task.id.clone();

    let result = timeout(
        Duration::from_secs(timeout_seconds),
        process_task(&mut task, handler),
    )
    .await;

    match result {
        Ok(Ok(task_result)) => Ok(Some(task_result)),
        Ok(Err(e)) => Ok(Some(TaskResult::failure(task_id, e.to_string(), 0))),
        Err(_) => {
            task.fail(format!("Task timed out after {}s", timeout_seconds));
            Ok(Some(TaskResult::failure(
                task_id,
                format!("Task timed out after {}s", timeout_seconds),
                0,
            )))
        }
    }
}

/// Continuously process tasks from the queue
pub async fn process_queue<F, Fut>(
    manager: QueueManager,
    timeout_seconds: u64,
    handler: F,
) -> Result<()>
where
    F: Fn(&Task) -> Fut + Clone + Send + 'static + std::marker::Sync,
    Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
{
    loop {
        if manager.is_empty() {
            manager.wait_for_task().await;
            continue;
        }

        if let Some(result) = process_next(&manager, timeout_seconds, handler.clone()).await? {
            if !result.success {
                eprintln!("Task {} failed: {:?}", result.task_id, result.error);
            }
        }
    }
}

/// Process the next task from the queue with retry support
pub async fn process_next_with_retry<F, Fut>(
    manager: &QueueManager,
    retry_manager: &RetryManager,
    timeout_seconds: u64,
    handler: F,
) -> Result<Option<TaskResult>>
where
    F: Fn(&Task) -> Fut + Clone,
    Fut: std::future::Future<Output = Result<serde_json::Value>>,
{
    if manager.is_empty() {
        return Ok(None);
    }

    let mut task = manager.get_next_task().await?.unwrap();
    let task_id = task.id.clone();
    let current_attempt = task.retry_count.unwrap_or(0);

    let result = timeout(
        Duration::from_secs(timeout_seconds),
        process_task(&mut task, handler),
    )
    .await;

    match result {
        Ok(Ok(task_result)) => Ok(Some(task_result)),
        Ok(Err(e)) => {
            if retry_manager
                .should_retry(&task_id, current_attempt)
                .await?
            {
                let next_retry_at = retry_manager
                    .schedule_retry(&task_id, current_attempt + 1)
                    .await?;
                tracing::warn!(
                    task_id = %task_id,
                    attempt = current_attempt + 1,
                    next_retry_at = %next_retry_at,
                    error = %e,
                    "Task failed, scheduled for retry"
                );
                Ok(None)
            } else {
                Ok(Some(TaskResult::failure(task_id, e.to_string(), 0)))
            }
        }
        Err(_) => {
            task.fail(format!("Task timed out after {}s", timeout_seconds));
            if retry_manager
                .should_retry(&task_id, current_attempt)
                .await?
            {
                let next_retry_at = retry_manager
                    .schedule_retry(&task_id, current_attempt + 1)
                    .await?;
                tracing::warn!(
                    task_id = %task_id,
                    attempt = current_attempt + 1,
                    next_retry_at = %next_retry_at,
                    "Task timed out, scheduled for retry"
                );
                Ok(None)
            } else {
                Ok(Some(TaskResult::failure(
                    task_id,
                    format!("Task timed out after {}s", timeout_seconds),
                    0,
                )))
            }
        }
    }
}

/// Continuously process tasks from the queue with retry support
pub async fn process_queue_with_retry<F, Fut>(
    manager: QueueManager,
    retry_manager: Arc<RetryManager>,
    timeout_seconds: u64,
    handler: F,
) -> Result<()>
where
    F: Fn(&Task) -> Fut + Clone + Send + 'static + std::marker::Sync,
    Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
{
    loop {
        if manager.is_empty() {
            manager.wait_for_task().await;
            continue;
        }

        if let Some(result) =
            process_next_with_retry(&manager, &retry_manager, timeout_seconds, handler.clone())
                .await?
        {
            if !result.success {
                eprintln!("Task {} failed: {:?}", result.task_id, result.error);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_process_task() {
        let mut task = Task::new("test task");

        let result = process_task(&mut task, |_| async {
            Ok(serde_json::json!({ "output": "success" }))
        })
        .await
        .unwrap();

        assert!(result.success);
        assert_eq!(task.status, crate::types::TaskStatus::Completed);
    }

    #[tokio::test]
    async fn test_process_task_failure() {
        let mut task = Task::new("failing task");

        let result = process_task(&mut task, |_| async {
            Err(crate::error::QueueError::Other(anyhow::anyhow!(
                "test error"
            )))
        })
        .await
        .unwrap();

        assert!(!result.success);
        assert_eq!(task.status, crate::types::TaskStatus::Failed);
    }

    #[tokio::test]
    async fn test_process_next() {
        let manager = QueueManager::new(crate::types::QueueConfig::default());
        manager.add_task(Task::new("test task")).await.unwrap();

        let result = process_next(&manager, 5, |_| async {
            Ok(serde_json::json!({ "output": "success" }))
        })
        .await
        .unwrap();

        assert!(result.is_some());
        assert!(result.unwrap().success);
    }

    #[tokio::test]
    async fn test_process_next_empty_queue() {
        let manager = QueueManager::new(crate::types::QueueConfig::default());

        let result = process_next(&manager, 5, |_| async {
            Ok(serde_json::json!({ "output": "success" }))
        })
        .await
        .unwrap();

        assert!(result.is_none());
    }
}
