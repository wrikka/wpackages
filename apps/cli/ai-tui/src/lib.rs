//! # AI TUI
//!
//! A modern AI-powered Terminal User Interface (TUI) built with Rust.
//!
//! ## Features
//!
//! - **AI Integration**: Full AI/ML capabilities with streaming responses
//! - **Code Understanding**: Deep code analysis with parsers and embeddings
//! - **MCP Support**: Model Context Protocol for extensibility
//! - **Git Integration**: Complete git workflow support
//! - **Command Palette**: Fuzzy search with categories and history
//! - **Chat Panel**: Syntax highlighting with timestamps
//! - **File Explorer**: Navigation with breadcrumbs and search
//!
//! ## Architecture
//!
//! The application follows Rust best practices:
//! - **Error Handling**: Uses `thiserror` for custom errors
//! - **Configuration**: Uses `figment` for multi-source config
//! - **Observability**: Uses `tracing` for structured logging
//! - **Async Runtime**: Uses `tokio` for async operations
//!
//! ## Usage
//!
//! ```no_run
//! use ai_tui::config::AppConfig;
//! use ai_tui::telemetry;
//! use ai_tui::app::TuiApp;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     telemetry::init_subscriber();
//!     let config = AppConfig::load()?;
//!     let mut app = TuiApp::new().await?;
//!     app.run()?;
//!     Ok(())
//! }
//! ```

pub mod adapters;
pub mod app;
pub mod components;
pub mod config;
pub mod constants;
pub mod error;
pub mod prelude;
pub mod services;
pub mod telemetry;
pub mod types;
pub mod utils;

// Public API re-exports
pub use app::TuiApp;
pub use config::AppConfig;
pub use error::{AppError, Result};
