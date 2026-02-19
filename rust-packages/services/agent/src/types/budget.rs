//! types/budget.rs

/// Represents a type of cost that can be tracked against a budget.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum CostType {
    LlmTokens,
    ToolApiCall,
    // Other cost types can be added here.
}

/// Represents a record of a specific cost incurred by the agent.
#[derive(Debug, Clone)]
pub struct CostRecord {
    pub cost_type: CostType,
    pub amount: u64,
}

/// Defines the budget limits for the agent.
#[derive(Debug, Clone)]
pub struct Budget {
    pub limits: std::collections::HashMap<CostType, u64>,
}
