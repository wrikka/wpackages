use crate::error::TestingResult;
use crate::types::{BenchmarkComparison, BenchmarkPercentiles, BenchmarkResult, MemoryMetrics, ThroughputMetrics};
use std::time::{Duration, Instant};

pub use crate::types::BenchmarkRunner;

pub fn bench<F>(name: &str, f: F) -> BenchmarkResult
where
    F: FnMut(),
{
    BenchmarkRunner::new().run(name, f)
}

pub fn bench_with_samples<F>(name: &str, samples: usize, f: F) -> BenchmarkResult
where
    F: FnMut(),
{
    BenchmarkRunner::new()
        .with_warmup(samples / 10)
        .with_samples(samples)
        .run(name, f)
}

pub fn bench_async<F, Fut>(name: &str, f: F) -> BenchmarkResult
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = ()>,
{
    let mut runner = BenchmarkRunner::new();
    let warmup = runner.warmup_iterations;
    let samples = runner.sample_iterations;

    let mut durations = Vec::with_capacity(samples);

    let mut f = f;
    for _ in 0..warmup {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(f());
    }

    for _ in 0..samples {
        let start = Instant::now();
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(f());
        durations.push(start.elapsed());
    }

    BenchmarkResult::new(name, durations)
}

pub struct BenchmarkGroup {
    name: String,
    results: Vec<BenchmarkResult>,
}

impl BenchmarkGroup {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            results: Vec::new(),
        }
    }

    pub fn bench<F>(&mut self, name: &str, f: F) -> &BenchmarkResult
    where
        F: FnMut(),
    {
        let result = bench(&format!("{}::{}", self.name, name), f);
        self.results.push(result);
        self.results.last().unwrap()
    }

    pub fn results(&self) -> &[BenchmarkResult] {
        &self.results
    }

    pub fn fastest(&self) -> Option<&BenchmarkResult> {
        self.results.iter().min_by_key(|r| r.mean)
    }

    pub fn slowest(&self) -> Option<&BenchmarkResult> {
        self.results.iter().max_by_key(|r| r.mean)
    }

    pub fn compare(&self, baseline_name: &str, current_name: &str) -> Option<BenchmarkComparison> {
        let baseline = self.results.iter().find(|r| r.name.ends_with(baseline_name))?;
        let current = self.results.iter().find(|r| r.name.ends_with(current_name))?;
        Some(BenchmarkComparison::new(baseline.clone(), current.clone()))
    }
}

pub fn measure<F, R>(f: F) -> (R, Duration)
where
    F: FnOnce() -> R,
{
    let start = Instant::now();
    let result = f();
    (result, start.elapsed())
}

pub async fn measure_async<F, Fut, R>(f: F) -> (R, Duration)
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = R>,
{
    let start = Instant::now();
    let result = f().await;
    (result, start.elapsed())
}

pub fn throughput(items: usize, duration: Duration) -> ThroughputMetrics {
    ThroughputMetrics::new(items, 0, duration)
}

pub fn throughput_bytes(bytes: u64, duration: Duration) -> ThroughputMetrics {
    ThroughputMetrics::new(0, bytes, duration)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bench_basic() {
        let result = bench("simple_op", || {
            let mut sum = 0u64;
            for i in 0..100 {
                sum += i;
            }
        });

        assert_eq!(result.iterations, 100);
        assert!(result.mean > Duration::ZERO);
    }

    #[test]
    fn test_benchmark_group() {
        let mut group = BenchmarkGroup::new("math");

        group.bench("add", || 1 + 1);
        group.bench("mul", || 1 * 2);

        assert_eq!(group.results().len(), 2);
        assert!(group.fastest().is_some());
    }

    #[test]
    fn test_measure() {
        let (result, duration) = measure(|| {
            std::thread::sleep(Duration::from_millis(10));
            42
        });

        assert_eq!(result, 42);
        assert!(duration >= Duration::from_millis(10));
    }

    #[test]
    fn test_throughput() {
        let metrics = throughput(1000, Duration::from_secs(1));

        assert!((metrics.items_per_second - 1000.0).abs() < 0.1);
    }
}
