//! services/marketplace.rs

use crate::types::marketplace::ToolListing;
use std::path::{Path, PathBuf};
use tokio::fs;

/// A service that simulates a decentralized tool marketplace using the local file system.
#[derive(Clone)]
pub struct MarketplaceService {
    marketplace_dir: PathBuf,
}

impl MarketplaceService {
    /// Creates a new `MarketplaceService` that uses the given directory as its storage.
    pub fn new(marketplace_dir: impl AsRef<Path>) -> Self {
        Self { marketplace_dir: marketplace_dir.as_ref().to_path_buf() }
    }

    /// Publishes a tool listing to the marketplace.
    pub async fn publish(&self, listing: &ToolListing) -> std::io::Result<()> {
        let data = serde_json::to_string_pretty(listing)?;
        let path = self.marketplace_dir.join(format!("{}.json", listing.name));
        fs::create_dir_all(&self.marketplace_dir).await?;
        fs::write(path, data).await
    }

    /// Searches the marketplace for tools matching a query.
    pub async fn search(&self, query: &str) -> std::io::Result<Vec<ToolListing>> {
        let mut results = Vec::new();
        let mut entries = fs::read_dir(&self.marketplace_dir).await?;

        while let Some(entry) = entries.next_entry().await? {
            if entry.path().is_file() {
                let data = fs::read(entry.path()).await?;
                if let Ok(listing) = serde_json::from_slice::<ToolListing>(&data) {
                    if listing.name.contains(query) || listing.description.contains(query) {
                        results.push(listing);
                    }
                }
            }
        }
        Ok(results)
    }
}
