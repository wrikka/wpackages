//! Types for music generation

use serde::{Deserialize, Serialize};

/// Request to generate music
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicRequest {
    pub model: String,
    pub prompt: String,
    pub duration_seconds: Option<u32>,
}

/// Response containing the generated music data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicResponse {
    pub created: u64,
    pub data: Vec<MusicData>,
}

/// Represents a single generated music track
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicData {
    pub url: String,
    pub b64_json: Option<String>,
}
