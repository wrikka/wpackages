#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_load_from_file() {
        let config = AppConfig::load();
        assert!(config.is_ok());
        let config = config.unwrap();
        assert_eq!(config.app.name, "TUI Rust");
        assert_eq!(config.app.version, "0.1.0");
    }

    #[test]
    fn test_logging_config_default() {
        let config = AppConfig::load().unwrap();
        assert_eq!(config.logging.level, "info");
    }

    #[test]
    fn test_config_clone() {
        let config = AppConfig::load().unwrap();
        let cloned = config.clone();
        assert_eq!(config.app.name, cloned.app.name);
        assert_eq!(config.logging.level, cloned.logging.level);
    }
}
