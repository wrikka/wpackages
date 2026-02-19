//! Configuration benchmarking utilities
//!
//! This module provides benchmarking support for configuration operations.

use std::time::{Duration, Instant};

/// Represents benchmark results.
#[derive(Debug, Clone)]
pub struct BenchmarkResult {
    name: String,
    duration: Duration,
    iterations: u64,
    ops_per_second: f64,
}

impl BenchmarkResult {
    /// Creates a new benchmark result.
    ///
    /// # Arguments
    ///
    /// * `name` - The benchmark name
    /// * `duration` - The elapsed duration
    /// * `iterations` - Number of iterations
    ///
    /// # Returns
    ///
    /// Returns a new result.
    pub fn new(name: String, duration: Duration, iterations: u64) -> Self {
        let ops_per_second = if duration.as_nanos() > 0 {
            (iterations as f64 / duration.as_secs_f64()) * 1_000_000_000.0
        } else {
            0.0
        };

        Self {
            name,
            duration,
            iterations,
            ops_per_second,
        }
    }

    /// Returns the benchmark name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the duration.
    ///
    /// # Returns
    ///
    /// Returns the duration.
    pub fn duration(&self) -> Duration {
        self.duration
    }

    /// Returns the number of iterations.
    ///
    /// # Returns
    ///
    /// Returns the iteration count.
    pub fn iterations(&self) -> u64 {
        self.iterations
    }

    /// Returns operations per second.
    ///
    /// # Returns
    ///
    /// Returns the ops/sec.
    pub fn ops_per_second(&self) -> f64 {
        self.ops_per_second
    }

    /// Formats the result as a string.
    ///
    /// # Returns
    ///
    /// Returns the formatted result.
    pub fn format(&self) -> String {
        format!(
            "{}: {:?} ({} iterations, {:.2} ops/sec)",
            self.name(),
            self.duration,
            self.iterations,
            self.ops_per_second
        )
    }
}

/// Represents a benchmark suite.
pub struct BenchmarkSuite {
    benchmarks: Vec<Benchmark>,
    warmup_iterations: u64,
    measurement_iterations: u64,
}

impl BenchmarkSuite {
    /// Creates a new benchmark suite.
    ///
    /// # Returns
    ///
    /// Returns a new suite.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::benchmarking::BenchmarkSuite;
    ///
    /// let suite = BenchmarkSuite::new();
    /// ```
    pub fn new() -> Self {
        Self {
            benchmarks: Vec::new(),
            warmup_iterations: 100,
            measurement_iterations: 1000,
        }
    }

    /// Sets the warmup iterations.
    ///
    /// # Arguments
    ///
    /// * `iterations` - Number of warmup iterations
    ///
    /// # Returns
    ///
    /// Returns the suite.
    pub fn with_warmup_iterations(mut self, iterations: u64) -> Self {
        self.warmup_iterations = iterations;
        self
    }

    /// Sets the measurement iterations.
    ///
    /// # Arguments
    ///
    /// * `iterations` - Number of measurement iterations
    ///
    /// # Returns
    ///
    /// Returns the suite.
    pub fn with_measurement_iterations(mut self, iterations: u64) -> Self {
        self.measurement_iterations = iterations;
        self
    }

    /// Adds a benchmark.
    ///
    /// # Arguments
    ///
    /// * `benchmark` - The benchmark to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::benchmarking::{BenchmarkSuite, Benchmark};
    ///
    /// let mut suite = BenchmarkSuite::new();
    /// suite.add_benchmark(Benchmark::new("load", |config| {
    ///     config.load()
    /// }));
    /// ```
    pub fn add_benchmark(&mut self, benchmark: Benchmark) {
        self.benchmarks.push(benchmark);
    }

    /// Runs all benchmarks.
    ///
    /// # Returns
    ///
    /// Returns a list of benchmark results.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::benchmarking::BenchmarkSuite;
    ///
    /// let mut suite = BenchmarkSuite::new();
    /// suite.add_benchmark(load_bench);
    /// let results = suite.run();
    /// for result in results {
    ///     println!("{}", result.format());
    /// }
    /// ```
    pub fn run(&self) -> Vec<BenchmarkResult> {
        let mut results = Vec::new();

        for benchmark in &self.benchmarks {
            // Warmup
            for _ in 0..self.warmup_iterations {
                benchmark.run();
            }

            // Measure
            let start = Instant::now();
            for _ in 0..self.measurement_iterations {
                benchmark.run();
            }
            let duration = start.elapsed();

            results.push(BenchmarkResult::new(
                benchmark.name().to_string(),
                duration,
                self.measurement_iterations,
            ));
        }

        results
    }

    /// Returns the number of benchmarks.
    ///
    /// # Returns
    ///
    /// Returns the benchmark count.
    pub fn len(&self) -> usize {
        self.benchmarks.len()
    }

    /// Returns `true` if there are no benchmarks.
    ///
    /// # Returns
    ///
    /// Returns `true` if empty.
    pub fn is_empty(&self) -> bool {
        self self.benchmarks.is_empty()
    }
}

impl Default for BenchmarkSuite {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a benchmark.
pub struct Benchmark {
    name: String,
    operation: Box<dyn Fn() + Send + Sync>,
}

impl Benchmark {
    /// Creates a new benchmark.
    ///
    /// # Arguments
    ///
    /// * `name` - The benchmark name
    /// * `operation` - The operation to benchmark
    ///
    /// # Returns
    ///
    /// Returns a new benchmark.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::benchmarking::Benchmark;
    /// use config::types::AppConfig;
    ///
    /// let config = AppConfig::default();
    /// let bench = Benchmark::new("load", || config.load());
    /// ```
    pub fn new<F>(name: String, operation: F) -> Self
    where
        F: Fn() + Send + Sync + 'static,
    {
        Self {
            name,
            operation: Box::new(operation),
        }
    }

    /// Returns the benchmark name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Runs the benchmark operation.
    pub fn run(&self) {
        (self.operation)();
    }
}

/// Benchmarks configuration operations.
///
/// # Returns
///
/// Returns a list of benchmark results.
///
/// # Example
///
/// ```no_run
/// use config::utils::benchmarking::benchmark_config_operations;
///
/// let results = benchmark_config_operations();
/// for result in results {
///     println!("{}", result.format());
/// }
/// ```
pub fn benchmark_config_operations() -> Vec<BenchmarkResult> {
    let mut suite = BenchmarkSuite::new();

    let config = crate::types::AppConfig::default();

    // Add benchmarks
    suite.add_benchmark(Benchmark::new("load", || {
        let _ = config.load();
    }));

    suite.add_benchmark(Benchmark::new("save", || {
        let _ = config.save();
    }));

    suite.add_benchmark(Benchmark::new("validate", || {
        let _ = config.validate();
    }));

    suite.add_benchmark(Benchmark::new("export_toml", || {
        let _ = config.export(crate::types::ConfigFormat::Toml);
    }));

    suite.add_benchmark(Benchmark::new("export_json", || {
        let _ = config.export(crate::types::ConfigFormat::Json);
    }));

    suite.add_benchmark(Benchmark::new("export_yaml", || {
        let _ = config.export(crate::::types::ConfigFormat::Yaml);
    }));

    suite.run()
}

/// Benchmarks parsing operations.
///
/// # Returns
///
/// Returns a list of benchmark results.
///
/// # Example
///
/// ```no_run
/// use config::utils::benchmarking::benchmark_parsing;
///
/// let results = benchmark_parsing();
/// for result in results {
    ///     println!("{}", result.format());
/// }
/// ```
pub fn benchmark_parsing() -> Vec<BenchmarkResult> {
    let mut suite = BenchmarkSuite::new();

    let config = crate::types::AppConfig::default();
    let toml_data = config.export(crate::types::ConfigFormat::Toml).unwrap();
    let json_data = config.export(crate::types::ConfigFormat::Json).unwrap();
    let yaml_data = config.export(crate::types::ConfigFormat::Yaml).unwrap();

    suite.add_benchmark(Benchmark::new("parse_toml", || {
        let _ = crate::types::AppConfig::import(&toml_data, crate::types::ConfigFormat::Toml);
    }));

    suite.add_benchmark(Benchmark::new("parse_json", || {
        let _ = crate::types::AppConfig::import(&json_data, crate::types::ConfigFormat::Json);
    }));

    suite.add_benchmark(Benchmark::new("parse_yaml", || {
        let _ = crate::types::AppConfig::import(&yaml_data, crate::types::ConfigFormat::Yaml);
    }));

    suite.run()
}

/// Generates a benchmark report.
///
/// # Arguments
///
/// * `results` - The benchmark results
///
/// # Returns
///
/// /// Returns the report as a string.
///
/// # Example
///
/// ```no_run
/// use config::utils::benchmarking::{benchmark_config_operations, generate_benchmark_report};
///
/// let results = benchmark_config_operations();
/// let report = generate_benchmark_report(&results);
/// println!("{}", report);
/// ```
pub fn generate_benchmark_report(results: &[BenchmarkResult]) -> String {
    let mut report = String::new();

    report.push_str("# Benchmark Report\n\n");
    report.push_str("## Summary\n\n");

    let total_duration: Duration = results.iter().map(|r| r.duration()).sum();
    let total_iterations: u64 = results.iter().map(|r| r.iterations()).sum();

    report.push_str(&format!(
        "Total Time: {:?}\n",
        total_duration
    ));
    report.push_str(&format!(
        "Total Iterations: {}\n",
        total_iterations
    ));
    report.push_str(&format!(
        "Average Ops/Sec: {:.2}\n\n",
        if total_duration.as_nanos() > 0 {
            (total_iterations as f64 / total_duration.as_secs_f64()) * 1_000_000_000.0
        } else {
            0.0
        }
    ));

    report.push_str("## Results\n\n");
    for result in results {
        report.push_str(&format!("{}\n", result.format()));
    }

    report
}

/// Compares two benchmark results.
///
/// # Arguments
///
/// * `result1` - First benchmark result
/// * `result2` - Second benchmark result
///
/// # Returns
///
    /// Returns the comparison as a string.
///
    # Example
///
    /// ```no_run
    /// use config::utils::benchmarking::{BenchmarkResult, compare_benchmarks};
///
    /// let result1 = BenchmarkResult::new("test1", Duration::from_millis(100), 1000);
    /// let result2 = BenchmarkResult::new("test2", Duration::from_millis(200), 1000);
    /// let comparison = compare_benchmarks(&result1, &result2);
    /// println!("{}", comparison);
    /// ```
pub fn compare_benchmarks(result1: &BenchmarkResult, result2: &BenchmarkResult) -> String {
    let speedup = if result2.ops_per_second() > 0.0 {
        result1.ops_per_second() / result2.ops_per_second()
    } else {
        0.0
    };

    format!(
        "{} vs {}:\n\
         {}: {:.2} ops/sec\n\
         {}:\n\
         {}: {:.2} ops/sec\n\
         Speedup: {:.2}x\n",
        result1.name(),
        result2.name(),
        result1.name(),
        result1.ops_per_second(),
        result2.name(),
        result2.ops_per_second(),
        speedup
    )
}

/// Represents a performance profile.
#[derive(Debug, Clone)]
pub struct PerformanceProfile {
    name: String,
    benchmarks: Vec<BenchmarkResult>,
}

impl PerformanceProfile {
    /// Creates a new performance profile.
    ///
    /// # Arguments
    ///
    /// * `name` - The profile name
    ///
    /// # Returns
    ///
    /// Returns a new profile.
    pub fn new(name: String) -> Self {
        Self {
            name,
            benchmarks: Vec::new(),
        }
    }

    /// Adds a benchmark result.
    ///
    /// # Arguments
    ///
    /// * `result` - The benchmark result to add
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::benchmarking::{PerformanceProfile, BenchmarkResult};
    ///
    /// let mut profile = PerformanceProfile::new("Config");
    /// let result = BenchmarkResult::new("test", Duration::from_millis(100), 1000);
    /// profile.add_benchmark(result);
    /// ```
    pub fn add_benchmark(&mut self, result: BenchmarkResult) {
        self.benchmarks.push(result);
    }

    /// Returns the profile name.
    ///
    /// # Returns
    ///
    /// Returns the name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the benchmarks.
    ///
    /// # Returns
    ///
    /// Returns the benchmarks.
    pub fn benchmarks(&self) -> &[BenchmarkResult] {
        &self.benchmarks
    }

    /// Returns the total duration.
    ///
    /// # Returns
    ///
    /// Returns the total duration.
    pub fn total_duration(&self) -> Duration {
        self.benchmarks.iter().map(|b| b.duration()).sum()
    }

    /// Returns the total iterations.
    ///
    /// # Returns
    ///
    /// Returns the total iterations.
    pub fn total_iterations(&self) -> u64 {
        self.benchmarks.iter().map(|b| b.iterations()).sum()
    }

    /// Returns the average ops/sec.
    ///
    /// # Returns
    ///
    /// Returns the average ops/sec.
    pub fn avg_ops_per_second(&self) -> f64 {
        let total_ops = self.total_iterations() as f64;
        let total_time = self.total_duration().as_secs_f64();

        if total_time > 0.0 {
            total_ops / total_time * 1_000_000_000.0
        } else {
            0.0
        }
    }

    /// Generates a profile report.
    ///
    /// # Returns
    ///
    /// Returns the report as a string.
    pub fn generate_report(&self) -> String {
        let mut report = String::new();

        report.push_str(&format!("# Performance Profile: {}\n\n", self.name()));
        report.push_str(&format!("Total Time: {:?}\n", self.total_duration()));
        report.push_str(&format!("Total Iterations: {}\n", self.total_iterations()));
        report.push_str(&format!("Average Ops/Sec: {:.2}\n\n", self.avg_ops_per_second()));

        report.push_str("## Benchmarks\n\n");
        for benchmark in &self.benchmarks {
            report.push_str(&format!("{}\n", benchmark.format()));
        }

        report
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_benchmark_result_new() {
        let result = BenchmarkResult::new(
            "test".to_string(),
            Duration::from_millis(100),
            1000,
        );
        assert_eq!(result.name(), "test");
        assert_eq!(result.iterations(), 1000);
        assert!(result.ops_per_second() > 0.0);
    }

    #[test]
    fn test_benchmark_result_format() {
        let result = BenchmarkResult::new(
            "test".to_string(),
            Duration::from_millis(100),
            1000,
        );
        let formatted = result.format();
        assert!(formatted.contains("test:"));
    }

    #[test]
    fn test_benchmark_suite_new() {
        let suite = BenchmarkSuite::new();
        assert!(suite.is_empty());
    }

    #[test]
    fn test_benchmark_suite_run() {
        let mut suite = BenchmarkSuite::new();
        let config = crate::types::AppConfig::default();

        suite.add_benchmark(Benchmark::new("test", || {
            let _ = config.load();
        }));

        let results = suite.run();
        assert_eq!(results.len(), 1);
        assert!(results[0].passed());
    }

    #[test]
    fn test_benchmark_new() {
        let config = crate::types::AppConfig::default();
        let bench = Benchmark::new("test", || {
            let _ = config.load();
        });
        assert_eq!(bench.name(), "test");
    }

    #[test]
    fn test_benchmark_config_operations() {
        let results = benchmark_config_operations();
        assert!(!results.is_empty());
    }

    #[test]
    fn test_benchmark_parsing() {
        let results = benchmark_parsing();
        assert!(!results.is_empty());
    }

    #[test]
    fn test_generate_benchmark_report() {
        let results = vec
![
            BenchmarkResult::new("test1".to_string(), Duration::from_millis(100), 1000),
            BenchmarkResult::new("test2".to_string(), Duration::from_millis(200), 1000),
        ];
        let report = generate_benchmark_report(&results);
        assert!(report.contains("# Benchmark Report"));
        assert!(report.contains("test1"));
        assert!(report.contains("test2"));
    }

    #[test]
    fn test_compare_benchmarks() {
        let result1 = BenchmarkResult::new(
            "test1".to_string(),
            Duration::from_millis(100),
            1000,
        );
        let result2 = BenchmarkResult::new(
            "test2".to_string(),
            Duration::from_millis(200),
            1000,
        );
        let comparison = compare_benchmarks(&result1, &result2);
        assert!(comparison.contains("test1 vs test2"));
    }

    #[test]
    fn test_performance_profile() {
        let mut profile = PerformanceProfile::new("Test");
        let result = BenchmarkResult::new("test".to_string(), Duration::from_millis(100), 1000);
        profile.add_benchmark(result);
        assert_eq!(profile.name(), "Test");
        assert_eq!(profile.len(), 1);
    }

    #[test]
    fn test_performance_profile_generate_report() {
        let mut profile = PerformanceProfile::new("Test");
        let result = BenchmarkResult::new("test".to_string(), Duration::from_millis(100), 1000);
        profile.add_benchmark(result);
        let report = profile.generate_report();
        assert!(report.contains("# Performance Profile: Test"));
    }
}
