//! CLI tool for configuration management
//!
//! This module provides a CLI interface for configuration operations.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};
use std::path::Path;

/// Represents CLI command result.
#[derive(Debug, Clone)]
pub enum CommandResult {
    Success(String),
    Error(String),
    Help(String),
}

/// Represents a CLI command.
pub enum CliCommand {
    Init,
    Validate { path: String },
    Migrate { path: String },
    Export { path: String, format: ConfigFormat },
    Import { path: String, format: ConfigFormat },
    Diff { old: String, new: String },
    Merge { base: String, other: String },
    Version { path: String },
    Help,
}

/// Represents a CLI tool.
pub struct CliTool {
    name: String,
    version: String,
}

impl CliTool {
    /// Creates a new CLI tool.
    ///
    /// # Returns
    ///
    /// Returns a new tool.
    pub fn new() -> Self {
        Self {
            name: "wai-config".to_string(),
            version: "1.0.0".to_string(),
        }
    }

    /// Executes a CLI command.
    ///
    /// # Arguments
    ///
    /// * `command` - The command to execute
    ///
    /// # Returns
    ///
    /// Returns the command result.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::cli::{CliTool, CliCommand};
    ///
    /// let tool = CliTool::new();
    /// let result = tool.execute(CliCommand::Help);
    /// ```
    pub fn execute(&self, command: CliCommand) -> CommandResult {
        match command {
            CliCommand::Init => self.init(),
            CliCommand::Validate { path } => self.validate(&path),
            CliCommand::Migrate { path } => self.migrate(&path),
            CliCommand::Export { path, format } => self.export(&path, format),
            CliCommand::Import { path, format } => self.import(&path, format),
            CliCommand::Diff { old, new } => self.diff(&old, &new),
            CliCommand::Merge { base, other } => self.merge(&base, &other),
            CliCommand::Version { path } => self.version(&path),
            CliCommand::Help => self.help(),
        }
    }

    /// Initializes configuration.
    fn init(&self) -> CommandResult {
        let config = AppConfig::default();
        match config.save() {
            Ok(()) => CommandResult::Success("Configuration initialized successfully".to_string()),
            Err(e) => CommandResult::Error(format!("Failed to initialize: {}", e)),
        }
    }

    /// Validates configuration.
    fn validate(&self, path: &str) -> CommandResult {
        match AppConfig::load_from_path(path) {
            Ok(config) => match config.validate() {
                Ok(()) => CommandResult::Success("Configuration is valid".to_string()),
                Err(e) => CommandResult::Error(format!("Validation failed: {}", e)),
            },
            Err(e) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Migrates configuration.
    fn migrate(&self, path: &str) -> CommandResult {
        match AppConfig::load_from_path(path) {
            Ok(mut config) => match config.migrate() {
                Ok(()) => match config.save() {
                    Ok(()) => CommandResult::Success("Configuration migrated successfully".to_string()),
                    Err(e) => CommandResult::Error(format!("Failed to save: {}", e)),
                },
                Err(e) => CommandResult::Error(format!("Migration failed: {}", e)),
            },
            Err(e) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Exports configuration.
    fn export(&self, path: &str, format: ConfigFormat) -> CommandResult {
        match AppConfig::load() {
            Ok(config) => match config.save_to_path(path, format) {
                Ok(()) => CommandResult::Success(format!("Exported to {}", path)),
                Err(e) => CommandResult::Error(format!("Export failed: {}", e)),
            },
            Err(e) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Imports configuration.
    fn import(&self, path: &str, format: ConfigFormat) -> CommandResult {
        match AppConfig::load_from_path(path) {
            Ok(config) => match config.save_to_path("Config.toml", ConfigFormat::Toml) {
                Ok(()) => CommandResult::Success("Configuration imported successfully".to_string()),
                Err(e) => CommandResult::Error(format!("Import failed: {}", e)),
            },
            Err(e) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Diffs two configurations.
    fn diff(&self, old: &str, new: &str) -> CommandResult {
        match (AppConfig::load_from_path(old), AppConfig::load_from_path(new)) {
            (Ok(old_config), Ok(new_config)) => {
                use crate::utils::diff_merge::diff_configs;
                let diff = diff_configs(&old_config, &new_config);
                CommandResult::Success(format!("Found {} differences", diff.len()))
            }
            (Err(e), _) | (_, Err(e)) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Merges two configurations.
    fn merge(&self, base: &str, other: &str) -> CommandResult {
        match (AppConfig::load_from_path(base), AppConfig::load_from_path(other)) {
            (Ok(base_config), Ok(other_config)) => {
                use crate::utils::diff_merge::merge_configs;
                let merged = merge_configs(&base_config, &other_config);
                CommandResult::Success("Configuration merged successfully".to_string())
            }
            (Err(e), _) | (_, Err(e)) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Shows configuration version.
    fn version(&self, path: &str) -> CommandResult {
        match AppConfig::load_from_path(path) {
            Ok(config) => CommandResult::Success(format!("Config version: {}", config.version.as_string())),
            Err(e) => CommandResult::Error(format!("Failed to load: {}", e)),
        }
    }

    /// Shows help information.
    fn help(&self) -> CommandResult {
        let help = format!(
            "{} v{}\n\
             \n\
             Usage: {} <command> [options]\n\
             \n\
             Commands:\n\
             init              Initialize configuration\n\
             validate <path>   Validate configuration\n\
             migrate <path>    Migrate configuration\n\
             export <path>    Export configuration\n\
             import <path>    Import configuration\n\
             diff <old> <new>  Diff configurations\n\
             merge <base> <other> Merge configurations\n\
             version <path>    Show config version\n\
             help              Show this help\n\
             \n\
             Options:\n\
             --format <toml|json|yaml>  Specify format\n",
            self.name, self.version, self.name
        );
        CommandResult::Help(help)
    }
}

impl Default for CliTool {
    fn default() -> Self {
        Self::new()
    }
}

/// Parses CLI arguments into a command.
///
/// # Arguments
///
/// * `args` - The command line arguments
///
/// # Returns
///
/// Returns the parsed command.
///
/// # Example
///
/// ```no_run
/// use config::utils::cli::parse_args;
///
/// let args = vec
!["validate", "Config.toml"];
/// let command = parse_args(&args);
/// ```
pub fn parse_args(args: &[String]) -> CliCommand {
    if args.is_empty() {
        return CliCommand::Help;
    }

    match args[0].as_str() {
        "init" => CliCommand::Init,
        "validate" => {
            let path = args.get(1).cloned().unwrap_or_else(|| "Config.toml".to_string());
            CliCommand::Validate { path }
        }
        "migrate" => {
            let path = args.get(1).cloned().unwrap_or_else(|| "Config.toml".to_string());
            CliCommand::Migrate { path }
        }
        "export" => {
            let path = args.get(1).cloned().unwrap_or_else(|| "export.toml".to_string());
            let format = args.get(2).and_then(|f| match f.as_str() {
                "toml" => Some(ConfigFormat::Toml),
                "json" => Some(ConfigFormat::Json),
                "yaml" => Some(ConfigFormat::Yaml),
                _ => None,
            }).unwrap_or(ConfigFormat::Toml);
            CliCommand::Export { path, format }
        }
        "import" => {
            let path = args.get(1).cloned().unwrap_or_else(|| "import.toml".to_string());
            let format = args.get(2).and_then(|f| match f.as_str() {
                "toml" => Some(ConfigFormat::Toml),
                "json" => Some(ConfigFormat::Json),
                "yaml" => Some(ConfigFormat::Yaml),
                _ => None,
            }).unwrap_or(ConfigFormat::Toml);
            CliCommand::Import { path, format }
        }
        "diff" => {
            let old = args.get(1).cloned().unwrap_or_else(|| "old.toml".to_string());
            let new = args.get(2).cloned().unwrap_or_else(|| "new.toml".to_string());
            CliCommand::Diff { old, new }
        }
        "merge" => {
            let base = args.get(1).cloned().unwrap_or_else(|| "base.toml".to_string());
            let other = args.get(2).cloned().unwrap_or_else(|| "other.toml".to_string());
            CliCommand::Merge { base, other }
        }
        "version" => {
            let path = args.get(1).cloned().unwrap_or_else(|| "Config.toml".to_string());
            CliCommand::Version { path }
        }
        "help" | "--help" | "-h" => CliCommand::Help,
        _ => CliCommand::Help,
    }
}

/// Runs the CLI tool.
///
/// # Arguments
///
/// * `args` - The command line arguments
///
/// # Returns
///
/// Returns the command result.
///
/// # Example
///
/// ```no_run
/// use config::utils::cli::run_cli;
///
/// let args = vec
!["validate".to_string(), "Config.toml".to_string()];
/// let result = run_cli(&args);
/// ```
pub fn run_cli(args: &[String]) -> CommandResult {
    let tool = CliTool::new();
    let command = parse_args(args);
    tool.execute(command)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cli_tool_new() {
        let tool = CliTool::new();
        assert_eq!(tool.name, "wai-config");
    }

    #[test]
    fn test_cli_tool_help() {
        let tool = CliTool::new();
        let result = tool.execute(CliCommand::Help);
        assert!(matches!(result, CommandResult::Help(_)));
    }

    #[test]
    fn test_parse_args_help() {
        let args = vec
!["help".to_string()];
        let command = parse_args(&args);
        assert!(matches!(command, CliCommand::Help));
    }

    #[test]
    fn test_parse_args_validate() {
        let args = vec
!["validate".to_string(), "Config.toml".to_string()];
        let command = parse_args(&args);
        assert!(matches!(command, CliCommand::Validate { .. }));
    }

    #[test]
    fn test_parse_args_export() {
        let args = vec
!["export".to_string(), "output.toml".to_string(), "toml".to_string()];
        let command = parse_args(&args);
        assert!(matches!(command, CliCommand::Export { .. }));
    }
}
