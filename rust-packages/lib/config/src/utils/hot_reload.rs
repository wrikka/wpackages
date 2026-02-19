//! Configuration hot reload
//!
//! This module provides hot reload functionality for configuration.

use crate::error::{ConfigError, ConfigResult};
use crate::types::{AppConfig, ConfigFormat};
use std::path::Path;
use std::sync::{Arc, RwLock};
use std::time::Duration;

/// Represents a configuration watcher.
pub struct ConfigWatcher {
    path: Arc<RwLock<String>>,
    config: Arc<RwLock<AppConfig>>,
    callback: Arc<RwLock<Option<Box<dyn Fn(AppConfig) + Send + Sync>>>>,
}

impl ConfigWatcher {
    /// Creates a new configuration watcher.
    ///
    /// # Arguments
    ///
    /// * `path` - The path to watch
    /// * `config` - The initial configuration
    ///
    /// # Returns
    ///
    /// Returns a new watcher.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::hot_reload::ConfigWatcher;
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// let watcher = ConfigWatcher::new("Config.toml", config);
    /// ```
    pub fn new<P: AsRef<Path>>(path: P, config: AppConfig) -> Self {
        Self {
            path: Arc::new(RwLock::new(path.as_ref().to_string_lossy().to_string())),
            config: Arc::new(RwLock::new(config)),
            callback: Arc::new(RwLock::new(None)),
        }
    }

    /// Sets the callback for configuration changes.
    ///
    /// # Arguments
    ///
    /// * `callback` - The callback function
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::hot_reload::ConfigWatcher;
    ///
    /// let mut watcher = ConfigWatcher::new("Config.toml", config);
    /// watcher.set_callback(Box::new(|new_config| {
    ///     println!("Config changed!");
    /// }));
    /// ```
    pub fn set_callback<F>(&self, callback: F)
    where
        F: Fn(AppConfig) + Send + Sync + 'static,
    {
        let mut cb = self.callback.write().unwrap();
        *cb = Some(Box::new(callback));
    }

    /// Starts watching for file changes.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::hot_reload::ConfigWatcher;
    ///
    /// let watcher = ConfigWatcher::new("Config.toml", config);
    /// watcher.watch().unwrap();
    /// ```
    pub fn watch(&self) -> ConfigResult<()> {
        let path = self.path.read().unwrap().clone();
        let config = self.config.clone();
        let callback = self.callback.clone();

        // Spawn a background task to watch for changes
        std::thread::spawn(move || {
            let mut last_modified = get_file_modified_time(&path);

            loop {
                std::thread::sleep(Duration::from_secs(1));

                if let Some(modified) = get_file_modified_time(&path) {
                    if modified > last_modified {
                        last_modified = modified;

                        if let Ok(new_config) = load_config(&path) {
                            // Update config
                            if let Ok(mut cfg) = config.write() {
                                *cfg = new_config.clone();

                                // Call callback
                                if let Ok(cb) = callback.read() {
                                    if let Some(ref cb_fn) = *cb {
                                        cb_fn(new_config);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        Ok(())
    }

    /// Returns the current configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> AppConfig {
        self.config.read().unwrap().clone()
    }

    /// Reloads the configuration.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::hot_reload::ConfigWatcher;
    ///
    /// let watcher = ConfigWatcher::new("Config.toml", config);
    /// watcher.reload().unwrap();
    /// ```
    pub fn reload(&self) -> ConfigResult<()> {
        let path = self.path.read().unwrap().clone();
        let new_config = load_config(&path)?;

        if let Ok(mut cfg) = self.config.write() {
            *cfg = new_config;
        }

        Ok(())
    }
}

/// Gets the file modification time.
fn get_file_modified_time(path: &str) -> Option<std::time::SystemTime> {
    std::fs::metadata(path).ok()?.modified().ok()
}

/// Loads configuration from a file.
fn load_config(path: &str) -> ConfigResult<AppConfig> {
    AppConfig::load_from_path(path)
}

/// Represents a hot reload manager.
pub struct HotReloadManager {
    watchers: Vec<ConfigWatcher>,
}

impl HotReloadManager {
    /// Creates a new hot reload manager.
    ///
    /// # Returns
    ///
    /// Returns a new manager.
    pub fn new() -> Self {
        Self {
            watchers: Vec::new(),
        }
    }

    /// Adds a watcher.
    ///
    /// # Arguments
    ///
    /// * `watcher` - The watcher to add
    pub fn add_watcher(&mut self, watcher: ConfigWatcher) {
        self.watchers.push(watcher);
    }

    /// Starts all watchers.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    pub fn start(&self) -> ConfigResult<()> {
        for watcher in &self.watchers {
            watcher.watch()?;
        }
        Ok(())
    }

    /// Reloads all watchers.
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    pub fn reload_all(&self) -> ConfigResult<()> {
        for watcher in &self.watchers {
            watcher.reload()?;
        }
        Ok(())
    }
}

impl Default for HotReloadManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a reload event.
#[derive(Debug, Clone)]
pub struct ReloadEvent {
    timestamp: String,
    path: String,
    config: AppConfig,
}

impl ReloadEvent {
    /// Creates a new reload event.
    ///
    /// # Arguments
    ///
    /// * `path` - The file path
    /// * `config` - The configuration
    ///
    /// # Returns
    ///
    /// Returns a new event.
    pub fn new(path: String, config: AppConfig) -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            timestamp: timestamp.to_string(),
            path,
            config,
        }
    }

    /// Returns the timestamp.
    ///
    /// # Returns
    ///
    /// Returns the timestamp.
    pub fn timestamp(&self) -> &str {
        &self.timestamp
    }

    /// Returns the path.
    ///
    /// # Returns
    ///
    /// Returns the path.
    pub fn path(&self) -> &str {
        &self.path
    }

    /// Returns the configuration.
    ///
    /// # Returns
    ///
    /// Returns the configuration.
    pub fn config(&self) -> &AppConfig {
        &self.config
    }
}

/// Represents a reload event listener.
pub trait ReloadListener: Send + Sync {
    /// Called when configuration is reloaded.
    ///
    /// # Arguments
    ///
    /// * `event` - The reload event
    fn on_reload(&self, event: &ReloadEvent);
}

/// Represents a reload event emitter.
pub struct ReloadEmitter {
    listeners: Vec<Box<dyn ReloadListener>>,
}

impl ReloadEmitter {
    /// Creates a new reload emitter.
    ///
    /// # Returns
    ///
    /// Returns a new emitter.
    pub fn new() -> Self {
        Self {
            listeners: Vec::new(),
        }
    }

    /// Adds a listener.
    ///
    /// # Arguments
    ///
    /// * `listener` - The listener to add
    pub fn add_listener(&mut self, listener: Box<dyn ReloadListener>) {
        self.listeners.push(listener);
    }

    /// Emits a reload event.
    ///
    /// # Arguments
    ///
    /// * `event` - The event to emit
    pub fn emit(&self, event: &ReloadEvent) {
        for listener in &self.listeners {
            listener.on_reload(event);
        }
    }
}

impl Default for ReloadEmitter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_watcher_new() {
        let config = AppConfig::default();
        let watcher = ConfigWatcher::new("Config.toml", config);
        assert_eq!(watcher.config().appearance.theme_id, "default-dark");
    }

    #[test]
    fn test_reload_event() {
        let config = AppConfig::default();
        let event = ReloadEvent::new("path".to_string(), config);
        assert_eq!(event.path(), "path");
    }

    #[test]
    fn test_reload_emitter() {
        let emitter = ReloadEmitter::new();
        assert!(emitter.listeners.is_empty());
    }

    #[test]
    fn test_hot_reload_manager() {
        let manager = HotReloadManager::new();
        assert!(manager.watchers.is_empty());
    }
}
