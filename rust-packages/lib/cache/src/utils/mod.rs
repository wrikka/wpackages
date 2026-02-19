mod metrics;

pub use metrics::CacheMetrics;

use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, Hash, Eq, PartialEq)]
pub struct CacheKey {
    pub namespace: Option<String>,
    pub key: String,
    pub hash: String,
}

impl CacheKey {
    pub fn new(key: String) -> Self {
        let hash = blake3::hash(key.as_bytes()).to_hex().to_string();
        Self {
            namespace: None,
            key,
            hash,
        }
    }

    pub fn with_namespace(namespace: String, key: String) -> Self {
        let full_key = format!("{}:{}", namespace, key);
        let hash = blake3::hash(full_key.as_bytes()).to_hex().to_string();
        Self {
            namespace: Some(namespace),
            key,
            hash,
        }
    }

    pub fn from_parts(parts: &[&str]) -> Self {
        let key = parts.join(":");
        Self::new(key)
    }
}

impl fmt::Display for CacheKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.namespace {
            Some(ns) => write!(f, "{}:{}", ns, self.key),
            None => write!(f, "{}", self.key),
        }
    }
}

pub fn generate_cache_key(namespace: Option<&str>, key: &str) -> CacheKey {
    match namespace {
        Some(ns) => CacheKey::with_namespace(ns.to_string(), key.to_string()),
        None => CacheKey::new(key.to_string()),
    }
}

pub fn hash_key(key: &str) -> String {
    blake3::hash(key.as_bytes()).to_hex().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache_key_creation() {
        let key = CacheKey::new("test_key".to_string());
        assert_eq!(key.key, "test_key");
        assert!(!key.hash.is_empty());
    }

    #[test]
    fn test_cache_key_with_namespace() {
        let key = CacheKey::with_namespace("app".to_string(), "user_123".to_string());
        assert_eq!(key.namespace, Some("app".to_string()));
        assert_eq!(key.key, "user_123");
    }

    #[test]
    fn test_generate_cache_key() {
        let key = generate_cache_key(Some("test"), "value");
        assert_eq!(key.namespace, Some("test".to_string()));
        assert_eq!(key.key, "value");
    }

    #[test]
    fn test_hash_key() {
        let hash1 = hash_key("test");
        let hash2 = hash_key("test");
        let hash3 = hash_key("different");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }
}
