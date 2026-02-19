use crate::registry::ExtensionRegistry;
use figment::Figment;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use tracing::{debug, info, warn};

// A generic value type for settings
type SettingValue = serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtensionSettingSpec {
    pub key: String,
    pub title: String,
    pub description: String,
    pub default: SettingValue,
}

pub struct ConfigService {
    registry: Arc<ExtensionRegistry>,
    // Using RwLock for interior mutability to allow reading and writing settings
    settings: RwLock<HashMap<String, SettingValue>>,
    // Figment instance for handling config file loading/saving
    figment: Figment,
    // Path to the settings file
    settings_path: PathBuf,
}

impl ConfigService {
    pub fn new(registry: Arc<ExtensionRegistry>, figment: Figment, settings_path: PathBuf) -> Self {
        Self {
            registry,
            settings: RwLock::new(HashMap::new()),
            figment,
            settings_path,
        }
    }

    pub fn register_setting(&self, spec: ExtensionSettingSpec) {
        let mut settings = self.settings.write().unwrap();
        // Only set default if not already set
        settings.entry(spec.key.clone()).or_insert(spec.default);
        debug!("Registered setting: {}", spec.key);
    }

    pub fn get_setting(&self, key: &str) -> Option<SettingValue> {
        let settings = self.settings.read().unwrap();
        settings.get(key).cloned()
    }

    pub fn set_setting(&self, key: String, value: SettingValue) {
        let mut settings = self.settings.write().unwrap();
        settings.insert(key.clone(), value);
        debug!("Setting updated: {}", key);
        // Auto-save after setting
        if let Err(e) = self.save_settings() {
            warn!("Failed to auto-save settings: {}", e);
        }
    }

    /// Loads configuration from disk
    pub fn load_config(&self) {
        debug!("Loading settings from: {:?}", self.settings_path);

        if !self.settings_path.exists() {
            info!("Settings file does not exist, starting with empty settings");
            return;
        }

        match std::fs::read_to_string(&self.settings_path) {
            Ok(content) => {
                match serde_json::from_str::<HashMap<String, SettingValue>>(&content) {
                    Ok(loaded_settings) => {
                        let mut settings = self.settings.write().unwrap();
                        // Merge loaded settings with current settings
                        for (key, value) in loaded_settings {
                            settings.insert(key, value);
                        }
                        info!("Loaded {} settings from disk", settings.len());
                    }
                    Err(e) => {
                        warn!("Failed to parse settings file: {}, starting with empty settings", e);
                    }
                }
            }
            Err(e) => {
                warn!("Failed to read settings file: {}, starting with empty settings", e);
            }
        }
    }

    /// Saves configuration to disk
    pub fn save_settings(&self) -> std::io::Result<()> {
        debug!("Saving settings to: {:?}", self.settings_path);

        let settings = self.settings.read().unwrap();
        let content = serde_json::to_string_pretty(&*settings)?;

        // Create parent directory if it doesn't exist
        if let Some(parent) = self.settings_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        std::fs::write(&self.settings_path, content)?;
        info!("Settings saved to: {:?}", self.settings_path);
        Ok(())
    }

    /// Resets a setting to its default value
    pub fn reset_setting(&self, key: &str) -> Option<SettingValue> {
        // This would need to know the default value
        // For now, we'll just remove the setting
        let mut settings = self.settings.write().unwrap();
        let value = settings.remove(key);
        if value.is_some() {
            debug!("Reset setting: {}", key);
            if let Err(e) = self.save_settings() {
                warn!("Failed to auto-save settings after reset: {}", e);
            }
        }
        value
    }

    /// Gets all settings
    pub fn get_all_settings(&self) -> HashMap<String, SettingValue> {
        let settings = self.settings.read().unwrap();
        settings.clone()
    }

    /// Clears all settings
    pub fn clear_all_settings(&self) {
        let mut settings = self.settings.write().unwrap();
        settings.clear();
        info!("All settings cleared");
        if let Err(e) = self.save_settings() {
            warn!("Failed to auto-save settings after clear: {}", e);
        }
    }
}
