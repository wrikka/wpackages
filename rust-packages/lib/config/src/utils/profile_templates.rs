//! Profile templates for configuration
//!
//! This module provides predefined configuration profile templates.

use crate::types::AppConfig;
use std::collections::HashMap;

/// Represents a profile template.
#[derive(Debug, Clone)]
pub struct ProfileTemplate {
    id: String,
    name: String,
    description: String,
    config: AppConfig,
    tags: Vec<String>,
}

impl ProfileTemplate {
    /// Creates a new profile template.
    ///
    /// # Arguments
    ///
    /// * `id` - The template ID
    /// * `name` - The template name
    /// * `description` - The template description
    /// * `config` - The configuration
    /// * `tags` - Tags for categorization
    ///
    /// # Returns
    ///
    /// Returns a new template.
    pub fn new(
        id: String,
        name: String,
        description: String,
        config: AppConfig,
        tags: Vec<String>,
    ) -> Self {
        Self {
            id,
            name,
            description,
            config,
            tags,
        }
    }

    /// Returns the template ID.
    ///
    /// # Returns
    ///
    /// Returns the ID.
    pub fn id(&self) -> &str {
        &self.id
    }

    /// Returns the template name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the template description.
    ///
    /// # Returns
    ///
    /// Returns the description.
    pub fn description(&self) -> &str {
        &self.description
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns the tags.
    ///
    /// # Returns
    ///
    /// Returns the tags.
    pub fn tags(&self) -> &[String] {
        &self.tags
    }
}

/// Returns all available profile templates.
///
/// # Returns
///
/// Returns a list of templates.
///
/// # Example
///
/// ```no_run
/// use config::utils::profile_templates::get_templates;
///
/// let templates = get_templates();
/// for template in templates {
///     println!("{}: {}", template.name(), template.description());
/// }
/// ```
pub fn get_templates() -> Vec<ProfileTemplate> {
    vec![
        ProfileTemplate::new(
            "default".to_string(),
            "Default".to_string(),
            "Default configuration profile".to_string(),
            create_default_config(),
            vec!["default".to_string(), "basic".to_string()],
        ),
        ProfileTemplate::new(
            "development".to_string(),
            "Development".to_string(),
            "Optimized for development workflow".to_string(),
            create_development_config(),
            vec!["development".to_string(), "dev".to_string()],
        ),
        ProfileTemplate::new(
            "production".to_string(),
            "Production".to_string(),
            "Optimized for production environment".to_string(),
            create_production_config(),
            vec!["production".to_string(), "prod".to_string()],
        ),
        ProfileTemplate::new(
            "minimal".to_string(),
            "Minimal".to_string(),
            "Minimal configuration for lightweight usage".to_string(),
            create_minimal_config(),
            vec!["minimal".to_string(), "light".to_string()],
        ),
        ProfileTemplate::new(
            "accessibility".to_string(),
            "Accessibility".to_string(),
            "High accessibility configuration".to_string(),
            create_accessibility_config(),
            vec!["accessibility".to_string(), "a11y".to_string()],
        ),
        ProfileTemplate::new(
            "performance".to_string(),
            "Performance".to_string(),
            "High performance configuration".to_string(),
            create_performance_config(),
            vec!["performance".to_string(), "perf".to_string()],
        ),
    ]
}

/// Gets a template by ID.
///
/// # Arguments
///
/// * `id` - The template ID
///
/// # Returns
///
/// Returns the template if found.
///
/// # Example
///
/// ```no_run
/// use config::utils::profile_templates::get_template;
///
/// if let Some(template) = get_template("development") {
///     println!("Found: {}", template.name());
/// }
/// ```
pub fn get_template(id: &str) -> Option<ProfileTemplate> {
    get_templates().into_iter().find(|t| t.id() == id)
}

/// Gets templates by tag.
///
/// # Arguments
///
/// * `tag` - The tag to filter by
///
/// # Returns
///
/// Returns a list of matching templates.
///
/// # Example
///
/// ```no_run
/// use config::utils::profile_templates::get_templates_by_tag;
///
/// let templates = get_templates_by_tag("dev");
/// for template in templates {
///     println!("{}: {}", template.name(), template.description());
/// }
/// ```
pub fn get_templates_by_tag(tag: &str) -> Vec<ProfileTemplate> {
    get_templates()
        .into_iter()
        .filter(|t| t.tags().contains(&tag.to_string()))
        .collect()
}

/// Creates a default configuration.
fn create_default_config() -> AppConfig {
    AppConfig::default()
}

/// Creates a development configuration.
fn create_development_config() -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.theme_id = "developer-dark".to_string();
    config.appearance.font.size = 13;
    config.appearance.show_scrollbar = true;
    config.appearance.show_tab_bar = true;
    config.appearance.show_status_bar = true;

    config.behavior.auto_save = true;
    config.behavior.restore_session = true;
    config.behavior.shell_integration = true;

    config.advanced.log_level = "debug".to_string();
    config.advanced.enable_telemetry = false;
    config.advanced.update_check = false;

    config
}

/// Creates a production configuration.
fn create_production_config() -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.theme_id = "production-light".to_string();
    config.appearance.font.size = 14;

    config.behavior.auto_save = false;
    config.behavior.restore_session = false;

    config.advanced.log_level = "error".to_string();
    config.advanced.enable_telemetry = true;
    config.advanced.enable_error_reporting = true;
    config.advanced.update_check = true;

    config
}

/// Creates a minimal configuration.
fn create_minimal_config() -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.show_scrollbar = false;
    config.appearance.show_tab_bar = false;
    config.appearance.show_status_bar = false;

    config.behavior.auto_save = false;
    config.behavior.restore_session = false;

    config.advanced.log_level = "warn".to_string();
    config.advanced.enable_telemetry = false;

    config
}

/// Creates an accessibility configuration.
fn create_accessibility_config() -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.font.size = 18;
    config.appearance.font.line_height = 1.5;
    config.appearance.letter_spacing = 0.1;

    config.appearance.show_scrollbar = true;
    config.appearance.show_status_bar = true;

    config.advanced.log_level = "info".to_string();

    config
}

/// Creates a performance configuration.
fn create_performance_config() -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.show_scrollbar = false;
    config.appearance.show_tab_bar = false;
    config.appearance.show_status_bar = false;

    config.behavior.auto_save = false;
    config.behavior.restore_session = false;

    config.advanced.log_level = "error".to_string();
    config.advanced.enable_telemetry = false;

    config.advanced.enable_gpu_acceleration = true;

    config
}

/// Creates a custom profile template.
///
/// # Arguments
///
/// * `name` - The profile name
/// * `description` - The profile description
/// * `config` - The configuration
/// * `tags` - Tags for categorization
///
/// # Returns
///
/// Returns a custom template.
///
/// # Example
///
/// ```no_run
/// use config::utils::profile_templates::create_custom_template;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let template = create_custom_template(
///     "My Profile".to_string(),
///     "Custom profile".to_string(),
///     config,
///     vec!["custom".to_string()]
/// );
/// ```
pub fn create_custom_template(
    name: String,
    description: String,
    config: AppConfig,
    tags: Vec<String>,
) -> ProfileTemplate {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    let id = format!("custom-{}", timestamp);

    ProfileTemplate::new(id, name, description, config, tags)
}

/// Merges a template with existing configuration.
///
/// # Arguments
///
/// * `template` - The template to apply
/// * `config` - The existing configuration
///
/// # Returns
///
/// Returns the merged configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::profile_templates::apply_template;
/// use config::types::AppConfig;
///
/// let config = AppConfig::default();
/// let template = get_template("development").unwrap();
/// let merged = apply_template(&template, &config);
/// ```
pub fn apply_template(template: &ProfileTemplate, config: &AppConfig) -> AppConfig {
    let mut merged = config.clone();

    // Apply template settings
    if template.config().appearance.theme_id != "default-dark" {
        merged.appearance.theme_id = template.config().appearance.theme_id.clone();
    }

    if template.config().appearance.font.size != 14 {
        merged.appearance.font.size = template.config().appearance.font.size;
    }

    if template.config().behavior.auto_save != true {
        merged.behavior.auto_save = template.config().behavior.auto_save;
    }

    if template.config().advanced.log_level != "info" {
        merged.advanced.log_level = template.config().advanced.log_level.clone();
    }

    merged
}

/// Represents a template registry.
#[derive(Debug, Clone)]
pub struct TemplateRegistry {
    templates: Vec<ProfileTemplate>,
}

impl TemplateRegistry {
    /// Creates a new template registry.
    ///
    /// # Returns
    ///
    /// Returns a new registry.
    pub fn new() -> Self {
        Self {
            templates: get_templates(),
        }
    }

    /// Registers a custom template.
    ///
    /// # Arguments
    ///
    /// * `template` - The template to register
    pub fn register(&mut self, template: ProfileTemplate) {
        self.templates.push(template);
    }

    /// Gets a template by ID.
    ///
    /// # Arguments
    ///
    /// * `id` - The template ID
    ///
    /// # Returns
    ///
    /// Returns the template if found.
    pub fn get(&self, id: &str) -> Option<&ProfileTemplate> {
        self.templates.iter().find(|t| t.id() == id)
    }

    /// Lists all templates.
    ///
    /// # Returns
    ///
    /// Returns a slice of templates.
    pub fn list(&self) -> &[ProfileTemplate] {
        &self.templates
    }

    /// Searches templates by name.
    ///
    /// # Arguments
    ///
    /// * `query` - The search query
    ///
    /// # Returns
    ///
    /// Returns matching templates.
    pub fn search(&self, query: &str) -> Vec<&ProfileTemplate> {
        self.templates
            .iter()
            .filter(|t| {
                t.name().to_lowercase().contains(&query.to_lowercase())
                    || t.description().to_lowercase().contains(&query.to_lowercase())
            })
            .collect()
    }
}

impl Default for TemplateRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_templates() {
        let templates = get_templates();
        assert!(!templates.is_empty());
        assert!(templates.iter().any(|t| t.id() == "default"));
    }

    #[test]
    fn test_get_template() {
        let template = get_template("default");
        assert!(template.is_some());
        assert_eq!(template.unwrap().name(), "Default");
    }

    #[test]
    fn test_get_templates_by_tag() {
        let templates = get_templates_by_tag("dev");
        assert!(!templates.is_empty());
    }

    #[test]
    fn test_create_custom_template() {
        let config = AppConfig::default();
        let template = create_custom_template(
            "Test".to_string(),
            "Test template".to_string(),
            config,
            vec!["test".to_string()],
        );
        assert!(template.id().starts_with("custom-"));
    }

    #[test]
    fn test_apply_template() {
        let config = AppConfig::default();
        let template = get_template("development").unwrap();
        let merged = apply_template(&template, &config);
        assert_eq!(merged.appearance.theme_id, "developer-dark");
    }

    #[test]
    fn test_template_registry() {
        let registry = TemplateRegistry::new();
        assert!(!registry.list().is_empty());
    }

    #[test]
    fn test_template_registry_search() {
        let registry = TemplateRegistry::new();
        let results = registry.search("dev");
        assert!(!results.is_empty());
    }
}
