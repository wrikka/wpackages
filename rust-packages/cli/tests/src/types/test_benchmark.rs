use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub id: String,
    pub name: String,
    pub iterations: usize,
    pub total_duration: Duration,
    pub min: Duration,
    pub max: Duration,
    pub mean: Duration,
    pub median: Duration,
    pub std_dev: Duration,
    pub percentiles: BenchmarkPercentiles,
    pub memory: Option<MemoryMetrics>,
    pub throughput: Option<ThroughputMetrics>,
}

impl BenchmarkResult {
    pub fn new(name: impl Into<String>, samples: Vec<Duration>) -> Self {
        let iterations = samples.len();
        let total_duration: Duration = samples.iter().sum();

        let min = samples.iter().min().copied().unwrap_or(Duration::ZERO);
        let max = samples.iter().max().copied().unwrap_or(Duration::ZERO);
        let mean = if iterations > 0 {
            total_duration / iterations as u32
        } else {
            Duration::ZERO
        };

        let median = calculate_median(&samples);
        let std_dev = calculate_std_dev(&samples, mean);
        let percentiles = calculate_percentiles(&samples);

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.into(),
            iterations,
            total_duration,
            min,
            max,
            mean,
            median,
            std_dev,
            percentiles,
            memory: None,
            throughput: None,
        }
    }

    pub fn with_memory(mut self, memory: MemoryMetrics) -> Self {
        self.memory = Some(memory);
        self
    }

    pub fn with_throughput(mut self, throughput: ThroughputMetrics) -> Self {
        self.throughput = Some(throughput);
        self
    }

    pub fn ops_per_second(&self) -> f64 {
        if self.mean.is_zero() {
            0.0
        } else {
            1_000_000_000.0 / self.mean.as_nanos() as f64
        }
    }

    pub fn is_fast(&self) -> bool {
        self.mean < Duration::from_millis(10)
    }

    pub fn is_slow(&self) -> bool {
        self.mean > Duration::from_secs(1)
    }

    pub fn summary(&self) -> String {
        format!(
            "{}: {:?} mean, {:?} min, {:?} max, {:.2} ops/s",
            self.name,
            self.mean,
            self.min,
            self.max,
            self.ops_per_second()
        )
    }
}

fn calculate_median(samples: &[Duration]) -> Duration {
    if samples.is_empty() {
        return Duration::ZERO;
    }

    let mut sorted: Vec<_> = samples.iter().copied().collect();
    sorted.sort();

    let mid = sorted.len() / 2;
    if sorted.len() % 2 == 0 {
        (sorted[mid - 1] + sorted[mid]) / 2
    } else {
        sorted[mid]
    }
}

fn calculate_std_dev(samples: &[Duration], mean: Duration) -> Duration {
    if samples.len() < 2 {
        return Duration::ZERO;
    }

    let mean_nanos = mean.as_nanos() as f64;
    let variance: f64 = samples
        .iter()
        .map(|d| {
            let diff = d.as_nanos() as f64 - mean_nanos;
            diff * diff
        })
        .sum::<f64>()
        / (samples.len() - 1) as f64;

    Duration::from_nanos(variance.sqrt() as u64)
}

fn calculate_percentiles(samples: &[Duration]) -> BenchmarkPercentiles {
    if samples.is_empty() {
        return BenchmarkPercentiles::default();
    }

    let mut sorted: Vec<_> = samples.iter().copied().collect();
    sorted.sort();

    let percentile = |p: f64| -> Duration {
        let idx = ((samples.len() - 1) as f64 * p / 100.0).round() as usize;
        sorted[idx.min(sorted.len() - 1)]
    };

    BenchmarkPercentiles {
        p50: percentile(50.0),
        p75: percentile(75.0),
        p90: percentile(90.0),
        p95: percentile(95.0),
        p99: percentile(99.0),
        p999: percentile(99.9),
    }
}

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct BenchmarkPercentiles {
    pub p50: Duration,
    pub p75: Duration,
    pub p90: Duration,
    pub p95: Duration,
    pub p99: Duration,
    pub p999: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetrics {
    pub peak_bytes: u64,
    pub avg_bytes: u64,
    pub allocations: usize,
    pub deallocations: usize,
}

impl MemoryMetrics {
    pub fn new(peak_bytes: u64, avg_bytes: u64) -> Self {
        Self {
            peak_bytes,
            avg_bytes,
            allocations: 0,
            deallocations: 0,
        }
    }

    pub fn with_allocations(mut self, allocs: usize, deallocs: usize) -> Self {
        self.allocations = allocs;
        self.deallocations = deallocs;
        self
    }

    pub fn peak_mb(&self) -> f64 {
        self.peak_bytes as f64 / (1024.0 * 1024.0)
    }

    pub fn avg_mb(&self) -> f64 {
        self.avg_bytes as f64 / (1024.0 * 1024.0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThroughputMetrics {
    pub items_per_second: f64,
    pub bytes_per_second: f64,
    pub total_items: usize,
    pub total_bytes: u64,
}

impl ThroughputMetrics {
    pub fn new(items: usize, bytes: u64, duration: Duration) -> Self {
        let secs = duration.as_secs_f64();
        Self {
            items_per_second: items as f64 / secs,
            bytes_per_second: bytes as f64 / secs,
            total_items: items,
            total_bytes: bytes,
        }
    }

    pub fn mb_per_second(&self) -> f64 {
        self.bytes_per_second / (1024.0 * 1024.0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkComparison {
    pub baseline: BenchmarkResult,
    pub current: BenchmarkResult,
    pub mean_change_percent: f64,
    pub min_change_percent: f64,
    pub max_change_percent: f64,
    pub throughput_change_percent: f64,
}

impl BenchmarkComparison {
    pub fn new(baseline: BenchmarkResult, current: BenchmarkResult) -> Self {
        let mean_change = percent_change(baseline.mean, current.mean);
        let min_change = percent_change(baseline.min, current.min);
        let max_change = percent_change(baseline.max, current.max);

        let throughput_change = match (&baseline.throughput, &current.throughput) {
            (Some(b), Some(c)) => percent_change_items(b.items_per_second, c.items_per_second),
            _ => 0.0,
        };

        Self {
            baseline,
            current,
            mean_change_percent: mean_change,
            min_change_percent: min_change,
            max_change_percent: max_change,
            throughput_change_percent: throughput_change,
        }
    }

    pub fn is_regression(&self) -> bool {
        self.mean_change_percent > 10.0
    }

    pub fn is_improvement(&self) -> bool {
        self.mean_change_percent < -10.0
    }

    pub fn summary(&self) -> String {
        let direction = if self.is_improvement() {
            "FASTER"
        } else if self.is_regression() {
            "SLOWER"
        } else {
            "UNCHANGED"
        };

        format!(
            "{}: {:.1}% mean change ({:?} -> {:?})",
            direction,
            self.mean_change_percent,
            self.baseline.mean,
            self.current.mean
        )
    }
}

fn percent_change(old: Duration, new: Duration) -> f64 {
    if old.is_zero() {
        return 0.0;
    }
    ((new.as_nanos() as f64 - old.as_nanos() as f64) / old.as_nanos() as f64) * 100.0
}

fn percent_change_items(old: f64, new: f64) -> f64 {
    if old == 0.0 {
        return 0.0;
    }
    ((new - old) / old) * 100.0
}

#[derive(Debug, Clone, Default)]
pub struct BenchmarkRunner {
    pub warmup_iterations: usize,
    pub sample_iterations: usize,
}

impl BenchmarkRunner {
    pub fn new() -> Self {
        Self {
            warmup_iterations: 10,
            sample_iterations: 100,
        }
    }

    pub fn with_warmup(mut self, iterations: usize) -> Self {
        self.warmup_iterations = iterations;
        self
    }

    pub fn with_samples(mut self, iterations: usize) -> Self {
        self.sample_iterations = iterations;
        self
    }

    pub fn run<F>(&self, name: &str, mut f: F) -> BenchmarkResult
    where
        F: FnMut(),
    {
        for _ in 0..self.warmup_iterations {
            f();
        }

        let mut samples = Vec::with_capacity(self.sample_iterations);
        for _ in 0..self.sample_iterations {
            let start = std::time::Instant::now();
            f();
            samples.push(start.elapsed());
        }

        BenchmarkResult::new(name, samples)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_benchmark_result() {
        let samples = vec![
            Duration::from_millis(100),
            Duration::from_millis(110),
            Duration::from_millis(90),
        ];

        let result = BenchmarkResult::new("test_op", samples);

        assert_eq!(result.iterations, 3);
        assert!(result.mean >= Duration::from_millis(90));
        assert!(result.mean <= Duration::from_millis(110));
    }

    #[test]
    fn test_ops_per_second() {
        let samples = vec![Duration::from_millis(10)];
        let result = BenchmarkResult::new("test", samples);

        assert!((result.ops_per_second() - 100.0).abs() < 1.0);
    }

    #[test]
    fn test_comparison() {
        let baseline = BenchmarkResult::new("test", vec![Duration::from_millis(100)]);
        let current = BenchmarkResult::new("test", vec![Duration::from_millis(50)]);

        let comparison = BenchmarkComparison::new(baseline, current);

        assert!(comparison.is_improvement());
        assert!(comparison.mean_change_percent < 0.0);
    }
}
