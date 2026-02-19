//! Performance services module

pub mod traits;
pub mod client;

// Re-export main types for convenience
pub use traits::PerformanceClient;
pub use client::{
    PerformanceClientImpl, PerformanceClientConfig, PerformanceClientMethods,
    PerformanceClientReports, create_performance_client, create_performance_client_with_config
};
