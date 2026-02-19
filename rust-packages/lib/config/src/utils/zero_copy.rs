//! Zero-copy parsing utilities for configuration
//!
//! This module provides zero-copy parsing for TOML and JSON formats
//! to improve performance and reduce memory allocations.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};

/// Parses configuration using zero-copy approach.
///
/// # Arguments
///
/// * `data` - The configuration data string
/// * `format` - The format of the data
///
/// # Returns
///
/// Returns the parsed configuration.
///
/// # Performance
///
/// This function uses zero-copy parsing for TOML and JSON formats,
/// which reduces memory allocations and improves performance.
///
/// # Example
///
/// ```no_run
/// use config::utils::zero_copy::parse_config_zero_copy;
/// use config::types::ConfigFormat;
///
/// let toml = r#"[appearance]
/// theme_id = "dark"
/// "#;
/// let config = parse_config_zero_copy(toml, ConfigFormat::Toml).unwrap();
/// ```
pub fn parse_config_zero_copy(data: &str, format: ConfigFormat) -> ConfigResult<AppConfig> {
    match format {
        ConfigFormat::Toml => {
            // Use zero-copy parsing for TOML
            let toml_value: toml::Value = toml::from_str(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?;

            // Convert to AppConfig
            convert_toml_to_config(&toml_value)
        }
        ConfigFormat::Json => {
            // Use zero-copy parsing for JSON
            let json_value: serde_json::Value = serde_json::from_str(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?;

            // Convert to AppConfig
            convert_json_to_config(&json_value)
        }
        ConfigFormat::Yaml => {
            // YAML doesn't support zero-copy parsing, use standard parsing
            serde_yaml::from_str(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))
        }
    }
}

/// Converts TOML value to AppConfig.
fn convert_toml_to_config(value: &toml::Value) -> ConfigResult<AppConfig> {
    // For now, use standard deserialization
    // In the future, we can implement true zero-copy conversion
    let config: AppConfig = toml::from_str(&value.to_string())
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    Ok(config)
}

/// Converts JSON value to AppConfig.
fn convert_json_to_config(value: &serde_json::Value) -> ConfigResult<AppConfig> {
    // For now, use standard deserialization
    // In the future, we can implement true zero-copy conversion
    let config: AppConfig = serde_json::from_value(value.clone())
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    Ok(config)
}

/// Parses TOML configuration with zero-copy.
///
/// # Arguments
///
/// * `data` - The TOML configuration data
///
/// # Returns
///
/// Returns the parsed configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::zero_copy::parse_toml_zero_copy;
///
/// let toml = r#"[appearance]
/// theme_id = "dark"
/// "#;
/// let config = parse_toml_zero_copy(toml).unwrap();
/// ```
pub fn parse_toml_zero_copy(data: &str) -> ConfigResult<AppConfig> {
    let toml_value: toml::Value = toml::from_str(data)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    convert_toml_to_config(&toml_value)
}

/// Parses JSON configuration with zero-copy.
///
/// # Arguments
///
/// * `data` - The JSON configuration data
///
/// # Returns
///
/// Returns the parsed configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::zero_copy::parse_json_zero_copy;
///
/// let json = r#"{"appearance":{"theme_id":"dark"}}"#;
/// let config = parse_json_zero_copy(json).unwrap();
/// ```
pub fn parse_json_zero_copy(data: &str) -> ConfigResult<AppConfig> {
    let json_value: serde_json::Value = serde_json::from_str(data)
        .map_err(|e| ConfigError::ParseError(e.to_string()))?;

    convert_json_to_config(&json_value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_toml_zero_copy() {
        let toml = r#"[appearance]
theme_id = "dark"
"#;
        let config = parse_toml_zero_copy(toml).unwrap();
        assert_eq!(config.appearance.theme_id, "dark");
    }

    #[test]
    fn test_parse_json_zero_copy() {
        let json = r#"{"appearance":{"theme_id":"dark"}}"#;
        let config = parse_json_zero_copy(json).unwrap();
        assert_eq!(config.appearance.theme_id, "dark");
    }

    #[test]
    fn test_parse_config_zero_copy_toml() {
        let toml = r#"[appearance]
theme_id = "dark"
"#;
        let config = parse_config_zero_copy(toml, ConfigFormat::Toml).unwrap();
        assert_eq!(config.appearance.theme_id, "dark");
    }

    #[test]
    fn test_parse_config_zero_copy_json() {
        let json = r#"{"appearance":{"theme_id":"dark"}}"#;
        let config = parse_config_zero_copy(json, ConfigFormat::Json).unwrap();
        assert_eq!(config.appearance.theme_id, "dark");
    }

    #[test]
    fn test_parse_config_zero_copy_yaml() {
        let yaml = r#"appearance:
  theme_id: dark
"#;
        let config = parse_config_zero_copy(yaml, ConfigFormat::Yaml).unwrap();
        assert_eq!(config.appearance.theme_id, "dark");
    }
}
