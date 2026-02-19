//! Adapters Module
//!
//! This module contains wrappers for external libraries and third-party services.
//! Adapters isolate the application from external dependencies, making it easier to
//! test and replace implementations.

pub mod database;
pub mod filesystem;
pub mod network;

pub use database::*;
pub use filesystem::*;
pub use network::*;
