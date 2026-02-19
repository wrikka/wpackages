//! # AI TUI - Entry Point
//!
//! This is the main entry point for the AI TUI application.
//!
//! ## Application Flow
//!
//! 1. Initialize telemetry (logging/tracing)
//! 2. Load configuration from Config.toml and environment
//! 3. Create and run the AI TUI application
//!
//! ## Environment Variables
//!
//! - `RUST_LOG` - Set log level (default: info)
//! - `APP_LOGGING__LEVEL` - Override logging level
//! - `APP_APP__NAME` - Override application name
//!
//! ## Key Bindings
//!
//! - `q` - Quit application
//! - `Ctrl+P` - Open command palette
//! - `j/k` - Scroll chat panel up/down
//! - `↑/↓` - Navigate file explorer
//! - `Enter` - Send message / Execute command
//! - `Esc` - Close command palette

use ai_tui::prelude::*;
use ai_tui::{app::TuiApp, config::AppConfig, telemetry};
use anyhow::Context;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize telemetry first
    telemetry::init_subscriber();

    // Load configuration
    let config = AppConfig::load().context("Failed to load configuration")?;

    // Log startup information
    info!("{} v{}", config.app.name, config.app.version);
    info!("Starting AI TUI...");
    info!("Log level set to: {}", config.logging.level);
    info!("AI provider set to: {}", config.ai.provider);

    // Create and run the AI TUI application
    let mut app = TuiApp::new(config)
        .await
        .context("Failed to create AI TUI app")?;
    app.run().await.context("Application failed to run")?;

    // Cleanup terminal
    app.cleanup().context("Failed to cleanup terminal")?;

    info!("Application exited gracefully.");

    Ok(())
}
