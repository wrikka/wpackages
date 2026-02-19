//! Feature 32: Visual Feedback & Progress Display

use crate::types::*;

/// Feature 32: Visual Feedback & Progress Display
pub struct VisualFeedback {
    display_enabled: bool,
}

impl Default for VisualFeedback {
    fn default() -> Self {
        Self { display_enabled: true }
    }
}

impl VisualFeedback {
    /// Show real-time progress
    pub fn show_progress(&self, progress: f32) {
        if self.display_enabled {
            println!("Progress: {:.0}%", progress * 100.0);
        }
    }

    /// Highlight current actions
    pub fn highlight_action(&self, action: &str) {
        if self.display_enabled {
            println!("Current action: {}", action);
        }
    }

    /// Provide visual confirmations
    pub fn confirm(&self, message: &str) {
        if self.display_enabled {
            println!("✓ {}", message);
        }
    }
}
