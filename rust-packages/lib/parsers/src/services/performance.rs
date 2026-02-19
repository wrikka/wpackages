use crate::error::{ParseError, Result};
use crate::Format;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct Cache {
    data: Arc<RwLock<HashMap<String, (Value, std::time::Instant)>>>,
    ttl: std::time::Duration,
}

impl Cache {
    pub fn new(ttl_seconds: u64) -> Self {
        Self {
            data: Arc::new(RwLock::new(HashMap::new())),
            ttl: std::time::Duration::from_secs(ttl_seconds),
        }
    }

    pub async fn get(&self, key: &str) -> Option<Value> {
        let cache = self.data.read().await;
        if let Some((value, timestamp)) = cache.get(key) {
            if timestamp.elapsed() < self.ttl {
                return Some(value.clone());
            }
        }
        None
    }

    pub async fn set(&self, key: String, value: Value) {
        let mut cache = self.data.write().await;
        cache.insert(key, (value, std::time::Instant::now()));
    }

    pub async fn clear_expired(&self) {
        let mut cache = self.data.write().await;
        cache.retain(|_, (_, timestamp)| timestamp.elapsed() < self.ttl);
    }
}

pub struct OptimizedParser {
    cache: Cache,
}

impl OptimizedParser {
    pub fn new(cache_ttl_seconds: u64) -> Self {
        Self {
            cache: Cache::new(cache_ttl_seconds),
        }
    }

    pub async fn parse_with_cache(
        &self,
        input: &str,
        format: crate::Format,
    ) -> Result<Value> {
        let cache_key = format!("{}:{}", format!("{:?}", format), ahash::hash(input));
        
        // Try cache first
        if let Some(cached) = self.cache.get(&cache_key).await {
            return Ok(cached);
        }

        // Parse and cache result
        let result = match format {
            crate::Format::Json => serde_json::from_str(input).map_err(ParseError::Json),
            crate::Format::Toml => toml::from_str(input).map_err(ParseError::Toml),
            crate::Format::Xml => quick_xml::de::from_str(input).map_err(ParseError::Xml),
            crate::Format::Yaml => serde_yaml::from_str(input).map_err(ParseError::Yaml),
        };

        if let Ok(ref value) = result {
            self.cache.set(cache_key, value.clone()).await;
        }

        result
    }
}

// Zero-copy optimization for large strings
pub fn parse_json_zero_copy(input: &str) -> Result<Value> {
    // For now, use regular parsing - RawValue requires more complex setup
    serde_json::from_str(input).map_err(ParseError::Json)
}
