//! Service for managing the extension marketplace and local installations.

use crate::error::{AppError, Result};
use crate::services::marketplace_client::{
    ExtensionUpdate, MarketplaceClient, RemoteExtension, SearchQuery,
};
use crate::types::manifest::ExtensionManifest;
use std::sync::{Arc, Mutex};
use tracing::{debug, info};

/// Represents the state of a locally installed extension.
#[derive(Clone, Debug)]
pub struct LocalExtension {
    pub manifest: ExtensionManifest,
    pub is_enabled: bool,
    pub is_builtin: bool,
}

/// A thread-safe service for managing the extension marketplace.
#[derive(Clone)]
pub struct MarketplaceService {
    inner: Arc<Mutex<ServiceInner>>,
    client: MarketplaceClient,
}

#[derive(Default)]
struct ServiceInner {
    local_extensions: Vec<LocalExtension>,
}

impl MarketplaceService {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(ServiceInner::default())),
            client: MarketplaceClient::default(),
        }
    }

    /// Creates a new MarketplaceService with a custom client
    pub fn with_client(client: MarketplaceClient) -> Self {
        Self {
            inner: Arc::new(Mutex::new(ServiceInner::default())),
            client,
        }
    }

    /// Updates the list of local extensions.
    /// This would be called by the ExtensionManager after loading extensions.
    pub fn update_local_extensions(&self, extensions: Vec<LocalExtension>) {
        let mut inner = self.inner.lock().unwrap();
        inner.local_extensions = extensions;
        info!("Updated local extensions list");
    }

    /// Returns a list of all locally installed extensions.
    pub fn get_local_extensions(&self) -> Vec<LocalExtension> {
        self.inner.lock().unwrap().local_extensions.clone()
    }

    /// Searches for extensions in the remote marketplace
    pub async fn search(&self, query: SearchQuery) -> Result<Vec<RemoteExtension>> {
        debug!("Searching marketplace with query: {:?}", query);
        self.client.search(query).await
    }

    /// Gets an extension from the remote marketplace by ID
    pub async fn get_remote_extension(&self, id: uuid::Uuid) -> Result<RemoteExtension> {
        debug!("Getting remote extension: {}", id);
        self.client.get_extension(id).await
    }

    /// Downloads an extension from the marketplace
    pub async fn download_extension(&self, id: uuid::Uuid) -> Result<Vec<u8>> {
        debug!("Downloading extension: {}", id);
        self.client.download_extension(id).await
    }

    /// Checks for updates for a local extension
    pub async fn check_updates(&self, extension_id: &str) -> Result<Option<ExtensionUpdate>> {
        debug!("Checking updates for: {}", extension_id);
        let uuid = uuid::Uuid::parse_str(extension_id)
            .map_err(|e| AppError::NetworkError(format!("Invalid UUID: {}", e)))?;
        self.client.check_updates(uuid).await
    }

    /// Checks for updates for all local extensions
    pub async fn check_all_updates(&self) -> Result<Vec<ExtensionUpdate>> {
        debug!("Checking updates for all local extensions");
        let local_extensions = self.get_local_extensions();
        let mut updates = Vec::new();

        for ext in local_extensions {
            if let Ok(Some(update)) = self.check_updates(ext.manifest.id.as_ref()).await {
                updates.push(update);
            }
        }

        info!("Found {} updates", updates.len());
        Ok(updates)
    }

    /// Installs an extension from the marketplace
    pub async fn install(&self, id: uuid::Uuid, install_dir: &std::path::Path) -> Result<()> {
        info!("Installing extension: {}", id);

        // Download the extension
        let bytes = self.download_extension(id).await?;

        // Get extension metadata
        let remote_ext = self.get_remote_extension(id).await?;

        // Create extension directory
        let ext_dir = install_dir.join(&remote_ext.name);
        std::fs::create_dir_all(&ext_dir)?;

        // Save the downloaded file
        let file_path = ext_dir.join(format!("{}.wasm", remote_ext.name));
        std::fs::write(&file_path, bytes)?;

        // Create manifest
        let manifest = ExtensionManifest::from(remote_ext.clone());
        let manifest_path = ext_dir.join("extension.toml");
        let manifest_content =
            toml::to_string_pretty(&manifest).map_err(AppError::TomlSerialize)?;
        std::fs::write(manifest_path, manifest_content)?;

        info!("Extension {} installed successfully", remote_ext.name);
        Ok(())
    }

    /// Publishes an extension to the marketplace
    pub async fn publish(
        &self,
        manifest: ExtensionManifest,
        download_url: String,
    ) -> Result<RemoteExtension> {
        info!("Publishing extension: {}", manifest.name);
        self.client.create_extension(manifest, download_url).await
    }

    /// Checks if the marketplace is available
    pub async fn is_marketplace_available(&self) -> bool {
        self.client.health_check().await.unwrap_or(false)
    }
}

impl Default for MarketplaceService {
    fn default() -> Self {
        Self::new()
    }
}
