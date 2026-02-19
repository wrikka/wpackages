//! Performance optimization module
//! 
//! Provides utilities for optimizing rendering and computation performance

pub mod cache;
pub mod virtualization;
pub mod batching;
pub mod profiler;

pub use cache::*;
pub use virtualization::*;
pub use batching::*;
pub use profiler::*;
