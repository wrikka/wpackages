//! types/prediction.rs

use crate::types::budget::CostType;
use std::collections::HashMap;

/// Represents the predicted cost of a plan.
#[derive(Debug, Clone)]
pub struct CostPrediction {
    pub costs: HashMap<CostType, u64>,
}
