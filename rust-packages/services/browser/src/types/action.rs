use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionRecord {
    pub timestamp: DateTime<Utc>,
    pub action_type: String,
    pub selector: Option<String>,
    pub value: Option<String>,
    pub success: bool,
    pub error: Option<String>,
}

impl ActionRecord {
    pub fn success(
        action_type: impl Into<String>,
        selector: Option<String>,
        value: Option<String>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            action_type: action_type.into(),
            selector,
            value,
            success: true,
            error: None,
        }
    }

    pub fn failure(
        action_type: impl Into<String>,
        selector: Option<String>,
        error: impl Into<String>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            action_type: action_type.into(),
            selector,
            value: None,
            success: false,
            error: Some(error.into()),
        }
    }
}
