//! 12-Factor App Support for Configuration
//!
//! This module provides 12-factor application configuration support.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;
use std::collections::HashMap;

/// Represents a 12-factor configuration source.
#[derive(Debug, Clone)]
pub struct TwelveFactorConfig {
    env_prefix: String,
    config: AppConfig,
}

impl TwelveFactorConfig {
    /// Creates a new 12-factor configuration.
    ///
    /// # Arguments
    ///
    /// * `env_prefix` - The environment variable prefix
    ///
    /// # Returns
    ///
    /// Returns a new configuration.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::twelve_factor::TwelveFactorConfig;
    ///
    /// let config = TwelveFactorConfig::new("APP_");
    /// ```
    pub fn new(env_prefix: String) -> Self {
        Self {
            env_prefix,
            config: AppConfig::default(),
        }
    }

    /// Loads configuration from environment variables.
    ///
    /// # Returns
    ///
    /// Returns the loaded configuration.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::twelve_factor::TwelveFactorConfig;
    ///
    /// let mut config = TwelveFactorConfig::new("APP_");
    /// let loaded = config.load_from_env().unwrap();
    /// ```
    pub fn load_from_env(&mut self) -> ConfigResult<AppConfig> {
        // Load appearance settings
        if let Ok(theme_id) = std::env::var(&format!("{}THEME_ID", self.env_prefix)) {
            self.config.appearance.theme_id = theme_id;
        }

        if let Ok(font_size) = std::env::var(&format!("{}FONT_SIZE", self.env_prefix)) {
            if let Ok(size) = font_size.parse::<u32>() {
                self.config.appearance.font.size = size;
            }
        }

        // Load behavior settings
        if let Ok(auto_save) = std::env::var(&format!("{}AUTO_SAVE", self.env_prefix)) {
            if let Ok(val) = auto_save.parse::<bool>() {
                self.config.behavior.auto_save = val;
            }
        }

        if let Ok(confirm_close) = std::env::var(&format!("{}CONFIRM_CLOSE", self.env_prefix)) {
            if let Ok(val) = confirm_close.parse::<bool>() {
                self.config.behavior.confirm_close = val;
            }
        }

        // Load PTY settings
        if let Ok(shell) = std::env::var(&format!("{}SHELL", self.env_prefix)) {
            self.config.pty.shell = shell;
        }

        if let Ok(rows) = std::env::var(&format!("{}PTY_ROWS", self.env_prefix)) {
            if let Ok(val) = rows.parse::<u16>() {
                self.config.pty.rows = val;
            }
        }

        if let Ok(cols) = std::env::var(&format!("{}PTY_COLS", self.env_prefix)) {
            if let Ok(val) = cols.parse::<u16>() {
                self.config.pty.cols = val;
            }
        }

        // Load advanced settings
        if let Ok(log_level) = std::env::var(&format!("{}LOG_LEVEL", self.env_prefix)) {
            self.config.advanced.log_level = log_level;
        }

        if let Ok(enable_telemetry) = std::env::var(&format!("{}TELEMETRY", self.env_prefix)) {
            if let Ok(val) = enable_telemetry.parse::<bool>() {
                self.config.advanced.enable_telemetry = val;
            }
        }

        Ok(self.config.clone())
    }

    /// Returns the environment variable prefix.
    ///
    /// # Returns
    ///
    /// Returns the prefix.
    pub fn env_prefix(&self) -> &str {
        &self.env_prefix
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }
}

/// Represents an environment variable mapping.
#[derive(Debug, Clone)]
pub struct EnvVarMapping {
    env_var: String,
    config_path: String,
    description: String,
}

impl EnvVarMapping {
    /// Creates a new environment variable mapping.
    ///
    /// # Arguments
    ///
    /// * `env_var` - The environment variable name
    /// * `config_path` - The configuration path
    /// * `description` - The mapping description
    ///
    /// # Returns
    ///
    /// Returns a new mapping.
    pub fn new(env_var: String, config_path: String, description: String) -> Self {
        Self {
            env_var,
            config_path,
            description,
        }
    }

    /// Returns the environment variable name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn env_var(&self) -> &str {
        &self.env_var
    }

    /// Returns the configuration path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn config_path(&self) -> &str {
        &self.config_path
    }

    /// Returns the description.
    ///
    /// # Returns
    ///
    /// Returns the description.
    pub fn description(&self) -> &str {
        &self.description
    }
}

/// Returns environment variable mappings for configuration.
///
/// # Returns
///
/// Returns a list of mappings.
///
/// # Example
///
/// ```no_run
/// use config::utils::twelve_factor::get_env_mappings;
///
/// let mappings = get_env_mappings();
/// for mapping in mappings {
///     println!("{} -> {} ({})", mapping.env_var(), mapping.config_path(), mapping.description());
/// }
/// ```
pub fn get_env_mappings() -> Vec<EnvVarMapping> {
    vec![
        EnvVarMapping::new(
            "APP_THEME_ID".to_string(),
            "appearance.theme_id".to_string(),
            "Theme identifier".to_string(),
        ),
        EnvVarMapping::new(
            "APP_FONT_SIZE".to_string(),
            "appearance.font.size".to_string(),
            "Font size".to_string(),
        ),
        EnvVarMapping::new(
            "APP_AUTO_SAVE".to_string(),
            "behavior.auto_save".to_string(),
            "Auto save setting".to_string(),
        ),
        EnvVarMapping::new(
            "APP_CONFIRM_CLOSE".to_string(),
            "behavior.confirm_close".to_string(),
            "Confirm before closing".to_string(),
        ),
        EnvVarMapping::new(
            "APP_SHELL".to_string(),
            "pty.shell".to_string(),
            "Shell command".to_string(),
        ),
        EnvVarMapping::new(
            "APP_PTY_ROWS".to_string(),
            "pty.rows".to_string(),
            "PTY rows".to_string(),
        ),
        EnvVarMapping::new(
            "APP_PTY_COLS".to_string(),
            "pty.cols".to_string(),
            "PTY columns".to_string(),
        ),
        EnvVarMapping::new(
            "APP_LOG_LEVEL".to_string(),
            "advanced.log_level".to_string(),
            "Log level".to_string(),
        ),
        EnvVarMapping::new(
            "APP_TELEMETRY".to_string(),
            "advanced.enable_telemetry".to_string(),
            "Enable telemetry".to_string(),
        ),
    ]
}

/// Generates environment variable documentation.
///
/// # Returns
///
/// Returns the documentation as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::twelve_factor::generate_env_docs;
///
/// let docs = generate_env_docs();
/// println!("{}", docs);
/// ```
pub fn generate_env_docs() -> String {
    let mut docs = String::new();

    docs.push_str("# Environment Variables\n\n");
    docs.push_str("The following environment variables can be used to configure the application:\n\n");

    for mapping in get_env_mappings() {
        docs.push_str(&format!(
            "## {}\n\
             **Path**: `{}`\n\
             **Description**: {}\n\n",
            mapping.env_var(),
            mapping.config_path(),
            mapping.description()
        ));
    }

    docs
}

/// Validates environment variables.
///
/// # Returns
///
/// Returns `Ok(())` if valid, `Err` with errors if invalid.
///
/// # Example
///
/// ```no_run
/// use config::utils::twelve_factor::validate_env_vars;
///
/// match validate_env_vars() {
///     Ok(()) => println!("Valid"),
///     Err(errors) => println!("Invalid: {:?}", errors),
/// }
/// ```
pub fn validate_env_vars() -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    // Validate font size
    if let Ok(font_size_str) = std::env::var("APP_FONT_SIZE") {
        if let Err(_) = font_size_str.parse::<u32>() {
            errors.push("APP_FONT_SIZE must be a valid number".to_string());
        }
    }

    // Validate PTY rows
    if let Ok(rows_str) = std::env::var("APP_PTY_ROWS") {
        if let Err(_) = rows_str.parse::<u16>() {
            errors.push("APP_PTY_ROWS must be a valid number".to_string());
        }
    }

    // Validate PTY cols
    if let Ok(cols_str) = std::env::var("APP_PTY_COLS") {
        if let Err(_) = cols_str.parse::<u16>() {
            errors.push("APP_PTY_COLS must be a valid number".to_string());
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// Creates a .env.example file.
///
/// # Returns
///
/// Returns the .env.example content.
///
/// # Example
///
/// ```no_run
/// use config::utils::twelve_factor::create_env_example;
///
/// let example = create_env_example();
/// println!("{}", example);
/// ```
pub fn create_env_example() -> String {
    let mut example = String::new();

    example.push_str("# Application Configuration\n\n");
    example.push_str("# Theme Settings\n");
    example.push_str("APP_THEME_ID=default-dark\n");
    example.push_str("APP_FONT_SIZE=14\n\n");

    example.push_str("# Behavior Settings\n");
    example.push_str("APP_AUTO_SAVE=true\n");
    example.push_str("APP_CONFIRM_CLOSE=false\n\n");

    example.push_str("# PTY Settings\n");
    example.push_str("APP_SHELL=powershell.exe\n");
    example.push_str("APP_PTY_ROWS=24\n");
    example.push_str("APP_PTY_COLS=80\n\n");

    example.push_str("# Advanced Settings\n");
    example.push_str("APP_LOG_LEVEL=info\n");
    example.push_str("APP_TELEMETRY=false\n");

    example
}

/// Loads configuration from a .env file.
///
/// # Arguments
///
/// * `path` - The path to the .env file
///
/// # Returns
///
/// Returns the loaded configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::twelve_factor::load_from_env_file;
///
/// let config = load_from_env_file(".env").unwrap();
/// ```
pub fn load_from_env_file<P: AsRef<std::path::Path>>(path: P) -> ConfigResult<AppConfig> {
    let path = path.as_ref();

    if !path.exists() {
        return Err(ConfigError::NotFound(path.display().to_string()));
    }

    let content = std::fs::read_to_string(path)?;

    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim();

            // Remove quotes if present
            let value = value.trim_matches('"').trim_matches('\'');

            std::env::set_var(key, value);
        }
    }

    let mut twelve_factor = TwelveFactorConfig::new("APP_".to_string());
    twelve_factor.load_from_env()
}

/// Exports configuration to environment variables.
///
/// # Arguments
///
/// * `config` - The configuration to export
/// # Returns
///
/// Returns a map of environment variables.
///
/// # Example
///
/// ```no_run
/// use config::utils::twelve_factor::export_to_env;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let env_vars = export_to_env(&config);
/// for (key, value) in env_vars {
///     println!("{}={}", key, value);
/// }
/// ```
pub fn export_to_env(config: &AppConfig) -> HashMap<String, String> {
    let mut env_vars = HashMap::new();

    env_vars.insert("APP_THEME_ID".to_string(), config.appearance.theme_id.clone());
    env_vars.insert("APP_FONT_SIZE".to_string(), config.appearance.font.size.to_string());
    env_vars.insert("APP_AUTO_SAVE".to_string(), config.behavior.auto_save.to_string());
    env_vars.insert("APP_CONFIRM_CLOSE".to_string(), config.behavior.confirm_close.to_string());
    env_vars.insert("APP_SHELL".to_string(), config.pty.shell.clone());
    env_vars.insert("APP_PTY_ROWS".to_string(), config.pty.rows.to_string());
    env_vars.insert("APP_PTY_COLS".to_string(), config.pty.cols.to_string());
    env_vars.insert("APP_LOG_LEVEL".to_string(), config.advanced.log_level.clone());
    env_vars.insert("APP_TELEMETRY".to_string(), config.advanced.enable_telemetry.to_string());

    env_vars
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_twelve_factor_config_new() {
        let config = TwelveFactorConfig::new("APP_".to_string());
        assert_eq!(config.env_prefix(), "APP_");
    }

    #[test]
    fn test_get_env_mappings() {
        let mappings = get_env_mappings();
        assert!(!mappings.is_empty());
        assert!(mappings.iter().any(|m| m.env_var() == "APP_THEME_ID"));
    }

    #[test]
    fn test_generate_env_docs() {
        let docs = generate_env_docs();
        assert!(docs.contains("Environment Variables"));
    }

    #[test]
    fn test_create_env_example() {
        let example = create_env_example();
        assert!(example.contains("APP_THEME_ID"));
        assert!(example.contains("APP_FONT_SIZE"));
    }

    #[test]
    fn test_export_to_env() {
        let config = AppConfig::default();
        let env_vars = export_to_env(&config);
        assert!(!env_vars.is_empty());
        assert!(env_vars.contains_key("APP_THEME_ID"));
    }
}
