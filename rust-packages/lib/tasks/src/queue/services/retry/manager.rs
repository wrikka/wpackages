//! Retry manager for handling failed tasks

use crate::error::{QueueError, Result};
use crate::persistence::Persistence;
use crate::retry::{CircuitBreaker, RetryPolicy};
use crate::types::{TaskId, TaskStatus};
use chrono::{DateTime, Utc};
use dashmap::DashMap;
use std::sync::Arc;

/// Manager for retrying failed tasks
pub struct RetryManager {
    persistence: Arc<dyn Persistence>,
    policy: RetryPolicy,
    circuit_breaker: Arc<CircuitBreaker>,
    task_metrics: Arc<DashMap<TaskId, TaskMetrics>>,
}

/// Metrics for a task
#[derive(Debug, Clone)]
struct TaskMetrics {
    attempt_count: usize,
    last_attempt: DateTime<Utc>,
}

impl RetryManager {
    /// Create a new retry manager
    pub fn new(persistence: Arc<dyn Persistence>, policy: RetryPolicy) -> Self {
        Self {
            persistence,
            policy,
            circuit_breaker: Arc::new(CircuitBreaker::new()),
            task_metrics: Arc::new(DashMap::new()),
        }
    }

    /// Create with default retry policy
    pub fn with_default(persistence: Arc<dyn Persistence>) -> Self {
        Self::new(persistence, RetryPolicy::default())
    }

    /// Check if a task should be retried
    pub async fn should_retry(&self, _task_id: &TaskId, current_attempt: usize) -> Result<bool> {
        // Check circuit breaker first
        if !self.circuit_breaker.allows_execution().await {
            return Ok(false);
        }

        Ok(self.policy.should_retry(current_attempt))
    }

    /// Schedule a task for retry
    pub async fn schedule_retry(&self, task_id: &TaskId, attempt: usize) -> Result<DateTime<Utc>> {
        let now = Utc::now();
        let next_retry_at = self.policy.next_retry_at(attempt, now);

        self.persistence
            .increment_retry(task_id, next_retry_at)
            .await?;

        // Update metrics
        self.task_metrics.insert(
            task_id.clone(),
            TaskMetrics {
                attempt_count: attempt,
                last_attempt: now,
            },
        );

        Ok(next_retry_at)
    }

    /// Get tasks ready for retry
    pub async fn get_retry_tasks(&self, limit: usize) -> Result<Vec<crate::types::Task>> {
        let now = Utc::now();
        self.persistence.get_retry_tasks(now, limit).await
    }

    /// Process retry tasks
    pub async fn process_retry_tasks<F, Fut>(&self, handler: F) -> Result<usize>
    where
        F: Fn(crate::types::Task) -> Fut + Send + Sync,
        Fut: std::future::Future<Output = Result<serde_json::Value>> + Send,
    {
        let tasks = self.get_retry_tasks(10).await?;
        let mut processed = 0;

        for task in tasks {
            let task_id = task.id.clone();
            let current_attempt = task.retry_count.unwrap_or(0);

            // Check circuit breaker
            if !self.circuit_breaker.allows_execution().await {
                break;
            }

            if !self.should_retry(&task_id, current_attempt).await? {
                self.persistence
                    .update_task_status(&task_id, TaskStatus::Failed)
                    .await?;
                continue;
            }

            let result = handler(task.clone()).await;

            match result {
                Ok(output) => {
                    self.circuit_breaker.record_success().await;
                    self.persistence
                        .update_task_result(&task_id, &output.to_string(), None)
                        .await?;
                    self.persistence
                        .update_task_status(&task_id, TaskStatus::Completed)
                        .await?;
                    // Remove metrics
                    self.task_metrics.remove(&task_id);
                }
                Err(e) => {
                    self.circuit_breaker.record_failure().await;
                    let next_retry_at = self.schedule_retry(&task_id, current_attempt + 1).await?;
                    tracing::warn!(
                        task_id = %task_id,
                        attempt = current_attempt + 1,
                        next_retry_at = %next_retry_at,
                        error = %e,
                        "Task failed, scheduled for retry"
                    );
                }
            }

            processed += 1;
        }

        Ok(processed)
    }

    /// Get retry policy
    pub fn policy(&self) -> &RetryPolicy {
        &self.policy
    }

    /// Update retry policy
    pub fn set_policy(&mut self, policy: RetryPolicy) {
        self.policy = policy;
    }

    /// Get circuit breaker
    pub fn circuit_breaker(&self) -> Arc<CircuitBreaker> {
        self.circuit_breaker.clone()
    }

    /// Get task metrics
    pub fn task_metrics(&self) -> Arc<DashMap<TaskId, TaskMetrics>> {
        self.task_metrics.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_retry_manager_creation() {
        let persistence = Arc::new(
            crate::persistence::SQLitePersistence::in_memory()
                .await
                .unwrap(),
        );
        let manager = RetryManager::with_default(persistence);

        assert_eq!(manager.policy().max_retries, 3);
    }

    #[tokio::test]
    async fn test_should_retry() {
        let persistence = Arc::new(
            crate::persistence::SQLitePersistence::in_memory()
                .await
                .unwrap(),
        );
        let manager = RetryManager::with_default(persistence);

        assert!(manager
            .should_retry(&TaskId::new("test".to_string()), 0)
            .await
            .unwrap());
        assert!(manager
            .should_retry(&TaskId::new("test".to_string()), 2)
            .await
            .unwrap());
        assert!(!manager
            .should_retry(&TaskId::new("test".to_string()), 3)
            .await
            .unwrap());
    }
}
