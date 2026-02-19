//! Audio generation types
//!
//! This module defines types for audio generation models.

use serde::{Deserialize, Serialize};

/// Request for audio generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioRequest {
    pub model: String,
    pub prompt: String,
    pub voice: Option<String>,
}

/// Response for audio generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioResponse {
    pub created: u64,
    pub data: Vec<Audio>,
}

/// Audio data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Audio {
    pub url: String,
    pub b64_json: Option<String>,
}
