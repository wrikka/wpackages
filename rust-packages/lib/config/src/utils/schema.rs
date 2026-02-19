//! Schema validation for configuration
//!
//! This module provides schema-based validation for configuration.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;

/// Represents a validation error.
#[derive(Debug, Clone)]
pub struct ValidationError {
    path: String,
    message: String,
    severity: ErrorSeverity,
}

/// Represents error severity.
#[derive(Debug, Clone, PartialEq)]
pub enum ErrorSeverity {
    Error,
    Warning,
    Info,
}

impl ValidationError {
    /// Creates a new validation error.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the field
    /// * `message` - The error message
    /// * `severity` - The error severity
    ///
    /// # Returns
    ///
    /// Returns a new validation error.
    pub fn new(path: String, message: String, severity: ErrorSeverity) -> Self {
        Self {
            path,
            message,
            severity,
        }
    }

    /// Returns the path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn path(&self) -> &str {
        &self.path
    }

    /// Returns the message.
    ///
    /// # Returns
    ///
    /// Returns the message.
    pub fn message(&self) -> &str {
        &self.message
    }

    /// Returns the severity.
    ///
    /// # Returns
    ///
    /// Returns the severity.
    pub fn severity(&self) -> &ErrorSeverity {
        &self.severity
    }
}

/// Validates configuration against schema.
///
/// # Arguments
///
/// * `config` - The configuration to validate
///
/// # Returns
///
/// Returns a list of validation errors.
///
/// # Example
///
/// ```no_run
/// use config::utils::schema::validate_schema;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let errors = validate_schema(&config);
/// for error in errors {
///     println!("{}: {}", error.path(), error.message());
/// }
/// ```
pub fn validate_schema(config: &AppConfig) -> Vec<ValidationError> {
    let mut errors = Vec::new();

    // Validate PTY configuration
    if config.pty.rows == 0 || config.pty.rows > 200 {
        errors.push(ValidationError::new(
            "pty.rows".to_string(),
            "PTY rows must be between 1 and 200".to_string(),
            ErrorSeverity::Error,
        ));
    }

    if config.pty.cols == 0 || config.pty.cols > 500 {
        errors.push(ValidationError::new(
            "pty.cols".to_string(),
            "PTY cols must be between 1 and 500".to_string(),
            ErrorSeverity::Error,
        ));
    }

    // Validate font configuration
    if config.appearance.font.size == 0 || config.appearance.font.size > 72 {
        errors.push(ValidationError::new(
            "appearance.font.size".to_string(),
            "Font size must be between 1 and 72".to_string(),
            ErrorSeverity::Error,
        ));
    }

    if config.appearance.font.line_height < 0.5 || config.appearance.font.line_height > 3.0 {
        errors.push(ValidationError::new(
            "appearance.font.line_height".to_string(),
            "Line height must be between 0.5 and 3.0".to_string(),
            ErrorSeverity::Warning,
        ));
    }

    // Validate window configuration
    if config.appearance.window.width == 0 || config.appearance.window.width > 10000 {
        errors.push(ValidationError::new(
            "appearance.window.width".to_string(),
            "Window width must be between 1 and 10000".to_string(),
            ErrorSeverity::Error,
        ));
    }

    if config.appearance.window.height == 0 || config.appearance.window.height > 10000 {
        errors.push(ValidationError::new(
            "appearance.window.height".to_string(),
            "Window height must be between 1 and 10000".to_string(),
            ErrorSeverity::Error,
        ));
    }

    // Validate advanced configuration
    if config.advanced.log_level != "trace"
        && config.advanced.log_level != "debug"
        && config.advanced.log_level != "info"
        && config.advanced.log_level != "warn"
        && config.advanced.log_level != "error"
    {
        errors.push(ValidationError::new(
            "advanced.log_level".to_string(),
            "Log level must be one of: trace, debug, info, warn, error".to_string(),
            ErrorSeverity::Error,
        ));
    }

    if config.advanced.max_log_size_mb == 0 || config.advanced.max_log_size_mb > 1000 {
        errors.push(ValidationError::new(
            "advanced.max_log_size_mb".to_string(),
            "Max log size must be between 1 and 1000".to_string(),
            ErrorSeverity::Warning,
        ));
    }

    if config.advanced.max_log_files == 0 || config.advanced.max_log_files > 100 {
        errors.push(ValidationError::new(
            "advanced.max_log_files".to_string(),
            "Max log files must be between 1 and 100".to_string(),
            ErrorSeverity::Warning,
        ));
    }

    // Validate clipboard configuration
    if config.clipboard.max_history == 0 || config.clipboard.max_history > 10000 {
        errors.push(ValidationError::new(
            "clipboard.max_history".to_string(),
            "Clipboard max history must be between 1 and 10000".to_string(),
            ErrorSeverity::Warning,
        ));
    }

    errors
}

/// Checks if configuration is valid.
///
/// # Arguments
///
/// * `config` - The configuration to validate
///
/// # Returns
///
/// Returns `Ok(())` if valid, `Err` with errors if invalid.
///
/// # Example
///
/// ```no_run
/// use config::utils::schema::validate_config;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// match validate_config(&config) {
///     Ok(()) => println!("Config is valid"),
///     Err(errors) => {
///         for error in errors {
///             println!("Error: {}", error.message());
///         }
///     }
/// }
/// ```
pub fn validate_config(config: &AppConfig) -> Result<(), Vec<ValidationError>> {
    let errors = validate_schema(config);

    let has_errors = errors.iter().any(|e| e.severity == ErrorSeverity::Error);

    if has_errors {
        Err(errors)
    } else {
        Ok(())
    }
}

/// Generates schema documentation.
///
/// # Returns
///
/// Returns schema documentation as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::schema::generate_schema_docs;
///
/// let docs = generate_schema_docs();
/// println!("{}", docs);
/// ```
pub fn generate_schema_docs() -> String {
    r#"
# Configuration Schema

## PTY Configuration

- `pty.rows` (u16): Number of rows (1-200)
- `pty.cols` (u16): Number of columns (1-500)
- `pty.shell` (String): Shell command
- `pty.args` (Vec<String>): Shell arguments
- `pty.env` (HashMap<String, String>): Environment variables

## Appearance Configuration

- `appearance.theme_id` (String): Theme identifier
- `appearance.theme_variant` (String): Theme variant
- `appearance.font.family` (String): Font family
- `appearance.font.size` (u32): Font size (1-72)
- `appearance.font.line_height` (f32): Line height (0.5-3.0)
- `appearance.font.letter_spacing` (f32): Letter spacing
- `appearance.window.width` (u32): Window width (1-10000)
- `appearance.window.height` (u32): Window height (1-10000)
- `appearance.window.x` (Option<i32>): Window X position
- `appearance.window.y` (Option<i32>): Window Y position
- `appearance.window.maximized` (bool): Maximized state
- `appearance.window.fullscreen` (bool): Fullscreen state
- `appearance.window.always_on_top` (bool): Always on top
- `appearance.window.title` (String): Window title
- `appearance.show_scrollbar` (bool): Show scrollbar
- `appearance.show_tab_bar` (bool): Show tab bar
- `appearance.show_status_bar` (bool): Show status bar
- `appearance.tab_bar_position` (String): Tab bar position

## Behavior Configuration

- `behavior.confirm_close` (bool): Confirm before closing
- `behavior.confirm_exit` (bool): Confirm before exit
- `behavior.auto_save` (bool): Auto save
- `behavior.restore_session` (bool): Restore session
- `behavior.shell_integration` (bool): Shell integration
- `behavior.copy_on_select` (bool): Copy on select
- `behavior.right_click_action` (String): Right click action

## Advanced Configuration

- `advanced.enable_gpu_acceleration` (bool): GPU acceleration
- `advanced.enable_telemetry` (bool): Telemetry
- `advanced.enable_error_reporting` (bool): Error reporting
- `advanced.log_level` (String): Log level (trace, debug, info, warn, error)
- `advanced.max_log_size_mb` (usize): Max log size (1-1000)
- `advanced.max_log_files` (usize): Max log files (1-100)
- `advanced.update_check` (bool): Update check

## Clipboard Configuration

- `clipboard.enable_clipboard` (bool): Enable clipboard
- `clipboard.max_history` (usize): Max history (1-10000)

## Hotkey Configuration

- `hotkeys.enable_hotkeys` (bool): Enable hotkeys
- `hotkeys.bindings` (Vec<Value>): Hotkey bindings

## Theme Configuration

- `theme.current_theme` (String): Current theme
- `theme.available_themes` (Vec<String>): Available themes

## Profile Configuration

- `profile.default_profile` (String): Default profile
- `profile.profiles` (Vec<String>): Profile list

## Custom Properties

- `custom_properties` (HashMap<String, Value>): Custom properties
"#
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_schema_valid() {
        let config = AppConfig::default();
        let errors = validate_schema(&config);

        let has_errors = errors.iter().any(|e| e.severity == ErrorSeverity::Error);
        assert!(!has_errors);
    }

    #[test]
    fn test_validate_config_valid() {
        let config = AppConfig::default();
        let result = validate_config(&config);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_config_invalid() {
        let mut config = AppConfig::default();
        config.pty.rows = 0;

        let result = validate_config(&config);
        assert!(result.is_err());
    }

    #[test]
    fn test_generate_schema_docs() {
        let docs = generate_schema_docs();
        assert!(docs.contains("Configuration Schema"));
    }
}
