use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PipelineStatus {
    Pending,
    Running,
    Success,
    Failed,
    Cancelled,
    Skipped,
    Unknown,
}

impl PipelineStatus {
    pub fn is_active(&self) -> bool {
        matches!(self, PipelineStatus::Pending | PipelineStatus::Running)
    }
    
    pub fn is_completed(&self) -> bool {
        matches!(self, PipelineStatus::Success | PipelineStatus::Failed | PipelineStatus::Cancelled | PipelineStatus::Skipped)
    }
    
    pub fn is_successful(&self) -> bool {
        matches!(self, PipelineStatus::Success)
    }
}
