//! Video generation types
//!
//! This module defines types for video generation models.

use serde::{Deserialize, Serialize};

/// Request for video generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoRequest {
    pub model: String,
    pub prompt: String,
    pub n: Option<u32>,
    pub size: Option<String>,
}

/// Response for video generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoResponse {
    pub created: u64,
    pub data: Vec<Video>,
}

/// Video data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Video {
    pub url: String,
    pub b64_json: Option<String>,
    pub revised_prompt: Option<String>,
}
