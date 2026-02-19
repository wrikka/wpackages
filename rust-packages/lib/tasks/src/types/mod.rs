//! Core types for task management
//!
//! This module provides fundamental type definitions used throughout the task system,
//! including timestamps, metadata, pagination, IDs, and task-specific types.

pub mod common;
pub mod id;

// Re-export task-specific types from components
pub use crate::components::types::*;

// Re-export foundation types
pub use common::*;
pub use id::*;
