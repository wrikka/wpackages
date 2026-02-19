use super::registry::PluginRegistry;
use super::types::{InstalledPlugin, PluginCategory, PluginManifest, PluginReview, PluginStats};
use anyhow::Result;
use chrono::Utc;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

pub struct PluginMarketplace {
    registry: Arc<PluginRegistry>,
    plugin_dir: PathBuf,
    installed_plugins: Arc<RwLock<HashMap<String, InstalledPlugin>>>,
}

impl PluginMarketplace {
    pub fn new(plugin_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&plugin_dir)?;

        Ok(Self {
            registry: Arc::new(PluginRegistry::default()),
            plugin_dir,
            installed_plugins: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    pub async fn initialize(&self) -> Result<()> {
        self.sync_registry().await?;
        self.load_installed_plugins().await?;
        Ok(())
    }

    pub async fn sync_registry(&self) -> Result<()> {
        self.registry.sync_from_remote().await
    }

    pub async fn search(
        &self,
        query: &str,
        category: Option<PluginCategory>,
    ) -> Result<Vec<PluginManifest>> {
        self.registry.search(query, category).await
    }

    pub async fn get_featured(&self) -> Result<Vec<PluginManifest>> {
        self.registry.get_featured().await
    }

    pub async fn get_popular(&self) -> Result<Vec<PluginManifest>> {
        self.registry.get_popular().await
    }

    pub async fn get_recent(&self) -> Result<Vec<PluginManifest>> {
        self.registry.get_recent().await
    }

    pub async fn install(&self, plugin_id: &str) -> Result<InstalledPlugin> {
        let manifest = self
            .registry
            .get_plugin(plugin_id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Plugin not found: {}", plugin_id))?;

        let wasm_bytes = self.registry.download_plugin(plugin_id).await?;

        let plugin_path = self.plugin_dir.join(format!("{}.wasm", plugin_id));
        std::fs::write(&plugin_path, wasm_bytes)?;

        let installed = InstalledPlugin {
            manifest: manifest.clone(),
            installed_at: Utc::now(),
            enabled: true,
            version: manifest.version.clone(),
            path: plugin_path,
        };

        self.installed_plugins
            .write()
            .insert(plugin_id.to_string(), installed.clone());

        Ok(installed)
    }

    pub async fn uninstall(&self, plugin_id: &str) -> Result<()> {
        if let Some(plugin) = self.installed_plugins.write().remove(plugin_id) {
            if plugin.path.exists() {
                std::fs::remove_file(plugin.path)?;
            }
        }

        Ok(())
    }

    pub async fn enable(&self, plugin_id: &str) -> Result<()> {
        if let Some(mut plugin) = self.installed_plugins.write().get_mut(plugin_id) {
            plugin.enabled = true;
        }
        Ok(())
    }

    pub async fn disable(&self, plugin_id: &str) -> Result<()> {
        if let Some(mut plugin) = self.installed_plugins.write().get_mut(plugin_id) {
            plugin.enabled = false;
        }
        Ok(())
    }

    pub async fn update(&self, plugin_id: &str) -> Result<InstalledPlugin> {
        self.uninstall(plugin_id).await?;
        self.install(plugin_id).await
    }

    pub fn get_installed(&self) -> Vec<InstalledPlugin> {
        self.installed_plugins.read().values().cloned().collect()
    }

    pub fn get_installed_plugin(&self, plugin_id: &str) -> Option<InstalledPlugin> {
        self.installed_plugins.read().get(plugin_id).cloned()
    }

    pub async fn get_reviews(&self, plugin_id: &str) -> Result<Vec<PluginReview>> {
        self.registry.get_reviews(plugin_id).await
    }

    pub async fn add_review(&self, review: PluginReview) -> Result<()> {
        self.registry.add_review(review).await
    }

    pub async fn get_stats(&self, plugin_id: &str) -> Result<Option<PluginStats>> {
        self.registry.get_stats(plugin_id).await
    }

    async fn load_installed_plugins(&self) -> Result<()> {
        let mut installed = self.installed_plugins.write();

        if let Ok(entries) = std::fs::read_dir(&self.plugin_dir) {
            for entry in entries.flatten() {
                if let Some(name) = entry.file_name().to_str() {
                    if name.ends_with(".wasm") {
                        let plugin_id = name.trim_end_matches(".wasm");
                        if let Ok(manifest) = self.load_manifest(plugin_id) {
                            let installed_plugin = InstalledPlugin {
                                manifest,
                                installed_at: Utc::now(),
                                enabled: true,
                                version: "0.0.0".to_string(),
                                path: entry.path(),
                            };
                            installed.insert(plugin_id.to_string(), installed_plugin);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    fn load_manifest(&self, plugin_id: &str) -> Result<PluginManifest> {
        let manifest_path = self.plugin_dir.join(format!("{}.json", plugin_id));
        let manifest_data = std::fs::read_to_string(manifest_path)?;
        Ok(serde_json::from_str(&manifest_data)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_plugin_marketplace() {
        let plugin_dir = std::env::temp_dir().join("terminal-marketplace-test");
        let marketplace = PluginMarketplace::new(plugin_dir).unwrap();

        let results = marketplace.search("", None).await.unwrap();
        assert_eq!(results.len(), 0);
    }
}
