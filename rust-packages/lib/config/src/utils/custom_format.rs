//! Custom format support for configuration
//!
//! This module provides extensibility for custom configuration formats.

use crate::error::{ConfigError, ConfigResult};
use crate::types::AppConfig;

/// Trait for custom configuration formats.
///
/// Implement this trait to add support for custom configuration formats.
///
/// # Example
///
/// ```no_run
/// use config::utils::custom_format::ConfigFormatTrait;
/// use config::types::AppConfig;
///
/// struct MyCustomFormat;
///
/// impl ConfigFormatTrait for MyCustomFormat {
///     fn parse(&self, data: &str) -> ConfigResult<AppConfig> {
///         // Parse custom format
///         Ok(AppConfig::default())
///     }
///
///     fn serialize(&self, config: &AppConfig) -> ConfigResult<String> {
///         // Serialize to custom format
///         Ok("custom format".to_string())
///     }
/// }
/// ```
pub trait ConfigFormatTrait {
    /// Parses configuration data from a custom format.
    ///
    /// # Arguments
    ///
    /// * `data` - The configuration data string
    ///
    /// # Returns
    ///
    /// Returns the parsed configuration.
    fn parse(&self, data: &str) -> ConfigResult<AppConfig>;

    /// Serializes configuration to a custom format.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to serialize
    ///
    /// # Returns
    ///
    /// Returns the serialized configuration string.
    fn serialize(&self, config: &AppConfig) -> ConfigResult<String>;

    /// Returns the name of the format.
    ///
    /// # Returns
    ///
    /// Returns the format name.
    fn name(&self) -> &str {
        "custom"
    }

    /// Returns the file extension for this format.
    ///
    /// # Returns
    ///
    /// Returns the file extension.
    fn extension(&self) -> &str {
        "custom"
    }
}

/// Wrapper for custom configuration formats.
pub struct CustomFormat<T: ConfigFormatTrait> {
    format: T,
}

impl<T: ConfigFormatTrait> CustomFormat<T> {
    /// Creates a new custom format wrapper.
    ///
    /// # Arguments
    ///
    /// * `format` - The custom format implementation
    ///
    /// # Returns
    ///
    /// Returns a new custom format wrapper.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormat;
    ///
    /// let custom_format = CustomFormat::new(MyCustomFormat);
    /// ```
    pub fn new(format: T) -> Self {
        Self { format }
    }

    /// Parses configuration data.
    ///
    /// # Arguments
    ///
    /// * `data` - The configuration data string
    ///
    /// # Returns
    ///
    /// Returns the parsed configuration.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormat;
    ///
    /// let data = "my custom config data";
    /// let config = custom_format.parse(data).unwrap();
    /// ```
    pub fn parse(&self, data: &str) -> ConfigResult<AppConfig> {
        self.format.parse(data)
    }

    /// Serializes configuration.
    ///
    /// # Arguments
    ///
    /// * `config` - The configuration to serialize
    ///
    /// # Returns
    ///
    /// Returns the serialized configuration string.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormat;
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// let serialized = custom_format.serialize(&config).unwrap();
    /// ```
    pub fn serialize(&self, config: &AppConfig) -> ConfigResult<String> {
        self.format.serialize(config)
    }

    /// Returns the format name.
    ///
    /// # Returns
    ///
    /// Returns the format name.
    pub fn name(&self) -> &str {
        self.format.name()
    }

    /// Returns the file extension.
    ///
    /// # Returns
    ///
    /// Returns the file extension.
    pub fn extension(&self) -> &str {
        self.format.extension()
    }
}

/// Registry for custom configuration formats.
pub struct CustomFormatRegistry {
    formats: Vec<Box<dyn ConfigFormatTrait>>,
}

impl Default for CustomFormatRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl CustomFormatRegistry {
    /// Creates a new custom format registry.
    ///
    /// # Returns
    ///
    /// Returns a new registry.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormatRegistry;
    ///
    /// let registry = CustomFormatRegistry::new();
    /// ```
    pub fn new() -> Self {
        Self {
            formats: Vec::new(),
        }
    }

    /// Registers a custom format.
    ///
    /// # Arguments
    ///
    /// * `format` - The custom format to register
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormatRegistry;
    ///
    /// registry.register(Box::new(MyCustomFormat));
    /// ```
    pub fn register(&mut self, format: Box<dyn ConfigFormatTrait>) {
        self.formats.push(format);
    }

    /// Gets a format by name.
    ///
    /// # Arguments
    ///
    /// * `name` - The format name
    ///
    /// # Returns
    ///
    /// Returns the format if found, `None` otherwise.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormatRegistry;
    ///
    /// if let Some(format) = registry.get_format("my_custom") {
    ///     // Use the format
    /// }
    /// ```
    pub fn get_format(&self, name: &str) -> Option<&dyn ConfigFormatTrait> {
        self.formats
            .iter()
            .find(|f| f.name() == name)
            .map(|f| f.as_ref())
    }

    /// Gets a format by file extension.
    ///
    /// # Arguments
    ///
    /// * `extension` - The file extension
    ///
    /// # Returns
    ///
    /// Returns the format if found, `None` otherwise.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormatRegistry;
    ///
    /// if let Some(format) = registry.get_format_by_extension("mycustom") {
    ///     // Use the format
    /// }
    /// ```
    pub fn get_format_by_extension(&self, extension: &str) -> Option<&dyn ConfigFormatTrait> {
        self.formats
            .iter()
            .find(|f| f.extension() == extension)
            .map(|f| f.as_ref())
    }

    /// Lists all registered formats.
    ///
    /// # Returns
    ///
    /// Returns a list of format names.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::custom_format::CustomFormatRegistry;
    ///
    /// let formats = registry.list_formats();
    /// for format in formats {
    ///     println!("{}", format);
    /// }
    /// ```
    pub fn list_formats(&self) -> Vec<&str> {
        self.formats.iter().map(|f| f.name()).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TestFormat;

    impl ConfigFormatTrait for TestFormat {
        fn parse(&self, _data: &str) -> ConfigResult<AppConfig> {
            Ok(AppConfig::default())
        }

        fn serialize(&self, _config: &AppConfig) -> ConfigResult<String> {
            Ok("test format".to_string())
        }

        fn name(&self) -> &str {
            "test"
        }

        fn extension(&self) -> &str {
            "test"
        }
    }

    #[test]
    fn test_custom_format() {
        let format = CustomFormat::new(TestFormat);
        let config = format.parse("test data").unwrap();
        assert_eq!(config.appearance.theme_id, "default-dark");
    }

    #[test]
    fn test_custom_format_serialize() {
        let format = CustomFormat::new(TestFormat);
        let config = AppConfig::default();
        let serialized = format.serialize(&config).unwrap();
        assert_eq!(serialized, "test format");
    }

    #[test]
    fn test_custom_format_registry() {
        let mut registry = CustomFormatRegistry::new();
        registry.register(Box::new(TestFormat));

        let format = registry.get_format("test").unwrap();
        assert_eq!(format.name(), "test");
    }

    #[test]
    fn test_custom_format_registry_by_extension() {
        let mut registry = CustomFormatRegistry::new();
        registry.register(Box::new(TestFormat));

        let format = registry.get_format_by_extension("test").unwrap();
        assert_eq!(format.extension(), "test");
    }

    #[test]
    fn test_list_formats() {
        let mut registry = CustomFormatRegistry::new();
        registry.register(Box::new(TestFormat));

        let formats = registry.list_formats();
        assert_eq!(formats.len(), 1);
        assert_eq!(formats[0], "test");
    }
}
