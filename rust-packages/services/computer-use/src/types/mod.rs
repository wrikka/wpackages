//! Core types for computer-use
//!
//! This module defines all core data structures organized by domain.

pub mod actions;
pub mod advanced;
pub mod geometry;
pub mod identifiers;
pub mod protocol;
pub mod screen;
pub mod tasks;

// Re-export all types
pub use actions::*;
pub use advanced::*;
pub use geometry::*;
pub use identifiers::*;
pub use protocol::*;
pub use screen::*;
pub use tasks::*;
