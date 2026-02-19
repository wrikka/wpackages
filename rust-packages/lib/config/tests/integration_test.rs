//! Integration tests for Config Suite

use config::components::*;
use config::services::*;
use config::types::{AppConfig, ConfigFormat, FontConfig, WindowConfig};
use config::version::ConfigVersion;
use tempfile::TempDir;

#[test]
fn test_config_validation() {
    let config = AppConfig::default();
    let version = ConfigVersion::new(1, 0, 0);

    let result = validate_config(&config, &version);
    assert!(result.is_ok());
}

#[test]
fn test_font_config_validation() {
    let font = FontConfig::default();
    let result = validate_font_config(&font);
    assert!(result.is_ok());
}

#[test]
fn test_font_config_validation_empty_family() {
    let font = FontConfig {
        family: String::new(),
        ..Default::default()
    };

    let result = validate_font_config(&font);
    assert!(result.is_err());
}

#[test]
fn test_window_config_validation() {
    let window = WindowConfig::default();
    let result = validate_window_config(&window);
    assert!(result.is_ok());
}

#[test]
fn test_window_config_validation_zero_size() {
    let window = WindowConfig {
        width: 0,
        height: 0,
        ..Default::default()
    };

    let result = validate_window_config(&window);
    assert!(result.is_err());
}

#[test]
fn test_config_serialization_toml() {
    let config = AppConfig::default();
    let result = serialize_config(&config, ConfigFormat::Toml);
    assert!(result.is_ok());
    assert!(result.unwrap().contains("version"));
}

#[test]
fn test_config_serialization_json() {
    let config = AppConfig::default();
    let result = serialize_config(&config, ConfigFormat::Json);
    assert!(result.is_ok());
    assert!(result.unwrap().contains("version"));
}

#[test]
fn test_config_migration() {
    let mut config = AppConfig::default();
    config.version = ConfigVersion::new(0, 1, 0);
    let target = ConfigVersion::new(1, 0, 0);

    let result = migrate_config(&mut config, &target);
    assert!(result.is_ok());
    assert_eq!(config.version, target);
}

#[test]
fn test_needs_migration() {
    let mut config = AppConfig::default();
    config.version = ConfigVersion::new(0, 1, 0);
    let target = ConfigVersion::new(1, 0, 0);

    assert!(needs_migration(&config, &target));
}

#[test]
fn test_needs_migration_false() {
    let config = AppConfig::default();
    let target = ConfigVersion::new(1, 0, 0);

    assert!(!needs_migration(&config, &target));
}

#[test]
fn test_file_service_write_and_read() {
    let temp_dir = TempDir::new().unwrap();
    let config_path = temp_dir.path().join("test_config.toml");

    let config = AppConfig::default();

    let write_result = FileService::write_config(&config, &config_path, ConfigFormat::Toml);
    assert!(write_result.is_ok());

    let read_result = FileService::read_config(&config_path);
    assert!(read_result.is_ok());
}

#[test]
fn test_file_service_exists() {
    let temp_dir = TempDir::new().unwrap();
    let config_path = temp_dir.path().join("test_config.toml");

    assert!(!FileService::exists(&config_path));

    let config = AppConfig::default();
    FileService::write_config(&config, &config_path, ConfigFormat::Toml).unwrap();

    assert!(FileService::exists(&config_path));
}

#[test]
fn test_file_service_delete() {
    let temp_dir = TempDir::new().unwrap();
    let config_path = temp_dir.path().join("test_config.toml");

    let config = AppConfig::default();
    FileService::write_config(&config, &config_path, ConfigFormat::Toml).unwrap();

    assert!(FileService::exists(&config_path));

    let delete_result = FileService::delete_config(&config_path);
    assert!(delete_result.is_ok());
    assert!(!FileService::exists(&config_path));
}

#[test]
fn test_file_service_default_path() {
    let path = FileService::default_path();
    assert_eq!(path, std::path::PathBuf::from("Config.toml"));
}

#[test]
fn test_profile_service() {
    let temp_dir = TempDir::new().unwrap();
    let service = ProfileService::new(temp_dir.path());

    let profiles = service.list_profiles().unwrap();
    assert!(profiles.is_empty());
}

#[test]
fn test_profile_service_save_and_load() {
    use config::profile::ConfigProfile;

    let temp_dir = TempDir::new().unwrap();
    let service = ProfileService::new(temp_dir.path());

    let profile = ConfigProfile::default();
    let save_result = service.save_profile("test_profile", &profile);
    assert!(save_result.is_ok());

    let profiles = service.list_profiles().unwrap();
    assert!(profiles.contains(&"test_profile".to_string()));

    let load_result = service.load_profile("test_profile");
    assert!(load_result.is_ok());
}

#[test]
fn test_profile_service_delete() {
    use config::profile::ConfigProfile;

    let temp_dir = TempDir::new().unwrap();
    let service = ProfileService::new(temp_dir.path());

    let profile = ConfigProfile::default();
    service.save_profile("test_profile", &profile).unwrap();

    assert!(service.profile_exists("test_profile"));

    let delete_result = service.delete_profile("test_profile");
    assert!(delete_result.is_ok());
    assert!(!service.profile_exists("test_profile"));
}

#[test]
fn test_backup_service() {
    let temp_dir = TempDir::new().unwrap();
    let backup_dir = temp_dir.path().join("backups");
    let service = BackupService::new(&backup_dir);

    let config_path = temp_dir.path().join("Config.toml");
    let config = AppConfig::default();
    FileService::write_config(&config, &config_path, ConfigFormat::Toml).unwrap();

    let backup_result = service.create_backup(&config_path);
    assert!(backup_result.is_ok());

    let backups = service.list_backups().unwrap();
    assert!(!backups.is_empty());
}

#[test]
fn test_backup_service_restore() {
    let temp_dir = TempDir::new().unwrap();
    let backup_dir = temp_dir.path().join("backups");
    let service = BackupService::new(&backup_dir);

    let config_path = temp_dir.path().join("Config.toml");
    let config = AppConfig::default();
    FileService::write_config(&config, &config_path, ConfigFormat::Toml).unwrap();

    let backup_path = service.create_backup(&config_path).unwrap();

    let restore_path = temp_dir.path().join("restored_config.toml");
    let restore_result = service.restore_backup(&backup_path, &restore_path);
    assert!(restore_result.is_ok());
    assert!(FileService::exists(&restore_path));
}

#[test]
fn test_backup_service_cleanup() {
    let temp_dir = TempDir::new().unwrap();
    let backup_dir = temp_dir.path().join("backups");
    let service = BackupService::new(&backup_dir);

    let config_path = temp_dir.path().join("Config.toml");
    let config = AppConfig::default();
    FileService::write_config(&config, &config_path, ConfigFormat::Toml).unwrap();

    service.create_backup(&config_path).unwrap();
    service.create_backup(&config_path).unwrap();
    service.create_backup(&config_path).unwrap();

    let deleted = service.cleanup_old_backups(2).unwrap();
    assert_eq!(deleted, 1);

    let backups = service.list_backups().unwrap();
    assert_eq!(backups.len(), 2);
}
