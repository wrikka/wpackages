//! Application Layer
//!
//! Orchestrates business flows and composes the application.

use wai_config::config::AppConfig;
use wai_config::error::ConfigError;
use wai_config::manager::ConfigManager;
use wai_config::telemetry::init_subscriber;

/// Application entry point.
pub struct App {
    config: AppConfig,
    manager: ConfigManager,
}

impl App {
    /// Creates a new application instance.
    pub fn new() -> Result<Self, ConfigError> {
        init_subscriber();

        let config = AppConfig::load()?;
        let manager = ConfigManager::new()?;

        Ok(Self { config, manager })
    }

    /// Runs the application.
    pub fn run(&self) -> Result<(), ConfigError> {
        tracing::info!("Starting application");
        
        // Application logic here
        
        Ok(())
    }

    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns the config manager.
    pub fn manager(&self) -> &ConfigManager {
        &self.manager
    }
}

impl Default for App {
    fn default() -> Self {
        Self::new().expect("Failed to create app")
    }
}
