use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct Metrics {
    pub task_duration: Arc<DurationMetric>,
    pub cache_hits: Arc<CounterMetric>,
    pub cache_misses: Arc<CounterMetric>,
    pub hash_duration: Arc<DurationMetric>,
    pub remote_cache_duration: Arc<DurationMetric>,
}

impl Metrics {
    pub fn new() -> Self {
        Metrics {
            task_duration: Arc::new(DurationMetric::new("task_duration_seconds")),
            cache_hits: Arc::new(CounterMetric::new("cache_hits_total")),
            cache_misses: Arc::new(CounterMetric::new("cache_misses_total")),
            hash_duration: Arc::new(DurationMetric::new("hash_duration_seconds")),
            remote_cache_duration: Arc::new(DurationMetric::new("remote_cache_duration_seconds")),
        }
    }

    pub fn snapshot(&self) -> MetricsSnapshot {
        MetricsSnapshot {
            task_duration: self.task_duration.snapshot(),
            cache_hits: self.cache_hits.get(),
            cache_misses: self.cache_misses.get(),
            hash_duration: self.hash_duration.snapshot(),
            remote_cache_duration: self.remote_cache_duration.snapshot(),
        }
    }
}

impl Default for Metrics {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug)]
pub struct MetricsSnapshot {
    pub task_duration: DurationSnapshot,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub hash_duration: DurationSnapshot,
    pub remote_cache_duration: DurationSnapshot,
}

#[derive(Debug, Clone)]
pub struct DurationMetric {
    name: String,
    total_ms: AtomicU64,
    count: AtomicU64,
}

impl DurationMetric {
    pub fn new(name: &str) -> Self {
        DurationMetric {
            name: name.to_string(),
            total_ms: AtomicU64::new(0),
            count: AtomicU64::new(0),
        }
    }

    pub fn record(&self, duration_ms: u64) {
        self.total_ms.fetch_add(duration_ms, Ordering::Relaxed);
        self.count.fetch_add(1, Ordering::Relaxed);
    }

    pub fn snapshot(&self) -> DurationSnapshot {
        let total_ms = self.total_ms.load(Ordering::Relaxed);
        let count = self.count.load(Ordering::Relaxed);

        DurationSnapshot {
            total_ms,
            count,
            avg_ms: if count > 0 { total_ms / count } else { 0 },
        }
    }
}

#[derive(Debug, Clone)]
pub struct DurationSnapshot {
    pub total_ms: u64,
    pub count: u64,
    pub avg_ms: u64,
}

#[derive(Debug, Clone)]
pub struct CounterMetric {
    name: String,
    value: AtomicU64,
}

impl CounterMetric {
    pub fn new(name: &str) -> Self {
        CounterMetric {
            name: name.to_string(),
            value: AtomicU64::new(0),
        }
    }

    pub fn increment(&self) {
        self.value.fetch_add(1, Ordering::Relaxed);
    }

    pub fn add(&self, amount: u64) {
        self.value.fetch_add(amount, Ordering::Relaxed);
    }

    pub fn get(&self) -> u64 {
        self.value.load(Ordering::Relaxed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_duration_metric() {
        let metric = DurationMetric::new("test_duration");

        metric.record(100);
        metric.record(200);
        metric.record(300);

        let snapshot = metric.snapshot();
        assert_eq!(snapshot.total_ms, 600);
        assert_eq!(snapshot.count, 3);
        assert_eq!(snapshot.avg_ms, 200);
    }

    #[test]
    fn test_counter_metric() {
        let metric = CounterMetric::new("test_counter");

        metric.increment();
        metric.increment();
        metric.add(5);

        assert_eq!(metric.get(), 7);
    }

    #[test]
    fn test_metrics_snapshot() {
        let metrics = Metrics::new();

        metrics.task_duration.record(100);
        metrics.cache_hits.increment();
        metrics.cache_misses.increment();
        metrics.cache_misses.increment();

        let snapshot = metrics.snapshot();
        assert_eq!(snapshot.task_duration.count, 1);
        assert_eq!(snapshot.cache_hits, 1);
        assert_eq!(snapshot.cache_misses, 2);
    }
}
