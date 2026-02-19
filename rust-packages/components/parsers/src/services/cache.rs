use crate::error::ParseResult;
use crate::types::ParsedDocument;
use cache::prelude::*;
use cache::CacheBackend;
use serde::{Deserialize, Serialize};
use std::hash::Hash;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct DocumentCacheKey {
    pub file_path: String,
    pub file_hash: String,
    pub parser_type: String,
}

impl DocumentCacheKey {
    pub fn new(file_path: PathBuf, file_hash: String, parser_type: String) -> Self {
        Self {
            file_path: file_path.to_string_lossy().to_string(),
            file_hash,
            parser_type,
        }
    }

    pub fn from_path(path: &PathBuf) -> Self {
        // Use simple hash instead of blake3 to avoid extra dependency
        use std::collections::hash_map::DefaultHasher;
        use std::hash::Hasher;
        let mut hasher = DefaultHasher::new();
        hasher.write(path.to_string_lossy().as_bytes());
        let file_hash = format!("{:x}", hasher.finish());
        let parser_type = Self::infer_parser_type(path);

        Self {
            file_path: path.to_string_lossy().to_string(),
            file_hash,
            parser_type,
        }
    }

    fn infer_parser_type(path: &PathBuf) -> String {
        path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedDocument {
    pub document: ParsedDocument,
    pub timestamp: u64,
}

impl CachedDocument {
    pub fn new(document: ParsedDocument) -> Self {
        Self {
            document,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

pub struct DocumentCache {
    cache: cache::InMemoryCache<DocumentCacheKey, CachedDocument>,
}

impl DocumentCache {
    pub fn new(max_capacity: usize, ttl_secs: u64) -> Self {
        let config = CacheConfig::builder()
            .backend(cache::config::CacheBackendType::InMemory)
            .max_capacity(max_capacity)
            .ttl(std::time::Duration::from_secs(ttl_secs))
            .enable_metrics(true)
            .build();

        Self {
            cache: cache::InMemoryCache::new(&config),
        }
    }

    pub async fn get(&self, key: &DocumentCacheKey) -> ParseResult<Option<ParsedDocument>> {
        match self.cache.get(key).await? {
            Some(cached) => Ok(Some(cached.document)),
            None => Ok(None),
        }
    }

    pub async fn set(&self, key: DocumentCacheKey, document: ParsedDocument) -> ParseResult<()> {
        self.cache.set(key, CachedDocument::new(document)).await?;
        Ok(())
    }

    pub async fn invalidate(&self, key: &DocumentCacheKey) -> ParseResult<()> {
        self.cache.remove(key).await?;
        Ok(())
    }

    pub async fn clear(&self) -> ParseResult<()> {
        self.cache.clear().await?;
        Ok(())
    }

    pub fn metrics(&self) -> CacheMetrics {
        self.cache.metrics()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_document_cache_key() {
        let path = PathBuf::from("/test/document.pdf");
        let key = DocumentCacheKey::from_path(&path);

        assert_eq!(key.parser_type, "pdf");
        assert!(!key.file_hash.is_empty());
    }

    #[tokio::test]
    async fn test_document_cache_basic() {
        let cache = DocumentCache::new(100, 3600);
        let path = PathBuf::from("/test/document.pdf");
        let key = DocumentCacheKey::from_path(&path);

        let document = ParsedDocument {
            content: "Test content".to_string(),
            metadata: crate::types::DocumentMetadata {
                format: crate::types::DocumentFormat::Pdf,
                title: None,
                author: None,
                created_date: None,
                modified_date: None,
                language: None,
                page_count: None,
                word_count: 2,
                char_count: 12,
            },
            sections: Vec::new(),
        };

        cache.set(key.clone(), document.clone()).await.unwrap();
        let cached = cache.get(&key).await.unwrap();

        assert!(cached.is_some());
        assert_eq!(cached.unwrap().content, "Test content");
    }

    #[tokio::test]
    async fn test_document_cache_miss() {
        let cache = DocumentCache::new(100, 3600);
        let path = PathBuf::from("/test/document.pdf");
        let key = DocumentCacheKey::from_path(&path);

        let cached = cache.get(&key).await.unwrap();
        assert!(cached.is_none());
    }

    #[tokio::test]
    async fn test_document_cache_metrics() {
        let cache = DocumentCache::new(100, 3600);
        let path = PathBuf::from("/test/document.pdf");
        let key = DocumentCacheKey::from_path(&path);

        let document = ParsedDocument {
            content: "Test content".to_string(),
            metadata: crate::types::DocumentMetadata {
                format: crate::types::DocumentFormat::Pdf,
                title: None,
                author: None,
                created_date: None,
                modified_date: None,
                language: None,
                page_count: None,
                word_count: 2,
                char_count: 12,
            },
            sections: Vec::new(),
        };

        cache.set(key.clone(), document).await.unwrap();
        cache.get(&key).await.unwrap();
        cache
            .get(&DocumentCacheKey::from_path(&PathBuf::from(
                "/test/other.pdf",
            )))
            .await
            .unwrap();

        let metrics = cache.metrics();
        assert_eq!(metrics.hits(), 1);
        assert_eq!(metrics.misses(), 1);
    }
}
