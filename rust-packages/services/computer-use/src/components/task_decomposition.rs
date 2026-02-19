//! Task decomposition component (pure logic)
//!
//! Breaks down complex tasks into subtasks.

use crate::types::TaskGoal;

/// Decomposed task
#[derive(Debug, Clone)]
pub struct DecomposedTask {
    pub subtasks: Vec<SubTask>,
    pub total_steps: usize,
}

/// A single subtask
#[derive(Debug, Clone)]
pub struct SubTask {
    pub id: usize,
    pub description: String,
    pub dependencies: Vec<usize>,
    pub priority: TaskPriority,
}

/// Task priority
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum TaskPriority {
    Low,
    Medium,
    High,
    Critical,
}

/// Task decomposer (pure component)
pub struct TaskDecomposer {
    max_subtasks: usize,
}

impl TaskDecomposer {
    /// Create new task decomposer
    pub const fn new() -> Self {
        Self { max_subtasks: 50 }
    }

    /// Create with custom max subtasks
    pub const fn with_max_subtasks(max: usize) -> Self {
        Self { max_subtasks: max }
    }

    /// Decompose a task goal into subtasks
    pub fn decompose(&self, goal: &TaskGoal) -> Result<DecomposedTask, DecompositionError> {
        let subtasks = self.analyze_goal(goal);
        let total_steps = subtasks.len();

        if total_steps > self.max_subtasks {
            return Err(DecompositionError::TooComplex {
                subtasks: total_steps,
                max: self.max_subtasks,
            });
        }

        Ok(DecomposedTask {
            subtasks,
            total_steps,
        })
    }

    /// Analyze goal and create subtasks
    fn analyze_goal(&self, goal: &TaskGoal) -> Vec<SubTask> {
        let mut subtasks = Vec::new();

        // Initial analysis subtask
        subtasks.push(SubTask {
            id: 0,
            description: format!("Analyze current state for: {}", goal.description),
            dependencies: vec![],
            priority: TaskPriority::High,
        });

        // Execution subtask
        subtasks.push(SubTask {
            id: 1,
            description: format!("Execute actions to achieve: {}", goal.target_state),
            dependencies: vec![0],
            priority: TaskPriority::Medium,
        });

        // Verification subtask
        subtasks.push(SubTask {
            id: 2,
            description: "Verify task completion".to_string(),
            dependencies: vec![1],
            priority: TaskPriority::Low,
        });

        subtasks
    }

    /// Check if goal is decomposable
    pub fn is_decomposable(&self, goal: &TaskGoal) -> bool {
        !goal.description.is_empty() && !goal.target_state.is_empty()
    }
}

impl Default for TaskDecomposer {
    fn default() -> Self {
        Self::new()
    }
}

/// Decomposition errors
#[derive(Debug, Clone, thiserror::Error)]
pub enum DecompositionError {
    #[error("Task too complex: {subtasks} subtasks exceeds maximum {max}")]
    TooComplex { subtasks: usize, max: usize },

    #[error("Goal cannot be decomposed: {0}")]
    Undecomposable(String),

    #[error("Circular dependency detected")]
    CircularDependency,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decompose_task() {
        let decomposer = TaskDecomposer::new();
        let goal = TaskGoal {
            description: "Open browser and navigate".to_string(),
            target_state: "browser opened".to_string(),
        };
        let result = decomposer.decompose(&goal).unwrap();
        assert_eq!(result.subtasks.len(), 3);
    }

    #[test]
    fn test_is_decomposable() {
        let decomposer = TaskDecomposer::new();
        let goal = TaskGoal {
            description: "Do something".to_string(),
            target_state: "done".to_string(),
        };
        assert!(decomposer.is_decomposable(&goal));
    }
}
