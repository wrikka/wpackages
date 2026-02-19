//! Scheduler types

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use task_types::Task;

/// Schedule for a task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Schedule {
    /// Run once at a specific time
    OneTime { at: DateTime<Utc> },
    /// Run at a specific interval
    Interval { seconds: u64 },
    /// Run using cron expression
    Cron { expression: String },
}

/// Scheduled task with timing information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledTask {
    pub task: Task,
    pub schedule: Schedule,
    pub next_run: DateTime<Utc>,
    pub last_run: Option<DateTime<Utc>>,
    pub run_count: u32,
    pub enabled: bool,
}

impl ScheduledTask {
    pub fn new(task: Task, schedule: Schedule) -> Self {
        let next_run = match &schedule {
            Schedule::OneTime { at } => *at,
            Schedule::Interval { seconds } => {
                Utc::now() + chrono::Duration::seconds(*seconds as i64)
            }
            Schedule::Cron { .. } => Utc::now(), // Will be calculated by scheduler
        };

        ScheduledTask {
            task,
            schedule,
            next_run,
            last_run: None,
            run_count: 0,
            enabled: true,
        }
    }

    pub fn should_run(&self) -> bool {
        self.enabled && Utc::now() >= self.next_run
    }

    pub fn mark_run(&mut self) {
        self.last_run = Some(Utc::now());
        self.run_count += 1;

        match &self.schedule {
            Schedule::OneTime { .. } => {
                self.enabled = false;
            }
            Schedule::Interval { seconds } => {
                self.next_run = Utc::now() + chrono::Duration::seconds(*seconds as i64);
            }
            Schedule::Cron { .. } => {
                // Will be calculated by scheduler
            }
        }
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    pub fn disable(&mut self) {
        self.enabled = false;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use task_types::{Task, TaskPriority};

    #[test]
    fn test_scheduled_task_creation() {
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };

        let scheduled = ScheduledTask::new(task, schedule);

        assert_eq!(scheduled.task.name, "test task");
        assert!(scheduled.enabled);
        assert_eq!(scheduled.run_count, 0);
    }

    #[test]
    fn test_should_run() {
        let task = Task::new("test task");
        let schedule = Schedule::OneTime {
            at: Utc::now() - chrono::Duration::seconds(10),
        };

        let scheduled = ScheduledTask::new(task, schedule);

        assert!(scheduled.should_run());
    }

    #[test]
    fn test_should_not_run_future() {
        let task = Task::new("test task");
        let schedule = Schedule::OneTime {
            at: Utc::now() + chrono::Duration::seconds(100),
        };

        let scheduled = ScheduledTask::new(task, schedule);

        assert!(!scheduled.should_run());
    }

    #[test]
    fn test_mark_run() {
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };
        let mut scheduled = ScheduledTask::new(task, schedule);

        scheduled.mark_run();

        assert_eq!(scheduled.run_count, 1);
        assert!(scheduled.last_run.is_some());
    }

    #[test]
    fn test_mark_run_one_time() {
        let task = Task::new("test task");
        let schedule = Schedule::OneTime { at: Utc::now() };
        let mut scheduled = ScheduledTask::new(task, schedule);

        scheduled.mark_run();

        assert!(!scheduled.enabled);
    }

    #[test]
    fn test_enable_disable() {
        let task = Task::new("test task");
        let schedule = Schedule::Interval { seconds: 60 };
        let mut scheduled = ScheduledTask::new(task, schedule);

        scheduled.disable();
        assert!(!scheduled.enabled);

        scheduled.enable();
        assert!(scheduled.enabled);
    }
}
