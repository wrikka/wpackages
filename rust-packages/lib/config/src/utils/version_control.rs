//! Configuration version control
//!
//! This module provides version control for configuration.

use crate::types::AppConfig;
use std::collections::HashMap;

/// Represents a configuration version.
#[derive(Debug, Clone)]
pub struct ConfigVersionEntry {
    version: u32,
    timestamp: String,
    config: AppConfig,
    changes: Vec<String>,
}

impl ConfigVersionEntry {
    /// Creates a new config version entry.
    ///
    /// # Arguments
    ///
    /// * `version` - The version number
    /// * `timestamp` - The timestamp
    /// * `config` - The configuration
    /// * `changes` - List of changes
    ///
    /// # Returns
    ///
    /// Returns a new version entry.
    pub fn new(version: u32, timestamp: String, config: AppConfig, changes: Vec<String>) -> Self {
        Self {
            version,
            timestamp,
            config,
            changes,
        }
    }

    /// Returns the version number.
    ///
    /// # Returns
    ///
    /// Returns the version.
    pub fn version(&self) -> u32 {
        self.version
    }

    /// Returns the timestamp.
    ///
    /// # Returns
    ///
    /// Returns the timestamp.
    pub fn timestamp(&self) -> &str {
        &self.timestamp
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns the changes.
    ///
    /// # Returns
    ///
    /// Returns the changes.
    pub fn changes(&self) -> &[String] {
        &self.changes
    }
}

/// Represents configuration history.
#[derive(Debug, Clone)]
pub struct ConfigHistory {
    versions: Vec<ConfigVersionEntry>,
    current_version: u32,
}

impl ConfigHistory {
    /// Creates a new config history.
    ///
    /// # Returns
    ///
    /// Returns a new history.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let history = ConfigHistory::new();
    /// ```
    pub fn new() -> Self {
        Self {
            versions: Vec::new(),
            current_version: 0,
        }
    }

    /// Adds a new version.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration
    /// * `changes` - List of changes
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    /// use config::types::AppConfig;
    ///
    /// let mut history = ConfigHistory::new();
    /// let config = AppConfig::default();
    /// history.add_version(&config, vec!["Initial config".to_string()]).unwrap();
    /// ```
    pub fn add_version(&mut self, config: &AppConfig, changes: Vec<String>) -> std::io::Result<()> {
        use std::time::{SystemTime, UNIX_EPOCH};

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        self.current_version += 1;

        let entry = ConfigVersionEntry::new(
            self.current_version,
            timestamp.to_string(),
            config.clone(),
            changes,
        );

        self.versions.push(entry);

        Ok(())
    }

    /// Returns the current version.
    ///
    /// # Returns
    ///
    /// Returns the current version number.
    pub fn current_version(&self) -> u32 {
        self.current_version
    }

    /// Returns all versions.
    ///
    /// # Returns
    ///
    /// Returns a slice of versions.
    pub fn versions(&self) -> &[ConfigVersionEntry] {
        &self.versions
    }

    /// Returns the number of versions.
    ///
    /// # Returns
    ///
    /// Returns the version count.
    pub fn len(&self) -> usize {
        self.versions.len()
    }

    /// Returns `true` if there are no versions.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.versions.is_empty()
    }

    /// Gets a version by number.
    ///
    /// # Arguments
    ///
    /// * `version` - The version number
    ///
    /// # Returns
    ///
    /// Returns the version if found.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let history = ConfigHistory::new();
    /// if let Some(version) = history.get_version(1) {
    ///     println!("Version: {}", version.version());
    /// }
    /// ```
    pub fn get_version(&self, version: u32) -> Option<&ConfigVersionEntry> {
        self.versions.iter().find(|v| v.version() == version)
    }

    /// Gets the latest version.
    ///
    /// # Returns
    ///
    /// Returns the latest version if available.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let history = ConfigHistory::new();
    /// if let Some(latest) = history.get_latest() {
    ///     println!("Latest version: {}", latest.version());
    /// }
    /// ```
    pub fn get_latest(&self) -> Option<&ConfigVersionEntry> {
        self.versions.last()
    }

    /// Rolls back to a specific version.
    ///
    /// # Arguments
    ///
    /// * `version` - The version to rollback to
    ///
    /// # Returns
    ///
    /// Returns the configuration at that version.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let history = ConfigHistory::new();
    /// let config = history.rollback(1).unwrap();
    /// ```
    pub fn rollback(&self, version: u32) -> Option<AppConfig> {
        self.get_version(version).map(|v| v.config().clone())
    }

    /// Compares two versions.
    ///
    /// # Arguments
    ///
    /// * `version1` - First version number
    /// * `version2` - Second version number
    ///
    /// # Returns
    ///
    /// Returns a list of differences.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let history = ConfigHistory::new();
    /// let diffs = history.compare_versions(1, 2);
    /// ```
    pub fn compare_versions(&self, version1: u32, version2: u32) -> Vec<String> {
        let mut diffs = Vec::new();

        if let (Some(v1), Some(v2)) = (self.get_version(version1), self.get_version(version2)) {
            if v1.config().appearance.theme_id != v2.config().appearance.theme_id {
                diffs.push(format!(
                    "appearance.theme_id: {} -> {}",
                    v1.config().appearance.theme_id,
                    v2.config().appearance.theme_id
                ));
            }

            if v1.config().behavior.auto_save != v2.config().behavior.auto_save {
                diffs.push(format!(
                    "behavior.auto_save: {} -> {}",
                    v1.config().behavior.auto_save,
                    v2.config().behavior.auto_save
                ));
            }
        }

        diffs
    }

    /// Gets version history as a string.
    ///
    /// # Returns
    ///
    /// Returns the history as a formatted string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let history = ConfigHistory::new();
    /// let history_str = history.get_history_string();
    /// println!("{}", history_str);
    /// ```
    pub fn get_history_string(&self) -> String {
        let mut output = String::new();

        for version in &self.versions {
            output.push_str(&format!(
                "Version {}: {}\n",
                version.version(),
                version.timestamp()
            ));

            for change in version.changes() {
                output.push_str(&format!("  - {}\n", change));
            }
        }

        output
    }

    /// Limits history to a maximum number of versions.
    ///
    /// # Arguments
    ///
    /// * `max_versions` - Maximum number of versions to keep
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let mut history = ConfigHistory::new();
    /// history.limit_versions(10);
    /// ```
    pub fn limit_versions(&mut self, max_versions: usize) {
        if self.versions.len() > max_versions {
            let remove_count = self.versions.len() - max_versions;
            self.versions.drain(0..remove_count);
        }
    }

    /// Clears all versions.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::ConfigHistory;
    ///
    /// let mut history = ConfigHistory::new();
    /// history.clear();
    /// ```
    pub fn clear(&mut self) {
        self.versions.clear();
        self.current_version = 0;
    }
}

impl Default for ConfigHistory {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a config checkpoint.
#[derive(Debug, Clone)]
pub struct ConfigCheckpoint {
    id: String,
    timestamp: String,
    config: AppConfig,
    description: String,
}

impl ConfigCheckpoint {
    /// Creates a new checkpoint.
    ///
    /// # Arguments
    ///
    /// * `description` - The checkpoint description
    /// * `config` - The configuration
    ///
    /// # Returns
    ///
    /// Returns a new checkpoint.
    pub fn new(description: String, config: AppConfig) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let id = format!("checkpoint-{}", timestamp);

        Self {
            id,
            timestamp: timestamp.to_string(),
            config,
            description,
        }
    }

    /// Returns the checkpoint ID.
    ///
    /// # Returns
    ///
    /// Returns the ID.
    pub fn id(&self) -> &str {
        &self.id
    }

    /// Returns the timestamp.
    ///
    /// # Returns
    ///
    /// Returns the timestamp.
    pub fn timestamp(&self) -> &str {
        &self.timestamp
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
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

/// Represents checkpoint manager.
#[derive(Debug, Clone)]
pub struct CheckpointManager {
    checkpoints: Vec<ConfigCheckpoint>,
}

impl CheckpointManager {
    /// Creates a new checkpoint manager.
    ///
    /// # Returns
    ///
    /// Returns a new manager.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::CheckpointManager;
    ///
    /// let manager = CheckpointManager::new();
    /// ```
    pub fn new() -> Self {
        Self {
            checkpoints: Vec::new(),
        }
    }

    /// Creates a checkpoint.
    ///
    /// # Arguments
    ///
    /// * `description` - The checkpoint description
    /// * `config` - The configuration
    ///
    /// # Returns
    ///
    /// Returns the created checkpoint.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::CheckpointManager;
    /// use config::types::AppConfig;
    ///
    /// let mut manager = CheckpointManager::new();
    /// let config = AppConfig::default();
    /// let checkpoint = manager.create_checkpoint("Before migration".to_string(), &config);
    /// ```
    pub fn create_checkpoint(&mut self, description: String, config: &AppConfig) -> ConfigCheckpoint {
        let checkpoint = ConfigCheckpoint::new(description, config.clone());
        self.checkpoints.push(checkpoint.clone());
        checkpoint
    }

    /// Gets a checkpoint by ID.
    ///
    /// # Arguments
    ///
    /// * `id` - The checkpoint ID
    ///
    /// # Returns
    ///
    /// Returns the checkpoint if found.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::CheckpointManager;
    ///
    /// let manager = CheckpointManager::new();
    /// if let Some(checkpoint) = manager.get_checkpoint("checkpoint-123") {
    ///     println!("Description: {}", checkpoint.description());
    /// }
    /// ```
    pub fn get_checkpoint(&self, id: &str) -> Option<&ConfigCheckpoint> {
        self.checkpoints.iter().find(|c| c.id() == id)
    }

    /// Lists all checkpoints.
    ///
    /// # Returns
    ///
    /// Returns a slice of checkpoints.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::CheckpointManager;
    ///
    /// let manager = CheckpointManager::new();
    /// for checkpoint in manager.list_checkpoints() {
    ///     println!("{}: {}", checkpoint.id(), checkpoint.description());
    /// }
    /// ```
    pub fn list_checkpoints(&self) -> &[ConfigCheckpoint] {
        &self.checkpoints
    }

    /// Removes a checkpoint.
    ///
    /// # Arguments
    ///
    /// * `id` - The checkpoint ID
    ///
    /// # Returns
    ///
    /// Returns `true` if removed.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::CheckpointManager;
    ///
    /// let mut manager = CheckpointManager::new();
    /// manager.remove_checkpoint("checkpoint-123");
    /// ```
    pub fn remove_checkpoint(&mut self, id: &str) -> bool {
        if let Some(pos) = self.checkpoints.iter().position(|c| c.id() == id) {
            self.checkpoints.remove(pos);
            true
        } else {
            false
        }
    }

    /// Clears all checkpoints.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::version_control::CheckpointManager;
    ///
    /// let mut manager = CheckpointManager::new();
    /// manager.clear();
    /// ```
    pub fn clear(&mut self) {
        self.checkpoints.clear();
    }
}

impl Default for CheckpointManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_history_new() {
        let history = ConfigHistory::new();
        assert_eq!(history.current_version(), 0);
        assert!(history.is_empty());
    }

    #[test]
    fn test_add_version() {
        let mut history = ConfigHistory::new();
        let config = AppConfig::default();
        history.add_version(&config, vec!["Initial".to_string()]).unwrap();

        assert_eq!(history.current_version(), 1);
        assert_eq!(history.len(), 1);
    }

    #[test]
    fn test_get_version() {
        let mut history = ConfigHistory::new();
        let config = AppConfig::default();
        history.add_version(&config, vec!["Initial".to_string()]).unwrap();

        let version = history.get_version(1);
        assert!(version.is_some());
        assert_eq!(version.unwrap().version(), 1);
    }

    #[test]
    fn test_rollback() {
        let mut history = ConfigHistory::new();
        let config = AppConfig::default();
        history.add_version(&config, vec!["Initial".to_string()]).unwrap();

        let rolled_back = history.rollback(1);
        assert!(rolled_back.is_some());
    }

    #[test]
    fn test_checkpoint_manager() {
        let mut manager = CheckpointManager::new();
        let config = AppConfig::default();
        let checkpoint = manager.create_checkpoint("Test".to_string(), &config);

        assert!(manager.get_checkpoint(checkpoint.id()).is_some());
        assert_eq!(manager.list_checkpoints().len(), 1);
    }

    #[test]
    fn test_remove_checkpoint() {
        let mut manager = CheckpointManager::new();
        let config = AppConfig::default();
        let checkpoint = manager.create_checkpoint("Test".to_string(), &config);

        let removed = manager.remove_checkpoint(checkpoint.id());
        assert!(removed);
        assert!(manager.list_checkpoints().is_empty());
    }
}
