use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    pub backend: CacheBackendType,
    pub max_capacity: usize,
    pub ttl: Option<Duration>,
    pub ttl_idle: Option<Duration>,
    pub eviction_policy: EvictionPolicy,
    pub enable_metrics: bool,
    pub namespace: Option<String>,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            backend: CacheBackendType::InMemory,
            max_capacity: 1000,
            ttl: Some(Duration::from_secs(3600)),
            ttl_idle: None,
            eviction_policy: EvictionPolicy::Lru,
            enable_metrics: true,
            namespace: None,
        }
    }
}

impl CacheConfig {
    pub fn builder() -> CacheConfigBuilder {
        CacheConfigBuilder::new()
    }

    pub fn in_memory() -> Self {
        Self {
            backend: CacheBackendType::InMemory,
            ..Default::default()
        }
    }

    pub fn disk(path: String) -> Self {
        Self {
            backend: CacheBackendType::Disk { path },
            ..Default::default()
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CacheBackendType {
    InMemory,
    Disk { path: String },
    Redis { url: String },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum EvictionPolicy {
    Lru,
    Lfu,
    Fifo,
    None,
}

pub struct CacheConfigBuilder {
    config: CacheConfig,
}

impl Default for CacheConfigBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl CacheConfigBuilder {
    pub fn new() -> Self {
        Self {
            config: CacheConfig::default(),
        }
    }

    pub fn backend(mut self, backend: CacheBackendType) -> Self {
        self.config.backend = backend;
        self
    }

    pub fn max_capacity(mut self, capacity: usize) -> Self {
        self.config.max_capacity = capacity;
        self
    }

    pub fn ttl(mut self, ttl: Duration) -> Self {
        self.config.ttl = Some(ttl);
        self
    }

    pub fn ttl_idle(mut self, ttl: Duration) -> Self {
        self.config.ttl_idle = Some(ttl);
        self
    }

    pub fn eviction_policy(mut self, policy: EvictionPolicy) -> Self {
        self.config.eviction_policy = policy;
        self
    }

    pub fn enable_metrics(mut self, enable: bool) -> Self {
        self.config.enable_metrics = enable;
        self
    }

    pub fn namespace(mut self, namespace: String) -> Self {
        self.config.namespace = Some(namespace);
        self
    }

    pub fn build(self) -> CacheConfig {
        self.config
    }
}
