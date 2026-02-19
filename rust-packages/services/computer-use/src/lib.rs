//! Computer-use: Cross-platform desktop automation CLI for AI agents
//!
//! This crate provides a comprehensive desktop automation framework designed
//! for AI agents to control computers through a CLI interface.
//!
//! # Architecture
//!
//! - **CLI**: Command-line interface for user interaction
//! - **Daemon**: Background service for automation
//! - **Components**: Pure domain logic (no side effects)
//! - **Services**: Effect layer (I/O operations)
//! - **Adapters**: External library wrappers
//!
//! # Example
//!
//! ```no_run
//! use computer_use::prelude::*;
//!
//! #[tokio::main]
//! async fn main() -> Result<()> {
//!     let config = Config::load()?;
//!     computer_use::cli::run().await
//! }
//! ```

// Core modules (always present)
pub mod config;
pub mod constants;
pub mod error;
pub mod prelude;
pub mod telemetry;
pub mod types;
pub mod utils;

// Layered architecture
pub mod components;
pub mod services;
pub mod adapters;

// Application modules
pub mod cli;
pub mod daemon;
pub mod ipc;
pub mod protocol;
pub mod recording;
pub mod selector;
pub mod snapshot;

// Feature modules
pub mod core;
pub mod advanced;
pub mod safety;
pub mod user_experience;
pub mod mobile;
pub mod team;

// Additional features
pub mod ai;
pub mod recording_service;
pub mod detection;
pub mod workflows;
pub mod collab;
pub mod plugins;
pub mod gestures;
pub mod voice;
pub mod features;

// Platform-specific modules
#[cfg(windows)]
pub mod uia;

// Optional modules
pub mod vision;

// Re-exports for convenience
pub use config::Config;
pub use error::{Error, Result};

/// Crate version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Crate name
pub const NAME: &str = env!("CARGO_PKG_NAME");
