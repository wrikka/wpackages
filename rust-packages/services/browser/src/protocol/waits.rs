use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum WaitCondition {
    Element { selector: String },
    // Future conditions can be added here, e.g., Text, Navigation
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WaitRequest {
    pub condition: WaitCondition,
    pub timeout_ms: Option<u64>,
}
