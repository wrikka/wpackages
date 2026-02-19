//! Integration tests for SettingsService.

use extensions::services::settings_service::SettingsService;
use extensions::types::settings::{SettingSpec, SettingValue};
use tempfile::TempDir;
use std::path::Path;

#[tokio::test]
async fn test_settings_service_initialization() {
    let temp_dir = TempDir::new().unwrap();
    let storage_dir = temp_dir.path();

    let service = SettingsService::new(storage_dir);

    // Should not crash on initialization
    assert!(true);
}

#[tokio::test]
async fn test_register_setting() {
    let temp_dir = TempDir::new().unwrap();
    let storage_dir = temp_dir.path();

    let service = SettingsService::new(storage_dir);

    let spec = SettingSpec {
        key: "test_setting".to_string(),
        title: "Test Setting".to_string(),
        description: "A test setting".to_string(),
        default: SettingValue::String("default_value".to_string()),
    };

    service.register(spec).unwrap();

    let value = service.get("test_setting").unwrap();
    assert_eq!(value, SettingValue::String("default_value".to_string()));
}

#[tokio::test]
async fn test_set_setting() {
    let temp_dir = TempDir::new().unwrap();
    let storage_dir = temp_dir.path();

    let service = SettingsService::new(storage_dir);

    let spec = SettingSpec {
        key: "test_setting".to_string(),
        title: "Test Setting".to_string(),
        description: "A test setting".to_string(),
        default: SettingValue::String("default".to_string()),
    };

    service.register(spec).unwrap();

    service
        .set("test_setting", SettingValue::String("modified".to_string()))
        .unwrap();

    let value = service.get("test_setting").unwrap();
    assert_eq!(value, SettingValue::String("modified".to_string()));
}

#[tokio::test]
async fn test_persistence() {
    let temp_dir = TempDir::new().unwrap();
    let storage_dir = temp_dir.path();

    // Create first service and register a setting
    let service1 = SettingsService::new(storage_dir);

    let spec = SettingSpec {
        key: "persistent_setting".to_string(),
        title: "Persistent Setting".to_string(),
        description: "A persistent setting".to_string(),
        default: SettingValue::Number(42),
    };

    service1.register(spec).unwrap();

    // Modify the setting
    service1
        .set("persistent_setting", SettingValue::Number(100))
        .unwrap();

    // Create second service and verify persistence
    let service2 = SettingsService::new(storage_dir);

    let value = service2.get("persistent_setting").unwrap();
    assert_eq!(value, SettingValue::Number(100));
}

#[tokio::test]
async fn test_get_nonexistent_setting() {
    let temp_dir = TempDir::new().unwrap();
    let storage_dir = temp_dir.path();

    let service = SettingsService::new(storage_dir);

    let result = service.get("nonexistent");

    assert!(result.is_err());
}

#[tokio::test]
async fn test_set_nonexistent_setting() {
    let temp_dir = TempDir::new().unwrap();
    let storage_dir = temp_dir.path();

    let service = SettingsService::new(storage_dir);

    let result = service.set("nonexistent", SettingValue::String("value".to_string()));

    assert!(result.is_err());
}
