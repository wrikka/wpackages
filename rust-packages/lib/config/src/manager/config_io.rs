use figment::{
    providers::{Env, Format, Json, Toml},
    Figment,
};
use std::path::{Path, PathBuf};

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};

impl AppConfig {
    /// Loads configuration from the default path ("Config.toml").
    ///
    /// # Returns
    ///
    /// Returns the loaded `AppConfig`.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::load().unwrap();
    /// ```
    pub fn load() -> ConfigResult<Self> {
        Self::load_from_path("Config.toml")
    }

    /// Loads configuration from a specific path.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to the configuration file
    ///
    /// # Returns
    ///
    /// Returns the loaded `AppConfig`.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::load_from_path("my_config.toml").unwrap();
    /// ```
    pub fn load_from_path<P: AsRef<Path>>(path: P) -> ConfigResult<Self> {
        let path = path.as_ref();
        if !path.exists() {
            return Err(ConfigError::NotFound(path.display().to_string()));
        }

        let format = if path.extension().and_then(|s| s.to_str()) == Some("json") {
            ConfigFormat::Json
        } else if path.extension().and_then(|s| s.to_str()) == Some("yaml") || path.extension().and_then(|s| s.to_str()) == Some("yml") {
            ConfigFormat::Yaml
        } else {
            ConfigFormat::Toml
        };

        let config: Self = match format {
            ConfigFormat::Toml => Figment::new()
                .merge(Toml::file(path))
                .join(Env::prefixed("TERMINAL_").split("__"))
                .extract()?,
            ConfigFormat::Json => Figment::new()
                .merge(Json::file(path))
                .join(Env::prefixed("TERMINAL_").split("__"))
                .extract()?,
            ConfigFormat::Yaml => {
                let content = std::fs::read_to_string(path)?;
                serde_yaml::from_str(&content)
                    .map_err(|e| ConfigError::ParseError(e.to_string()))?
            }
        };

        Ok(config)
    }

    /// Saves configuration to the default path ("Config.toml").
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// config.save().unwrap();
    /// ```
    pub fn save(&self) -> ConfigResult<()> {
        self.save_to_path("Config.toml", ConfigFormat::Toml)
    }

    /// Saves configuration to a specific path.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to save the configuration to
    /// * `format` - The format to save in
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::{AppConfig, ConfigFormat};
    ///
    /// let config = AppConfig::default();
    /// config.save_to_path("my_config.json", ConfigFormat::Json).unwrap();
    /// ```
    pub fn save_to_path<P: AsRef<Path>>(
        &self,
        path: P,
        format: ConfigFormat,
    ) -> ConfigResult<()> {
        let path = path.as_ref();

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let content = match format {
            ConfigFormat::Toml => toml::to_string_pretty(self)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?,
            ConfigFormat::Json => serde_json::to_string_pretty(self)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?,
            ConfigFormat::Yaml => serde_yaml::to_string(self)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?,
        };

        std::fs::write(path, content)?;
        Ok(())
    }

    /// Exports the configuration to a string.
    ///
    /// # Arguments
    ///
    /// * `format` - The format to export to
    ///
    /// # Returns
    ///
    /// Returns the serialized configuration string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::{AppConfig, ConfigFormat};
    ///
    /// let config = AppConfig::default();
    /// let toml = config.export(ConfigFormat::Toml).unwrap();
    /// ```
    pub fn export(&self, format: ConfigFormat) -> ConfigResult<String> {
        match format {
            ConfigFormat::Toml => toml::to_string_pretty(self)
                .map_err(|e| ConfigError::ParseError(e.to_string())),
            ConfigFormat::Json => serde_json::to_string_pretty(self)
                .map_err(|e| ConfigError::ParseError(e.to_string())),
            ConfigFormat::Yaml => serde_yaml::to_string(self)
                .map_err(|e| ConfigError::ParseError(e.to_string())),
        }
    }

    /// Imports configuration from a string.
    ///
    /// # Arguments
    ///
    /// * `data` - The configuration data string
    /// * `format` - The format of the data
    ///
    /// # Returns
    ///
    /// Returns the imported `AppConfig`.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::{AppConfig, ConfigFormat};
    ///
    /// let toml = r#"[appearance]
    /// theme_id = "dark"
    /// "#;
    /// let config = AppConfig::import(toml, ConfigFormat::Toml).unwrap();
    /// ```
    pub fn import(data: &str, format: ConfigFormat) -> ConfigResult<Self> {
        let config: Self = match format {
            ConfigFormat::Toml => toml::from_str(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?,
            ConfigFormat::Json => serde_json::from_str(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?,
            ConfigFormat::Yaml => serde_yaml::from_str(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?,
        };

        config.validate()?;
        Ok(config)
    }
}
