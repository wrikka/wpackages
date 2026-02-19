use tui_rust::config::AppConfig;
use tui_rust::telemetry;

#[tokio::test]
async fn test_config_loading() {
    let config = AppConfig::load();
    assert!(config.is_ok());

    let config = config.unwrap();
    assert_eq!(config.app.name, "TUI Rust");
    assert_eq!(config.app.version, "0.1.0");
    assert_eq!(config.logging.level, "info");
}

#[tokio::test]
async fn test_telemetry_initialization() {
    telemetry::init_subscriber();
}

#[tokio::test]
async fn test_config_environment_override() {
    std::env::set_var("APP_LOGGING__LEVEL", "debug");
    let config = AppConfig::load();
    assert!(config.is_ok());
    let config = config.unwrap();
    assert_eq!(config.logging.level, "debug");
    std::env::remove_var("APP_LOGGING__LEVEL");
}

#[tokio::test]
async fn test_config_app_name_override() {
    std::env::set_var("APP_APP__NAME", "TestApp");
    let config = AppConfig::load();
    assert!(config.is_ok());
    let config = config.unwrap();
    assert_eq!(config.app.name, "TestApp");
    std::env::remove_var("APP_APP__NAME");
}

#[tokio::test]
async fn test_config_clone() {
    let config = AppConfig::load().unwrap();
    let cloned = config.clone();
    assert_eq!(config.app.name, cloned.app.name);
    assert_eq!(config.app.version, cloned.app.version);
    assert_eq!(config.logging.level, cloned.logging.level);
}
