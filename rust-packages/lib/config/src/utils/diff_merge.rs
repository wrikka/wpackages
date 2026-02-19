//! Configuration diff and merge utilities
//!
//! This module provides tools for comparing and merging configurations.

use crate::types::AppConfig;

/// Represents a configuration change.
#[derive(Debug, Clone, PartialEq)]
pub enum ConfigChange {
    /// Field was added.
    Added {
        path: String,
        value: String,
    },
    /// Field was removed.
    Removed {
        path: String,
        value: String,
    },
    /// Field was modified.
    Modified {
        path: String,
        old_value: String,
        new_value: String,
    },
}

/// Represents a configuration diff.
#[derive(Debug, Clone)]
pub struct ConfigDiff {
    changes: Vec<ConfigChange>,
}

impl ConfigDiff {
    /// Creates a new configuration diff.
    ///
    /// # Returns
    ///
    /// Returns a new diff.
    pub fn new() -> Self {
        Self {
            changes: Vec::new(),
        }
    }

    /// Adds a change to the diff.
    ///
    /// # Arguments
    ///
    /// * `change` - The change to add
    pub fn add_change(&mut self, change: ConfigChange) {
        self.changes.push(change);
    }

    /// Returns all changes.
    ///
    /// # Returns
    ///
    /// Returns a slice of changes.
    pub fn changes(&self) -> &[ConfigChange] {
        &self.changes
    }

    /// Returns the number of changes.
    ///
    /// # Returns
    ///
    /// Returns the change count.
    pub fn len(&self) -> usize {
        self.changes.len()
    }

    /// Returns `true` if there are no changes.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.changes.is_empty()
    }
}

impl Default for ConfigDiff {
    fn default() -> Self {
        Self::new()
    }
}

/// Compares two configurations and returns their differences.
///
/// # Arguments
///
/// * `old` - The old configuration
/// * `new` - The new configuration
///
/// # Returns
///
/// Returns the configuration diff.
///
/// # Example
///
/// ```no_run
/// use config::utils::diff_merge::diff_configs;
/// use config::types::AppConfig;
///
/// let old = AppConfig::default();
/// let mut new = AppConfig::default();
/// new.appearance.theme_id = "light".to_string();
///
/// let diff = diff_configs(&old, &new);
/// println!("Changes: {}", diff.len());
/// ```
pub fn diff_configs(old: &AppConfig, new: &AppConfig) -> ConfigDiff {
    let mut diff = ConfigDiff::new();

    // Compare appearance
    if old.appearance.theme_id != new.appearance.theme_id {
        diff.add_change(ConfigChange::Modified {
            path: "appearance.theme_id".to_string(),
            old_value: old.appearance.theme_id.clone(),
            new_value: new.appearance.theme_id.clone(),
        });
    }

    if old.appearance.font.family != new.appearance.font.family {
        diff.add_change(ConfigChange::Modified {
            path: "appearance.font.family".to_string(),
            old_value: old.appearance.font.family.clone(),
            new_value: new.appearance.font.family.clone(),
        });
    }

    if old.appearance.font.size != new.appearance.font.size {
        diff.add_change(ConfigChange::Modified {
            path: "appearance.font.size".to_string(),
            old_value: old.appearance.font.size.to_string(),
            new_value: new.appearance.font.size.to_string(),
        });
    }

    // Compare behavior
    if old.behavior.confirm_close != new.behavior.confirm_close {
        diff.add_change(ConfigChange::Modified {
            path: "behavior.confirm_close".to_string(),
            old_value: old.behavior.confirm_close.to_string(),
            new_value: new.behavior.confirm_close.to_string(),
        });
    }

    if old.behavior.auto_save != new.behavior.auto_save {
        diff.add_change(ConfigChange::Modified {
            path: "behavior.auto_save".to_string(),
            old_value: old.behavior.auto_save.to_string(),
            new_value: new.behavior.auto_save.to_string(),
        });
    }

    // Compare advanced
    if old.advanced.enable_telemetry != new.advanced.enable_telemetry {
        diff.add_change(ConfigChange::Modified {
            path: "advanced.enable_telemetry".to_string(),
            old_value: old.advanced.enable_telemetry.to_string(),
            new_value: new.advanced.enable_telemetry.to_string(),
        });
    }

    if old.advanced.log_level != new.advanced.log_level {
        diff.add_change(ConfigChange::Modified {
            path: "advanced.log_level".to_string(),
            old_value: old.advanced.log_level.clone(),
            new_value: new.advanced.log_level.clone(),
        });
    }

    // Compare PTY
    if old.pty.shell != new.pty.shell {
        diff.add_change(ConfigChange::Modified {
            path: "pty.shell".to_string(),
            old_value: old.pty.shell.clone(),
            new_value: new.pty.shell.clone(),
        });
    }

    if old.pty.rows != new.pty.rows {
        diff.add_change(ConfigChange::Modified {
            path: "pty.rows".to_string(),
            old_value: old.pty.rows.to_string(),
            new_value: new.pty.rows.to_string(),
        });
    }

    if old.pty.cols != new.pty.cols {
        diff.add_change(ConfigChange::Modified {
            path: "pty.cols".to_string(),
            old_value: old.pty.cols.to_string(),
            new_value: new.pty.cols.to_string(),
        });
    }

    diff
}

/// Merges two configurations.
///
/// # Arguments
///
/// * `base` - The base configuration
/// * `other` - The other configuration to merge
///
/// # Returns
///
/// Returns the merged configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::diff_merge::merge_configs;
/// use config::types::AppConfig;
///
/// let base = AppConfig::default();
/// let mut other = AppConfig::default();
/// other.appearance.theme_id = "light".to_string();
///
/// let merged = merge_configs(&base, &other);
/// println!("Theme: {}", merged.appearance.theme_id);
/// ```
pub fn merge_configs(base: &AppConfig, other: &AppConfig) -> AppConfig {
    let mut merged = base.clone();

    // Merge appearance
    if other.appearance.theme_id != "default-dark" {
        merged.appearance.theme_id = other.appearance.theme_id.clone();
    }
    if other.appearance.font.family != "Consolas" {
        merged.appearance.font.family = other.appearance.font.family.clone();
    }
    if other.appearance.font.size != 14 {
        merged.appearance.font.size = other.appearance.font.size;
    }

    // Merge behavior
    if other.behavior.confirm_close != false {
        merged.behavior.confirm_close = other.behavior.confirm_close;
    }
    if other.behavior.auto_save != true {
        merged.behavior.auto_save = other.behavior.auto_save;
    }

    // Merge advanced
    if other.advanced.enable_telemetry != false {
        merged.advanced.enable_telemetry = other.advanced.enable_telemetry;
    }
    if other.advanced.log_level != "info" {
        merged.advanced.log_level = other.advanced.log_level.clone();
    }

    // Merge PTY
    if other.pty.shell != "powershell.exe" {
        merged.pty.shell = other.pty.shell.clone();
    }
    if other.pty.rows != 24 {
        merged.pty.rows = other.pty.rows;
    }
    if other.pty.cols != 80 {
        merged.pty.cols = other.pty.cols;
    }

    merged
}

/// Represents a merge conflict.
#[derive(Debug, Clone)]
pub struct MergeConflict {
    path: String,
    base_value: String,
    our_value: String,
    their_value: String,
}

impl MergeConflict {
    /// Creates a new merge conflict.
    ///
    /// # Arguments
///
/// * `path` - The path to the conflicting field
/// * `base_value` - The base value
/// * `our_value` - Our value
/// * `their_value` - Their value
///
/// # Returns
///
/// Returns a new merge conflict.
    pub fn new(
        path: String,
        base_value: String,
        our_value: String,
        their_value: String,
    ) -> Self {
        Self {
            path,
            base_value,
            our_value,
            their_value,
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

    /// Returns the base value.
    ///
    /// # Returns
///
/// Returns the base value.
    pub fn base_value(&self) -> &str {
        &self.base_value
    }

    /// Returns our value.
    ///
    /// # Returns
///
/// Returns our value.
    pub fn our_value(&self) -> &str {
        &self.our_value
    }

    /// Returns their value.
    ///
    /// # Returns
///
/// Returns their value.
    pub fn their_value(&self) -> &str {
        &self.their_value
    }
}

/// Represents a merge result.
#[derive(Debug, Clone)]
pub enum MergeResult {
    /// Merge succeeded.
    Success(AppConfig),
    /// Merge failed with conflicts.
    Conflict(Vec<MergeConflict>),
}

/// Merges three configurations with conflict detection.
///
/// # Arguments
///
/// * `base` - The base configuration
/// * `our` - Our configuration
/// * `their` - Their configuration
///
/// # Returns
///
/// Returns the merge result.
///
/// # Example
///
/// ```no_run
/// use config::utils::diff_merge::merge_three_way;
/// use config::types::AppConfig;
///
/// let base = AppConfig::default();
/// let mut our = AppConfig::default();
/// our.appearance.theme_id = "light".to_string();
/// let mut their = AppConfig::default();
/// their.appearance.theme_id = "dark".to_string();
///
/// let result = merge_three_way(&base, &our, &their);
/// ```
pub fn merge_three_way(base: &AppConfig, our: &AppConfig, their: &AppConfig) -> MergeResult {
    let mut conflicts = Vec::new();

    // Detect conflicts
    if our.appearance.theme_id != base.appearance.theme_id
        && their.appearance.theme_id != base.appearance.theme_id
        && our.appearance.theme_id != their.appearance.theme_id
    {
        conflicts.push(MergeConflict::new(
            "appearance.theme_id".to_string(),
            base.appearance.theme_id.clone(),
            our.appearance.theme_id.clone(),
            their.appearance.theme_id.clone(),
        ));
    }

    if our.behavior.confirm_close != base.behavior.confirm_close
        && their.behavior.confirm_close != base.behavior.confirm_close
        && our.behavior.confirm_close != their.behavior.confirm_close
    {
        conflicts.push(MergeConflict::new(
            "behavior.confirm_close".to_string(),
            base.behavior.confirm_close.to_string(),
            our.behavior.confirm_close.to_string(),
            their.behavior.confirm_close.to_string(),
        ));
    }

    if !conflicts.is_empty() {
        return MergeResult::Conflict(conflicts);
    }

    // No conflicts, merge
    let merged = merge_configs(base, our);
    MergeResult::Success(merged)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diff_configs() {
        let old = AppConfig::default();
        let mut new = AppConfig::default();
        new.appearance.theme_id = "light".to_string();

        let diff = diff_configs(&old, &new);
        assert_eq!(diff.len(), 1);
    }

    #[test]
    fn test_merge_configs() {
        let base = AppConfig::default();
        let mut other = AppConfig::default();
        other.appearance.theme_id = "light".to_string();

        let merged = merge_configs(&base, &other);
        assert_eq!(merged.appearance.theme_id, "light");
    }

    #[test]
    fn test_merge_three_way_success() {
        let base = AppConfig::default();
        let mut our = AppConfig::default();
        our.appearance.theme_id = "light".to_string();
        let their = AppConfig::default();

        let result = merge_three_way(&base, &our, &their);
        assert!(matches!(result, MergeResult::Success(_)));
    }

    #[test]
    fn test_merge_three_way_conflict() {
        let base = AppConfig::default();
        let mut our = AppConfig::default();
        our.appearance.theme_id = "light".to_string();
        let mut their = AppConfig::default();
        their.appearance.theme_id = "dark".to_string();

        let result = merge_three_way(&base, &our, &their);
        assert!(matches!(result, MergeResult::Conflict(_)));
    }
}
