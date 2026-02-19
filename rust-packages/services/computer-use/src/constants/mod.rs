//! Constants for computer-use
//!
//! This module contains all constant values used throughout the application.

/// Application constants
pub mod app;

/// Default values
pub mod defaults;

/// Limits and thresholds
pub mod limits;

// Re-export all constants
pub use app::*;
pub use defaults::*;
pub use limits::*;
