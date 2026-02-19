//! Integration tests for ConfigService.

use extensions::services::config_service::{ConfigService, ExtensionSettingSpec};
use extensions::registry::ExtensionRegistry;
use figment::Figment;
use serde_json::json;
use tempfile::TempDir;
use std::sync::Arc;

#[tokio::test]
async fn test_config_service_initialization() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    let service = ConfigService::new(registry, figment, settings_path.clone());

    assert_eq!(service.get_setting("test_key"), None);
}

#[tokio::test]
async fn test_register_setting() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    let service = ConfigService::new(registry, figment, settings_path.clone());

    let spec = ExtensionSettingSpec {
        key: "test_setting".to_string(),
        title: "Test Setting".to_string(),
        description: "A test setting".to_string(),
        default: json!("default_value"),
    };

    service.register_setting(spec);

    assert_eq!(
        service.get_setting("test_setting"),
        Some(json!("default_value"))
    );
}

#[tokio::test]
async fn test_set_and_get_setting() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    let service = ConfigService::new(registry, figment, settings_path.clone());

    service.set_setting("custom_key".to_string(), json!("custom_value"));

    assert_eq!(
        service.get_setting("custom_key"),
        Some(json!("custom_value"))
    );
}

#[tokio::test]
async fn test_save_and_load_settings() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    // Create first service and set some values
    let service1 = ConfigService::new(registry.clone(), figment.clone(), settings_path.clone());
    service1.set_setting("key1".to_string(), json!("value1"));
    service1.set_setting("key2".to_string(), json!(42));
    service1.save_settings().unwrap();

    // Create second service and load the values
    let service2 = ConfigService::new(registry, figment, settings_path);
    service2.load_config();

    assert_eq!(service2.get_setting("key1"), Some(json!("value1")));
    assert_eq!(service2.get_setting("key2"), Some(json!(42)));
}

#[tokio::test]
async fn test_reset_setting() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    let service = ConfigService::new(registry, figment, settings_path.clone());

    let spec = ExtensionSettingSpec {
        key: "reset_test".to_string(),
        title: "Reset Test".to_string(),
        description: "Test reset".to_string(),
        default: json!("default"),
    };

    service.register_setting(spec);
    service.set_setting("reset_test".to_string(), json!("modified"));
    assert_eq!(
        service.get_setting("reset_test"),
        Some(json!("modified"))
    );

    service.reset_setting("reset_test");

    // After reset, the setting should be removed (not restored to default)
    assert_eq!(service.get_setting("reset_test"), None);
}

#[tokio::test]
async fn test_get_all_settings() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    let service = ConfigService::new(registry, figment, settings_path);

    service.set_setting("key1".to_string(), json!("value1"));
    service.set_setting("key2".to_string(), json!(42));
    service.set_setting("key3".to_string(), json!(true));

    let all_settings = service.get_all_settings();

    assert_eq!(all_settings.len(), 3);
    assert_eq!(all_settings.get("key1"), Some(&json!("value1")));
    assert_eq!(all_settings.get("key2"), Some(&json!(42)));
    assert_eq!(all_settings.get("key3"), Some(&json!(true)));
}

#[tokio::test]
async fn test_clear_all_settings() {
    let temp_dir = TempDir::new().unwrap();
    let settings_path = temp_dir.path().join("settings.json");
    let registry = Arc::new(ExtensionRegistry::new());
    let figment = Figment::new();

    let service = ConfigService::new(registry, figment, settings_path);

    service.set_setting("key1".to_string(), json!("value1"));
    service.set_setting("key2".to_string(), json!("value2"));

    assert_eq!(service.get_all_settings().len(), 2);

    service.clear_all_settings();

    assert_eq!(service.get_all_settings().len(), 0);
}
