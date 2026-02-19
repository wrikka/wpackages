//! Performance client module.
//!
//! This module contains the performance client implementation and related components.

pub mod config;
pub mod core;
pub mod factory;
pub mod methods;
pub mod reports;

// Re-export main types for convenience
pub use config::PerformanceClientConfig;
pub use core::PerformanceClientImpl;
pub use factory::{create_performance_client, create_performance_client_with_config};
pub use methods::PerformanceClientMethods;
pub use reports::PerformanceClientReports;
