//! Feature 9: Smart Scheduling

use serde::{Deserialize, Serialize};
use crate::types::TaskGoal;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledTask {
    pub id: String,
    pub goal: TaskGoal,
    pub schedule: Schedule,
    pub status: TaskStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Schedule { Once, Interval { secs: u64 }, Cron(String) }

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum TaskStatus { Pending, Running, Done, Failed }

pub struct SmartScheduler { tasks: Vec<ScheduledTask> }

impl SmartScheduler {
    pub fn new() -> Self { Self { tasks: vec![] } }
    pub fn schedule(&mut self, goal: TaskGoal, sched: Schedule) -> String {
        let id = uuid::Uuid::new_v4().to_string();
        self.tasks.push(ScheduledTask { id: id.clone(), goal, schedule: sched, status: TaskStatus::Pending });
        id
    }
    pub fn list(&self) -> &[ScheduledTask] { &self.tasks }
}
impl Default for SmartScheduler { fn default() -> Self { Self::new() } }
