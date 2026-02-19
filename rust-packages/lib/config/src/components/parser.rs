//! Configuration parsing component
//!
//! Pure functions for parsing configuration from different formats.

use figment::{
    providers::{Env, Format, Json, Toml},
    Figment,
};
use std::path::Path;

use super::super::error::{ConfigError, ConfigResult};
use super::super::types::{AppConfig, ConfigFormat};

/// Parses configuration from a file path.
///
/// # Arguments
///
/// * `path` - The path to the configuration file
/// * `env_prefix` - The environment variable prefix (e.g., "TERMINAL_")
///
/// # Returns
///
/// Returns the parsed `AppConfig`.
///
/// # Example
///
/// ```no_run
/// use config::components::parser::parse_config_from_path;
/// use std::path::Path;
///
/// let config = parse_config_from_path(Path::new("Config.toml"), "TERMINAL_").unwrap();
/// ```
pub fn parse_config_from_path<P: AsRef<Path>>(
    path: P,
    env_prefix: &str,
) -> ConfigResult<AppConfig> {
    let path = path.as_ref();
    if !path.exists() {
        return Err(ConfigError::NotFound(path.display().to_string()));
    }

    let format = if path.extension().and_then(|s| s.to_str()) == Some("json") {
        ConfigFormat::Json
    } else {
        ConfigFormat::Toml
    };

    parse_config(path, format, env_prefix)
}

/// Parses configuration from a file with a specific format.
///
/// # Arguments
///
/// * `path` - The path to the configuration file
/// * `format` - The configuration format
/// * `env_prefix` - The environment variable prefix
///
/// # Returns
///
/// Returns the parsed `AppConfig`.
pub fn parse_config<P: AsRef<Path>>(
    path: P,
    format: ConfigFormat,
    env_prefix: &str,
) -> ConfigResult<AppConfig> {
    let config: AppConfig = match format {
        ConfigFormat::Toml => Figment::new()
            .merge(Toml::file(path))
            .join(Env::prefixed(env_prefix).split("__"))
            .extract()?,
        ConfigFormat::Json => Figment::new()
            .merge(Json::file(path))
            .join(Env::prefixed(env_prefix).split("__"))
            .extract()?,
    };

    Ok(config)
}

/// Serializes configuration to a string.
///
/// # Arguments
///
/// * `config` - The configuration to serialize
/// * `format` - The output format
///
/// # Returns
///
/// Returns the serialized configuration string.
pub fn serialize_config(config: &AppConfig, format: ConfigFormat) -> ConfigResult<String> {
    match format {
        ConfigFormat::Toml => toml::to_string_pretty(config)
            .map_err(|e| ConfigError::ParseError(e.to_string())),
        ConfigFormat::Json => serde_json::to_string_pretty(config)
            .map_err(|e| ConfigError::ParseError(e.to_string())),
    }
}
