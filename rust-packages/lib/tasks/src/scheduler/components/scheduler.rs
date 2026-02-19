//! Task scheduler with runtime

use crate::core::Scheduler;
use crate::storage::InMemoryStorage;
use crate::Result;
use queue::{QueueConfig, QueueManager, Task};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{error, info};

/// Runtime scheduler that runs tasks at scheduled times
pub struct RuntimeScheduler {
    scheduler: Scheduler,
    queue_manager: Arc<QueueManager>,
    running: Arc<RwLock<bool>>,
}

impl RuntimeScheduler {
    pub fn new(check_interval_seconds: u64, queue_config: QueueConfig) -> Self {
        RuntimeScheduler {
            scheduler: Scheduler::new(InMemoryStorage::new(), check_interval_seconds),
            queue_manager: Arc::new(QueueManager::new(queue_config)),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Schedule a task
    pub fn schedule(&self, task: Task, schedule: crate::types::Schedule) -> Result<()> {
        self.scheduler.schedule(task, schedule)?;
        Ok(())
    }

    /// Start the scheduler
    pub async fn start(&self) -> Result<()> {
        let mut running = self.running.write().await;
        if *running {
            return Ok(());
        }
        *running = true;
        drop(running);

        info!("Starting scheduler");

        let scheduler = self.scheduler.clone();
        let queue_manager = self.queue_manager.clone();
        let running_flag = self.running.clone();
        let check_interval = self.scheduler.check_interval();

        tokio::spawn(async move {
            while *running_flag.read().await {
                if let Err(e) = Self::check_and_run_tasks(&scheduler, &queue_manager).await {
                    error!("Error checking tasks: {}", e);
                }

                tokio::time::sleep(check_interval).await;
            }

            info!("Scheduler stopped");
        });

        Ok(())
    }

    /// Stop the scheduler
    pub async fn stop(&self) {
        let mut running = self.running.write().await;
        *running = false;
        info!("Scheduler stopping...");
    }

    /// Check for due tasks and add them to the queue
    async fn check_and_run_tasks(
        scheduler: &Scheduler,
        queue_manager: &QueueManager,
    ) -> Result<()> {
        let due_tasks = scheduler.get_due_tasks();

        for scheduled_task in due_tasks {
            info!(
                "Running scheduled task: {} (run count: {})",
                scheduled_task.task.name, scheduled_task.run_count
            );

            // Clone the task for the queue
            let task_for_queue = scheduled_task.task.clone();

            // Mark as run
            scheduler.mark_task_run(scheduled_task.clone())?;

            // Add to queue
            if let Err(e) = queue_manager.add_task(task_for_queue) {
                error!("Failed to add task to queue: {}", e);
            }
        }

        Ok(())
    }

    /// Get the scheduler instance
    pub fn scheduler(&self) -> &Scheduler {
        &self.scheduler
    }

    /// Get the queue manager
    pub fn queue_manager(&self) -> Arc<QueueManager> {
        self.queue_manager.clone()
    }

    /// Check if the scheduler is running
    pub async fn is_running(&self) -> bool {
        *self.running.read().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Schedule;

    #[tokio::test]
    async fn test_runtime_scheduler() {
        let scheduler = RuntimeScheduler::new(1, QueueConfig::default());

        let task = Task::new("test task");
        scheduler
            .schedule(task, Schedule::Interval { seconds: 1 })
            .unwrap();

        scheduler.start().await.unwrap();

        // Wait a bit for the scheduler to run
        tokio::time::sleep(tokio::time::Duration::from_millis(1500)).await;

        assert!(scheduler.queue_manager().queue_size() > 0);

        scheduler.stop().await;
    }

    #[tokio::test]
    async fn test_scheduler_stop() {
        let scheduler = RuntimeScheduler::new(1, QueueConfig::default());

        scheduler.start().await.unwrap();
        assert!(scheduler.is_running().await);

        scheduler.stop().await;
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        assert!(!scheduler.is_running().await);
    }
}
