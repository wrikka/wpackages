pub mod adapters;
pub mod components;
pub mod config;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// Integrated modules from foundation
pub mod parallel;
pub mod queue;
pub mod scheduler;

// Re-export public API
pub use crate::prelude::*;

// Re-export parallel types
pub use parallel::{ParallelError, ParallelResult};

// Re-export queue types  
pub use queue::{QueueError, QueueResult};

// Re-export scheduler types
pub use scheduler::{SchedulerError, SchedulerResult};
