//! Configuration export and import utilities
//!
//! This module provides export and import functionality for configuration.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};
use std::path::Path;

/// Exports configuration to a file.
///
/// # Arguments
///
/// * `config` - The configuration to export
/// * `path` - The path to export to
/// * `format` - The format to use
///
/// # Returns
///
/// Returns `Ok(())` on success.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::export_config_to_file;
/// use config::types::{AppConfig, ConfigFormat};
///
/// let config = AppConfig::default();
/// export_config_to_file(&config, "export.toml", ConfigFormat::Toml).unwrap();
/// ```
pub fn export_config_to_file<P: AsRef<Path>>(
    config: &AppConfig,
    path: P,
    format: ConfigFormat,
) -> ConfigResult<()> {
    config.save_to_path(path, format)
}

/// Imports configuration from a file.
///
/// # Arguments
///
/// * `path` - The path to import from
///
/// # Returns
///
/// Returns the imported configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::import_config_from_file;
///
/// let config = import_config_from_file("import.toml").unwrap();
/// ```
pub fn import_config_from_file<P: AsRef<Path>>(path: P) -> ConfigResult<AppConfig> {
    AppConfig::load_from_path(path)
}

/// Exports configuration to a string.
///
/// # Arguments
///
/// * `config` - The configuration to export
/// * `format` - The format to use
///
/// # Returns
///
/// Returns the exported configuration as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::export_config_to_string;
/// use config::types::{AppConfig, ConfigFormat};
///
/// let config = AppConfig::default();
/// let exported = export_config_to_string(&config, ConfigFormat::Toml).unwrap();
/// println!("{}", exported);
/// ```
pub fn export_config_to_string(
    config: &AppConfig,
    format: ConfigFormat,
) -> ConfigResult<String> {
    config.export(format)
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
/// Returns the imported configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::import_config_from_string;
/// use config::types::ConfigFormat;
///
/// let data = r#"[appearance]
/// theme_id = "dark"
/// "#;
/// let config = import_config_from_string(data, ConfigFormat::Toml).unwrap();
/// ```
pub fn import_config_from_string(
    data: &str,
    format: ConfigFormat,
) -> ConfigResult<AppConfig> {
    AppConfig::import(data, format)
}

/// Represents an export bundle.
#[derive(Debug, Clone)]
pub struct ExportBundle {
    config: AppConfig,
    metadata: ExportMetadata,
}

/// Represents export metadata.
#[derive(Debug, Clone)]
pub struct ExportMetadata {
    version: String,
    timestamp: String,
    format: ConfigFormat,
    description: Option<String>,
}

impl ExportMetadata {
    /// Creates new export metadata.
    ///
    /// # Arguments
    ///
    /// * `version` - The config version
    /// * `format` - The export format
    ///
    /// # Returns
    ///
    /// Returns new metadata.
    pub fn new(version: String, format: ConfigFormat) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            version,
            timestamp: timestamp.to_string(),
            format,
            description: None,
        }
    }

    /// Returns the version.
    ///
    /// # Returns
    ///
    /// Returns the version.
    pub fn version(&self) -> &str {
        &self.version
    }

    /// Returns the timestamp.
    ///
    /// # Returns
    ///
    /// Returns the timestamp.
    pub fn timestamp(&self) -> &str {
        &self.timestamp
    }

    /// Returns the format.
    ///
    /// # Returns
    ///
    /// Returns the format.
    pub fn format(&self) -> ConfigFormat {
        self.format
    }

    /// Returns the description.
    ///
    /// # Returns
    ///
    /// Returns the description.
    pub fn description(&self) -> Option<&str> {
        self.description.as_deref()
    }
}

impl ExportBundle {
    /// Creates a new export bundle.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration
    /// * `metadata` - The metadata
    ///
    /// # Returns
    ///
    /// Returns a new bundle.
    pub fn new(config: AppConfig, metadata: ExportMetadata) -> Self {
        Self { config, metadata }
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns the metadata.
    ///
    /// # Returns
    ///
    /// Returns the metadata.
    pub fn metadata(&self) -> &ExportMetadata {
        &self.metadata
    }
}

/// Exports configuration as a bundle.
///
/// # Arguments
///
/// * `config` - The configuration to export
/// * `format` - The format to use
/// * `description` - Optional description
///
/// # Returns
///
/// Returns the export bundle.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::export_config_bundle;
/// use config::types::{AppConfig, ConfigFormat};
///
/// let config = AppConfig::default();
/// let bundle = export_config_bundle(&config, ConfigFormat::Toml, Some("Backup".to_string())).unwrap();
/// ```
pub fn export_config_bundle(
    config: &AppConfig,
    format: ConfigFormat,
    description: Option<String>,
) -> ConfigResult<ExportBundle> {
    let mut metadata = ExportMetadata::new(config.version.as_string(), format);
    metadata.description = description;

    Ok(ExportBundle::new(config.clone(), metadata))
}

/// Imports configuration from a bundle.
///
/// # Arguments
///
/// * `bundle` - The export bundle
///
/// # Returns
///
/// Returns the imported configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::import_config_bundle;
///
/// let config = import_config_bundle(&bundle).unwrap();
/// ```
pub fn import_config_bundle(bundle: &ExportBundle) -> ConfigResult<AppConfig> {
    let mut config = bundle.config().clone();
    config.validate()?;
    Ok(config)
}

/// Represents a migration plan.
#[derive(Debug, Clone)]
pub struct MigrationPlan {
    from_format: ConfigFormat,
    to_format: ConfigFormat,
    steps: Vec<MigrationStep>,
}

/// Represents a migration step.
#[derive(Debug, Clone)]
pub struct MigrationStep {
    description: String,
    action: MigrationAction,
}

/// Represents a migration action.
#[derive(Debug, Clone)]
pub enum MigrationAction {
    ConvertField {
        path: String,
        from_type: String,
        to_type: String,
    },
    AddField {
        path: String,
        default_value: String,
    },
    RemoveField {
        path: String,
    },
}

/// Creates a migration plan for format conversion.
///
/// # Arguments
///
/// * `from_format` - Source format
/// * `to_format` - Target format
///
/// # Returns
///
/// Returns the migration plan.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::create_migration_plan;
/// use config::types::ConfigFormat;
///
/// let plan = create_migration_plan(ConfigFormat::Toml, ConfigFormat::Json);
/// for step in plan.steps() {
///     println!("{}", step.description());
/// }
/// ```
pub fn create_migration_plan(
    from_format: ConfigFormat,
    to_format: ConfigFormat,
) -> MigrationPlan {
    let mut steps = Vec::new();

    if from_format != to_format {
        steps.push(MigrationStep {
            description: format!("Convert from {:?} to {:?}", from_format, to_format),
            action: MigrationAction::ConvertField {
                path: "config".to_string(),
                from_type: format!("{:?}", from_format),
                to_type: format!("{:?}", to_format),
            },
        });
    }

    MigrationPlan {
        from_format,
        to_format,
        steps,
    }
}

impl MigrationPlan {
    /// Returns the source format.
    ///
    /// # Returns
    ///
    /// Returns the format.
    pub fn from_format(&self) -> ConfigFormat {
        self.from_format
    }

    /// Returns the target format.
    ///
    /// # Returns
    ///
    /// Returns the format.
    pub fn to_format(&self) -> ConfigFormat {
        self.to_format
    }

    /// Returns the migration steps.
    ///
    /// # Returns
    ///
    /// Returns the steps.
    pub fn steps(&self) -> &[MigrationStep] {
        &self.steps
    }

    /// Returns the number of steps.
    ///
    /// # Returns
    ///
    /// Returns the step count.
    pub fn len(&self) -> usize {
        self.steps.len()
    }
}

impl MigrationStep {
    /// Returns the description.
    ///
    /// # Returns
    ///
    /// Returns the description.
    pub fn description(&self) -> &str {
        &self.description
    }

    /// Returns the action.
    ///
    /// # Returns
    ///
    /// Returns the action.
    pub fn action(&self) -> &MigrationAction {
        &self.action
    }
}

/// Validates export format.
///
/// # Arguments
///
/// * `format` - The format to validate
///
/// # Returns
///
/// Returns `Ok(())` if valid.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::validate_export_format;
/// use config::types::ConfigFormat;
///
/// validate_export_format(ConfigFormat::Toml).unwrap();
/// ```
pub fn validate_export_format(format: ConfigFormat) -> ConfigResult<()> {
    match format {
        ConfigFormat::Toml | ConfigFormat::Json | ConfigFormat::Yaml => Ok(()),
    }
}

/// Checks if configuration can be exported.
///
/// # Arguments
///
/// * `config` - The configuration
/// * `format` - The format
///
/// # Returns
///
/// Returns `true` if exportable.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::can_export;
/// use config::types::{AppConfig, ConfigFormat};
///
/// let config = AppConfig::default();
/// if can_export(&config, ConfigFormat::Toml) {
///     println!("Can export");
/// }
/// ```
pub fn can_export(config: &AppConfig, format: ConfigFormat) -> bool {
    validate_export_format(format).is_ok() && config.validate().is_ok()
}

/// Checks if configuration can be imported.
///
/// # Arguments
///
/// * `path` - The path to check
///
/// # Returns
///
/// Returns `true` if importable.
///
/// # Example
///
/// ```no_run
/// use config::utils::export_import::can_import;
///
/// if can_import("config.toml") {
///     println!("Can import");
/// }
/// ```
pub fn can_import<P: AsRef<Path>>(path: P) -> bool {
    let path = path.as_ref();
    path.exists() && path.is_file()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_config_to_string() {
        let config = AppConfig::default();
        let exported = export_config_to_string(&config, ConfigFormat::Toml).unwrap();
        assert!(exported.contains("theme_id"));
    }

    #[test]
    fn test_import_config_from_string() {
        let data = r#"[appearance]
theme_id = "dark"
"#;
        let config = import_config_from_string(data, ConfigFormat::Toml).unwrap();
        assert_eq!(config.appearance.theme_id, "dark");
    }

    #[test]
    fn test_export_config_bundle() {
        let config = AppConfig::default();
        let bundle = export_config_bundle(&config, ConfigFormat::Toml, None).unwrap();
        assert_eq!(bundle.metadata().version(), "1.0.0");
    }

    #[test]
    fn test_import_config_bundle() {
        let config = AppConfig::default();
        let bundle = export_config_bundle(&config, ConfigFormat::Toml, None).unwrap();
        let imported = import_config_bundle(&bundle).unwrap();
        assert_eq!(imported.appearance.theme_id, config.appearance.theme_id);
    }

    #[test]
    fn test_create_migration_plan() {
        let plan = create_migration_plan(ConfigFormat::Toml, ConfigFormat::Json);
        assert_eq!(plan.len(), 1);
    }

    #[test]
    fn test_validate_export_format() {
        assert!(validate_export_format(ConfigFormat::Toml).is_ok());
        assert!(validate_export_format(ConfigFormat::Json).is_ok());
        assert!(validate_export_format(ConfigFormat::Yaml).is_ok());
    }

    #[test]
    fn test_can_export() {
        let config = AppConfig::default();
        assert!(can_export(&config, ConfigFormat::Toml));
    }
}
