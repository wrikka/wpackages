use crate::error::{TestingError, TestingResult};
use crate::types::{CacheConfig, HashAlgorithm, TestCase, TestExecutionResult, TestResult};
use blake3::Hash;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::{Duration, Instant, SystemTime};
use tracing::{debug, info};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub key: String,
    pub test_id: String,
    pub result: TestResult,
    pub duration: Duration,
    pub output: String,
    pub error_message: Option<String>,
    pub file_hash: String,
    pub timestamp: SystemTime,
    pub hits: usize,
}

impl CacheEntry {
    pub fn from_result(result: &TestExecutionResult, file_hash: &str) -> Self {
        Self {
            key: format!("{}:{}", result.test_id, file_hash),
            test_id: result.test_id.0.clone(),
            result: result.result,
            duration: result.duration,
            output: result.output.clone(),
            error_message: result.error_message.clone(),
            file_hash: file_hash.to_string(),
            timestamp: SystemTime::now(),
            hits: 0,
        }
    }

    pub fn to_execution_result(&self, test: &TestCase) -> TestExecutionResult {
        TestExecutionResult::new(test, self.result, self.duration)
            .with_output(&self.output)
            .with_retry_count(self.hits)
    }

    pub fn is_expired(&self, max_age: Duration) -> bool {
        self.timestamp
            .elapsed()
            .map(|elapsed| elapsed > max_age)
            .unwrap_or(true)
    }
}

#[derive(Debug, Clone)]
pub struct TestCache {
    config: CacheConfig,
    entries: HashMap<String, CacheEntry>,
    stats: CacheStats,
}

#[derive(Debug, Clone, Default)]
pub struct CacheStats {
    pub hits: usize,
    pub misses: usize,
    pub evictions: usize,
    pub total_size_bytes: u64,
}

impl TestCache {
    pub fn new(config: CacheConfig) -> Self {
        Self {
            config,
            entries: HashMap::new(),
            stats: CacheStats::default(),
        }
    }

    pub fn with_config(config: CacheConfig) -> Self {
        Self::new(config)
    }

    pub fn compute_file_hash(&self, path: &PathBuf) -> TestingResult<String> {
        let content = std::fs::read(path)?;
        let hash = match self.config.hash_algorithm {
            HashAlgorithm::Blake3 => {
                let hash = blake3::hash(&content);
                hex::encode(hash.as_bytes())
            }
            HashAlgorithm::Sha256 => {
                use sha2::{Sha256, Digest};
                let mut hasher = Sha256::new();
                hasher.update(&content);
                hex::encode(hasher.finalize())
            }
            HashAlgorithm::Sha512 => {
                use sha2::{Sha512, Digest};
                let mut hasher = Sha512::new();
                hasher.update(&content);
                hex::encode(hasher.finalize())
            }
        };
        Ok(hash)
    }

    pub fn compute_content_hash(&self, content: &str) -> String {
        match self.config.hash_algorithm {
            HashAlgorithm::Blake3 => {
                let hash = blake3::hash(content.as_bytes());
                hex::encode(hash.as_bytes())
            }
            HashAlgorithm::Sha256 => {
                use sha2::{Sha256, Digest};
                let mut hasher = Sha256::new();
                hasher.update(content.as_bytes());
                hex::encode(hasher.finalize())
            }
            HashAlgorithm::Sha512 => {
                use sha2::{Sha512, Digest};
                let mut hasher = Sha512::new();
                hasher.update(content.as_bytes());
                hex::encode(hasher.finalize())
            }
        }
    }

    pub fn get(&mut self, test: &TestCase, file_hash: &str) -> Option<CacheEntry> {
        let key = format!("{}:{}", test.id, file_hash);

        if let Some(entry) = self.entries.get_mut(&key) {
            if entry.is_expired(self.config.max_age) {
                self.entries.remove(&key);
                self.stats.misses += 1;
                return None;
            }

            entry.hits += 1;
            self.stats.hits += 1;
            debug!("Cache hit for test: {}", test.id);
            return Some(entry.clone());
        }

        self.stats.misses += 1;
        None
    }

    pub fn set(&mut self, result: &TestExecutionResult, file_hash: &str) {
        let entry = CacheEntry::from_result(result, file_hash);
        let key = entry.key.clone();

        self.entries.insert(key, entry);
        self.evict_if_needed();
    }

    pub fn invalidate(&mut self, test_id: &str) {
        self.entries.retain(|_, e| e.test_id != test_id);
    }

    pub fn invalidate_by_file(&mut self, file_hash: &str) {
        self.entries.retain(|_, e| e.file_hash != file_hash);
    }

    pub fn clear(&mut self) {
        self.entries.clear();
        self.stats = CacheStats::default();
    }

    pub fn prune_expired(&mut self) {
        let max_age = self.config.max_age;
        let before = self.entries.len();
        self.entries.retain(|_, e| !e.is_expired(max_age));
        let removed = before - self.entries.len();
        self.stats.evictions += removed;
        debug!("Pruned {} expired entries", removed);
    }

    fn evict_if_needed(&mut self) {
        let current_size = self.entries.len() * 1024;

        if current_size as u64 > self.config.max_size_bytes {
            let to_remove = self.entries.len() / 4;
            let mut keys: Vec<_> = self.entries.keys().cloned().collect();
            keys.sort_by_key(|k| {
                self.entries.get(k).map(|e| e.timestamp).unwrap_or(SystemTime::UNIX_EPOCH)
            });

            for key in keys.into_iter().take(to_remove) {
                self.entries.remove(&key);
                self.stats.evictions += 1;
            }
        }
    }

    pub fn stats(&self) -> &CacheStats {
        &self.stats
    }

    pub fn hit_rate(&self) -> f64 {
        let total = self.stats.hits + self.stats.misses;
        if total == 0 {
            0.0
        } else {
            self.stats.hits as f64 / total as f64
        }
    }

    pub fn entry_count(&self) -> usize {
        self.entries.len()
    }

    pub fn load(&mut self) -> TestingResult<()> {
        if !self.config.cache_dir.exists() {
            return Ok(());
        }

        let cache_file = self.config.cache_dir.join("cache.json");
        if !cache_file.exists() {
            return Ok(());
        }

        let content = std::fs::read_to_string(cache_file)?;
        let entries: HashMap<String, CacheEntry> = serde_json::from_str(&content)?;
        self.entries = entries;
        info!("Loaded {} cache entries", self.entries.len());
        Ok(())
    }

    pub fn save(&self) -> TestingResult<()> {
        std::fs::create_dir_all(&self.config.cache_dir)?;

        let cache_file = self.config.cache_dir.join("cache.json");
        let content = serde_json::to_string_pretty(&self.entries)?;
        std::fs::write(cache_file, content)?;

        info!("Saved {} cache entries", self.entries.len());
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct CacheKey {
    pub test_id: String,
    pub file_hashes: Vec<String>,
    pub env_hash: String,
    pub config_hash: String,
}

impl CacheKey {
    pub fn new(test_id: impl Into<String>) -> Self {
        Self {
            test_id: test_id.into(),
            file_hashes: Vec::new(),
            env_hash: String::new(),
            config_hash: String::new(),
        }
    }

    pub fn with_file_hash(mut self, hash: impl Into<String>) -> Self {
        self.file_hashes.push(hash.into());
        self
    }

    pub fn with_env_hash(mut self, hash: impl Into<String>) -> Self {
        self.env_hash = hash.into();
        self
    }

    pub fn with_config_hash(mut self, hash: impl Into<String>) -> Self {
        self.config_hash = hash.into();
        self
    }

    pub fn compute_key(&self) -> String {
        let mut combined = String::new();
        combined.push_str(&self.test_id);
        combined.push_str(&self.env_hash);
        combined.push_str(&self.config_hash);
        for hash in &self.file_hashes {
            combined.push_str(hash);
        }
        blake3::hash(combined.as_bytes()).to_hex().to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn create_test_case() -> TestCase {
        TestCase::new("test1", "test_addition", PathBuf::from("test.rs"), 10)
    }

    #[test]
    fn test_cache_basic() {
        let config = CacheConfig::new();
        let mut cache = TestCache::new(config);

        let test = create_test_case();
        let result = TestExecutionResult::passed(&test, Duration::from_millis(100));

        cache.set(&result, "file_hash_123");

        let cached = cache.get(&test, "file_hash_123");
        assert!(cached.is_some());
    }

    #[test]
    fn test_cache_miss() {
        let config = CacheConfig::new();
        let mut cache = TestCache::new(config);

        let test = create_test_case();
        let cached = cache.get(&test, "nonexistent");

        assert!(cached.is_none());
        assert_eq!(cache.stats().misses, 1);
    }

    #[test]
    fn test_cache_key() {
        let key = CacheKey::new("test1")
            .with_file_hash("abc123")
            .with_env_hash("env456");

        let computed = key.compute_key();
        assert!(!computed.is_empty());
    }

    #[test]
    fn test_content_hash() {
        let config = CacheConfig::new();
        let cache = TestCache::new(config);

        let hash1 = cache.compute_content_hash("hello world");
        let hash2 = cache.compute_content_hash("hello world");
        let hash3 = cache.compute_content_hash("different");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }
}
