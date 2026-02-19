use super::backend::CacheBackend;
use crate::types::{ChatRequest, ChatResponse};
use async_trait::async_trait;
use std::path::{Path, PathBuf};
use tokio::fs;

/// A cache backend that stores responses in the file system.
pub struct FileCache {
    cache_dir: PathBuf,
}

impl FileCache {
    /// Create a new `FileCache` with the given cache directory.
    pub async fn new(cache_dir: impl AsRef<Path>) -> std::io::Result<Self> {
        let path = cache_dir.as_ref().to_path_buf();
        fs::create_dir_all(&path).await?;
        Ok(Self { cache_dir: path })
    }

    fn get_path(&self, key: &str) -> PathBuf {
        self.cache_dir.join(key)
    }
}

#[async_trait]
impl CacheBackend for FileCache {
    async fn get_chat(&self, key: &str) -> Option<ChatResponse> {
        let path = self.get_path(key);
        if !path.exists() {
            return None;
        }
        let content = fs::read(path).await.ok()?;
        serde_json::from_slice(&content).ok()
    }

    async fn put_chat(&self, key: &str, response: &ChatResponse) {
        let path = self.get_path(key);
        if let Ok(content) = serde_json::to_vec(response) {
            let _ = fs::write(path, content).await;
        }
    }

    async fn clear(&self) {
        let _ = fs::remove_dir_all(&self.cache_dir).await;
        let _ = fs::create_dir_all(&self.cache_dir).await;
    }

    async fn stats(&self) -> super::CacheStats {
        let mut count = 0;
        if let Ok(mut entries) = fs::read_dir(&self.cache_dir).await {
            while let Ok(Some(_)) = entries.next_entry().await {
                count += 1;
            }
        }
        super::CacheStats {
            chat_entries: count,
        }
    }
}
