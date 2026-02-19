//! Parallel executor for running tasks concurrently

use std::sync::Arc;
use tokio::sync::Semaphore;
use tokio::task::JoinSet;
use crate::{Result, ProgressTracker, CancellationToken};
use super::scheduler::{Task, TaskScheduler, TaskId, TaskStatus};

/// Parallel executor configuration
#[derive(Clone)]
pub struct ExecutorConfig {
    max_concurrency: usize,
    queue_size: usize,
}

impl Default for ExecutorConfig {
    fn default() -> Self {
        Self {
            max_concurrency: 4,
            queue_size: 100,
        }
    }
}

impl ExecutorConfig {
    /// Create a new executor config
    pub fn new() -> Self {
        Self::default()
    }

    /// Set max concurrency
    pub fn max_concurrency(mut self, value: usize) -> Self {
        self.max_concurrency = value;
        self
    }

    /// Set queue size
    pub fn queue_size(mut self, value: usize) -> Self {
        self.queue_size = value;
        self
    }
}

/// Parallel executor for running tasks concurrently
pub struct ParallelExecutor {
    config: ExecutorConfig,
    scheduler: TaskScheduler,
    semaphore: Arc<Semaphore>,
}

impl ParallelExecutor {
    /// Create a new parallel executor
    pub fn new(max_concurrency: usize) -> Self {
        let config = ExecutorConfig {
            max_concurrency,
            ..Default::default()
        };
        
        Self::with_config(config)
    }

    /// Create a parallel executor with custom config
    pub fn with_config(config: ExecutorConfig) -> Self {
        let semaphore = Arc::new(Semaphore::new(config.max_concurrency));
        
        Self {
            config,
            scheduler: TaskScheduler::new(),
            semaphore,
        }
    }

    /// Create a builder for the executor
    pub fn builder() -> ExecutorBuilder {
        ExecutorBuilder::new()
    }

    /// Execute tasks in parallel
    pub async fn execute<T, R, F>(&self, tasks: Vec<Task<T, F>>) -> Result<Vec<R>>
    where
        T: Send + Sync + 'static,
        R: Send + Sync + 'static,
        F: FnOnce(T) -> R + Send + Sync + 'static,
    {
        let mut join_set = JoinSet::new();
        let mut task_ids = Vec::new();

        for task in tasks {
            let id = task.id();
            let task_name = task.name().to_string();
            let operation = task.operation().clone();
            
            task_ids.push(id);
            self.scheduler.schedule(task).await;
            
            let permit = self.semaphore.clone().acquire_owned().await.map_err(|e| {
                crate::ParallelError::ParallelFailed {
                    message: format!("Failed to acquire semaphore permit: {}", e),
                    source: anyhow::anyhow!(e),
                }
            })?;

            let scheduler = self.scheduler.clone();
            
            join_set.spawn(async move {
                let _permit = permit;
                scheduler.update_status(id, TaskStatus::Running).await;
                
                let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                    operation()
                }));
                
                match result {
                    Ok(value) => {
                        scheduler.update_status(id, TaskStatus::Completed).await;
                        Ok(value)
                    }
                    Err(_) => {
                        scheduler.update_status(id, TaskStatus::Failed("Task panicked".to_string())).await;
                        Err(crate::ParallelError::TaskFailed("Task panicked".to_string()))
                    }
                }
            });
        }

        let mut results = Vec::new();
        let mut errors = Vec::new();

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(value)) => results.push(value),
                Ok(Err(e)) => errors.push(e),
                Err(e) => {
                    errors.push(crate::ParallelError::TaskFailed(format!("Task join error: {}", e)));
                }
            }
        }

        if !errors.is_empty() {
            return Err(crate::ParallelError::MultipleErrors(errors));
        }

        Ok(results)
    }

    /// Execute tasks with progress tracking and cancellation support
    pub async fn execute_with_progress<T, R, F>(
        &self,
        tasks: Vec<Task<T, F>>,
        tracker: &ProgressTracker,
        token: &CancellationToken,
    ) -> Result<Vec<R>>
    where
        T: Send + Sync + 'static,
        R: Send + Sync + 'static,
        F: FnOnce(T) -> Result<R> + Send + Sync + 'static,
    {
        tracker.start();
        let mut join_set = JoinSet::new();

        for task in tasks {
            let id = task.id();
            let operation = task.operation().clone();
            
            self.scheduler.schedule(task).await;
            
            let permit = self.semaphore.clone().acquire_owned().await.map_err(|e| {
                crate::ParallelError::ParallelFailed {
                    message: format!("Failed to acquire semaphore permit: {}", e),
                    source: anyhow::anyhow!(e),
                }
            })?;

            let tracker = tracker.clone();
            let token = token.clone();
            let scheduler = self.scheduler.clone();
            
            join_set.spawn(async move {
                let _permit = permit;
                scheduler.update_status(id, TaskStatus::Running).await;
                
                token.check_cancelled()?;
                
                let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                    operation()
                }));
                
                match result {
                    Ok(Ok(value)) => {
                        tracker.increment_completed();
                        scheduler.update_status(id, TaskStatus::Completed).await;
                        Ok(value)
                    }
                    Ok(Err(e)) => {
                        tracker.increment_failed();
                        scheduler.update_status(id, TaskStatus::Failed(format!("{:?}", e))).await;
                        Err(e)
                    }
                    Err(_) => {
                        tracker.increment_failed();
                        scheduler.update_status(id, TaskStatus::Failed("Task panicked".to_string())).await;
                        Err(crate::ParallelError::TaskFailed("Task panicked".to_string()))
                    }
                }
            });
        }

        let mut results = Vec::new();
        let mut errors = Vec::new();

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(value)) => results.push(value),
                Ok(Err(e)) => errors.push(e),
                Err(e) => {
                    errors.push(crate::ParallelError::TaskFailed(format!("Task join error: {}", e)));
                }
            }
        }

        if !errors.is_empty() {
            return Err(crate::ParallelError::MultipleErrors(errors));
        }

        Ok(results)
    }

    /// Get task scheduler
    pub fn scheduler(&self) -> &TaskScheduler {
        &self.scheduler
    }

    /// Wait for all tasks to complete
    pub async fn wait_all(&self, task_ids: Vec<TaskId>) -> Result<()> {
        for id in task_ids {
            self.scheduler.wait(id).await?;
        }
        Ok(())
    }

    /// Cancel all tasks
    pub async fn cancel_all(&self, task_ids: Vec<TaskId>) {
        for id in task_ids {
            self.scheduler.update_status(id, TaskStatus::Cancelled).await;
        }
    }
}

impl Default for ParallelExecutor {
    fn default() -> Self {
        Self::new(4)
    }
}

/// Builder for ParallelExecutor
pub struct ExecutorBuilder {
    config: ExecutorConfig,
}

impl ExecutorBuilder {
    /// Create a new builder
    pub fn new() -> Self {
        Self {
            config: ExecutorConfig::default(),
        }
    }

    /// Set max concurrency
    pub fn max_concurrency(mut self, value: usize) -> Self {
        self.config.max_concurrency = value;
        self
    }

    /// Set queue size
    pub fn queue_size(mut self, value: usize) -> Self {
        self.config.queue_size = value;
        self
    }

    /// Build the executor
    pub fn build(self) -> ParallelExecutor {
        ParallelExecutor::with_config(self.config)
    }
}

impl Default for ExecutorBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parallel_executor() {
        let executor = ParallelExecutor::new(2);
        
        let tasks = vec![
            Task::new("task1", 1),
            Task::new("task2", 2),
            Task::new("task3", 3),
        ];
        
        let results = executor.execute(tasks, |x| x * 2).await;
        assert!(results.is_ok());
        assert_eq!(results.unwrap(), vec![2, 4, 6]);
    }

    #[tokio::test]
    async fn test_executor_builder() {
        let executor = ParallelExecutor::builder()
            .max_concurrency(8)
            .queue_size(100)
            .build();
        
        assert_eq!(executor.config.max_concurrency, 8);
        assert_eq!(executor.config.queue_size, 100);
    }

    #[tokio::test]
    async fn test_execute_with_progress() {
        let executor = ParallelExecutor::new(2);
        let tracker = ProgressTracker::new(3);
        let token = CancellationToken::new();
        
        let tasks = vec![
            Task::new("task1", 1),
            Task::new("task2", 2),
            Task::new("task3", 3),
        ];
        
        let results = executor.execute_with_progress(tasks, &tracker, &token, |x| Ok(x * 2)).await;
        assert!(results.is_ok());
        assert_eq!(results.unwrap(), vec![2, 4, 6]);
        assert_eq!(tracker.completed(), 3);
    }
}
