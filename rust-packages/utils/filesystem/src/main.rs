//! Application entry point for `filesystem` CLI.
//!
//! This module serves as composition root, responsible for:
//! - Configuration loading
//! - Dependency injection and wiring
//! - Telemetry initialization
//! - Application orchestration
//!
//! Following strict architectural principles:
//! - All side effects are explicitly declared
//! - Dependencies are injected through constructors
//! - No global mutable state

use anyhow::{Context, Result};
use std::sync::Arc;

use filesystem::{
    config::FilesystemConfig,
    telemetry::{self, TelemetryGuard},
};

/// Application state container.
///
/// Holds all dependencies needed by application,
/// enabling proper dependency injection and testability.
struct App {
    _telemetry: TelemetryGuard,
    config: Arc<FilesystemConfig>,
}

impl App {
    /// Initialize application with given configuration.
    ///
    /// # Errors
    ///
    /// Returns an error if telemetry initialization fails.
    fn init(config: FilesystemConfig) -> Result<Self> {
        // Initialize telemetry first for proper logging
        let telemetry = TelemetryGuard::new(&config.logging)
            .context("Failed to initialize telemetry")?;

        tracing::info!(
            app.name = %config.app.name,
            app.version = %config.app.version,
            "Application starting"
        );

        // Validate configuration
        config.validate()
            .map_err(|e| anyhow::anyhow!("Configuration validation failed: {}", e))?;

        Ok(Self {
            _telemetry: telemetry,
            config: Arc::new(config),
        })
    }

    /// Run main application logic.
    ///
    /// # Errors
    ///
    /// Returns an error if application encounters a fatal error.
    async fn run(&self) -> Result<()> {
        tracing::info!("Application running");

        // Main application logic would go here
        // This is where you would:
        // - Parse CLI arguments
        // - Dispatch to appropriate commands
        // - Handle user interactions

        Ok(())
    }
}

/// Main entry point.
///
/// # Errors
///
/// Returns an error if application fails to start or encounters
/// a fatal error during execution.
#[tokio::main]
async fn main() -> Result<()> {
    // Load configuration from default sources
    let config = FilesystemConfig::load()
        .context("Failed to load configuration")?;

    // Initialize and run application
    let app = App::init(config)?;
    app.run().await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_app_init_with_default_config() {
        let config = FilesystemConfig::new();
        let result = App::init(config);
        // Should succeed with valid default config
        assert!(result.is_ok());
    }
}
