//! Configuration migration component
//!
//! Pure functions for migrating configuration between versions.

use super::super::error::{ConfigError, ConfigResult};
use super::super::types::AppConfig;
use super::super::version::ConfigVersion;

/// Migrates a configuration to the target version.
///
/// # Arguments
///
/// * `config` - The configuration to migrate
/// * `target_version` - The target version to migrate to
///
/// # Returns
///
/// Returns the migrated configuration.
///
/// # Example
///
/// ```no_run
/// use config::components::migrator::migrate_config;
/// use config::types::AppConfig;
/// use config::version::ConfigVersion;
///
/// let mut config = AppConfig::default();
/// let target = ConfigVersion::new(2, 0, 0);
/// migrate_config(&mut config, &target).unwrap();
/// ```
pub fn migrate_config(
    config: &mut AppConfig,
    target_version: &ConfigVersion,
) -> ConfigResult<()> {
    if config.version.major < target_version.major {
        migrate_major(config, config.version.major, target_version.major)?;
    }

    if config.version.minor < target_version.minor {
        migrate_minor(config, config.version.minor, target_version.minor)?;
    }

    config.version = target_version.clone();
    Ok(())
}

/// Performs major version migration.
fn migrate_major(
    config: &mut AppConfig,
    from: u32,
    to: u32,
) -> ConfigResult<()> {
    for version in from..to {
        match version {
            1 => {
                if to > 1 {
                    migrate_v1_to_v2(config)?;
                }
            }
            _ => {}
        }
    }
    Ok(())
}

/// Performs minor version migration.
fn migrate_minor(
    config: &mut AppConfig,
    from: u32,
    to: u32,
) -> ConfigResult<()> {
    for version in from..to {
        match version {
            0 => {
                if to > 0 {
                    migrate_v0_to_v1(config)?;
                }
            }
            _ => {}
        }
    }
    Ok(())
}

/// Migrates from version 0.x to 1.0.
fn migrate_v0_to_v1(config: &mut AppConfig) -> ConfigResult<()> {
    if config.appearance.font.family.is_empty() {
        config.appearance.font.family = "Consolas".to_string();
    }
    if config.appearance.font.size == 0 {
        config.appearance.font.size = 14;
    }
    Ok(())
}

/// Migrates from version 1.x to 2.0.
fn migrate_v1_to_v2(config: &mut AppConfig) -> ConfigResult<()> {
    if config.pty.rows == 0 {
        config.pty.rows = 24;
    }
    if config.pty.cols == 0 {
        config.pty.cols = 80;
    }
    Ok(())
}

/// Checks if a configuration needs migration.
///
/// # Arguments
///
/// * `config` - The configuration to check
/// * `target_version` - The target version
///
/// # Returns
///
/// Returns `true` if migration is needed, `false` otherwise.
pub fn needs_migration(config: &AppConfig, target_version: &ConfigVersion) -> bool {
    config.version.major < target_version.major
        || (config.version.major == target_version.major
            && config.version.minor < target_version.minor)
}
