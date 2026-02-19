//! Feature 19: Incremental Progress Tracking
//! 
//! Tracks progress of long-running tasks,
//! resumes from checkpoints,
//! provides status updates to users.

use anyhow::Result;
use std::collections::HashMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ProgressTrackingError {
    #[error("Failed to track progress")]
    TrackingFailed,
    #[error("Checkpoint not found")]
    CheckpointNotFound,
}

/// Incremental progress tracker
pub struct ProgressTracker {
    tasks: HashMap<String, TaskProgress>,
    checkpoints: HashMap<String, Checkpoint>,
}

impl ProgressTracker {
    pub fn new() -> Self {
        Self {
            tasks: HashMap::new(),
            checkpoints: HashMap::new(),
        }
    }

    /// Track progress of long-running tasks
    pub fn track_task(&mut self, task_id: String, total_steps: u32) {
        self.tasks.insert(
            task_id.clone(),
            TaskProgress {
                task_id: task_id.clone(),
                current_step: 0,
                total_steps,
                status: TaskStatus::InProgress,
                start_time: std::time::Instant::now(),
            },
        );
    }

    /// Update task progress
    pub fn update_progress(&mut self, task_id: &str, step: u32) -> Result<()> {
        if let Some(progress) = self.tasks.get_mut(task_id) {
            progress.current_step = step;
            if progress.current_step >= progress.total_steps {
                progress.status = TaskStatus::Completed;
            }
            Ok(())
        } else {
            Err(ProgressTrackingError::TrackingFailed.into())
        }
    }

    /// Resume from checkpoints
    pub fn resume_from_checkpoint(&mut self, checkpoint_id: &str) -> Result<TaskProgress> {
        let checkpoint = self
            .checkpoints
            .get(checkpoint_id)
            .ok_or(ProgressTrackingError::CheckpointNotFound)?;

        Ok(TaskProgress {
            task_id: checkpoint.task_id.clone(),
            current_step: checkpoint.step,
            total_steps: checkpoint.total_steps,
            status: TaskStatus::InProgress,
            start_time: std::time::Instant::now(),
        })
    }

    /// Create checkpoint
    pub fn create_checkpoint(&mut self, task_id: &str, step: u32, total_steps: u32) -> String {
        let checkpoint_id = format!("{}_checkpoint_{}", task_id, step);
        self.checkpoints.insert(
            checkpoint_id.clone(),
            Checkpoint {
                task_id: task_id.to_string(),
                step,
                total_steps,
                timestamp: std::time::Instant::now(),
            },
        );
        checkpoint_id
    }

    /// Provide status updates to users
    pub fn get_status(&self, task_id: &str) -> Option<StatusUpdate> {
        self.tasks.get(task_id).map(|progress| StatusUpdate {
            task_id: task_id.to_string(),
            progress: progress.current_step as f32 / progress.total_steps as f32,
            status: progress.status.clone(),
            elapsed: progress.start_time.elapsed(),
        })
    }
}

#[derive(Debug, Clone)]
pub struct TaskProgress {
    pub task_id: String,
    pub current_step: u32,
    pub total_steps: u32,
    pub status: TaskStatus,
    pub start_time: std::time::Instant,
}

#[derive(Debug, Clone)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

#[derive(Debug, Clone)]
pub struct Checkpoint {
    pub task_id: String,
    pub step: u32,
    pub total_steps: u32,
    pub timestamp: std::time::Instant,
}

#[derive(Debug, Clone)]
pub struct StatusUpdate {
    pub task_id: String,
    pub progress: f32,
    pub status: TaskStatus,
    pub elapsed: std::time::Duration,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_progress_tracker() {
        let mut tracker = ProgressTracker::new();
        tracker.track_task("task1".to_string(), 10);
        tracker.update_progress("task1", 5).expect("Failed to update progress");
        let status = tracker.get_status("task1").expect("Failed to get status");
        assert_eq!(status.progress, 0.5);
    }
}
