//! Middleware support for task processing

use crate::error::Result;
use crate::types::{Task, TaskResult};
use std::future::Future;
use std::pin::Pin;

/// Task handler function type
pub type TaskHandler =
    Box<dyn Fn(Task) -> Pin<Box<dyn Future<Output = Result<TaskResult>> + Send>> + Send + Sync>;

/// Middleware trait for task processing
pub trait Middleware: Send + Sync {
    /// Process a task before execution
    fn before(&self, task: &mut Task) -> Result<()> {
        Ok(())
    }

    /// Process a task result after execution
    fn after(&self, task: &Task, result: &mut TaskResult) -> Result<()> {
        Ok(())
    }

    /// Handle errors during task execution
    fn on_error(&self, task: &Task, error: &crate::error::TaskError) -> Result<()> {
        Ok(())
    }
}

/// Middleware chain
pub struct MiddlewareChain {
    middlewares: Vec<Box<dyn Middleware>>,
}

impl MiddlewareChain {
    /// Create a new middleware chain
    pub fn new() -> Self {
        Self {
            middlewares: Vec::new(),
        }
    }

    /// Add a middleware to the chain
    pub fn add<M: Middleware + 'static>(mut self, middleware: M) -> Self {
        self.middlewares.push(Box::new(middleware));
        self
    }

    /// Execute before middleware
    pub fn execute_before(&self, task: &mut Task) -> Result<()> {
        for middleware in &self.middlewares {
            middleware.before(task)?;
        }
        Ok(())
    }

    /// Execute after middleware
    pub fn execute_after(&self, task: &Task, result: &mut TaskResult) -> Result<()> {
        for middleware in &self.middlewares {
            middleware.after(task, result)?;
        }
        Ok(())
    }

    /// Execute error middleware
    pub fn execute_on_error(&self, task: &Task, error: &crate::error::TaskError) -> Result<()> {
        for middleware in &self.middlewares {
            middleware.on_error(task, error)?;
        }
        Ok(())
    }
}

impl Default for MiddlewareChain {
    fn default() -> Self {
        Self::new()
    }
}

/// Logging middleware
pub struct LoggingMiddleware;

impl Middleware for LoggingMiddleware {
    fn before(&self, task: &mut Task) -> Result<()> {
        tracing::info!("Starting task: {} (id: {})", task.name, task.id);
        Ok(())
    }

    fn after(&self, task: &Task, result: &mut TaskResult) -> Result<()> {
        if result.success {
            tracing::info!(
                "Task completed: {} (id: {}) in {}ms",
                task.name,
                task.id,
                result.duration_ms
            );
        } else {
            tracing::error!(
                "Task failed: {} (id: {}) - {:?}",
                task.name,
                task.id,
                result.error
            );
        }
        Ok(())
    }

    fn on_error(&self, task: &Task, error: &crate::error::TaskError) -> Result<()> {
        tracing::error!("Task error: {} (id: {}) - {:?}", task.name, task.id, error);
        Ok(())
    }
}

/// Metrics middleware
#[cfg(feature = "metrics")]
pub struct MetricsMiddleware {
    tasks_started: prometheus::IntCounter,
    tasks_completed: prometheus::IntCounter,
    tasks_failed: prometheus::IntCounter,
    task_duration: prometheus::Histogram,
}

#[cfg(feature = "metrics")]
impl MetricsMiddleware {
    /// Create a new metrics middleware
    pub fn new() -> Self {
        let tasks_started = prometheus::register_int_counter!(
            "task_started_total",
            "Total number of tasks started"
        )
        .unwrap();

        let tasks_completed = prometheus::register_int_counter!(
            "task_completed_total",
            "Total number of tasks completed"
        )
        .unwrap();

        let tasks_failed =
            prometheus::register_int_counter!("task_failed_total", "Total number of tasks failed")
                .unwrap();

        let task_duration = prometheus::register_histogram!(
            "task_duration_seconds",
            "Task execution duration in seconds"
        )
        .unwrap();

        Self {
            tasks_started,
            tasks_completed,
            tasks_failed,
            task_duration,
        }
    }
}

#[cfg(feature = "metrics")]
impl Middleware for MetricsMiddleware {
    fn before(&self, _task: &mut Task) -> Result<()> {
        self.tasks_started.inc();
        Ok(())
    }

    fn after(&self, task: &Task, result: &mut TaskResult) -> Result<()> {
        if result.success {
            self.tasks_completed.inc();
        } else {
            self.tasks_failed.inc();
        }
        self.task_duration
            .observe(result.duration_ms as f64 / 1000.0);
        Ok(())
    }
}

/// Retry middleware
pub struct RetryMiddleware {
    max_retries: usize,
}

impl RetryMiddleware {
    /// Create a new retry middleware
    pub fn new(max_retries: usize) -> Self {
        Self { max_retries }
    }
}

impl Middleware for RetryMiddleware {
    fn before(&self, task: &mut Task) -> Result<()> {
        if task.max_retries == 0 {
            task.max_retries = self.max_retries;
        }
        Ok(())
    }

    fn on_error(&self, task: &Task, _error: &crate::error::TaskError) -> Result<()> {
        if task.can_retry() {
            tracing::warn!(
                "Task {} will be retried (attempt {}/{})",
                task.id,
                task.retry_count + 1,
                task.max_retries
            );
        }
        Ok(())
    }
}

/// Timeout middleware
pub struct TimeoutMiddleware {
    timeout_secs: u64,
}

impl TimeoutMiddleware {
    /// Create a new timeout middleware
    pub fn new(timeout_secs: u64) -> Self {
        Self { timeout_secs }
    }
}

impl Middleware for TimeoutMiddleware {
    fn before(&self, task: &mut Task) -> Result<()> {
        // Add timeout metadata to task
        task.metadata["timeout_secs"] = serde_json::json!(self.timeout_secs);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_middleware_chain() {
        let chain = MiddlewareChain::new()
            .add(LoggingMiddleware)
            .add(RetryMiddleware::new(3));

        let mut task = Task::new("test_task");
        chain.execute_before(&mut task).unwrap();
    }

    #[test]
    fn test_logging_middleware() {
        let middleware = LoggingMiddleware;
        let mut task = Task::new("test_task");
        middleware.before(&mut task).unwrap();
    }

    #[test]
    fn test_retry_middleware() {
        let middleware = RetryMiddleware::new(5);
        let mut task = Task::new("test_task");
        middleware.before(&mut task).unwrap();
        assert_eq!(task.max_retries, 5);
    }
}
