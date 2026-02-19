//! Task executor with retry logic

use crate::error::{Result, TaskError};
use crate::priority_queue::TaskPriorityQueue;
use crate::rate_limit::RateLimiter;
use crate::retry::RetryPolicy;
use crate::types::{Task, TaskResult, TaskStatus};
use chrono::Utc;
use std::time::Duration;
use tokio::time::sleep;

pub type TaskHandler = Box<dyn Fn() -> Result<serde_json::Value> + Send + Sync>;
pub type AsyncTaskHandler = Box<
    dyn Fn()
            -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<serde_json::Value>> + Send>>
        + Send
        + Sync,
>;

pub struct TaskExecutor {
    retry_policy: RetryPolicy,
    rate_limiter: RateLimiter,
    priority_queue: TaskPriorityQueue,
}

impl TaskExecutor {
    pub fn new(retry_policy: RetryPolicy) -> Self {
        Self {
            retry_policy,
            rate_limiter: RateLimiter::with_defaults(),
            priority_queue: TaskPriorityQueue::new(),
        }
    }

    pub fn with_default_retry() -> Self {
        Self::new(RetryPolicy::default())
    }

    /// Register a rate limit bucket for a specific key
    pub async fn register_rate_limit(&self, key: String, capacity: u32, refill_rate: u32) {
        self.rate_limiter.register(key, capacity, refill_rate).await;
    }

    /// Check if a task execution is allowed based on rate limiting
    pub async fn try_acquire(&self, key: &str, tokens: u32) -> bool {
        self.rate_limiter.try_acquire(key, tokens).await
    }

    /// Get available tokens for a key
    pub async fn available_tokens(&self, key: &str) -> u32 {
        self.rate_limiter.available_tokens(key).await
    }

    /// Add a task to the priority queue
    pub fn enqueue(&self, task: Task) -> Result<()> {
        self.priority_queue.push(task)
    }

    /// Get the next task from the priority queue
    pub fn dequeue(&self) -> Option<Task> {
        self.priority_queue.pop()
    }

    /// Peek at the next task without removing it
    pub fn peek_next(&self) -> Option<&Task> {
        self.priority_queue.peek()
    }

    /// Get the number of tasks in the queue
    pub fn queue_len(&self) -> usize {
        self.priority_queue.len()
    }

    pub async fn execute_task<F, Fut>(&self, mut task: Task, handler: F) -> (Task, TaskResult)
    where
        F: Fn() -> Fut + Send + Sync,
        Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
    {
        // Check rate limiting
        if !self.try_acquire(&task.id, 1).await {
            let duration = std::time::Instant::now().elapsed().as_millis() as u64;
            task.fail("Rate limit exceeded".to_string());
            let result =
                TaskResult::failure(task.id.clone(), "Rate limit exceeded".to_string(), duration);
            return (task, result);
        }

        let start_time = std::time::Instant::now();
        let mut last_error = None;

        loop {
            task.start();

            match handler().await {
                Ok(output) => {
                    let duration = start_time.elapsed().as_millis() as u64;
                    task.complete();

                    let result = TaskResult::success(task.id.clone(), output, duration);
                    return (task, result);
                }
                Err(e) => {
                    last_error = Some(e.to_string());
                    task.fail(e.to_string());

                    if task.can_retry() {
                        let backoff = self.retry_policy.compute_backoff(task.retry_count);
                        tracing::warn!(
                            "Task {} failed (attempt {}/{}), retrying in {:?}",
                            task.id,
                            task.retry_count,
                            task.max_retries,
                            backoff
                        );
                        sleep(backoff).await;
                        task.reset_for_retry();
                    } else {
                        let duration = start_time.elapsed().as_millis() as u64;
                        let result = TaskResult::failure(
                            task.id.clone(),
                            last_error.unwrap_or_else(|| "Unknown error".to_string()),
                            duration,
                        );
                        return (task, result);
                    }
                }
            }
        }
    }

    pub async fn execute_with_store<F, Fut, S>(
        &self,
        task_id: &str,
        handler: F,
        store: &S,
    ) -> Result<TaskResult>
    where
        F: Fn() -> Fut + Send + Sync,
        Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
        S: crate::store::TaskStore,
    {
        let mut task = store
            .get_task(task_id)
            .await?
            .ok_or_else(|| TaskError::Other(format!("Task {} not found", task_id)))?;

        let (updated_task, result) = self.execute_task(task, handler).await;
        store.update_task(&updated_task).await?;
        store.save_result(&result).await?;

        Ok(result)
    }
}

impl Default for TaskExecutor {
    fn default() -> Self {
        Self::with_default_retry()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_execute_task_success() {
        let executor = TaskExecutor::with_default_retry();
        let task = Task::new("test_task");

        let handler = || async { Ok(serde_json::json!({ "result": "success" })) };

        let (updated_task, result) = executor.execute_task(task, handler).await;

        assert_eq!(updated_task.status, TaskStatus::Completed);
        assert!(result.success);
    }

    #[tokio::test]
    async fn test_execute_task_with_retry() {
        let executor = TaskExecutor::new(RetryPolicy::new(3));
        let task = Task::new("test_task").with_retries(3);

        let mut attempt = 0;
        let handler = || {
            attempt += 1;
            async move {
                if attempt < 2 {
                    Err(TaskError::Other("Simulated error".to_string()))
                } else {
                    Ok(serde_json::json!({ "result": "success after retry" }))
                }
            }
        };

        let (updated_task, result) = executor.execute_task(task, handler).await;

        assert_eq!(updated_task.status, TaskStatus::Completed);
        assert!(result.success);
        assert_eq!(updated_task.retry_count, 1);
    }
}
