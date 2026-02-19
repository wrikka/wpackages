//! Session components - Pure functions for session management
//!
//! All functions are pure - no side effects, deterministic output

use crate::types::PtyConfig;
use std::collections::HashMap;

/// Generate next session ID
pub fn next_session_id(current_max: u32) -> u32 {
    current_max + 1
}

/// Check if a session exists
pub fn session_exists(sessions: &HashMap<u32, PtyConfig>, session_id: u32) -> bool {
    sessions.contains_key(&session_id)
}

/// Get active session count
pub fn active_session_count(sessions: &HashMap<u32, PtyConfig>) -> usize {
    sessions.len()
}
