use super::types::{PluginCategory, PluginManifest, PluginReview, PluginStats};
use anyhow::Result;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

pub struct PluginRegistry {
    plugins: Arc<RwLock<HashMap<String, PluginManifest>>>,
    reviews: Arc<RwLock<HashMap<String, Vec<PluginReview>>>>,
    stats: Arc<RwLock<HashMap<String, PluginStats>>>,
    registry_url: String,
}

impl PluginRegistry {
    pub fn new(registry_url: String) -> Self {
        Self {
            plugins: Arc::new(RwLock::new(HashMap::new())),
            reviews: Arc::new(RwLock::new(HashMap::new())),
            stats: Arc::new(RwLock::new(HashMap::new())),
            registry_url,
        }
    }

    pub async fn search(
        &self,
        query: &str,
        category: Option<PluginCategory>,
    ) -> Result<Vec<PluginManifest>> {
        let plugins = self.plugins.read();

        let results: Vec<PluginManifest> = plugins
            .values()
            .filter(|plugin| {
                let matches_query = query.is_empty()
                    || plugin.name.to_lowercase().contains(&query.to_lowercase())
                    || plugin
                        .description
                        .to_lowercase()
                        .contains(&query.to_lowercase())
                    || plugin
                        .tags
                        .iter()
                        .any(|tag| tag.to_lowercase().contains(&query.to_lowercase()));

                let matches_category = category
                    .as_ref()
                    .map_or(true, |cat| &plugin.category == cat);

                matches_query && matches_category
            })
            .cloned()
            .collect();

        Ok(results)
    }

    pub async fn get_plugin(&self, plugin_id: &str) -> Result<Option<PluginManifest>> {
        Ok(self.plugins.read().get(plugin_id).cloned())
    }

    pub async fn get_featured(&self) -> Result<Vec<PluginManifest>> {
        let plugins = self.plugins.read();

        let featured: Vec<PluginManifest> = plugins
            .values()
            .filter(|plugin| plugin.downloads > 1000 && plugin.rating >= 4.0)
            .take(10)
            .cloned()
            .collect();

        Ok(featured)
    }

    pub async fn get_popular(&self) -> Result<Vec<PluginManifest>> {
        let mut plugins = self.plugins.read().values().cloned().collect::<Vec<_>>();
        plugins.sort_by(|a, b| b.downloads.cmp(&a.downloads));
        Ok(plugins.into_iter().take(20).collect())
    }

    pub async fn get_recent(&self) -> Result<Vec<PluginManifest>> {
        let mut plugins = self.plugins.read().values().cloned().collect::<Vec<_>>();
        plugins.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(plugins.into_iter().take(20).collect())
    }

    pub async fn get_by_category(&self, category: PluginCategory) -> Result<Vec<PluginManifest>> {
        let plugins = self.plugins.read();

        let results: Vec<PluginManifest> = plugins
            .values()
            .filter(|plugin| plugin.category == category)
            .cloned()
            .collect();

        Ok(results)
    }

    pub async fn get_reviews(&self, plugin_id: &str) -> Result<Vec<PluginReview>> {
        Ok(self
            .reviews
            .read()
            .get(plugin_id)
            .cloned()
            .unwrap_or_default())
    }

    pub async fn add_review(&self, review: PluginReview) -> Result<()> {
        self.reviews
            .write()
            .entry(review.plugin_id.clone())
            .or_insert_with(Vec::new)
            .push(review);

        Ok(())
    }

    pub async fn get_stats(&self, plugin_id: &str) -> Result<Option<PluginStats>> {
        Ok(self.stats.read().get(plugin_id).cloned())
    }

    pub async fn sync_from_remote(&self) -> Result<()> {
        let url = format!("{}/api/v1/plugins", self.registry_url);

        let response = reqwest::get(&url).await?.error_for_status()?;

        let remote_plugins: Vec<PluginManifest> = response.json().await?;

        let mut plugins = self.plugins.write();
        for plugin in remote_plugins {
            plugins.insert(plugin.id.clone(), plugin);
        }

        Ok(())
    }

    pub async fn download_plugin(&self, plugin_id: &str) -> Result<Vec<u8>> {
        let plugin = self
            .get_plugin(plugin_id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Plugin not found: {}", plugin_id))?;

        let wasm_bytes = reqwest::get(&plugin.wasm_url)
            .await?
            .bytes()
            .await?
            .to_vec();

        let hash = sha256::digest(&wasm_bytes);
        if hash != plugin.wasm_hash {
            return Err(anyhow::anyhow!("Plugin hash mismatch"));
        }

        Ok(wasm_bytes)
    }
}

impl Default for PluginRegistry {
    fn default() -> Self {
        Self::new("https://plugins.terminal.app".to_string())
    }
}
