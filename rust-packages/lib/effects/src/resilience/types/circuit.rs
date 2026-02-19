use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitStats {
    pub state: CircuitState,
    pub failure_count: u32,
    pub success_count: u32,
    pub last_failure_time: Option<u64>,
    pub last_success_time: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CallResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub duration_ms: u64,
}

impl<T> CallResult<T> {
    pub fn success(data: T, duration_ms: u64) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            duration_ms,
        }
    }

    pub fn failure(error: String, duration_ms: u64) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            duration_ms,
        }
    }
}
