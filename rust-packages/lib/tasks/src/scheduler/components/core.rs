//! Core scheduler functionality

use crate::storage::{SchedulerStorage, ThreadSafeStorage};
use crate::types::{Schedule, ScheduledTask};
use crate::Result;
use crate::SchedulerError;
use queue::Task;
use std::time::Duration;

/// Core scheduler for managing scheduled tasks
#[derive(Clone)]
pub struct Scheduler {
    storage: ThreadSafeStorage,
    check_interval: Duration,
}

impl Scheduler {
    pub fn new(storage: impl SchedulerStorage + 'static, check_interval_seconds: u64) -> Self {
        Scheduler {
            storage: ThreadSafeStorage::new(storage),
            check_interval: Duration::from_secs(check_interval_seconds),
        }
    }

    /// Schedule a task
    pub fn schedule(&self, task: Task, schedule: Schedule) -> Result<ScheduledTask> {
        let scheduled = ScheduledTask::new(task, schedule);
        self.storage.add(scheduled.clone())?;
        Ok(scheduled)
    }

    /// Get a scheduled task
    pub fn get_scheduled_task(&self, task_id: &str) -> Option<ScheduledTask> {
        self.storage.get(&task_id.to_string())
    }

    /// Get all scheduled tasks
    pub fn get_all_scheduled_tasks(&self) -> Vec<ScheduledTask> {
        self.storage.get_all()
    }

    /// Update a scheduled task
    pub fn update_scheduled_task(&self, task: ScheduledTask) -> Result<()> {
        self.storage.update(task)
    }

    /// Remove a scheduled task
    pub fn remove_scheduled_task(&self, task_id: &str) -> Result<()> {
        self.storage.remove(&task_id.to_string())
    }

    /// Get tasks that are due to run
    pub fn get_due_tasks(&self) -> Vec<ScheduledTask> {
        self.storage.get_due_tasks()
    }

    /// Mark a task as run
    pub fn mark_task_run(&self, mut task: ScheduledTask) -> Result<()> {
        task.mark_run();
        self.storage.update(task)
    }

    /// Disable a scheduled task
    pub fn disable_task(&self, task_id: &str) -> Result<()> {
        if let Some(mut task) = self.storage.get(&task_id.to_string()) {
            task.disable();
            self.storage.update(task)
        } else {
            Err(crate::SchedulerError::TaskNotFound {
                task_id: task_id.to_string(),
            })
        }
    }

    /// Enable a scheduled task
    pub fn enable_task(&self, task_id: &str) -> Result<()> {
        if let Some(mut task) = self.storage.get(&task_id.to_string()) {
            task.enable();
            self.storage.update(task)
        } else {
            Err(crate::SchedulerError::TaskNotFound {
                task_id: task_id.to_string(),
            })
        }
    }

    /// Get the check interval
    pub fn check_interval(&self) -> Duration {
        self.check_interval
    }

    /// Clear all scheduled tasks
    pub fn clear(&self) {
        self.storage.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::storage::InMemoryStorage;
    use queue::TaskPriority;

    #[test]
    fn test_schedule_task() {
        let scheduler = Scheduler::new(InMemoryStorage::new(), 60);
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };

        let scheduled = scheduler.schedule(task, schedule);

        assert!(scheduled.is_ok());
        let scheduled = scheduled.unwrap();
        assert_eq!(scheduled.task.name, "test task");
    }

    #[test]
    fn test_get_scheduled_task() {
        let scheduler = Scheduler::new(InMemoryStorage::new(), 60);
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };

        let scheduled = scheduler.schedule(task, schedule).unwrap();
        let retrieved = scheduler.get_scheduled_task(&scheduled.task.id);

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().task.name, "test task");
    }

    #[test]
    fn test_get_due_tasks() {
        let scheduler = Scheduler::new(InMemoryStorage::new(), 60);

        // Due task
        let task1 = Task::new("due task");
        let schedule1 = Schedule::OneTime {
            at: Utc::now() - chrono::Duration::seconds(10),
        };
        scheduler.schedule(task1, schedule1).unwrap();

        // Future task
        let task2 = Task::new("future task");
        let schedule2 = Schedule::OneTime {
            at: Utc::now() + chrono::Duration::seconds(100),
        };
        scheduler.schedule(task2, schedule2).unwrap();

        let due_tasks = scheduler.get_due_tasks();
        assert_eq!(due_tasks.len(), 1);
    }

    #[test]
    fn test_mark_task_run() {
        let scheduler = Scheduler::new(InMemoryStorage::new(), 60);
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };

        let scheduled = scheduler.schedule(task, schedule).unwrap();
        assert_eq!(scheduled.run_count, 0);

        scheduler.mark_task_run(scheduled).unwrap();

        let updated = scheduler.get_scheduled_task(&scheduled.task.id).unwrap();
        assert_eq!(updated.run_count, 1);
    }

    #[test]
    fn test_disable_enable_task() {
        let scheduler = Scheduler::new(InMemoryStorage::new(), 60);
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };

        let scheduled = scheduler.schedule(task, schedule).unwrap();
        let task_id = scheduled.task.id.clone();

        scheduler.disable_task(&task_id).unwrap();
        let task = scheduler.get_scheduled_task(&task_id).unwrap();
        assert!(!task.enabled);

        scheduler.enable_task(&task_id).unwrap();
        let task = scheduler.get_scheduled_task(&task_id).unwrap();
        assert!(task.enabled);
    }

    #[test]
    fn test_remove_scheduled_task() {
        let scheduler = Scheduler::new(InMemoryStorage::new(), 60);
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };

        let scheduled = scheduler.schedule(task, schedule).unwrap();
        let task_id = scheduled.task.id.clone();

        scheduler.remove_scheduled_task(&task_id).unwrap();

        let retrieved = scheduler.get_scheduled_task(&task_id);
        assert!(retrieved.is_none());
    }
}
