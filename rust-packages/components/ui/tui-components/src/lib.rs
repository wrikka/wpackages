//! # TUI Components
//!
//! Reusable TUI components built with ratatui.
//!
//! ## Features
//!
//! - **Command Palette**: Fuzzy search with categories and history
//! - **File Explorer**: Navigation with breadcrumbs and search
//! - **Chat Panel**: Syntax highlighting with timestamps
//! - **Theme System**: Customizable themes
//! - **Status Bar**: Status display
//! - **Plan Panel**: Execution plan display with approval workflow

pub mod chat_panel;
pub mod command_palette;
pub mod config;
pub mod error;
pub mod file_explorer;
pub mod plan_panel;
pub mod prelude;
pub mod status_bar;
pub mod telemetry;
pub mod theme;
pub mod types;

// Re-export public APIs
pub use config::AppConfig;
pub use error::{Result, TuiComponentsError};
pub use types::{AppMode, ExecutionMode, ExecutionPlan, FocusPanel, PlanStatus};

#[cfg(test)]
mod types_tests;
