//! IDE integration for configuration
//!
//! This module provides IDE integration features for configuration files.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};
use std::path::Path;

/// Represents IDE integration features.
pub struct IdeIntegration {
    language_server: bool,
    autocomplete: bool,
    syntax_highlighting: bool,
    validation: bool,
}

impl IdeIntegration {
    /// Creates a new IDE integration instance.
    ///
    /// # Returns
    ///
    /// Returns a new instance.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::ide_integration::IdeIntegration;
    ///
    /// let integration = IdeIntegration::new();
    /// ```
    pub fn new() -> Self {
        Self {
            language_server: true,
            autocomplete: true,
            syntax_highlighting: true,
            validation: true,
        }
    }

    /// Enables language server.
    ///
    /// # Arguments
    ///
    /// * `enabled` - Whether to enable
    pub fn with_language_server(mut self, enabled: bool) -> Self {
        self.language_server = enabled;
        self
    }

    /// Enables autocomplete.
    ///
    /// # Arguments
    ///
    /// * `enabled` - Whether to enable
    pub fn with_autocomplete(mut self, enabled: bool) -> Self {
        self.autocomplete = enabled;
        self
    }

    /// Enables syntax highlighting.
    ///
    /// # Arguments
    ///
    /// * `enabled` - Whether to enable
    pub fn with_syntax_highlighting(mut self, enabled: bool) -> Self {
        self.syntax_highlighting = enabled;
        self
    }

    /// Enables validation.
    ///
    /// # Arguments
    ///
    /// * `enabled` - Whether to enable
    pub fn with_validation(mut self, enabled: bool) -> Self {
        self.validation = enabled;
        self
    }

    /// Returns `true` if language server is enabled.
    ///
    /// # Returns
    ///
    /// Returns `true` if enabled.
    pub fn has_language_server(&self) -> bool {
        self.language_server
    }

    /// Returns `true` if autocomplete is enabled.
    ///
    /// # Returns
    ///
    /// Returns `true` if enabled.
    pub fn has_autocomplete(&self) -> bool {
        self.autocomplete
    }

    /// Returns `true` if syntax highlighting is enabled.
    ///
    /// # Returns
    ///
    /// Returns `true` if enabled.
    pub fn has_syntax_highlighting(&self) -> bool {
        self.syntax_highlighting
    }

    /// Returns `true` if validation is enabled.
    ///
    /// # Returns
    ///
    /// Returns `true` if enabled.
    pub fn has_validation(&self) -> bool {
        self.validation
    }
}

impl Default for IdeIntegration {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a language server configuration.
#[derive(Debug, Clone)]
pub struct LanguageServerConfig {
    server_name: String,
    server_version: String,
    capabilities: Vec<String>,
}

impl LanguageServerConfig {
    /// Creates a new language server configuration.
    ///
    /// # Returns
    ///
    /// Returns a new configuration.
    pub fn new() -> Self {
        Self {
            server_name: "wai-config-lsp".to_string(),
            server_version: "1.0.0".to_string(),
            capabilities: vec![
                "completion".to_string(),
                "hover".to_string(),
                "diagnostics".to_string(),
                "definition".to_string(),
                "references".to_string(),
                "rename".to_string(),
            ],
        }
    }

    /// Returns the server name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn server_name(&self) -> &str {
        &self.server_name
    }

    /// Returns the server version.
    ///
    /// # Returns
    ///
    /// Returns the version.
    pub fn server_version(&self) -> &str {
        &self.server_version
    }

    /// Returns the capabilities.
    ///
    /// # Returns
    ///
    /// Returns the capabilities.
    pub fn capabilities(&self) -> &[String] {
        &self.capabilities
    }

    /// Adds a capability.
    ///
    /// # Arguments
    ///
    /// * `capability` - The capability to add
    pub fn add_capability(&mut self, capability: String) {
        self.capabilities.push(capability);
    }

    /// Checks if a capability is supported.
    ///
    /// # Arguments
    ///
    /// * `capability` - The capability to check
    ///
    /// # Returns
    ///
    /// Returns `true` if supported.
    pub fn has_capability(&self, capability: &str) -> bool {
        self.capabilities.iter().any(|c| c == capability)
    }
}

/// Represents autocomplete suggestions.
#[derive(Debug, Clone)]
pub struct AutocompleteSuggestion {
    label: String,
    kind: String,
    detail: String,
}

impl AutocompleteSuggestion {
    /// Creates a new autocomplete suggestion.
    ///
    /// # Arguments
    ///
    /// * `label` - The suggestion label
    /// * `kind` - The suggestion kind
    /// * `detail` - The suggestion detail
    ///
    /// # Returns
    ///
    /// Returns a new suggestion.
    pub fn new(label: String, kind: String, detail: String) -> Self {
        Self {
            label,
            kind,
            detail,
        }
    }

    /// Returns the label.
    ///
    /// # Returns
    ///
    /// Returns the label.
    pub fn label(&self) -> &str {
        &self.label
    }

    /// Returns the kind.
    ///
    /// # Returns
    ///
    /// Returns the kind.
    pub fn kind(&self) -> &str {
        &self.kind
    }

    /// Returns the detail.
    ///
    /// # Returns
    ///
    /// Returns the detail.
    pub fn detail(&self) -> &str {
        &self.detail
    }
}

/// Gets autocomplete suggestions for a config file.
///
/// # Arguments
///
/// * `path` - The config file path
/// * `position` - The cursor position
///
/// # Returns
///
/// Returns a list of suggestions.
///
/// # Example
///
/// ```no_run
/// use config::utils::ide_integration::get_autocomplete_suggestions;
///
/// let suggestions = get_autocomplete_suggestions("Config.toml", 100);
/// for suggestion in suggestions {
///     println!("{}: {} ({})", suggestion.label(), suggestion.kind(), suggestion.detail());
/// }
/// ```
pub fn get_autocomplete_suggestions(path: &str, position: usize) -> Vec<AutocompleteSuggestion> {
    let mut suggestions = Vec::new();

    // Appearance suggestions
    suggestions.push(AutocompleteSuggestion::new(
        "appearance.theme_id".to_string(),
        "property".to_string(),
        "Theme identifier".to_string(),
    ));
    suggestions.push(AutocompleteSuggestion::new(
        "appearance.font.size".to_string(),
        "property".to_string(),
        "Font size".to_string(),
    ));
    suggestions.push(AutocompleteSuggestion::new(
        "appearance.font.family".to_string(),
        "property".to_string(),
        "Font family".to_string(),
    ));

    // Behavior suggestions
    suggestions.push(AutocompleteSuggestion::new(
        "behavior.auto_save".to_string(),
        "property".to_string(),
        "Auto save setting".to_string(),
    ));
    suggestions.push(AutocompleteSuggestion::new(
        "behavior.confirm_close".to_string(),
        "property".to_string(),
        "Confirm before closing".to_string(),
    ));

    // Advanced suggestions
    suggestions.push(AutocompleteSuggestion::new(
        "advanced.log_level".to_string(),
        "property".to_string(),
        "Log level".to_string(),
    ));
    suggestions.push(AutocompleteSuggestion::new(
        "advanced.enable_telemetry".to_string(),
        "property".to_string(),
        "Enable telemetry".to_string(),
    ));

    // PTY suggestions
    suggestions.push(AutocompleteSuggestion::new(
        "pty.shell".to_string(),
        "property".to_string(),
        "Shell command".to_string(),
    ));
    suggestions.push(AutocompleteSuggestion::new(
        "pty.rows".to_string(),
        "property".to_string(),
        "PTY rows".to_string(),
    ));

    suggestions
}

/// Represents a diagnostic.
#[derive(Debug, Clone)]
pub struct Diagnostic {
    range: (usize, usize),
    severity: DiagnosticSeverity,
    message: String,
}

/// Represents diagnostic severity.
#[derive(Debug, Clone, PartialEq)]
pub enum DiagnosticSeverity {
    Error,
    Warning,
    Info,
    Hint,
}

impl Diagnostic {
    /// Creates a new diagnostic.
    ///
    /// # Arguments
    ///
    /// * `range` - The diagnostic range
    /// * `severity` - The severity
    /// * `message` - The message
    ///
    /// # Returns
    ///
    /// Returns a new diagnostic.
    pub fn new(range: (usize, usize), severity: DiagnosticSeverity, message: String) -> Self {
        Self {
            range,
            severity,
            message,
        }
    }

    /// Returns the range.
    ///
    /// # Returns
    ///
    /// Returns the range.
    pub fn range(&self) -> (usize, usize) {
        self.range
    }

    /// Returns the severity.
    ///
    /// # Returns
    ///
    /// Returns the severity.
    pub fn severity(&self) -> &DiagnosticSeverity {
        &self.severity
    }

    /// Returns the message.
    ///
    /// # Returns
    ///
    /// Returns the message.
    pub fn message(&self) -> &str {
        &self.message
    }
}

/// Gets diagnostics for a config file.
///
/// # Arguments
///
/// * `path` - The config file path
///
/// # Returns
///
/// Returns a list of diagnostics.
///
/// # Example
///
/// ```no_run
/// use config::utils::ide_integration::get_diagnostics;
///
/// let diagnostics = get_diagnostics("Config.toml");
/// for diagnostic in diagnostics {
///     println!("{:?}: {}", diagnostic.severity(), diagnostic.message());
/// }
/// ```
pub fn get_diagnostics(path: &str) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    match AppConfig::load_from_path(path) {
        Ok(config) => {
            match config.validate() {
                Ok(()) => {}
                Err(e) => {
                    diagnostics.push(Diagnostic::new(
                        (0, 0),
                        DiagnosticSeverity::Error,
                        e.to_string(),
                    ));
                }
            }
        }
        Err(e) => {
            diagnostics.push(Diagnostic::new(
                (0, 0),
                DiagnosticSeverity::Error,
                e.to_string(),
            ));
        }
    }

    diagnostics
}

/// Represents syntax highlighting tokens.
#[derive(Debug, Clone)]
pub struct SyntaxToken {
    token_type: TokenType,
    text: String,
}

/// Represents token types.
#[derive(Debug, Clone, PartialEq)]
pub enum TokenType {
    Key,
    Value,
    Comment,
    String,
    Number,
    Boolean,
    Section,
}

impl SyntaxToken {
    /// Creates a new syntax token.
    ///
    /// # Arguments
    ///
    /// * `token_type` - The token type
    /// * `text` - The token text
    ///
    /// # Returns
    ///
    /// Returns a new token.
    pub fn new(token_type: TokenType, text: String) -> Self {
        Self {
            token_type,
            text,
        }
    }

    /// Returns the token type.
    ///
    /// # Returns
    ///
    /// Returns the token type.
    pub fn token_type(&self) -> &TokenType {
        &self.token_type
    }

    /// Returns the text.
    ///
    /// # Returns
    ///
    /// Returns the text.
    pub fn text(&self) -> &str {
        &self.text
    }
}

/// Tokenizes a config file.
///
/// # Arguments
///
/// * `content` - The file content
/// * `format` - The file format
///
/// # Returns
///
/// Returns a list of tokens.
///
/// # Example
///
/// ```no_run
/// use config::utils::ide_integration::tokenize_config;
/// use config::types::ConfigFormat;
///
/// let content = r#"theme_id = "dark""#;
/// let tokens = tokenize_config(content, ConfigFormat::Toml);
/// for token in tokens {
///     println!("{:?}: {}", token.token_type(), token.text());
/// }
/// ```
pub fn tokenize_config(content: &str, format: ConfigFormat) -> Vec<SyntaxToken> {
    let mut tokens = Vec::new();

    // Simple tokenization for demo
    for line in content.lines() {
        if line.trim().starts_with('#') {
            tokens.push(SyntaxToken::new(TokenType::Comment, line.to_string()));
            continue;
        }

        if line.contains('=') {
            let parts: Vec<&str> = line.split('=').collect();
            if parts.len() >= 2 {
                let key = parts[0].trim();
                let value = parts[1].trim();

                tokens.push(SyntaxToken::new(TokenType::Key, key.to_string()));

                if value.starts_with('"') {
                    tokens.push(SyntaxToken::new(TokenType::String, value.to_string()));
                } else if value.parse::<bool>().is_ok() {
                    tokens.push(SyntaxToken::new(TokenType::Boolean, value.to_string()));
                } else if value.parse::<i64>().is_ok() {
                    tokens.push(SyntaxToken::new(TokenType::Number, value.to_string()));
                } else {
                    tokens.push(SyntaxToken::new(TokenType::Value, value.to_string()));
                }
            }
        } else if line.starts_with('[') && line.ends_with(']') {
            tokens.push(SyntaxToken::new(TokenType::Section, line.to_string()));
        }
    }

    tokens
}

/// Represents an IDE extension.
#[derive(Debug, Clone)]
pub struct IdeExtension {
    name: String,
    version: String,
    description: String,
    supported_formats: Vec<ConfigFormat>,
}

impl IdeExtension {
    /// Creates a new IDE extension.
    ///
    /// # Arguments
    ///
    /// * `name` - The extension name
    /// * `version` - The extension version
    /// * `description` - The extension description
    ///
    /// # Returns
    ///
    /// Returns a new extension.
    pub fn new(name: String, version: String, description: String) -> Self {
        Self {
            name,
            version,
            description,
            supported_formats: vec![
                ConfigFormat::Toml,
                ConfigFormat::Json,
                ConfigFormat::Yaml,
            ],
        }
    }

    /// Returns the extension name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the extension version.
    ///
    /// # Returns
    ///
    /// Returns the version.
    pub fn version(&self) -> &str {
        &self.version
    }

    /// Returns the description.
    ///
    /// # Returns
    ///
    /// Returns the description.
    pub fn description(&self) -> &str {
        &self.description
    }

    /// Returns the supported formats.
    ///
    /// # Returns
    ///
    /// Returns the formats.
    pub fn supported_formats(&self) -> &[ConfigFormat] {
        &self.supported_formats
    }

    /// Checks if a format is supported.
    ///
    /// # Arguments
    ///
    /// * `format` - The format to check
    ///
    /// # Returns
    ///
    /// Returns `true` if supported.
    pub fn supports_format(&self, format: &ConfigFormat) -> bool {
        self.supported_formats.contains(format)
    }
}

/// Creates a VS Code extension manifest.
///
/// # Returns
///
/// Returns the manifest as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::ide_integration::create_vscode_manifest;
///
/// let manifest = create_vscode_manifest();
/// println!("{}", manifest);
/// ```
pub fn create_vscode_manifest() -> String {
    r#"{
  "name": "WAI Config",
  "displayName": "WAI Configuration Support",
  "description": "Language support for WAI configuration files",
  "version": "1.0.0",
  "engines": ["vscode"],
  "languages": [{
    "id": "toml",
    "aliases": ["config"],
    "extensions": [".toml"],
    "configuration": "./language-configuration.json"
  }],
  "contributes": [
    {
      "type": "languages",
      "languages": ["toml"],
      "label": "WAI Config",
      "aliases": ["config"],
      "extensions": [".toml"],
      "configuration": "./language-configuration.json"
    }
  ]
}"#
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ide_integration_new() {
        let integration = IdeIntegration::new();
        assert!(integration.has_language_server());
        assert!(integration.has_autocomplete());
    }

    #[test]
    fn test_language_server_config() {
        let config = LanguageServerConfig::new();
        assert_eq!(config.server_name(), "wai-config-lsp");
        assert!(config.has_capability("completion"));
    }

    #[test]
    fn test_autocomplete_suggestion() {
        let suggestion = AutocompleteSuggestion::new(
            "key".to_string(),
            "property".to_string(),
            "detail".to_string(),
        );
        assert_eq!(suggestion.label(), "key");
    }

    #[test]
    fn test_get_autocomplete_suggestions() {
        let suggestions = get_autocomplete_suggestions("Config.toml", 100);
        assert!(!suggestions.is_empty());
    }

    #[test]
    fn test_diagnostic() {
        let diagnostic = Diagnostic::new(
            (0, 10),
            DiagnosticSeverity::Error,
            "Error message".to_string(),
        );
        assert_eq!(diagnostic.message(), "Error message");
    }

    #[test]
    fn test_syntax_token() {
        let token = SyntaxToken::new(TokenType::Key, "key".to_string());
        assert_eq!(token.text(), "key");
    }

    #[test]
    fn test_tokenize_config() {
        let content = r#"theme_id = "dark""#;
        let tokens = tokenize_config(content, ConfigFormat::Toml);
        assert!(!tokens.is_empty());
    }

    #[test]
    fn test_ide_extension() {
        let extension = IdeExtension::new(
            "Test".to_string(),
            "1.0.0".to_string(),
            "Test extension".to_string(),
        );
        assert_eq!(extension.name(), "Test");
        assert!(extension.supports_format(&ConfigFormat::Toml));
    }

    #[test]
    fn test_create_vscode_manifest() {
        let manifest = create_vscode_manifest();
        assert!(manifest.contains("WAI Config"));
    }
}
