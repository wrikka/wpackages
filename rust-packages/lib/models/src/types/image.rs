//! Image generation types
//!
//! This module defines types for image generation models.

use serde::{Deserialize, Serialize};

/// Request for image generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageRequest {
    pub model: String,
    pub prompt: String,
    pub n: Option<u32>,
    pub size: Option<String>,
    pub quality: Option<String>,
    pub style: Option<String>,
}

/// Response for image generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageResponse {
    pub created: u64,
    pub data: Vec<Image>,
}

/// Image data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Image {
    pub url: String,
    pub b64_json: Option<String>,
    pub revised_prompt: Option<String>,
}
