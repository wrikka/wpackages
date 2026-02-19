//! Configuration validation component
//!
//! Pure functions for validating configuration structures.

use super::super::error::{ConfigError, ConfigResult};
use super::super::types::AppConfig;
use super::super::version::ConfigVersion;

/// Validates an application configuration.
///
/// # Arguments
///
/// * `config` - The configuration to validate
/// * `app_version` - The current application version
///
/// # Returns
///
/// Returns `Ok(())` if the configuration is valid, or an error otherwise.
///
/// # Example
///
/// ```no_run
/// use config::components::validator::validate_config;
/// use config::types::AppConfig;
/// use config::version::ConfigVersion;
///
/// let config = AppConfig::default();
/// let version = ConfigVersion::new(1, 0, 0);
/// validate_config(&config, &version).unwrap();
/// ```
pub fn validate_config(config: &AppConfig, app_version: &ConfigVersion) -> ConfigResult<()> {
    if !config.version.is_compatible_with(app_version) {
        return Err(ConfigError::ValidationError(format!(
            "Config version {} is not compatible with app version {}",
            config.version.as_string(),
            app_version.as_string()
        )));
    }

    if config.pty.rows == 0 || config.pty.cols == 0 {
        return Err(ConfigError::ValidationError(
            "PTY rows and cols must be greater than 0".to_string(),
        ));
    }

    if config.appearance.font.size == 0 {
        return Err(ConfigError::ValidationError(
            "Font size must be greater than 0".to_string(),
        ));
    }

    if config.appearance.window.width == 0 || config.appearance.window.height == 0 {
        return Err(ConfigError::ValidationError(
            "Window width and height must be greater than 0".to_string(),
        ));
    }

    Ok(())
}

/// Validates a font configuration.
///
/// # Arguments
///
/// * `font` - The font configuration to validate
///
/// # Returns
///
/// Returns `Ok(())` if the font configuration is valid, or an error otherwise.
pub fn validate_font_config(font: &super::super::types::FontConfig) -> ConfigResult<()> {
    if font.family.is_empty() {
        return Err(ConfigError::ValidationError(
            "Font family cannot be empty".to_string(),
        ));
    }

    if font.size == 0 {
        return Err(ConfigError::ValidationError(
            "Font size must be greater than 0".to_string(),
        ));
    }

    if font.line_height <= 0.0 {
        return Err(ConfigError::ValidationError(
            "Line height must be greater than 0".to_string(),
        ));
    }

    Ok(())
}

/// Validates a window configuration.
///
/// # Arguments
///
/// * `window` - The window configuration to validate
///
/// # Returns
///
/// Returns `Ok(())` if the window configuration is valid, or an error otherwise.
pub fn validate_window_config(window: &super::super::types::WindowConfig) -> ConfigResult<()> {
    if window.width == 0 || window.height == 0 {
        return Err(ConfigError::ValidationError(
            "Window width and height must be greater than 0".to_string(),
        ));
    }

    if window.title.is_empty() {
        return Err(ConfigError::ValidationError(
            "Window title cannot be empty".to_string(),
        ));
    }

    Ok(())
}
