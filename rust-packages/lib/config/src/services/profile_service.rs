//! Profile service for configuration management
//!
//! Service for managing configuration profiles.

use std::path::{Path, PathBuf};
use std::collections::HashMap;

use super::super::error::{ConfigError, ConfigResult};
use super::super::profile::ConfigProfile;
use super::file_service::FileService;

/// Profile service for managing configuration profiles.
pub struct ProfileService {
    profiles_dir: PathBuf,
}

impl ProfileService {
    /// Creates a new profile service.
    ///
    /// # Arguments
    ///
    /// * `profiles_dir` - The directory containing profile configurations
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::profile_service::ProfileService;
    /// use std::path::Path;
    ///
    /// let service = ProfileService::new(Path::new("profiles"));
    /// ```
    pub fn new<P: AsRef<Path>>(profiles_dir: P) -> Self {
        Self {
            profiles_dir: profiles_dir.as_ref().to_path_buf(),
        }
    }

    /// Lists all available profiles.
    ///
    /// # Returns
    ///
    /// Returns a vector of profile names.
    pub fn list_profiles(&self) -> ConfigResult<Vec<String>> {
        let mut profiles = Vec::new();

        if !self.profiles_dir.exists() {
            return Ok(profiles);
        }

        for entry in std::fs::read_dir(&self.profiles_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("toml") {
                if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                    profiles.push(name.to_string());
                }
            }
        }

        profiles.sort();
        Ok(profiles)
    }

    /// Loads a profile by name.
    ///
    /// # Arguments
    ///
    /// * `name` - The profile name
    ///
    /// # Returns
    ///
    /// Returns the loaded profile.
    pub fn load_profile(&self, name: &str) -> ConfigResult<ConfigProfile> {
        let path = self.profiles_dir.join(format!("{}.toml", name));

        if !path.exists() {
            return Err(ConfigError::NotFound(format!("Profile '{}' not found", name)));
        }

        let content = std::fs::read_to_string(&path)?;
        let profile: ConfigProfile = toml::from_str(&content)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;

        Ok(profile)
    }

    /// Saves a profile.
    ///
    /// # Arguments
    ///
    /// * `name` - The profile name
    /// * `profile` - The profile to save
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::services::profile_service::ProfileService;
    /// use config::profile::ConfigProfile;
    /// use std::path::Path;
    ///
    /// let service = ProfileService::new(Path::new("profiles"));
    /// let profile = ConfigProfile::default();
    /// service.save_profile("my_profile", &profile).unwrap();
    /// ```
    pub fn save_profile(&self, name: &str, profile: &ConfigProfile) -> ConfigResult<()> {
        std::fs::create_dir_all(&self.profiles_dir)?;

        let path = self.profiles_dir.join(format!("{}.toml", name));
        let content = toml::to_string_pretty(profile)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;

        std::fs::write(&path, content)?;
        Ok(())
    }

    /// Deletes a profile.
    ///
    /// # Arguments
    ///
    /// * `name` - The profile name to delete
    pub fn delete_profile(&self, name: &str) -> ConfigResult<()> {
        let path = self.profiles_dir.join(format!("{}.toml", name));

        if !path.exists() {
            return Err(ConfigError::NotFound(format!("Profile '{}' not found", name)));
        }

        std::fs::remove_file(&path)?;
        Ok(())
    }

    /// Checks if a profile exists.
    ///
    /// # Arguments
    ///
    /// * `name` - The profile name to check
    ///
    /// # Returns
    ///
    /// Returns `true` if the profile exists, `false` otherwise.
    pub fn profile_exists(&self, name: &str) -> bool {
        let path = self.profiles_dir.join(format!("{}.toml", name));
        path.exists()
    }
}
