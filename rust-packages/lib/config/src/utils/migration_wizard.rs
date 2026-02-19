//! Configuration migration wizard
//!
//! This module provides a wizard for guiding users through configuration migration.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigVersion};
use crate::version::ConfigVersion as Version;

/// Represents a migration change.
#[derive(Debug, Clone)]
pub struct MigrationChange {
    field: String,
    old_value: String,
    new_value: String,
    description: String,
}

impl MigrationChange {
    /// Creates a new migration change.
    ///
    /// # Arguments
    ///
    /// * `field` - The field name
    /// * `old_value` - The old value
    /// * `new_value` - The new value
    /// * `description` - The change description
    ///
    /// # Returns
    ///
    /// Returns a new migration change.
    pub fn new(field: String, old_value: String, new_value: String, description: String) -> Self {
        Self {
            field,
            old_value,
            new_value,
            description,
        }
    }

    /// Returns the field name.
    ///
    /// # Returns
    ///
    /// Returns the field.
    pub fn field(&self) -> &str {
        &self.field
    }

    /// Returns the old value.
    ///
    /// # Returns
    ///
    /// Returns the old value.
    pub fn old_value(&self) -> &str {
        &self.old_value
    }

    /// Returns the new value.
    ///
    /// # Returns
    ///
    /// Returns the new value.
    pub fn new_value(&self) -> &str {
        &self.new_value
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

/// Represents a migration wizard.
pub struct MigrationWizard {
    from_version: ConfigVersion,
    to_version: ConfigVersion,
    changes: Vec<MigrationChange>,
    applied: bool,
}

impl MigrationWizard {
    /// Creates a new migration wizard.
    ///
    /// # Arguments
    ///
    /// * `from_version` - The source version
    /// * `to_version` - The target version
    ///
    /// # Returns
    ///
    /// Returns a new wizard.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::migration_wizard::MigrationWizard;
    /// use config::version::ConfigVersion;
    ///
    /// let from = ConfigVersion::new(1, 0, 0);
    /// let to = ConfigVersion::new(2, 0, 0);
    /// let wizard = MigrationWizard::new(from, to);
    /// ```
    pub fn new(from_version: ConfigVersion, to_version: ConfigVersion) -> Self {
        Self {
            from_version,
            to_version,
            changes: Vec::new(),
            applied: false,
        }
    }

    /// Analyzes configuration and generates migration changes.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to analyze
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::migration_wizard::MigrationWizard;
    /// use config::types::AppConfig;
    ///
    /// let mut wizard = MigrationWizard::new(from, to);
    /// let config = AppConfig::default();
    /// wizard.analyze(&config).unwrap();
    /// ```
    pub fn analyze(&mut self, config: &AppConfig) -> ConfigResult<()> {
        self.changes.clear();

        // Check for migration from version 0.x to 1.0
        if self.from_version.major == 0 && self.to_version.major == 1 {
            self.analyze_v0_to_v1(config)?;
        }

        // Check for migration from version 1.x to 2.0
        if self.from_version.major == 1 && self.to_version.major == 2 {
            self.analyze_v1_to_v2(config)?;
        }

        Ok(())
    }

    /// Analyzes migration from version 0.x to 1.0.
    fn analyze_v0_to_v1(&mut self, config: &AppConfig) -> ConfigResult<()> {
        // Check font family
        if config.appearance.font.family.is_empty() {
            self.changes.push(MigrationChange::new(
                "appearance.font.family".to_string(),
                "".to_string(),
                "Consolas".to_string(),
                "Set default font family".to_string(),
            ));
        }

        // Check font size
        if config.appearance.font.size == 0 {
            self.changes.push(MigrationChange::new(
                "appearance.font.size".to_string(),
                "0".to_string(),
                "14".to_string(),
                "Set default font size".to_string(),
            ));
        }

        Ok(())
    }

    /// Analyzes migration from version 1.x to 2.0.
    fn analyze_v1_to_v2(&mut self, config: &AppConfig) -> ConfigResult<()> {
        // Check PTY rows
        if config.pty.rows == 0 {
            self.changes.push(MigrationChange::new(
                "pty.rows".to_string(),
                "0".to_string(),
                "24".to_string(),
                "Set default PTY rows".to_string(),
            ));
        }

        // Check PTY cols
        if config.pty.cols == 0 {
            self.changes.push(MigrationChange::new(
                "pty.cols".to_string(),
                "0".to_string(),
                "80".to_string(),
                "Set default PTY cols".to_string(),
            ));
        }

        Ok(())
    }

    /// Returns the migration changes.
    ///
    /// # Returns
    ///
    /// Returns a slice of changes.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::migration_wizard::MigrationWizard;
    ///
    /// let wizard = MigrationWizard::new(from, to);
    /// for change in wizard.preview() {
    ///     println!("{}: {} -> {}", change.field(), change.old_value(), change.new_value());
    /// }
    /// ```
    pub fn preview(&self) -> &[MigrationChange] {
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

    /// Applies the migration.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to migrate
    ///
    /// # Returns
    ///
    /// Returns the migrated configuration.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::migration_wizard::MigrationWizard;
    /// use config::types::AppConfig;
    ///
    /// let mut wizard = MigrationWizard::new(from, to);
    /// let config = AppConfig::default();
    /// let migrated = wizard.apply(&config).unwrap();
    /// ```
    pub fn apply(&mut self, config: &AppConfig) -> ConfigResult<AppConfig> {
        let mut migrated = config.clone();

        for change in &self.changes {
            match change.field.as_str() {
                "appearance.font.family" => {
                    migrated.appearance.font.family = change.new_value.clone();
                }
                "appearance.font.size" => {
                    migrated.appearance.font.size = change.new_value.parse().unwrap_or(14);
                }
                "pty.rows" => {
                    migrated.pty.rows = change.new_value.parse().unwrap_or(24);
                }
                "pty.cols" => {
                    migrated.pty.cols = change.new_value.parse().unwrap_or(80);
                }
                _ => {}
            }
        }

        self.applied = true;
        Ok(migrated)
    }

    /// Returns `true` if migration has been applied.
    ///
    /// # Returns
    ///
    /// Returns `true` if applied.
    pub fn is_applied(&self) -> bool {
        self.applied
    }

    /// Returns the from version.
    ///
    /// # Returns
    ///
    /// Returns the from version.
    pub fn from_version(&self) -> &ConfigVersion {
        &self.from_version
    }

    /// Returns the to version.
    ///
    /// # Returns
    ///
    /// Returns the to version.
    pub fn to_version(&self) -> &ConfigVersion {
        &self.to_version
    }

    /// Generates a migration summary.
    ///
    /// # Returns
    ///
    /// Returns the migration summary as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::migration_wizard::MigrationWizard;
    ///
    /// let wizard = MigrationWizard::new(from, to);
    /// let summary = wizard.get_summary();
    /// println!("{}", summary);
    /// ```
    pub fn get_summary(&self) -> String {
        let mut summary = String::new();

        summary.push_str(&format!(
            "Migration from v{} to v{}\n",
            self.from_version.as_string(),
            self.to_version.as_string()
        ));

        summary.push_str(&format!("Changes: {}\n", self.changes.len()));

        for change in &self.changes {
            summary.push_str(&format!(
                "  - {}: {} -> {} ({})\n",
                change.field(),
                change.old_value(),
                change.new_value(),
                change.description()
            ));
        }

        summary
    }
}

/// Creates a migration wizard for configuration.
///
/// # Arguments
///
/// * `config` - The configuration to migrate
/// * `target_version` - The target version
///
/// # Returns
    /// Returns a migration wizard.
///
/// # Example
///
/// ```no_run
/// use config::utils::migration_wizard::create_migration_wizard;
/// use config::types::AppConfig;
/// use config::version::ConfigVersion;
///
/// let config = AppConfig::default();
/// let target = ConfigVersion::new(2, 0, 0);
/// let wizard = create_migration_wizard(&config, target).unwrap();
/// ```
pub fn create_migration_wizard(
    config: &AppConfig,
    target_version: ConfigVersion,
) -> ConfigResult<MigrationWizard> {
    let mut wizard = MigrationWizard::new(config.version.clone(), target_version);
    wizard.analyze(config)?;
    Ok(wizard)
}

/// Checks if migration is needed.
///
/// # Arguments
///
/// * `config` - The configuration
/// * `target_version` - The target version
///
/// # Returns
    /// Returns `true` if migration is needed.
///
/// # Example
///
/// ```no_run
/// use config::utils::migration_wizard::needs_migration;
/// use config::types::AppConfig;
/// use config::version::ConfigVersion;
///
/// let config = AppConfig::default();
/// let target = ConfigVersion::new(2, 0, 0);
/// if needs_migration(&config, target) {
///     println!("Migration needed");
/// }
/// ```
pub fn needs_migration(config: &AppConfig, target_version: ConfigVersion) -> bool {
    config.version.major < target_version.major
        || (config.version.major == target_version.major
            && config.version.minor < target_version.minor)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_migration_wizard_new() {
        let from = ConfigVersion::new(1, 0, 0);
        let to = ConfigVersion::new(2, 0, 0);
        let wizard = MigrationWizard::new(from, to);

        assert_eq!(wizard.from_version().as_string(), "1.0.0");
        assert_eq!(wizard.to_version().as_string(), "2.0.0");
        assert!(!wizard.is_applied());
    }

    #[test]
    fn test_migration_wizard_analyze() {
        let from = ConfigVersion::new(0, 0, 0);
        let to = ConfigVersion::new(1, 0, 0);
        let mut wizard = MigrationWizard::new(from, to);

        let mut config = AppConfig::default();
        config.appearance.font.family = String::new();

        wizard.analyze(&config).unwrap();

        assert!(!wizard.is_empty());
    }

    #[test]
    fn test_migration_wizard_apply() {
        let from = ConfigVersion::new(0, 0, 0);
        let to = ConfigVersion::new(1, 0, 0);
        let mut wizard = MigrationWizard::new(from, to);

        let mut config = AppConfig::default();
        config.appearance.font.family = String::new();

        wizard.analyze(&config).unwrap();
        let migrated = wizard.apply(&config).unwrap();

        assert_eq!(migrated.appearance.font.family, "Consolas");
        assert!(wizard.is_applied());
    }

    #[test]
    fn test_needs_migration() {
        let mut config = AppConfig::default();
        config.version = ConfigVersion::new(1, 0, 0);
        let target = ConfigVersion::new(2, 0, 0);

        assert!(needs_migration(&config, target));
    }

    #[test]
    fn test_migration_change() {
        let change = MigrationChange::new(
            "field".to_string(),
            "old".to_string(),
            "new".to_string(),
            "desc".to_string(),
        );

        assert_eq!(change.field(), "field");
        assert_eq!(change.old_value(), "old");
        assert_eq!(change.new_value(), "new");
        assert_eq!(change.description(), "desc");
    }
}
