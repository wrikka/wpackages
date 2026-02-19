//! Client for connecting to the remote marketplace API

use crate::error::{AppError, Result};
use crate::types::manifest::ExtensionManifest;
use chrono::{DateTime, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tracing::{debug, error, info};
use uuid::Uuid;

/// Remote extension from marketplace
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteExtension {
    pub id: Uuid,
    pub name: String,
    pub version: String,
    pub author: String,
    pub repository: String,
    pub description: String,
    pub category: String,
    pub download_url: String,
    pub downloads: i64,
    pub rating: f32,
    pub author_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<RemoteExtension> for ExtensionManifest {
    fn from(ext: RemoteExtension) -> Self {
        ExtensionManifest {
            name: ext.name,
            id: crate::types::ExtensionId::new(ext.id.to_string().as_str()),
            version: ext.version,
            author: ext.author,
            repository: ext.repository,
            description: ext.description,
            category: crate::types::manifest::ExtensionCategory::Other,
            dependencies: None,
            permissions: Vec::new(),
        }
    }
}

/// Search query parameters
#[derive(Debug, Clone, Serialize)]
pub struct SearchQuery {
    pub q: Option<String>,
    pub category: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Extension update info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionUpdate {
    pub extension_id: Uuid,
    pub current_version: String,
    pub latest_version: String,
    pub changelog: String,
    pub download_url: String,
}

/// Client for the marketplace API
#[derive(Clone)]
pub struct MarketplaceClient {
    client: Client,
    base_url: String,
}

impl MarketplaceClient {
    /// Creates a new marketplace client
    pub fn new(base_url: impl Into<String>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| Client::new());

        Self {
            client,
            base_url: base_url.into(),
        }
    }

    /// Searches for extensions
    pub async fn search(&self, query: SearchQuery) -> Result<Vec<RemoteExtension>> {
        let url = format!("{}/extensions", self.base_url);
        debug!("Searching extensions: {:?}", query);

        let response = self
            .client
            .get(&url)
            .query(&query)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to search: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::NetworkError(format!(
                "Search failed: {}",
                response.status()
            )));
        }

        let extensions = response
            .json::<Vec<RemoteExtension>>()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to parse response: {}", e)))?;

        info!("Found {} extensions", extensions.len());
        Ok(extensions)
    }

    /// Gets an extension by ID
    pub async fn get_extension(&self, id: Uuid) -> Result<RemoteExtension> {
        let url = format!("{}/extensions/{}", self.base_url, id);
        debug!("Getting extension: {}", id);

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to get extension: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::NetworkError(format!(
                "Get extension failed: {}",
                response.status()
            )));
        }

        let extension = response
            .json::<RemoteExtension>()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to parse response: {}", e)))?;

        Ok(extension)
    }

    /// Downloads an extension
    pub async fn download_extension(&self, id: Uuid) -> Result<Vec<u8>> {
        let url = format!("{}/extensions/{}/download", self.base_url, id);
        debug!("Downloading extension: {}", id);

        // Increment download count
        self.client
            .post(&url)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to increment downloads: {}", e)))?;

        // Get the extension to get the download URL
        let extension = self.get_extension(id).await?;

        // Download the file
        let response = self
            .client
            .get(&extension.download_url)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to download file: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::NetworkError(format!(
                "Download failed: {}",
                response.status()
            )));
        }

        let bytes = response
            .bytes()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to read bytes: {}", e)))?;

        info!("Downloaded extension {} ({} bytes)", id, bytes.len());
        Ok(bytes.to_vec())
    }

    /// Checks for updates
    pub async fn check_updates(&self, extension_id: Uuid) -> Result<Option<ExtensionUpdate>> {
        let url = format!("{}/extensions/{}/updates", self.base_url, extension_id);
        debug!("Checking updates for: {}", extension_id);

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to check updates: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::NetworkError(format!(
                "Check updates failed: {}",
                response.status()
            )));
        }

        let update = response
            .json::<Option<ExtensionUpdate>>()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to parse response: {}", e)))?;

        Ok(update)
    }

    /// Creates a new extension (admin only)
    pub async fn create_extension(
        &self,
        manifest: ExtensionManifest,
        download_url: String,
    ) -> Result<RemoteExtension> {
        let url = format!("{}/extensions", self.base_url);
        debug!("Creating extension: {}", manifest.name);

        #[derive(Serialize)]
        struct CreateRequest {
            name: String,
            version: String,
            author: String,
            repository: String,
            description: String,
            category: String,
            download_url: String,
        }

        let request = CreateRequest {
            name: manifest.name.clone(),
            version: manifest.version.clone(),
            author: manifest.author.clone(),
            repository: manifest.repository.clone(),
            description: manifest.description.clone(),
            category: "other".to_string(),
            download_url,
        };

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to create extension: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::NetworkError(format!(
                "Create extension failed: {}",
                response.status()
            )));
        }

        let extension = response
            .json::<RemoteExtension>()
            .await
            .map_err(|e| AppError::NetworkError(format!("Failed to parse response: {}", e)))?;

        info!("Created extension: {}", extension.name);
        Ok(extension)
    }

    /// Checks if the marketplace is available
    pub async fn health_check(&self) -> Result<bool> {
        let url = format!("{}/health", self.base_url);

        let response = self
            .client
            .get(&url)
            .timeout(Duration::from_secs(5))
            .send()
            .await;

        match response {
            Ok(r) => Ok(r.status().is_success()),
            Err(e) => {
                error!("Health check failed: {}", e);
                Ok(false)
            }
        }
    }
}

impl Default for MarketplaceClient {
    fn default() -> Self {
        Self::new("http://localhost:3000")
    }
}
