//! Performance monitoring and profiling tools
//! 
//! This library provides comprehensive performance monitoring capabilities including:
//! - Metrics collection and analysis
//! - Performance profiling
//! - Resource usage tracking
//! - Benchmarking utilities

#![warn(clippy::all, clippy::pedantic)]
#![deny(clippy::unwrap_used, clippy::expect_used)]
#![forbid(unsafe_code)]

pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// Prelude module for common imports
pub mod prelude;

// Re-export main types for convenience
pub use crate::error::{PerformanceError, Result};
pub use crate::config::PerformanceConfig;
pub use crate::telemetry::init_telemetry;
