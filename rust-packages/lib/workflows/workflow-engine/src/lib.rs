//! # Workflow Engine
//!
//! Generic workflow engine for executing step-based workflows.
//!
//! ## Features
//!
//! - Step-based workflow execution
//! - Conditional branching
//! - Loop support
//! - Variable extraction and storage
//! - Retry logic with backoff
//! - Error handling with fallback

pub mod engine;
pub mod error;
pub mod executor;
pub mod types;

pub use engine::WorkflowEngine;
pub use error::{WorkflowError, Result};
pub use executor::WorkflowExecutor;
pub use types::*;
