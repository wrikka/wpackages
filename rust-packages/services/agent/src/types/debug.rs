//! types/debug.rs

use serde::Serialize;

/// Represents a message sent to the real-time debugger.
#[derive(Debug, Clone, Serialize)]
pub struct DebugMessage {
    pub step_name: String,
    pub data: String, // JSON-serialized data for the step
}
