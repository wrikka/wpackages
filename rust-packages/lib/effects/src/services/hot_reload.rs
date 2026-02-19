use crate::error::EffectError;
use crate::types::effect::Effect;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use std::time::Duration;

/// Dynamic configuration store
#[derive(Debug, Default)]
pub struct ConfigStore {
    configs: Arc<RwLock<HashMap<String, serde_json::Value>>>,
    watchers: Arc<Mutex<Vec<tokio::sync::mpsc::Sender<ConfigChange>>>>,
}

#[derive(Debug, Clone)]
pub struct ConfigChange {
    pub key: String,
    pub old_value: Option<serde_json::Value>,
    pub new_value: serde_json::Value,
}

impl ConfigStore {
    pub fn new() -> Self {
        Self {
            configs: Arc::new(RwLock::new(HashMap::new())),
            watchers: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn get(&self, key: &str) -> Option<serde_json::Value> {
        let configs = self.configs.read().await;
        configs.get(key).cloned()
    }

    pub async fn set(&self, key: impl Into<String>, value: serde_json::Value) {
        let key = key.into();
        let mut configs = self.configs.write().await;
        let old_value = configs.get(&key).cloned();
        configs.insert(key.clone(), value.clone());
        drop(configs);

        // Notify watchers
        let change = ConfigChange {
            key,
            old_value,
            new_value: value,
        };

        let watchers = self.watchers.lock().await;
        for watcher in watchers.iter() {
            let _ = watcher.send(change.clone()).await;
        }
    }

    pub async fn watch(&self) -> tokio::sync::mpsc::Receiver<ConfigChange> {
        let (tx, rx) = tokio::sync::mpsc::channel(100);
        let mut watchers = self.watchers.lock().await;
        watchers.push(tx);
        rx
    }
}

/// Hot reload configuration for effects
#[derive(Debug, Clone)]
pub struct HotReloadConfig {
    pub config_key: String,
    pub reload_interval: Duration,
}

/// Hot reload extension trait
pub trait HotReloadExt<T, E, R> {
    /// Enable hot reload of configuration
    fn with_hot_reload(self, config: HotReloadConfig, store: Arc<ConfigStore>) -> Effect<T, E, R>;
}

impl<T, E, R> HotReloadExt<T, E, R> for Effect<T, E, R>
where
    T: Send + Clone + 'static,
    E: Send + Clone + From<EffectError> + 'static,
    R: Send + Sync + Clone + 'static,
{
    fn with_hot_reload(self, config: HotReloadConfig, store: Arc<ConfigStore>) -> Effect<T, E, R> {
        Effect::new(move |ctx: R| {
            let effect = self.clone();
            let ctx = ctx.clone();
            let _config = config.clone();
            let _store = store.clone();

            Box::pin(async move {
                // In a real implementation, this would check for config updates
                // and potentially reconfigure the effect dynamically
                effect.run(ctx).await
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_config_store() {
        let store = Arc::new(ConfigStore::new());

        // Set config
        store.set("timeout", serde_json::json!(30)).await;

        // Get config
        let value = store.get("timeout").await;
        assert_eq!(value, Some(serde_json::json!(30)));

        // Watch for changes
        let mut rx = store.watch().await;

        // Update config
        store.set("timeout", serde_json::json!(60)).await;

        // Should receive change notification
        let change = rx.recv().await;
        assert!(change.is_some());
        assert_eq!(change.unwrap().new_value, serde_json::json!(60));
    }
}
