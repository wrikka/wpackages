//! Configuration documentation generator
//!
//! This module provides documentation generation for configuration.

use crate::types::AppConfig;
use std::collections::HashMap;

/// Represents a documentation generator.
pub struct DocumentationGenerator {
    config: AppConfig,
}

impl DocumentationGenerator {
    /// Creates a new documentation generator.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to document
    ///
    /// # Returns
    ///
    /// Returns a new generator.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// let generator = DocumentationGenerator::new(config);
    /// ```
    pub fn new(config: AppConfig) -> Self {
        Self { config }
    }

    /// Generates markdown documentation.
    ///
    /// # Returns
    ///
    /// Returns the documentation as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = DocumentationGenerator::new(config);
    /// let docs = generator.generate_markdown();
    /// println!("{}", docs);
    /// ```
    pub fn generate_markdown(&self) -> String {
        let mut docs = String::new();

        docs.push_str("# Configuration Documentation\n\n");
        docs.push_str("This document describes all configuration options.\n\n");

        docs.push_str("## Appearance\n\n");
        docs.push_str(&format!("- **theme_id**: `{}` - Theme identifier\n", self.config.appearance.theme_id));
        docs.push_str(&format!("- **font.family**: `{}` - Font family\n", self.config.appearance.font.family));
        docs.push_str(&format!("- **font.size**: `{}` - Font size\n", self.config.appearance.font.size));
        docs.push_str(&format!("- **font.line_height**: `{}` - Line height\n", self.config.appearance.font.line_height));
        docs.push_str(&format!("- **show_scrollbar**: `{}` - Show scrollbar\n", self.config.appearance.show_scrollbar));
        docs.push_str(&format!("- **show_tab_bar**: `{}` - Show tab bar\n", self.config.appearance.show_tab_bar));
        docs.push_str(&format!("- **show_status_bar**: `{}` - Show status bar\n", self.config.appearance.show_status_bar));
        docs.push_str("\n");

        docs.push_str("## Behavior\n\n");
        docs.push_str(&format!("- **confirm_close**: `{}` - Confirm before closing\n", self.config.behavior.confirm_close));
        docs.push_str(&format!("- **confirm_exit**: `{}` - Confirm before exit\n", self.config.behavior.confirm_exit));
        docs.push_str(&format!("- **auto_save**: `{}` - Auto save\n", self.config.behavior.auto_save));
        docs.push_str(&format!("- **restore_session**: `{}` - Restore session\n", self.config.behavior.restore_session));
        docs.push_str(&format!("- **shell_integration**: `{}` - Shell integration\n", self.config.behavior.shell_integration));
        docs.push_str(&format!("- **copy_on_select**: `{}` - Copy on select\n", self.config.behavior.copy_on_select));
        docs.push_str("\n");

        docs.push_str("## Advanced\n\n");
        docs.push_str(&format!("- **enable_gpu_acceleration**: `{}` - GPU acceleration\n", self.config.advanced.enable_gpu_acceleration));
        docs.push_str(&format!("- **enable_telemetry**: `{}` - Enable telemetry\n", self.config.advanced.enable_telemetry));
        docs.push_str(&format!("- **enable_error_reporting**: `{}` - Error reporting\n", self.config.advanced.enable_error_reporting));
        docs.push_str(&format!("- **log_level**: `{}` - Log level\n", self.config.advanced.log_level));
        docs.push_str(&format!("- **max_log_size_mb**: `{}` - Max log size (MB)\n", self.config.advanced.max_log_size_mb));
        docs.push_str(&format!("- **max_log_files**: `{}` - Max log files\n", self.config.advanced.max_log_files));
        docs.push_str(&format!("- **update_check**: `{}` - Update check\n", self.config.advanced.update_check));
        docs.push_str("\n");

        docs.push_str("## PTY\n\n");
        docs.push_str(&format!("- **shell**: `{}` - Shell command\n", self.config.pty.shell));
        docs.push_str(&format!("- **rows**: `{}` - PTY rows\n", self.config.pty.rows));
        docs.push_str(&format!("- **cols**: `{}` - PTY columns\n", self.config.pty.cols));
        docs.push_str("\n");

        docs
    }

    /// Generates JSON schema.
    ///
    /// # Returns
    ///
    /// Returns the JSON schema as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = DocumentationGenerator::new(config);
    /// let schema = generator.generate_json_schema();
    /// println!("{}", schema);
    /// ```
    pub fn generate_json_schema(&self) -> serde_json::Result<String> {
        let schema = serde_json::json!({
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "WAI Configuration",
            "type": "object",
            "properties": {
                "appearance": {
                    "type": "object",
                    "properties": {
                        "theme_id": {
                            "type": "string",
                            "default": "default-dark"
                        },
                        "font": {
                            "type": "object",
                            "properties": {
                                "family": {
                                    "type": "string",
                                    "default": "Consolas"
                                },
                                "size": {
                                    "type": "integer",
                                    "default": 14,
                                    "minimum": 1,
                                    "maximum": 72
                                },
                                "line_height": {
                                    "type": "number",
                                    "default": 1.2,
                                    "minimum": 0.5,
                                    "maximum": 3.0
                                }
                            }
                        }
                    }
                },
                "behavior": {
                    "type": "object",
                    "properties": {
                        "confirm_close": {
                            "type": "boolean",
                            "default": false
                        },
                        "auto_save": {
                            "type": "boolean",
                            "default": true
                        }
                    }
                },
                "advanced": {
                    "type": "object",
                    "properties": {
                        "log_level": {
                            "type": "string",
                            "enum": ["trace", "debug", "info", "warn", "error"],
                            "default": "info"
                        },
                        "enable_telemetry": {
                            "type": "boolean",
                            "default": false
                        }
                    }
                }
            }
        });

        serde_json::to_string_pretty(&schema)
    }

    /// Generates HTML documentation.
    ///
    /// # Returns
    ///
    /// Returns the HTML documentation as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = DocumentationGenerator::new(config);
    /// let html = generator.generate_html();
    /// println!("{}", html);
    /// ```
    pub fn generate_html(&self) -> String {
        format!(
            r#"<!DOCTYPE html>
<html>
<head>
    <title>Configuration Documentation</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .container {{ max-width: 900px; margin: 0 auto; }}
        h1 {{ color: #333; }}
        h2 {{ color: #555; border-bottom: 2px solid #ddd; padding-bottom: 10px; }}
        .property {{ margin: 10px 0; }}
        .name {{ font-weight: bold; color: #0066cc; }}
        .description {{ color: #666; }}
        code {{ background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Configuration Documentation</h1>
        <p>This document describes all configuration options.</p>
        {}
    </div>
</body>
</html>"#,
            self.generate_sections_html()
        )
    }

    /// Generates HTML sections.
    fn generate_sections_html(&self) -> String {
        let mut sections = String::new();

        sections.push_str("<h2>Appearance</h2>");
        sections.push_str(&self.generate_property_html("theme_id", "Theme identifier", &self.config.appearance.theme_id));
        sections.push_str(&self.generate_property_html("font.family", "Font family", &self.config.appearance.font.family));
        sections.push_str(&self.generate_property_html("font.size", "Font size", &self.config.appearance.font.size.to_string()));
        sections.push_str(&self.generate_property_html("show_scrollbar", "Show scrollbar", &self.config.appearance.show_scrollbar.to_string()));

        sections.push_str("<h2>Behavior</h2>");
        sections.push_str(&self.generate_property_html("confirm_close", "Confirm before closing", &self.config.behavior.confirm_close.to_string()));
        sections.push_str(&self.generate_property_html("auto_save", "Auto save", &self.config.behavior.auto_save.to_string()));
        sections.push_str(&self.generate_property_html("restore_session", "Restore session", &self.config.behavior.restore_session.to_string()));

        sections.push_str("<h2>Advanced</h2>");
        sections.push_str(&self.generate_property_html("enable_gpu_acceleration", "GPU acceleration", &self.config.advanced.enable_gpu_acceleration.to_string()));
        sections.push_str(&self.generate_property_html("log_level", "Log level", &self.config.advanced.log_level));
        sections.push_str(&self.generate_property_html("enable_telemetry", "Enable telemetry", &self.config.advanced.enable_telemetry.to_string()));

        sections
    }

    /// Generates a property HTML element.
    fn generate_property_html(&self, name: &str, description: &str, value: &str) -> String {
        format!(
            r#"<div class="property">
                <span class="name">{}</span>
                <span class="description">{}</span>
                <code>{}</code>
            </div>"#,
            name, description, value
        )
    }

    /// Generates a table of contents.
    ///
    /// # Returns
    ///
    /// Returns the TOC as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = DocumentationGenerator::new(config);
    /// let toc = generator.generate_toc();
    /// println!("{}", toc);
    /// ```
    pub fn generate_toc(&self) -> String {
        let mut toc = String::new();

        toc.push_str("# Table of Contents\n\n");
        toc.push_str("- [Appearance](#appearance)\n");
        toc.push_str("  - [Theme](#theme)\n");
        toc.push_str("  - [Font](#font)\n");
        toc.push_str("- [Behavior](#behavior)\n");
        toc.push_str("- [Advanced](#advanced)\n");
        toc.push_str("- [PTY](#pty)\n");
        toc.push_str("- [Theme](#theme)\n");
        toc.push_str("- [Clipboard](#clipboard)\n");
        toc.push_str("- [Hotkeys](#hotkeys)\n");

        toc
    }

    /// Generates examples.
    ///
    /// # Returns
    ///
    /// Returns the examples as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = MigrationWizard::new(config);
    /// let examples = generator.generate_examples();
    /// println!("{}", examples);
    /// ```
    pub fn generate_examples(&self) -> String {
        let mut examples = String::new();

        examples.push_str("# Configuration Examples\n\n");
        examples.push_str("## Basic Configuration\n\n");
        examples.push_str("```toml\n");
        examples.push_str("[appearance]\n");
        examples.push_str(&format!("theme_id = \"{}\"\n", self.config.appearance.theme_id));
        examples.push_str("\n");
        examples.push_str("[behavior]\n");
        examples.push_str(&format!("auto_save = {}\n", self.config.behavior.auto_save));
        examples.push_str("```\n\n");

        examples.push_str("## Development Configuration\n\n");
        examples.push_str("```toml\n");
        examples.push_str("[appearance]\n");
        examples.push_str("theme_id = \"developer-dark\"\n");
        examples.push_str("font.size = 13\n");
        examples.push_str("\n");
        examples.push_str("[behavior]\n");
        examples.push_str("auto_save = true\n");
        examples.push_str("restore_session = true\n");
        examples.push_str("\n");
        examples.push_str("[advanced]\n");
        examples.push_str("log_level = \"debug\"\n");
        examples.push_str("```\n\n");

        examples
    }

    /// Generates a quick start guide.
    ///
    /// # Returns
    ///
    /// Returns the guide as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = DocumentationGenerator::new(config);
    /// let guide = generator.generate_quick_start();
    /// println!("{}", guide);
    /// ```
    pub fn generate_quick_start(&self) -> String {
        r#"
# Quick Start Guide

## Installation

Add the config package to your `Cargo.toml`:

```toml
[dependencies]
config = { path = "../config" }
```

## Basic Usage

```rust
use config::prelude::*;

// Load configuration
let config = AppConfig::load()?;

// Modify configuration
config.appearance.theme_id = "dark".to_string();

// Save configuration
config.save()?;

// Validate configuration
config.validate()?;
```

## Environment Variables

Set environment variables to override configuration:

```bash
export APP_THEME_ID=dark
export APP_FONT_SIZE=14
export APP_AUTO_SAVE=true
```

## Profile Management

```rust
// Create a profile
let profile = ConfigProfile::new("Development", config);

// Add profile to manager
let mut manager = ConfigManager::new()?;
manager.add_profile(profile);

// Switch to profile
manager.set_active_profile("development");
```

## Migration

```rust
// Migrate configuration to latest version
let mut config = AppConfig::load()?;
config.migrate()?;
```
"#
        .to_string()
    }

    /// Generates a troubleshooting guide.
    ///
    /// # Returns
    ///
    /// Returns the guide as a string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::docs::DocumentationGenerator;
    ///
    /// let generator = DocumentationGenerator::new(config);
    /// let guide = generator.generate_troubleshooting();
    /// println!("{}", guide);
    /// ```
    pub fn generate_troubleshooting(&self) -> String {
        r#"
# Troubleshooting

## Configuration Not Found

If you see "Config file not found", ensure:
- The config file exists in the expected location
- You have read permissions
- The path is correct

## Validation Errors

Common validation errors:
- **PTY rows/cols must be greater than 0**: Set valid values for `pty.rows` and `pty.cols`
- **Font size must be greater than 0**: Set a valid font size
- **Log level must be valid**: Use one of: trace, debug, info, warn, error

## Migration Errors

If migration fails:
- Check the config version
- Ensure you have a backup
- Try manual migration

## Performance Issues

If config loading is slow:
- Use zero-copy parsing
- Consider using JSON instead of TOML
- Reduce config file size

## Hot Reload Not Working

If hot reload doesn't work:
- Check file permissions
- Ensure the watcher is running
- Verify the file path is correct
"#
        .to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_documentation_generator_new() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        assert_eq!(generator.config.appearance.theme_id, "default-dark");
    }

    #[test]
    fn test_generate_markdown() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let docs = generator.generate_markdown();
        assert!(docs.contains("# Configuration Documentation"));
        assert!(docs.contains("## Appearance"));
    }

    #[test]
    fn test_generate_json_schema() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let schema = generator.generate_json_schema().unwrap();
        assert!(schema.contains("WAI Configuration"));
    }

    #[test]
    fn test_generate_html() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let html = generator.generate_html();
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Configuration Documentation"));
    }

    #[test]
    fn test_generate_toc() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let toc = generator.generate_toc();
        assert!(toc.contains("# Table of Contents"));
    }

    #[test]
    fn test_generate_examples() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let examples = generator.generate_examples();
        assert!(examples.contains("# Configuration Examples"));
    }

    #[test]
    fn test_generate_quick_start() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let guide = generator.generate_quick_start();
        assert!(guide.contains("# Quick Start Guide"));
    }

    #[test]
    fn test_generate_troubleshooting() {
        let config = AppConfig::default();
        let generator = DocumentationGenerator::new(config);
        let guide = generator.generate_troubleshooting();
        assert!(guide.contains("# Troubleshooting"));
    }
}
