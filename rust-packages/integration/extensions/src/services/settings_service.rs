use crate::error::{AppError, Result};
use crate::types::settings::{SettingSpec, SettingValue};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tracing::warn;

const SETTINGS_FILE: &str = "settings.json";

/// A thread-safe service for managing extension settings.
#[derive(Clone)]
pub struct SettingsService {
    inner: Arc<Mutex<ServiceInner>>,
    path: PathBuf,
}

#[derive(Default, Serialize, Deserialize)]
struct ServiceInner {
    #[serde(skip)]
    specs: HashMap<String, SettingSpec>,
    values: HashMap<String, SettingValue>,
}

impl SettingsService {
    pub fn new(storage_dir: &Path) -> Self {
        let path = storage_dir.join(SETTINGS_FILE);
        let inner = Self::load(&path).unwrap_or_default();
        Self {
            inner: Arc::new(Mutex::new(inner)),
            path,
        }
    }

    fn load(path: &Path) -> Option<ServiceInner> {
        if !path.exists() {
            return None;
        }
        fs::read_to_string(path)
            .ok()
            .and_then(|content| serde_json::from_str(&content).ok())
    }

    fn save(&self) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        let content =
            serde_json::to_string_pretty(&*inner).map_err(|e| AppError::ServiceError {
                service_name: "SettingsService".to_string(),
                source: e.into(),
            })?;
        fs::write(&self.path, content)?;
        Ok(())
    }

    /// Registers a new setting specification.
    pub fn register(&self, spec: SettingSpec) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();
        let key = spec.key.clone();
        if inner.specs.contains_key(&key) {
            warn!("Overwriting an existing setting specification: {}", key);
        }

        // Set the default value only if no user-defined value exists
        inner
            .values
            .entry(key.clone())
            .or_insert_with(|| spec.default.clone());

        inner.specs.insert(key, spec);
        drop(inner);

        self.save()
    }

    /// Gets the current value of a setting.
    pub fn get(&self, key: &str) -> Result<SettingValue> {
        let inner = self.inner.lock().unwrap();
        inner
            .values
            .get(key)
            .cloned()
            .ok_or_else(|| AppError::SettingNotFound(key.to_string()))
    }

    /// Sets the value of a setting.
    pub fn set(&self, key: &str, value: SettingValue) -> Result<()> {
        let mut inner = self.inner.lock().unwrap();
        if !inner.specs.contains_key(key) {
            return Err(AppError::SettingNotFound(key.to_string()));
        }
        inner.values.insert(key.to_string(), value);
        drop(inner);

        self.save()
    }
}
