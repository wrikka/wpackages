use serde::{Deserialize, Serialize};

/// Task dependency type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DependencyType {
    /// Task must complete successfully before dependent task can start
    Success,
    /// Task must complete (success or failure) before dependent task can start
    Completion,
    /// Task must fail before dependent task can start
    Failure,
}

/// Task dependency definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskDependency {
    pub task_id: String,
    pub dependency_type: DependencyType,
}
