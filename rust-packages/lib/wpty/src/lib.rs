//! # wpty
//!
//! PTY management for wterminal.

extern crate napi_derive;

// --- Modules
pub mod adapters;
pub mod app;
pub mod config;
pub mod constants;
pub mod error;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// --- Public API
pub use app::PtySession;
pub use types::{
    Command, ExitEvent, Hyperlink, Keybinding, PtyConfig, PtySize, ShellIntegrationCommand,
    ShellIntegrationEvent, Theme, TriggerSpec,
};
