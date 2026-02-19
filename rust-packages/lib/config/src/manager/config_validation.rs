use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;

impl AppConfig {
    /// Validates the configuration.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` if the configuration is valid.
    ///
    /// # Errors
    ///
    /// Returns an error if the configuration is invalid.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// config.validate().unwrap();
    /// ```
    pub fn validate(&self) -> ConfigResult<()> {
        let current_version = crate::version::ConfigVersion::from_string(env!("CARGO_PKG_VERSION"))?;
        if !self.version.is_compatible_with(&current_version) {
            return Err(ConfigError::ValidationError(format!(
                "Config version {} is not compatible with app version {}",
                self.version.as_string(),
                current_version.as_string()
            )));
        }

        if self.pty.rows == 0 || self.pty.cols == 0 {
            return Err(ConfigError::ValidationError(
                "PTY rows and cols must be greater than 0".to_string(),
            ));
        }

        if self.appearance.font.size == 0 {
            return Err(ConfigError::ValidationError(
                "Font size must be greater than 0".to_string(),
            ));
        }

        Ok(())
    }

    /// Migrates the configuration to the current version.
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
    /// let mut config = AppConfig::load().unwrap();
    /// config.migrate().unwrap();
    /// ```
    pub fn migrate(&mut self) -> ConfigResult<()> {
        let current_version = crate::version::ConfigVersion::from_string(env!("CARGO_PKG_VERSION"))?;

        if self.version.major < current_version.major {
            self.migrate_to_version(&current_version)?;
        } else if self.version.minor < current_version.minor {
            self.migrate_to_version(&current_version)?;
        }

        self.version = current_version;
        Ok(())
    }

    fn migrate_to_version(&mut self, target_version: &crate::version::ConfigVersion) -> ConfigResult<()> {
        match (self.version.major, self.version.minor) {
            (0, _) => {
                self.version = crate::version::ConfigVersion::new(1, 0, 0);
            }
            _ => {}
        }

        Ok(())
    }
}
