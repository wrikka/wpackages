//! Configuration test utilities
//!
//! This module provides test utilities for configuration.

use crate::types::AppConfig;

/// Creates a test configuration.
///
/// # Returns
///
/// Returns a test configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_test_config;
///
/// let config = create_test_config();
/// ```
pub fn create_test_config() -> AppConfig {
    let mut config = AppConfig::default();

    // Set test values
    config.appearance.theme_id = "test-dark".to_string();
    config.appearance.font.size = 12;
    config.appearance.font.family = "TestFont".to_string();
    config.behavior.auto_save = false;
    config.behavior.confirm_close = false;
    config.advanced.log_level = "debug".to_string();
    config.advanced.enable_telemetry = false;
    config.pty.rows = 24;
    config.pty.cols = 80;
    config.pty.shell = "test-shell".to_string();

    config
}

/// Creates a test profile.
///
/// # Returns
///
/// Returns a test profile.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_test_profile;
/// use config::profile::ConfigProfile;
///
/// let profile = create_test_profile();
/// ```
pub fn create_test_profile() -> crate::profile::ConfigProfile {
    let config = create_test_config();
    crate::profile::ConfigProfile::new("test-profile".to_string(), config)
        .with_description("Test profile for unit tests".to_string())
}

/// Creates a minimal test configuration.
///
/// # Returns
///
/// Returns a minimal configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_minimal_config;
///
/// let config = create_minimal_config();
/// ```
pub fn create_minimal_config() -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.show_scrollbar = false;
    config.appearance.show_tab_bar = false;
    config.appearance.show_status_bar = false;
    config.behavior.auto_save = false;
    config.behavior.restore_session = false;
    config.advanced.log_level = "error".to_string();
    config.advanced.enable_telemetry = false;

    config
}

/// Creates a maximal test configuration.
///
/// # Returns
///
/// Returns a maximal configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_maximal_config;
///
/// let config = create_maximal_config();
/// ```
pub fn create_maximal_config() -> AppConfig {
    let mut config = create_test_config();

    config.appearance.window.width = 1920;
    config.appearance.window.height = 1080;
    config.appearance.window.maximized = true;
    config.appearance.window.fullscreen = false;
    config.appearance.window.always_on_top = false;

    config.behavior.auto_save = true;
    config.behavior.confirm_close = true;
    config.behavior.confirm_exit = true;
    config.behavior.restore_session = true;
    config.behavior.shell_integration = true;
    config.behavior.copy_on_select = true;

    config.advanced.enable_gpu_acceleration = true;
    config.advanced.enable_telemetry = true;
    config.advanced.enable_error_reporting = true;
    config.advanced.update_check = true;

    config.clipboard.enable_clipboard = true;
    config.clipboard.max_history = 1000;

    config.hotkeys.enable_hotkeys = true;

    config
}

/// Creates a test configuration with custom values.
///
/// # Arguments
///
/// * `theme_id` - Theme ID
/// * `font_size` - Font size
/// * `auto_save` - Auto save setting
///
/// # Returns
///
/// Returns a custom test configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_custom_config;
///
/// let config = create_custom_config("dark".to_string(), 16, true);
/// ```
pub fn create_custom_config(theme_id: String, font_size: u32, auto_save: bool) -> AppConfig {
    let mut config = AppConfig::default();

    config.appearance.theme_id = theme_id;
    config.appearance.font.size = font_size;
    config.behavior.auto_save = auto_save;

    config
}

/// Creates a test configuration with validation errors.
///
/// # Returns
///
/// Returns an invalid configuration.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_invalid_config;
///
/// let config = create_invalid_config();
/// assert!(config.validate().is_err());
/// ```
pub fn create_invalid_config() -> AppConfig {
    let mut config = AppConfig::default();

    // Create invalid values
    config.pty.rows = 0;
    config.pty.cols = 0;
    config.appearance.font.size = 0;

    config
}

/// Creates a test configuration with warnings.
///
/// # Returns
/// /// Returns a configuration with warnings.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_config_with_warnings;
///
/// let config = create_config_with_warnings();
/// ```
pub fn create_config_with_warnings() -> AppConfig {
    let mut config = AppConfig::default();

    // Create warning values
    config.appearance.font.line_height = 0.3;
    config.advanced.max_log_size_mb = 0;
    config.advanced.max_log_files = 0;

    config
}

/// Represents a test fixture.
#[derive(Debug, Clone)]
pub struct TestFixture {
    name: String,
    config: AppConfig,
    expected_valid: bool,
}

impl TestFixture {
    /// Creates a new test fixture.
    ///
    /// # Arguments
    ///
    /// * `name` - The fixture name
    /// * `config` - The configuration
    /// * `expected_valid` - Whether it should be valid
    ///
    /// # Returns
    ///
    /// Returns a new fixture.
    pub fn new(name: String, config: AppConfig, expected_valid: bool) -> Self {
        Self {
            name,
            config,
            expected_valid,
        }
    }

    /// Returns the fixture name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns whether it should be valid.
    ///
    /// # Returns
    ///
    /// Returns `true` if expected valid.
    pub fn expected_valid(&self) -> bool {
        self.expected_valid
    }
}

/// Creates common test fixtures.
///
/// # Returns
///
/// Returns a list of fixtures.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::get_test_fixtures;
///
/// let fixtures = get_test_fixtures();
/// for fixture in fixtures {
///     println!("{}: valid={}", fixture.name(), fixture.expected_valid());
/// }
/// ```
pub fn get_test_fixtures() -> Vec<TestFixture> {
    vec![
        TestFixture::new(
            "valid_config".to_string(),
            create_test_config(),
            true,
        ),
        TestFixture::new(
            "minimal_config".to_string(),
            create_minimal_config(),
            true,
        ),
        TestFixture::new(
            "maximal_config".to_string(),
            create_maximal_config(),
            true,
        ),
        TestFixture::new(
            "invalid_config".to_string(),
            create_invalid_config(),
            false,
        ),
        TestFixture::new(
            "config_with_warnings".to_string(),
            create_config_with_warnings(),
            true,
        ),
    ]
}

/// Runs validation tests on fixtures.
///
/// # Arguments
///
/// * `fixtures` - The test fixtures
///
/// # Returns
///
/// Returns `Ok(())` if all tests pass.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::{get_test_fixtures, run_validation_tests};
///
/// let fixtures = get_test_fixtures();
/// run_validation_tests(&fixtures).unwrap();
/// ```
pub fn run_validation_tests(fixtures: &[TestFixture]) -> Result<(), String> {
    for fixture in fixtures {
        let is_valid = fixture.config().validate().is_ok();

        if is_valid != fixture.expected_valid() {
            return Err(format!(
                "Fixture '{}' validation test failed: expected valid={}, got valid={}",
                fixture.name(),
                fixture.expected_valid(),
                is_valid
            ));
        }
    }

    Ok(())
}

/// Creates a mock config manager for testing.
///
/// # Returns
///
/// Returns a mock manager.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_mock_manager;
/// use config::manager::ConfigManager;
///
/// let manager = create_mock_manager();
/// ```
pub fn create_mock_manager() -> crate::manager::ConfigManager {
    let config = create_test_config();
    crate::manager::ConfigManager::with_paths(
        std::path::PathBuf::from("test-config.toml"),
        std::path::PathBuf::from("test-profiles"),
    ).unwrap()
}

/// Creates a temporary test directory.
///
/// # Returns
///
/// Returns the path to the temp directory.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::create_temp_dir;
///
/// let temp_dir = create_temp_dir().unwrap();
/// println!("Temp dir: {:?}", temp_dir);
/// ```
pub fn create_temp_dir() -> std::io::Result<std::path::PathBuf> {
    let temp_dir = std::env::temp_dir().join("config-test-XXXXXX");
    std::fs::create_dir_all(&temp_dir)?;
    Ok(temp_dir)
}

/// Cleans up a temporary directory.
///
/// # Arguments
///
/// * `path` - The path to clean up
///
/// # Returns
///
/// /// Returns `Ok(())` on success.
///
/// # Example
///
/// ```no_run
/// use config::utils::test_utils::{create_temp_dir, cleanup_temp_dir};
///
/// let temp_dir = create_temp_dir().unwrap();
/// // do tests
/// cleanup_temp_dir(&temp_dir).unwrap();
/// ```
pub fn cleanup_temp_dir(path: &std::path::Path) -> std::io::Result<()> {
    if path.exists() {
        std::fs::remove_dir_all(path)?;
    }
    Ok(())
}

/// Represents a test context.
#[derive(Debug, Clone)]
pub struct TestContext {
    temp_dir: Option<std::path::PathBuf>,
    config: AppConfig,
}

impl TestContext {
    /// Creates a new test context.
    ///
    /// # Returns
    ///
    /// Returns a new context.
    pub fn new() -> Self {
        Self {
            temp_dir: None,
            config: create_test_config(),
        }
    }

    /// Sets up a temporary directory.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    pub fn setup_temp_dir(&mut self) -> std::io::Result<()> {
        let temp_dir = create_temp_dir()?;
        self.temp_dir = Some(temp_dir);
        Ok(())
    }

    /// Cleans up the test context.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    pub fn cleanup(&mut self) -> std::io::Result<()> {
        if let Some(temp_dir) = &self.temp_dir {
            cleanup_temp_dir(temp_dir)?;
            self.temp_dir = None;
        }
        Ok(())
    }

    /// Returns the temporary directory.
    ///
    /// # Returns
    ///
    /// Returns the path if set.
    pub fn temp_dir(&self) -> Option<&std::path::PathBuf> {
        self.temp_dir.as_ref()
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }

    /// Returns a mutable reference to the configuration.
    ///
    /// # Returns
    ///
    /// Returns the mutable configuration.
    pub fn config_mut(&mut self) -> &mut AppConfig {
        &mut self.config
    }
}

impl Default for TestContext {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_test_config() {
        let config = create_test_config();
        assert_eq!(config.appearance.theme_id, "test-dark");
        assert_eq!(config.appearance.font.size, 12);
    }

    #[test]
    fn test_create_minimal_config() {
        let config = create_minimal_config();
        assert!(!config.appearance.show_scrollbar);
        assert!(!config.appearance.show_tab_bar);
    }

    #[test]
    fn test_create_maximal_config() {
        let config = create_maximal_config();
        assert_eq!(config.appearance.window.width, 1920);
        assert_eq!(config.appearance.window.height, 1080);
    }

    #[test]
    fn test_create_custom_config() {
        let config = create_custom_config("custom".to_string(), 16, true);
        assert_eq!(config.appearance.theme_id, "custom");
        assert_eq!(config.appearance.font.size, 16);
        assert!(config.behavior.auto_save);
    }

    #[test]
    fn test_create_invalid_config() {
        let config = create_invalid_config();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_create_config_with_warnings() {
        let config = create_config_with_warnings();
        let result = config.validate();
        assert!(result.is_ok()); // Warnings don't make it invalid
    }

    #[test]
    fn test_test_fixture() {
        let config = create_test_config();
        let fixture = TestFixture::new("test".to_string(), config, true);
        assert_eq!(fixture.name(), "test");
        assert!(fixture.expected_valid());
    }

    #[test]
    fn test_get_test_fixtures() {
        let fixtures = get_testtures();
        assert!(!fixtures.is_empty());
    }

    #[test]
    fn test_run_validation_tests() {
        let fixtures = get_test_fixtures();
        assert!(run_validation_tests(&fixtures).is_ok());
    }

    #[test]
    fn test_create_temp_dir() {
        let temp_dir = create_temp_dir().unwrap();
        assert!(temp_dir.exists());
        cleanup_temp_dir(&temp_dir).unwrap();
    }

    #[test]
    fn test_test_context() {
        let mut context = TestContext::new();
        assert_eq!(context.config().appearance.theme_id, "test-dark");
        context.setup_temp_dir().unwrap();
        assert!(context.temp_dir().is_some());
        context.cleanup().unwrap();
        assert!(context.temp_dir().is_none());
    }
}
