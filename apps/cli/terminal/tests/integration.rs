//! Integration tests for the terminal application

#[cfg(test)]
mod integration_tests {
    use terminal::config::AppConfig;
    use terminal::utils::{string::truncate, validation::is_valid_url};

    #[test]
    fn test_config_loading() {
        let config = AppConfig::load();
        assert!(config.is_ok());
    }

    #[test]
    fn test_utils_truncate() {
        assert_eq!(truncate("hello world", 5), "he...");
        assert_eq!(truncate("hi", 10), "hi");
    }

    #[test]
    fn test_utils_validation() {
        assert!(is_valid_url("https://example.com"));
        assert!(!is_valid_url("not a url"));
    }
}
