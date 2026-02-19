//! Types for 3D model generation

use serde::{Deserialize, Serialize};

/// Request to generate a 3D model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreeDRequest {
    pub model: String,
    pub prompt: String,
    pub height: Option<u32>,
    pub width: Option<u32>,
    pub steps: Option<u32>,
}

/// Response containing the generated 3D model data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreeDResponse {
    pub created: u64,
    pub data: Vec<ThreeDModelData>,
}

/// Represents a single generated 3D model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreeDModelData {
    pub url: String,
    pub b64_json: Option<String>,
    pub revised_prompt: Option<String>,
}
