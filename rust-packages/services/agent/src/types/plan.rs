//! types/plan.rs

/// Represents a single, actionable sub-task within a larger plan.
#[derive(Debug, Clone)]
pub struct SubTask {
    pub id: u32,
    pub description: String,
    pub parent_id: Option<u32>,
}

/// Represents a hierarchical plan composed of multiple sub-tasks.
#[derive(Debug, Clone)]
pub struct HierarchicalPlan {
    pub tasks: Vec<SubTask>,
}
