use crate::error::RsuiError;
use crate::types::theme::RsuiTheme;
use crate::types::theme_variables::{ThemeVariables, ThemeVariable, ThemeVariableType};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[cfg(test)]
mod theme_export_service_tests;

/// Export format
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExportFormat {
    Json,
    Toml,
    Yaml,
    Css,
}

impl ExportFormat {
    pub fn extension(&self) -> &str {
        match self {
            ExportFormat::Json => "json",
            ExportFormat::Toml => "toml",
            ExportFormat::Yaml => "yaml",
            ExportFormat::Css => "css",
        }
    }
}

/// Theme export data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeExport {
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub theme: RsuiTheme,
    pub variables: ThemeVariables,
}

impl ThemeExport {
    pub fn new(name: impl Into<String>, theme: RsuiTheme) -> Self {
        Self {
            name: name.into(),
            version: "1.0.0".to_string(),
            description: None,
            theme,
            variables: ThemeVariables::new(),
        }
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn with_version(mut self, version: impl Into<String>) -> Self {
        self.version = version.into();
        self
    }

    pub fn with_variables(mut self, variables: ThemeVariables) -> Self {
        self.variables = variables;
        self
    }
}

/// Theme export service trait
pub trait ThemeExportService {
    fn export(&self, theme_export: &ThemeExport, format: ExportFormat) -> Result<String, RsuiError>;
    fn import(&self, data: &str, format: ExportFormat) -> Result<ThemeExport, RsuiError>;
    fn export_to_file(&self, theme_export: &ThemeExport, format: ExportFormat, path: &str) -> Result<(), RsuiError>;
    fn import_from_file(&self, path: &str) -> Result<ThemeExport, RsuiError>;
    fn list_themes(&self, directory: &str) -> Result<Vec<String>, RsuiError>;
}

/// Default theme export service implementation
pub struct DefaultThemeExportService;

impl DefaultThemeExportService {
    pub fn new() -> Self {
        Self
    }
}

impl Default for DefaultThemeExportService {
    fn default() -> Self {
        Self::new()
    }
}

impl ThemeExportService for DefaultThemeExportService {
    fn export(&self, theme_export: &ThemeExport, format: ExportFormat) -> Result<String, RsuiError> {
        match format {
            ExportFormat::Json => self.export_json(theme_export),
            ExportFormat::Toml => self.export_toml(theme_export),
            ExportFormat::Yaml => self.export_yaml(theme_export),
            ExportFormat::Css => self.export_css(theme_export),
        }
    }

    fn import(&self, data: &str, format: ExportFormat) -> Result<ThemeExport, RsuiError> {
        match format {
            ExportFormat::Json => self.import_json(data),
            ExportFormat::Toml => self.import_toml(data),
            ExportFormat::Yaml => self.import_yaml(data),
            ExportFormat::Css => Err(RsuiError::Export("CSS import not supported".to_string())),
        }
    }

    fn export_to_file(&self, theme_export: &ThemeExport, format: ExportFormat, path: &str) -> Result<(), RsuiError> {
        let data = self.export(theme_export, format)?;
        std::fs::write(path, data).map_err(RsuiError::Io)?;
        Ok(())
    }

    fn import_from_file(&self, path: &str) -> Result<ThemeExport, RsuiError> {
        let data = std::fs::read_to_string(path).map_err(RsuiError::Io)?;
        
        let format = if path.ends_with(".json") {
            ExportFormat::Json
        } else if path.ends_with(".toml") {
            ExportFormat::Toml
        } else if path.ends_with(".yaml") || path.ends_with(".yml") {
            ExportFormat::Yaml
        } else {
            return Err(RsuiError::Export("Unknown file format".to_string()));
        };

        self.import(&data, format)
    }

    fn list_themes(&self, directory: &str) -> Result<Vec<String>, RsuiError> {
        let mut themes = Vec::new();
        
        let entries = std::fs::read_dir(directory).map_err(RsuiError::Io)?;
        
        for entry in entries {
            let entry = entry.map_err(RsuiError::Io)?;
            let path = entry.path();
            
            if path.is_file() {
                let extension = path.extension().and_then(|e| e.to_str());
                if matches!(extension, Some("json") | Some("toml") | Some("yaml") | Some("yml")) {
                    if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                        themes.push(name.to_string());
                    }
                }
            }
        }
        
        themes.sort();
        Ok(themes)
    }
}

impl DefaultThemeExportService {
    fn export_json(&self, theme_export: &ThemeExport) -> Result<String, RsuiError> {
        serde_json::to_string_pretty(theme_export).map_err(|e| RsuiError::Export(e.to_string()))
    }

    fn export_toml(&self, theme_export: &ThemeExport) -> Result<String, RsuiError> {
        toml::to_string_pretty(theme_export).map_err(|e| RsuiError::Export(e.to_string()))
    }

    fn export_yaml(&self, theme_export: &ThemeExport) -> Result<String, RsuiError> {
        serde_yaml::to_string(theme_export).map_err(|e| RsuiError::Export(e.to_string()))
    }

    fn export_css(&self, theme_export: &ThemeExport) -> Result<String, RsuiError> {
        let mut css = String::new();
        
        // Theme name as comment
        css.push_str(&format!("/* Theme: {} */\n", theme_export.name));
        css.push_str(&format!("/* Version: {} */\n", theme_export.version));
        if let Some(desc) = &theme_export.description {
            css.push_str(&format!("/* Description: {} */\n", desc));
        }
        css.push_str("\n");

        // CSS variables
        css.push_str(":root {\n");
        
        // Export theme colors as CSS variables
        css.push_str(&format!("  --rsui-primary: {};\n", color_to_css(theme_export.theme.primary)));
        css.push_str(&format!("  --rsui-secondary: {};\n", color_to_css(theme_export.theme.secondary)));
        css.push_str(&format!("  --rsui-accent: {};\n", color_to_css(theme_export.theme.accent)));
        css.push_str(&format!("  --rsui-foreground: {};\n", color_to_css(theme_export.theme.foreground)));
        css.push_str(&format!("  --rsui-background: {};\n", color_to_css(theme_export.theme.background)));
        css.push_str(&format!("  --rsui-card: {};\n", color_to_css(theme_export.theme.card)));
        css.push_str(&format!("  --rsui-card-foreground: {};\n", color_to_css(theme_export.theme.card_foreground)));
        css.push_str(&format!("  --rsui-popover: {};\n", color_to_css(theme_export.theme.popover)));
        css.push_str(&format!("  --rsui-popover-foreground: {};\n", color_to_css(theme_export.theme.popover_foreground)));
        css.push_str(&format!("  --rsui-primary-foreground: {};\n", color_to_css(theme_export.theme.primary_foreground)));
        css.push_str(&format!("  --rsui-secondary-foreground: {};\n", color_to_css(theme_export.theme.secondary_foreground)));
        css.push_str(&format!("  --rsui-accent-foreground: {};\n", color_to_css(theme_export.theme.accent_foreground)));
        css.push_str(&format!("  --rsui-destructive: {};\n", color_to_css(theme_export.theme.destructive)));
        css.push_str(&format!("  --rsui-destructive-foreground: {};\n", color_to_css(theme_export.theme.destructive_foreground)));
        css.push_str(&format!("  --rsui-border: {};\n", color_to_css(theme_export.theme.border)));
        css.push_str(&format!("  --rsui-input: {};\n", color_to_css(theme_export.theme.input)));
        css.push_str(&format!("  --rsui-ring: {};\n", color_to_css(theme_export.theme.ring)));
        
        // Export custom variables
        for variable in theme_export.variables.iter() {
            css.push_str(&format!("  {};\n", variable.1.css_variable_name_and_value()));
        }
        
        css.push_str("}\n");
        
        Ok(css)
    }

    fn import_json(&self, data: &str) -> Result<ThemeExport, RsuiError> {
        serde_json::from_str(data).map_err(|e| RsuiError::Export(e.to_string()))
    }

    fn import_toml(&self, data: &str) -> Result<ThemeExport, RsuiError> {
        toml::from_str(data).map_err(|e| RsuiError::Export(e.to_string()))
    }

    fn import_yaml(&self, data: &str) -> Result<ThemeExport, RsuiError> {
        serde_yaml::from_str(data).map_err(|e| RsuiError::Export(e.to_string()))
    }
}

/// Helper trait for theme variables
trait ThemeVariableExt {
    fn css_variable_name_and_value(&self) -> String;
}

impl ThemeVariableExt for ThemeVariable {
    fn css_variable_name_and_value(&self) -> String {
        format!("{}: {}", self.css_variable_name(), self.css_value())
    }
}

/// Convert egui Color32 to CSS color string
fn color_to_css(color: eframe::egui::Color32) -> String {
    let [r, g, b, a] = color.to_array();
    format!("rgba({}, {}, {}, {})", r, g, b, a)
}

/// Create a theme export from current theme
pub fn create_theme_export(name: impl Into<String>, theme: &RsuiTheme) -> ThemeExport {
    ThemeExport::new(name, theme.clone())
}

/// Export theme to JSON string
pub fn export_theme_to_json(theme_export: &ThemeExport) -> Result<String, RsuiError> {
    let service = DefaultThemeExportService::new();
    service.export(theme_export, ExportFormat::Json)
}

/// Export theme to CSS string
pub fn export_theme_to_css(theme_export: &ThemeExport) -> Result<String, RsuiError> {
    let service = DefaultThemeExportService::new();
    service.export(theme_export, ExportFormat::Css)
}
