// Cache analytics

use crate::services::metrics::MetricsSnapshot;

pub struct CacheAnalytics;

impl CacheAnalytics {
    pub fn analyze_cache_usage(snapshot: &MetricsSnapshot) -> CacheReport {
        CacheReport {
            cache_hits: snapshot.cache_hits,
            cache_misses: snapshot.cache_misses,
            hit_rate: if snapshot.cache_hits + snapshot.cache_misses > 0 {
                snapshot.cache_hits as f64 / (snapshot.cache_hits + snapshot.cache_misses) as f64
            } else {
                0.0
            },
        }
    }
}

#[derive(Debug, Clone)]
pub struct CacheReport {
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub hit_rate: f64,
}
