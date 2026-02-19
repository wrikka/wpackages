//! types/affective.rs

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents the emotional tone detected in an input.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalState {
    // A map of emotions (e.g., "joy", "sadness") to their detected intensity (0.0 to 1.0).
    pub emotions: HashMap<String, f32>,
}
