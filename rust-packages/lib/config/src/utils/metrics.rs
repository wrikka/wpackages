//! Configuration metrics and telemetry
//!
//! This module provides metrics and telemetry for configuration operations.

use std::time::{Duration, Instant};
use std::collections::HashMap;

/// Represents configuration metrics.
#[derive(Debug, Clone)]
pub struct ConfigMetrics {
    load_time: Duration,
    save_time: Duration,
    validation_time: Duration,
    migration_time: Duration,
    load_count: u64,
    save_count: u64,
    validation_count: u64,
    migration_count: u64,
}

impl ConfigMetrics {
    /// Creates a new metrics instance.
    ///
    /// # Returns
    ///
    /// Returns a new metrics instance.
    pub fn new() -> Self {
        Self {
            load_time: Duration::from_millis(0),
            save_time: Duration::from_millis(0),
            validation_time: Duration::from_millis(0),
            migration_time: Duration::from_millis(0),
            load_count: 0,
            save_count: 0,
            validation_count: 0,
            migration_count: 0,
        }
    }

    /// Records a load operation.
    ///
    /// # Arguments
    ///
    /// * `duration` - The operation duration
    pub fn record_load(&mut self, duration: Duration) {
        self.load_time = duration;
        self.load_count += 1;
    }

    /// Records a save operation.
    ///
    /// # Arguments
    ///
    /// * `duration` - The operation duration
    pub fn record_save(&mut self, duration: Duration) {
        self.save_time = duration;
        self.save_count += 1;
    }

    /// Records a validation operation.
    ///
    /// # Arguments
    ///
    /// * `duration` - The operation duration
    pub fn record_validation(&mut self, duration: Duration) {
        self.validation_time = duration;
        self.validation_count += 1;
    }

    /// Records a migration operation.
    ///
    /// # Arguments
    ///
    /// * `duration` - The operation duration
    pub fn record_migration(&mut self, duration: Duration) {
        self.migration_time = duration;
        self.migration_count += 1;
    }

    /// Returns the load time.
    ///
    /// # Returns
    ///
    /// Returns the duration.
    pub fn load_time(&self) -> Duration {
        self.load_time
    }

    /// Returns the save time.
    ///
    /// # Returns
    ///
    /// Returns the duration.
    pub fn save_time(&self) -> Duration {
        self.save_time
    }

    /// Returns the validation time.
    ///
    /// # Returns
    ///
    /// Returns the duration.
    pub fn validation_time(&self) -> Duration {
        self.validation_time
    }

    /// Returns the migration time.
    ///
    /// # Returns
    ///
    /// Returns the duration.
    pub fn migration_time(&self) -> Duration {
        self.migration_time
    }

    /// Returns the load count.
    ///
    /// # Returns
    ///
    /// Returns the count.
    pub fn load_count(&self) -> u64 {
        self.load_count
    }

    /// Returns the save count.
    ///
    /// # Returns
    ///
    /// Returns the count.
    pub fn save_count(&self) -> u64 {
        self.save_count
    }

    /// Returns the validation count.
    ///
    /// # Returns
    ///
    /// Returns the count.
    pub fn validation_count(&self) -> u64 {
        self.validation_count
    }

    /// Returns the migration count.
    ///
    /// # Returns
    ///
    /// Returns the count.
    pub fn migration_count(&self) -> u64 {
        self.migration_count
    }

    /// Returns the average load time.
    ///
    /// # Returns
    ///
    /// Returns the average duration.
    pub fn avg_load_time(&self) -> Duration {
        if self.load_count > 0 {
            self.load_time / self.load_count as u32
        } else {
            Duration::from_millis(0)
        }
    }

    /// Returns the average save time.
    ///
    /// # Returns
    ///
    /// Returns the average duration.
    pub fn avg_save_time(&self) -> Duration {
        if self.save_count > 0 {
            self.save_time / self.save_count as u32
        } else {
            Duration::from_millis(0)
        }
    }

    /// Returns the average validation time.
    ///
    /// # Returns
    ///
    /// Returns the average duration.
    pub fn avg_validation_time(&self) -> Duration {
        if self.validation_count > 0 {
            self.validation_time / self.validation_count as u32
        } else {
            Duration::from_millis(0)
        }
    }

    /// Returns the average migration time.
    ///
    /// # Returns
    ///
    /// Returns the average duration.
    pub fn avg_migration_time(&self) -> Duration {
        if self.migration_count > 0 {
            self.migration_time / self.migration_count as u32
        } else {
            Duration::from_millis(0)
        }
    }
}

impl Default for ConfigMetrics {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a metrics collector.
pub struct MetricsCollector {
    metrics: ConfigMetrics,
    start_time: Instant,
}

impl MetricsCollector {
    /// Creates a new metrics collector.
    ///
    /// # Returns
    ///
    /// Returns a new collector.
    pub fn new() -> Self {
        Self {
            metrics: ConfigMetrics::new(),
            start_time: Instant::now(),
        }
    }

    /// Returns the metrics.
    ///
    /// # Returns
    ///
    /// Returns the metrics.
    pub fn metrics(&self) -> &ConfigMetrics {
        &self.metrics
    }

    /// Returns the elapsed time since creation.
    ///
    /// # Returns
    ///
    /// Returns the elapsed duration.
    pub fn elapsed(&self) -> Duration {
        self.start_time.elapsed()
    }

    /// Resets the metrics.
    pub fn reset(&mut self) {
        self.metrics = ConfigMetrics::new();
        self.start_time = Instant::now();
    }

    /// Times an operation.
    ///
    /// # Arguments
    ///
    /// * `operation` - The operation to time
    ///
    /// # Returns
    ///
    /// Returns the operation result and duration.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::metrics::MetricsCollector;
    ///
    /// let mut collector = MetricsCollector::new();
    /// let (result, duration) = collector.time(|| {
    ///     // do something
    ///     42
    /// });
    /// ```
    pub fn time<F, R>(&mut self, operation: F) -> (R, Duration)
    where
        F: FnOnce() -> R,
    {
        let start = Instant::now();
        let result = operation();
        let duration = start.elapsed();
        (result, duration)
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents telemetry data.
#[derive(Debug, Clone)]
pub struct TelemetryData {
    metrics: ConfigMetrics,
    custom_data: HashMap<String, String>,
}

impl TelemetryData {
    /// Creates a new telemetry data instance.
    ///
    /// # Arguments
    ///
    /// * `metrics` - The configuration metrics
    ///
    /// # Returns
    ///
    /// Returns a new telemetry data instance.
    pub fn new(metrics: ConfigMetrics) -> Self {
        Self {
            metrics,
            custom_data: HashMap::new(),
        }
    }

    /// Adds custom data.
    ///
    /// # Arguments
    ///
    /// * `key` - The data key
    /// * `value` - The data value
    pub fn add_custom_data(&mut self, key: String, value: String) {
        self.custom_data.insert(key, value);
    }

    /// Returns the metrics.
    ///
    /// # Returns
    ///
    /// Returns the metrics.
    pub fn metrics(&self) -> &ConfigMetrics {
        &self.metrics
    }

    /// Returns the custom data.
    ///
    /// # Returns
    ///
    /// Returns the custom data.
    pub fn custom_data(&self) -> &HashMap<String, String> {
        &self.custom_data
    }

    /// Converts telemetry to JSON.
    ///
    /// # Returns
    ///
    /// Returns the JSON string.
    pub fn to_json(&self) -> serde_json::Result<String> {
        serde_json::to_string_pretty(self)
    }

    /// Converts telemetry to a string summary.
    ///
    /// # Returns
    ///
    /// Returns the summary.
    pub fn to_summary(&self) -> String {
        format!(
            "Config Metrics:\n\
             Loads: {} (avg: {:?})\n\
             Saves: {} (avg: {:?})\n\
             Validations: {} (avg: {:?})\n\
             Migrations: {} (avg: {:?})",
            self.metrics.load_count(),
            self.metrics.avg_load_time(),
            self.metrics.save_count(),
            self.metrics.avg_save_time(),
            self.metrics.validation_count(),
            self.metrics.avg_validation_time(),
            self.metrics.migration_count(),
            self.metrics.avg_migration_time()
        )
    }
}

/// Represents a telemetry reporter.
pub struct TelemetryReporter {
    endpoint: Option<String>,
    enabled: bool,
}

impl TelemetryReporter {
    /// Creates a new telemetry reporter.
    ///
    /// # Returns
    ///
    /// Returns a new reporter.
    pub fn new() -> Self {
        Self {
            endpoint: None,
            enabled: false,
        }
    }

    /// Sets the telemetry endpoint.
    ///
    /// # Arguments
    ///
    /// * `endpoint` - The endpoint URL
    pub fn with_endpoint(mut self, endpoint: String) -> Self {
        self.endpoint = Some(endpoint);
        self
    }

    /// Enables or disables telemetry.
    ///
    /// # Arguments
    ///
    /// * `enabled` - Whether to enable
    pub fn with_enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    /// Reports telemetry data.
    ///
    /// # Arguments
    ///
    /// * `data` - The telemetry data
    ///
    /// # Returns
    ///
    /// Returns `Ok(())` on success.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::metrics::{TelemetryReporter, ConfigMetrics};
    ///
    /// let reporter = TelemetryReporter::new().with_enabled(true);
    /// let metrics = ConfigMetrics::new();
    /// let data = TelemetryData::new(metrics);
    /// reporter.report(&data).unwrap();
    /// ```
    pub fn report(&self, data: &TelemetryData) -> std::io::Result<()> {
        if !self.enabled {
            return Ok(());
        }

        // In a real implementation, this would send data to the endpoint
        // For now, just log the data
        println!("Telemetry: {}", data.to_summary());

        Ok(())
    }

    /// Returns `true` if telemetry is enabled.
    ///
    /// # Returns
    ///
    /// Returns `true` if enabled.
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    /// Returns the endpoint.
    ///
    /// # Returns
    ///
    /// Returns the endpoint if set.
    pub fn endpoint(&self) -> Option<&str> {
        self.endpoint.as_deref()
    }
}

impl Default for TelemetryReporter {
    fn default() -> Self {
        Self::new()
    }
}

/// Represents a performance timer.
pub struct PerformanceTimer {
    start: Instant,
}

impl PerformanceTimer {
    /// Creates a new performance timer.
    ///
    /// # Returns
    ///
    /// Returns a new timer.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::metrics::PerformanceTimer;
    ///
    /// let timer = PerformanceTimer::new();
    /// // do work
    /// let elapsed = timer.elapsed();
    /// ```
    pub fn new() -> Self {
        Self {
            start: Instant::now(),
        }
    }

    /// Returns the elapsed time.
    ///
    /// # Returns
    ///
    /// Returns the elapsed duration.
    pub fn elapsed(&self) -> Duration {
        self.start.elapsed()
    }

    /// Times a code block.
    ///
    /// # Arguments
    ///
    /// * `block` - The code to time
    ///
    /// # Returns
    ///
    /// Returns the block result and elapsed time.
    ///
    /// # Example
    ///
    /// ```no_run
    /// use config::utils::metrics::PerformanceTimer;
    ///
    /// let (result, elapsed) = PerformanceTimer::time(|| {
    ///     // do work
    ///     42
    /// });
    /// println!("Time: {:?}", elapsed);
    /// ```
    pub fn time<F, R>(block: F) -> (R, Duration)
    where
        F: FnOnce() -> R,
    {
        let start = Instant::now();
        let result = block();
        let elapsed = start.elapsed();
        (result, elapsed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_metrics_new() {
        let metrics = ConfigMetrics::new();
        assert_eq!(metrics.load_count(), 0);
        assert_eq!(metrics.save_count(), 0);
    }

    #[test]
    fn test_config_metrics_record() {
        let mut metrics = ConfigMetrics::new();
        metrics.record_load(Duration::from_millis(100));
        assert_eq!(metrics.load_count(), 1);
        assert_eq!(metrics.load_time(), Duration::from_millis(100));
    }

    #[test]
    fn test_config_metrics_avg() {
        let mut metrics = ConfigMetrics::new();
        metrics.record_load(Duration::from_millis(100));
        metrics.record_load(Duration::from_millis(200));
        assert_eq!(metrics.avg_load_time(), Duration::from_millis(150));
    }

    #[test]
    fn test_metrics_collector() {
        let mut collector = MetricsCollector::new();
        let (result, duration) = collector.time(|| 42);
        assert_eq!(result, 42);
        assert!(duration > Duration::from_millis(0));
    }

    #[test]
    fn test_telemetry_data() {
        let metrics = ConfigMetrics::new();
        let mut data = TelemetryData::new(metrics);
        data.add_custom_data("key".to_string(), "value".to_string());
        assert_eq!(data.custom_data().len(), 1);
    }

    #[test]
    fn test_telemetry_reporter() {
        let reporter = TelemetryReporter::new().with_enabled(true);
        assert!(reporter.is_enabled());
    }

    #[test]
    fn test_performance_timer() {
        let timer = PerformanceTimer::new();
        let elapsed = timer.elapsed();
        assert!(elapsed > Duration::from_millis(0));
    }

    #[test]
    fn test_performance_timer_time() {
        let (result, elapsed) = PerformanceTimer::time(|| 42);
        assert_eq!(result, 42);
        assert!(elapsed > Duration::from_millis(0));
    }
}
