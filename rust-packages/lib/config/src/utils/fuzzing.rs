//! Configuration fuzz testing utilities
//!
//! This module provides fuzz testing support for configuration parsing.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};

/// Fuzz tests configuration parsing.
///
/// # Arguments
///
/// * `data` - The configuration data to test
/// * `format` - The format of the data
///
/// # Returns
///
/// Returns `Ok(())` if parsing succeeds, `Err` with error if it fails.
///
/// # Example
///
/// ```no_run
/// use config::utils::fuzzing::fuzz_parse_config;
/// use config::types::ConfigFormat;
///
/// let data = "invalid config data";
/// let result = fuzz_parse_config(data, ConfigFormat::Toml);
/// ```
pub fn fuzz_parse_config(data: &str, format: ConfigFormat) -> ConfigResult<()> {
    match format {
        ConfigFormat::Toml => {
            toml::from_str::<AppConfig>(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?;
        }
        ConfigFormat::Json => {
            serde_json::from_str::<AppConfig>(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?;
        }
        ConfigFormat::Yaml => {
            serde_yaml::from_str::<AppConfig>(data)
                .map_err(|e| ConfigError::ParseError(e.to_string()))?;
        }
    }

    Ok(())
}

/// Fuzz tests configuration validation.
///
/// # Arguments
///
/// * `data` - The configuration data to test
/// * `format` - The format of the data
///
/// # Returns
///
/// Returns `Ok(())` if validation succeeds, `Err` with error if it fails.
///
/// # Example
///
/// ```no_run
/// use config::utils::fuzzing::fuzz_validate_config;
/// use config::types::ConfigFormat;
///
/// let data = "invalid config data";
/// let result = fuzz_validate_config(data, ConfigFormat::Toml);
/// ```
pub fn fuzz_validate_config(data: &str, format: ConfigFormat) -> ConfigResult<()> {
    let config = fuzz_parse_config(data, format)?;
    config.validate()
}

/// Fuzz tests configuration migration.
///
/// # Arguments
///
/// * `data` - The configuration data to test
/// * `format` - The format of the data
///
/// # Returns
///
/// /// Returns `Ok(())` if migration succeeds, `Err` with error if it fails.
///
/// # Example
///
/// ```no_run
/// use config::utils::fuzzing::fuzz_migrate_config;
/// use config::types::ConfigFormat;
///
/// let data = "invalid config data";
/// let result = fuzz_migrate_config(data, ConfigFormat::Toml);
/// ```
pub fn fuzz_migrate_config(data: &str, format: ConfigFormat) -> ConfigResult<()> {
    let mut config = fuzz_parse_config(data, format)?;
    config.migrate()
}

/// Represents a fuzz test result.
#[derive(Debug, Clone)]
pub struct FuzzTestResult {
    test_name: String,
    passed: bool,
    error_message: Option<String>,
}

impl FuzzTestResult {
    /// Creates a new fuzz test result.
    ///
    /// # Arguments
    ///
    /// * `test_name` - The test name
    /// * `passed` - Whether the test passed
    /// * `error_message` - The error message if failed
    ///
    /// # Returns
    ///
    /// Returns a new result.
    pub fn new(test_name: String, passed: bool, error_message: Option<String>) -> Self {
        Self {
            test_name,
            passed,
            error_message,
        }
    }

    /// Returns the test name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn test_name(&self) -> &str {
        &self.test_name
    }

    /// Returns `true` if the test passed.
    ///
    /// # Returns
    ///
    /// Returns `true` if passed.
    pub fn passed(&self) -> bool {
        self.passed
    }

    /// Returns the error message.
    ///
    /// /// Returns
    ///
    /// Returns the error message if failed.
    pub fn error_message(&self) -> Option<&str> {
        self.error_message.as_deref()
    }
}

/// Runs a fuzz test.
///
/// # Arguments
///
/// * `test_name` - The test name
/// * `data` - The data to test
/// * `format` - The format
    /// * `test_fn` - The test function
///
/// # Returns
    ///
    /// Returns the test result.
///
/// # Example
///
    /// ```no_run
    /// use config::utils::fuzzing::run_fuzz_test;
    ///
    /// let result = run_fuzz_test("test", "data", ConfigFormat::Toml, |data| {
    ///     fuzz_parse_config(data, ConfigFormat::Toml)
    /// });
    /// ```
pub fn run_fuzz_test<F>(
    test_name: String,
    data: &str,
    format: ConfigFormat,
    test_fn: F,
) -> FuzzTestResult
where
    F: Fn(&str, ConfigFormat) -> ConfigResult<()>,
{
    match test_fn(data, format) {
        Ok(()) => FuzzTestResult::new(test_name, true, None),
        Err(e) => FuzzTestResult::new(
            test_name,
            false,
            Some(e.to_string()),
        ),
    }
}

/// Generates random fuzz test data.
///
/// # Arguments
///
/// * `size` - The size of the data to generate
///
/// # Returns
///
    /// Returns the generated data.
///
/// # Example
///
    /// ```no_run
    /// use config::utils::fuzzing::generate_fuzz_data;
    ///
    /// let data = generate_fuzz_data(100);
    /// println!("Fuzz data: {}", data);
    /// ```
pub fn generate_fuzz_data(size: usize) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    let mut data = String::new();
    let mut byte = (timestamp % 256) as u8;

    for _ in 0..size {
        byte = byte.wrapping_add(1);
        data.push(byte as char);
    }

    data
}

/// Generates structured fuzz test data.
///
/// # Arguments
///
/// * `format` - The format to generate for
///
/// # Returns
///
/// /// Returns the generated data.
///
/// # Example
///
    /// ```no_run
    /// use config::utils::fuzzing::generate_structured_fuzz_data;
    /// use config::types::ConfigFormat;
    ///
    /// let data = generate_structured_fuzz_data(ConfigFormat::Toml, 50);
    /// println!("Fuzz data: {}", data);
    /// ```
pub fn generate_structured_fuzz_data(format: ConfigFormat, size: usize) -> String {
    let mut data = String::new();

    match format {
        ConfigFormat::Toml => {
            data.push_str(&format!("[appearance]\n"));
            data.push_str(&format!("theme_id = \"{}\"\n", generate_random_string(10)));
            data.push_str(&format!("font.size = {}\n", generate_random_number(100)));
            data.push_str(&format!("[behavior]\n"));
            data.push_str(&format!("auto_save = {}\n", generate_random_bool()));
            data.push_str(&format!("confirm_close = {}\n", generate_random_bool()));
            data.push_str(&format!("[advanced]\n"));
            data.push_str(&format!("log_level = \"{}\"\n", generate_random_log_level()));
            data.push_str(&format!("enable_telemetry = {}\n", generate_random_bool()));
        }
        ConfigFormat::Json => {
            data.push_str(&format!("{{\"appearance\": {{\"theme_id\": \"{}\", \"font\": {{\"size\": {}}}}}}, \"behavior\": {{\"auto_save\": {}, \"confirm_close\": {}}}}}}",
                generate_random_string(10),
                generate_random_number(100),
                generate_random_bool(),
                generate_random_bool()
            ));
        }
        ConfigFormat::Yaml => {
            data.push_str(&format!("appearance:\n  theme_id: {}\n  font:\n    size: {}\nbehavior:\n  auto_save: {}\n  confirm_close: {}\nadvanced:\n  log_level: {}\n  enable_telemetry: {}\n",
                generate_random_string(10),
                generate_random_number(100),
                generate_random_bool(),
                generate_random_bool(),
                generate_random_log_level(),
                generate_random_bool()
            ));
        }
    }

    data
}

/// Generates a random string.
///
/// # Arguments
///
/// * `length` - The length of the string
///
/// # Returns
///
    /// Returns the generated string.
fn generate_random_string(length: usize) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    let chars = vec
!['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    let mut result = String::new();
    let mut index = (timestamp % chars.len()) as usize;

    for _ in 0..length {
        result.push(chars[index]);
        index = (index + 1) % chars.len();
    }

    result
}

/// Generates a random number.
///
/// # Arguments
///
/// * `max` - The maximum value
///
/// # Returns
///
/// Returns the generated number.
fn generate_random_number(max: u32) -> u32 {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    (timestamp % max as u128) as u32
}

/// Generates a random boolean.
///
/// # Returns
///
/// /// Returns the generated boolean.
fn generate_random_bool() -> bool {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();

    (timestamp % 2) == 0
}

/// Generates a random log level.
///
/// # Returns
///
/// /// Returns the log level.
fn generate_random_log_level() -> &'static str {
    let levels = ["trace", "debug", "info", "warn", "error"];
    let index = (SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() % levels.len()) as usize;
    levels[index]
}

/// Runs a fuzz test suite.
///
/// # Arguments
///
/// * `test_data` - List of (name, data, format) tuples
///
/// # Returns
///
/// /// Returns a list of test results.
///
/// # Example
///
/// ```no_run
/// use config::utils::fuzzing::run_fuzz_test_suite;
///
    /// let test_data = vec![
    ///     ("test1", "data", ConfigFormat::Toml),
    ///     ("test2", "data", ConfigFormat::Json),
    /// ];
    /// let results = run_fuzz_test_suite(&test_data);
    /// for result in results {
    ///     println!("{}: {}", result.test_name(), if result.passed() { "PASS" } else { "FAIL" });
    /// }
    /// ```
pub fn run_fuzz_test_suite(
    test_data: &[(&str, &str, ConfigFormat)],
) -> Vec<FuzzTestResult> {
    let mut results = Vec::new();

    for (test_name, data, format) in test_data {
        let result = run_fuzz_test(
            test_name.to_string(),
            data,
            *format,
            |data, format| fuzz_parse_config(data, format),
        );
        results.push(result);
    }

    results
}

/// Generates a fuzz test report.
///
    # Arguments
///
/// * `results` - The test results
///
/// # Returns
///
/// Returns the report as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::fuzzing::{run_fuzz_test_suite, generate_fuzz_report};
///
/// let test_data = vec![("test", "data", ConfigFormat::Toml)];
/// let results = run_fuzz_test_suite(&test_data);
/// let report = generate_fuzz_report(&results);
/// println!("{}", report);
/// ```
pub fn generate_fuzz_report(results: &[FuzzTestResult]) -> String {
    let mut report = String::new();

    report.push_str("# Fuzz Test Report\n\n");

    let passed = results.iter().filter(|r| r.passed()).count();
    let failed = results.iter().filter(|r| !r.passed()).count();

    report.push_str(&format!("Total: {}\n", results.len()));
    report.push_str(&format!("Passed: {}\n", passed));
    report.push_str(&format!("Failed: {}\n\n", failed));

    if failed > 0 {
        report.push_str("Failed Tests:\n\n");
        for result in results {
            if !result.passed() {
                report.push_str(&format!("- {}: {}\n", result.test_name(), result.error_message().unwrap()));
            }
        }
    }

    report
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fuzz_parse_config_valid() {
        let data = r#"[appearance]
theme_id = "dark"
"#;
        assert!(fuzz_parse_config(data, ConfigFormat::Toml).is_ok());
    }

    #[test]
    fn test_fuzz_parse_config_invalid() {
        let data = "invalid config data";
        assert!(fuzz_parse_config(data, ConfigFormat::Toml).is_err());
    }

    #[test]
    fn test_fuzz_validate_config() {
        let data = r#"[appearance]
theme_id = "dark"
"#;
        assert!(fuzz_validate_config(data, ConfigFormat::Toml).is_ok());
    }

    #[test]
    fn test_fuzz_migrate_config() {
        let data = r#"[appearance]
theme_id = "dark"
"#;
        assert!(fuzz_migrate_config(data, ConfigFormat::Toml).is_ok());
    }

    #[test]
    fn test_generate_fuzz_data() {
        let data = generate_fuzz_data(100);
        assert_eq!(data.len(), 100);
    }

    #[test]
    fn test_generate_structured_fuzz_data() {
        let data = generate_structured_fuzz_data(ConfigFormat::Toml, 50);
        assert!(data.contains("[appearance]"));
    }

    #[test]
    fn test_run_fuzz_test() {
        let data = r#"[appearance]
theme_id = "dark"
"#;
        let result = run_fuzz_test("test".to_string(), data, ConfigFormat::Toml, |data, format| {
            fuzz_parse_config(data, format)
        });
        assert!(result.passed());
    }

    #[test]
    fn test_run_fuzz_test_suite() {
        let test_data = vec![
            ("test1", r#"[appearance]
theme_id = "dark"
"#, ConfigFormat::Toml),
            ("test2", r#"{"appearance": {"theme_id": "dark"}}"#, ConfigFormat::Json),
        ];
        let results = run_fuzz_test_suite(&test_data);
        assert_eq!(results.len(), 2);
        assert!(results.iter().all(|r| r.passed()));
    }

    #[test]
    fn test_generate_fuzz_report() {
        let results = vec
![
            FuzzTestResult::new("test1".to_string(), true, None),
            FuzzTestResult::new("test2".to_string(), false, Some("error".to_string())),
        ];
        let report = generate_fuzz_report(&results);
        assert!(report.contains("Total: 2"));
        assert!(report.contains("Passed: 1"));
        assert!(report.contains("Failed: 1"));
    }
}
