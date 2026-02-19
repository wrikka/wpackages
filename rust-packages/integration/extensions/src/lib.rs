//! The main library for the wterminal extension system.

// Layered module structure
pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod initialization;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// Prelude module for convenient imports
pub mod prelude;

// Re-export main types for convenience
pub use error::{AppError, Result as ExtensionResult};
