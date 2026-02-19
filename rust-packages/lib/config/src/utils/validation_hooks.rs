//! Configuration validation hooks
//!
//! This module provides validation hooks for custom configuration validation.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;

/// Represents a validation hook.
pub trait ValidationHook: Send + Sync {
    /// Validates the configuration.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to validate
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` if valid, `Err` with error if invalid.
    fn validate(&self, config: &AppConfig) -> ConfigResult<()>;

    /// Returns the hook name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    fn name(&self) -> &str {
        "validation_hook"
    }
}

/// Represents a configuration validator with hooks.
pub struct ConfigValidator {
    hooks: Vec<Box<dyn ValidationHook>>,
}

impl ConfigValidator {
    /// Creates a new configuration validator.
    ///
    /// # Returns
    ///
    /// Returns a new validator.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::validation_hooks::ConfigValidator;
    ///
    /// let validator = ConfigValidator::new();
    /// ```
    pub fn new() -> Self {
        Self {
            hooks: Vec::new(),
        }
    }

    /// Adds a validation hook.
    ///
    /// # Arguments
    ///
    /// * `hook` - The hook to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::validation_hooks::ConfigValidator;
    ///
    /// let mut validator = ConfigValidator::new();
    /// validator.add_hook(Box::new(MyHook));
    /// ```
    pub fn add_hook(&mut self, hook: Box<dyn ValidationHook>) {
        self.hooks.push(hook);
    }

    /// Removes a hook by name.
    ///
    /// # Arguments
    ///
    /// * `name` - The hook name
    ///
    /// # Returns
    ///
    /// Returns `true` if removed.
    pub fn remove_hook(&mut self, name: &str) -> bool {
        if let Some(pos) = self.hooks.iter().position(|h| h.name() == name) {
            self.hooks.remove(pos);
            true
        } else {
            false
        }
    }

    /// Validates configuration with all hooks.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to validate
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` if valid, `Err` with errors if invalid.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::validation_hooks::ConfigValidator;
    /// use config::types::AppConfig;
    ///
    /// let validator = ConfigValidator::new();
    /// let config = AppConfig::default();
    /// validator.validate(&config).unwrap();
    /// ```
    pub fn validate(&self, config: &AppConfig) -> ConfigResult<()> {
        for hook in &self.hooks {
            hook.validate(config)?;
        }
        Ok(())
    }

    /// Returns the number of hooks.
    ///
    /// # Returns
    ///
    /// Returns the hook count.
    pub fn len(&self) -> usize {
        self.hooks.len()
    }

    /// Returns `true` if there are no hooks.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.hooks.is_empty()
    }
}

impl Default for ConfigValidator {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a validation result.
#[derive(Debug, Clone)]
pub struct ValidationResult {
    is_valid: bool,
    errors: Vec<String>,
    warnings: Vec<String>,
}

impl ValidationResult {
    /// Creates a new validation result.
    ///
    /// # Arguments
    ///
    /// * `is_valid` - Whether the config is valid
    /// * `errors` - List of errors
    /// * `warnings` - List of warnings
    ///
    /// # Returns
    ///
    /// Returns a new result.
    pub fn new(is_valid: bool, errors: Vec<String>, warnings: Vec<String>) -> Self {
        Self {
            is_valid,
            errors,
            warnings,
        }
    }

    /// Returns `true` if valid.
    ///
    /// # Returns
    ///
    /// Returns `true` if valid.
    pub fn is_valid(&self) -> bool {
        self.is_valid
    }

    /// Returns the errors.
    ///
    /// # Returns
    ///
    /// Returns the errors.
    pub fn errors(&self) -> &[String] {
        &self.errors
    }

    /// Returns the warnings.
    ///
    /// # Returns
    ///
    /// Returns the warnings.
    pub fn warnings(&self) -> &[String] {
        &self.warnings
    }

    /// Returns the total number of issues.
    ///
    /// # Returns
    ///
    /// Returns the issue count.
    pub fn total_issues(&self) -> usize {
        self.errors.len() + self.warnings.len()
    }
}

/// Represents a validation hook builder.
pub struct ValidationHookBuilder {
    name: String,
    validator: Box<dyn Fn(&AppConfig) -> ConfigResult<()> + Send + Sync>,
}

impl ValidationHookBuilder {
    /// Creates a new validation hook builder.
    ///
    /// # Arguments
    ///
    /// * `name` - The hook name
    ///
    /// # Returns
    ///
    /// Returns a new builder.
    pub fn new(name: String) -> Self {
        Self {
            name,
            validator: Box::new(|_| Ok(())),
        }
    }

    /// Sets the validator function.
    ///
    /// # Arguments
    ///
    /// * `validator` - The validator function
    ///
    /// # Returns
    ///
    /// Returns the builder.
    pub fn with_validator<F>(mut self, validator: F) -> Self
    where
        F: Fn(&AppConfig) -> ConfigResult<()> + Send + Sync + 'static,
    {
        self.validator = Box::new(validator);
        self
    }

    /// Builds the validation hook.
    ///
    /// # Returns
    ///
    /// Returns the hook.
    pub fn build(self) -> Box<dyn ValidationHook> {
        Box::new(BuiltValidationHook {
            name: self.name,
            validator: self.validator,
        })
    }
}

/// Represents a built validation hook.
struct BuiltValidationHook {
    name: String,
    validator: Box<dyn Fn(&AppConfig) -> ConfigResult<()> + Send + Sync>,
}

impl ValidationHook for BuiltValidationHook {
    fn validate(&self, config: &AppConfig) -> ConfigResult<()> {
        (self.validator)(config)
    }

    fn name(&self) -> &str {
        &self.name
    }
}

/// Creates a simple validation hook.
///
/// # Arguments
///
/// * `name` - The hook name
/// * `validator` - The validator function
///
/// # Returns
///
/// Returns the hook.
///
/// # Example
///
/// ```no_run
/// use config::utils::validation_hooks::create_validation_hook;
/// use config::types::AppConfig;
///
/// let hook = create_validation_hook("my_hook", |config| {
///     if config.appearance.font.size > 100 {
///         Err(ConfigError::ValidationError("Font size too large".to_string()))
///     } else {
///         Ok(())
///     }
/// });
/// ```
pub fn create_validation_hook<F>(
    name: String,
    validator: F,
) -> Box<dyn ValidationHook>
where
    F: Fn(&AppConfig) -> ConfigResult<()> + Send + Sync + 'static,
{
    ValidationHookBuilder::new(name).with_validator(validator).build()
}

/// Represents a hook registry.
#[derive(Debug, Clone, Default)]
pub struct HookRegistry {
    hooks: Vec<Box<dyn ValidationHook>>,
}

impl HookRegistry {
    /// Creates a new hook registry.
    ///
    /// # Returns
    ///
    /// Returns a new registry.
    pub fn new() -> Self {
        Self {
            hooks: Vec::new(),
        }
    }

    /// Registers a hook.
    ///
    /// # Arguments
    ///
    /// * `hook` - The hook to register
    pub fn register(&mut self, hook: Box<dyn ValidationHook>) {
        self.hooks.push(hook);
    }

    /// Gets a hook by name.
    ///
    /// # Arguments
    ///
    /// * `name` - The hook name
    ///
    /// # Returns
    ///
    /// Returns the hook if found.
    pub fn get(&self, name: &str) -> Option<&dyn ValidationHook> {
        self.hooks.iter().find(|h| h.name() == name).map(|h| h.as_ref())
    }

    /// Lists all hooks.
    ///
    /// # Returns
    ///
    /// Returns a slice of hooks.
    pub fn list(&self) -> Vec<&str> {
        self.hooks.iter().map(|h| h.name()).collect()
    }

    /// Removes a hook.
    ///
    /// # Arguments
    ///
    /// * `name` - The hook name
    ///
    /// # Returns
    ///
    /// Returns `true` if removed.
    pub fn remove(&mut self, name: &str) -> bool {
        if let Some(pos) = self.hooks.iter().position(|h| h.name() == name) {
            self.hooks.remove(pos);
            true
        } else {
            false
        }
    }

    /// Clears all hooks.
    pub fn clear(&mut self) {
        self.hooks.clear();
    }

    /// Returns the number of hooks.
    ///
    /// # Returns
    ///
    /// Returns the hook count.
    pub fn len(&self) -> usize {
        self.hooks.len()
    }

    /// Returns `true` if there are no hooks.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self.hooks.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_validator_new() {
        let validator = ConfigValidator::new();
        assert!(validator.is_empty());
    }

    #[test]
    fn test_config_validator_add_hook() {
        let mut validator = ConfigValidator::new();
        let hook = create_validation_hook("test".to_string(), |_| Ok(()));
        validator.add_hook(hook);
        assert_eq!(validator.len(), 1);
    }

    #[test]
    fn test_config_validator_validate() {
        let mut validator = ConfigValidator::new();
        let hook = create_validation_hook("test".to_string(), |_| Ok(()));
        validator.add_hook(hook);

        let config = AppConfig::default();
        assert!(validator.validate(&config).is_ok());
    }

    #[test]
    fn test_validation_result() {
        let result = ValidationResult::new(
            true,
            vec!["error1".to_string()],
            vec!["warning1".to_string()],
        );
        assert!(result.is_valid());
        assert_eq!(result.errors().len(), 1);
        assert_eq!(result.warnings().len(), 1);
    }

    #[test]
    fn test_hook_registry() {
        let mut registry = HookRegistry::new();
        let hook = create_validation_hook("test".to_string(), |_| Ok(()));
        registry.register(hook);
        assert_eq!(registry.len(), 1);
    }

    #[test]
    fn test_hook_registry_get() {
        let mut registry = HookRegistry::new();
        let hook = create_validation_hook("test".to_string(), |_| Ok(()));
        registry.register(hook);
        assert!(registry.get("test").is_some());
    }

    #[test]
    fn test_hook_registry_remove() {
        let mut registry = HookRegistry::new();
        let hook = create_validation_hook("test".to_string(), |_| Ok(()));
        registry.register(hook);
        let removed = registry.remove("test");
        assert!(removed);
        assert!(registry.is_empty());
    }
}
