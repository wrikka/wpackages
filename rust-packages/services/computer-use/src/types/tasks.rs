//! Task and goal types

use serde::{Deserialize, Serialize};

/// Task goal definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskGoal {
    pub description: String,
    pub target_state: String,
}

/// Task execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub success: bool,
    pub message: String,
    pub duration_ms: Option<u64>,
}

impl TaskResult {
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            duration_ms: None,
        }
    }

    pub fn failure(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            duration_ms: None,
        }
    }

    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }
}

/// Outcome of an action
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Outcome {
    Success,
    Failure,
    Partial,
}

/// Feedback for learning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Feedback {
    pub task_id: String,
    pub action_taken: String,
    pub outcome: Outcome,
    pub user_correction: Option<String>,
}

/// Action plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionPlan {
    pub actions: Vec<PlannedAction>,
    pub estimated_steps: usize,
}

/// A single planned action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlannedAction {
    pub action: crate::types::Action,
    pub description: String,
    pub dependencies: Vec<usize>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_result() {
        let result = TaskResult::success("Done").with_duration(100);
        assert!(result.success);
        assert_eq!(result.duration_ms, Some(100));
    }
}
