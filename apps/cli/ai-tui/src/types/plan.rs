//! Plan mode types and structures

use serde::{Deserialize, Serialize};

/// Execution mode for plan/build
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExecutionMode {
    /// Plan mode - review before executing
    Plan,
    /// Build mode - execute directly
    Build,
}

/// A single step in a plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanStep {
    /// Step number
    pub step_number: usize,
    /// Description of what this step does
    pub description: String,
    /// Files that will be modified in this step
    pub files: Vec<FileChange>,
    /// Estimated time to execute
    pub estimated_duration_ms: u64,
    /// Whether this step has been approved
    pub approved: bool,
}

/// A file change in a plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChange {
    /// File path
    pub path: String,
    /// Type of change
    pub change_type: ChangeType,
    /// Brief description of the change
    pub description: String,
    /// Line numbers affected (optional)
    pub line_range: Option<(usize, usize)>,
}

/// Type of file change
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChangeType {
    /// Create new file
    Create,
    /// Modify existing file
    Modify,
    /// Delete file
    Delete,
    /// Rename file
    Rename,
}

/// A complete execution plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionPlan {
    /// Unique plan ID
    pub id: String,
    /// Plan description
    pub description: String,
    /// Steps in the plan
    pub steps: Vec<PlanStep>,
    /// Total estimated time
    pub total_estimated_duration_ms: u64,
    /// Creation timestamp
    pub created_at: chrono::DateTime<chrono::Utc>,
    /// Plan status
    pub status: PlanStatus,
}

/// Plan status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlanStatus {
    /// Plan is being generated
    Generating,
    /// Plan is ready for review
    Ready,
    /// Plan is being executed
    Executing,
    /// Plan completed successfully
    Completed,
    /// Plan failed
    Failed,
}

impl ExecutionPlan {
    /// Create a new execution plan
    pub fn new(id: String, description: String) -> Self {
        Self {
            id,
            description,
            steps: Vec::new(),
            total_estimated_duration_ms: 0,
            created_at: chrono::Utc::now(),
            status: PlanStatus::Generating,
        }
    }

    /// Add a step to the plan
    pub fn add_step(&mut self, step: PlanStep) {
        self.total_estimated_duration_ms += step.estimated_duration_ms;
        self.steps.push(step);
    }

    /// Check if all steps are approved
    pub fn all_steps_approved(&self) -> bool {
        self.steps.iter().all(|step| step.approved)
    }

    /// Get all files that will be modified
    pub fn get_all_files(&self) -> Vec<&FileChange> {
        self.steps
            .iter()
            .flat_map(|step| step.files.iter())
            .collect()
    }

    /// Approve a specific step
    pub fn approve_step(&mut self, step_number: usize) {
        if let Some(step) = self.steps.get_mut(step_number) {
            step.approved = true;
        }
    }

    /// Approve all steps
    pub fn approve_all(&mut self) {
        for step in &mut self.steps {
            step.approved = true;
        }
    }
}
