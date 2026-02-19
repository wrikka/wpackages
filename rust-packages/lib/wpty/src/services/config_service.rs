use crate::config::AppConfig;
use notify::{RecommendedWatcher, RecursiveMode, Watcher, EventKind};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc, RwLock};

#[derive(Clone)]
pub struct ConfigService {
    config: Arc<RwLock<AppConfig>>,
    reload_tx: broadcast::Sender<()>,
}

impl Default for ConfigService {
    fn default() -> Self {
        Self::new()
    }
}

impl ConfigService {
    pub fn new() -> Self {
        let config = AppConfig::load().unwrap_or_default();
        let (tx, _) = broadcast::channel(1);
        Self {
            config: Arc::new(RwLock::new(config)),
            reload_tx: tx,
        }
    }

    pub async fn get_config(&self) -> tokio::sync::RwLockReadGuard<'_, AppConfig> {
        self.config.read().await
    }

    pub fn subscribe(&self) -> broadcast::Receiver<()> {
        self.reload_tx.subscribe()
    }

    async fn reload(&self) {
        tracing::info!("Reloading configuration...");
        match AppConfig::load() {
            Ok(new_config) => {
                let mut config_lock = self.config.write().await;
                *config_lock = new_config;
                tracing::info!("Configuration reloaded successfully.");
                if self.reload_tx.send(()).is_err() {
                    tracing::warn!("No listeners for config reload event.");
                }
            }
            Err(e) => {
                tracing::error!("Failed to reload configuration: {}", e);
            }
        }
    }

    pub fn watch(&self) {
        let service_clone = self.clone();
        tokio::spawn(async move {
            if let Err(e) = service_clone.watch_config_file().await {
                tracing::error!("Failed to start config file watcher: {}", e);
            }
        });
    }

    async fn watch_config_file(&self) -> notify::Result<()> {
        let (tx, mut rx) = mpsc::channel(1);

        let mut watcher = RecommendedWatcher::new(
            move |res| {
                tx.blocking_send(res).expect("Failed to send notify event");
            },
            notify::Config::default(),
        )?;

        let config_path = AppConfig::get_config_path().unwrap();
        watcher.watch(Path::new(&config_path), RecursiveMode::NonRecursive)?;

        while let Some(res) = rx.recv().await {
            match res {
                Ok(event) => {
                    if let EventKind::Modify(_) = event.kind {
                        self.reload().await;
                    }
                }
                Err(e) => tracing::error!("Watch error: {:?}", e),
            }
        }

        Ok(())
    }
}

