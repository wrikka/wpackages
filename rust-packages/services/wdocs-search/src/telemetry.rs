use tracing::{info, warn, error, debug, trace, Level};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, fmt};
use std::env;
use crate::prelude::*;
use crate::error::{ConfigError, ConfigResult};

/// Telemetry configuration
#[derive(Debug, Clone)]
pub struct TelemetryConfig {
    pub log_level: String,
    pub enable_file_logging: bool,
    pub log_file_path: Option<String>,
    pub enable_json_format: bool,
    pub enable_performance_metrics: bool,
}

impl Default for TelemetryConfig {
    fn default() -> Self {
        Self {
            log_level: "info".to_string(),
            enable_file_logging: false,
            log_file_path: None,
            enable_json_format: false,
            enable_performance_metrics: true,
        }
    }
}

impl TelemetryConfig {
    /// Load telemetry configuration from environment
    pub fn from_env() -> ConfigResult<Self> {
        let mut config = Self::default();
        
        if let Ok(log_level) = env::var("WDOCS_LOG_LEVEL") {
            config.log_level = log_level;
        }
        
        if let Ok(enable_file) = env::var("WDOCS_ENABLE_FILE_LOG") {
            config.enable_file_logging = enable_file.parse()
                .map_err(|e| ConfigError::InvalidConfig(format!("Invalid WDOCS_ENABLE_FILE_LOG: {}", e)))?;
        }
        
        if let Ok(log_file) = env::var("WDOCS_LOG_FILE") {
            config.log_file_path = Some(log_file);
        }
        
        if let Ok(enable_json) = env::var("WDOCS_ENABLE_JSON_LOG") {
            config.enable_json_format = enable_json.parse()
                .map_err(|e| ConfigError::InvalidConfig(format!("Invalid WDOCS_ENABLE_JSON_LOG: {}", e)))?;
        }
        
        if let Ok(enable_metrics) = env::var("WDOCS_ENABLE_METRICS") {
            config.enable_performance_metrics = enable_metrics.parse()
                .map_err(|e| ConfigError::InvalidConfig(format!("Invalid WDOCS_ENABLE_METRICS: {}", e)))?;
        }
        
        Ok(config)
    }
    
    /// Parse log level string to tracing Level
    fn parse_log_level(level: &str) -> Level {
        match level.to_lowercase().as_str() {
            "trace" => Level::TRACE,
            "debug" => Level::DEBUG,
            "info" => Level::INFO,
            "warn" => Level::WARN,
            "error" => Level::ERROR,
            _ => Level::INFO,
        }
    }
}

/// Initialize telemetry and logging
pub fn init_telemetry(config: &TelemetryConfig) -> ConfigResult<()> {
    let log_level = TelemetryConfig::parse_log_level(&config.log_level);
    
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("wdocs_search"));
    
    let fmt_layer = fmt::layer()
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_ansi(true);
    
    let subscriber = tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer);
    
    // Add file logging if enabled
    let subscriber = if config.enable_file_logging {
        let file_appender = if let Some(log_file) = &config.log_file_path {
            tracing_appender::rolling::daily(log_file, "wdocs-search.log")
                .map_err(|e| ConfigError::InvalidConfig(format!("Failed to create file appender: {}", e)))?
        } else {
            tracing_appender::rolling::daily("logs", "wdocs-search.log")
                .map_err(|e| ConfigError::InvalidConfig(format!("Failed to create file appender: {}", e)))?
        };
        
        let file_layer = tracing_subscriber::fmt::layer()
            .with_writer(file_appender)
            .with_ansi(false)
            .with_target(true);
        
        subscriber.with(file_layer)
    } else {
        subscriber
    };
    
    // Set global subscriber
    subscriber.init();
    
    info!("Telemetry initialized with log level: {}", config.log_level);
    
    Ok(())
}

/// Performance metrics collector
#[derive(Debug, Default)]
pub struct PerformanceMetrics {
    pub search_operations: u64,
    pub index_operations: u64,
    pub memory_usage_bytes: u64,
    pub total_documents: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
}

impl PerformanceMetrics {
    /// Create new metrics instance
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Record search operation
    pub fn record_search(&mut self) {
        self.search_operations += 1;
        trace!("Search operation recorded, total: {}", self.search_operations);
    }
    
    /// Record index operation
    pub fn record_index(&mut self) {
        self.index_operations += 1;
        trace!("Index operation recorded, total: {}", self.index_operations);
    }
    
    /// Update memory usage
    pub fn update_memory_usage(&mut self, bytes: u64) {
        self.memory_usage_bytes = bytes;
        debug!("Memory usage updated: {} bytes", bytes);
    }
    
    /// Update document count
    pub fn update_document_count(&mut self, count: u64) {
        self.total_documents = count;
        debug!("Document count updated: {}", count);
    }
    
    /// Record cache hit
    pub fn record_cache_hit(&mut self) {
        self.cache_hits += 1;
        trace!("Cache hit recorded, total: {}", self.cache_hits);
    }
    
    /// Record cache miss
    pub fn record_cache_miss(&mut self) {
        self.cache_misses += 1;
        trace!("Cache miss recorded, total: {}", self.cache_misses);
    }
    
    /// Get cache hit ratio
    pub fn cache_hit_ratio(&self) -> f64 {
        let total_requests = self.cache_hits + self.cache_misses;
        if total_requests == 0 {
            return 0.0;
        }
        self.cache_hits as f64 / total_requests as f64
    }
    
    /// Log performance summary
    pub fn log_summary(&self) {
        info!("Performance Summary:");
        info!("  Search Operations: {}", self.search_operations);
        info!("  Index Operations: {}", self.index_operations);
        info!("  Memory Usage: {} bytes", self.memory_usage_bytes);
        info!("  Total Documents: {}", self.total_documents);
        info!("  Cache Hits: {}", self.cache_hits);
        info!("  Cache Misses: {}", self.cache_misses);
        info!("  Cache Hit Ratio: {:.2}%", self.cache_hit_ratio() * 100.0);
    }
    
    /// Reset all metrics
    pub fn reset(&mut self) {
        *self = Self::default();
        debug!("Performance metrics reset");
    }
}

/// Global performance metrics instance (thread-local)
use std::cell::RefCell;
thread_local! {
    static PERF_METRICS: RefCell<PerformanceMetrics> = RefCell::new(PerformanceMetrics::new());
}

/// Get performance metrics
pub fn get_performance_metrics() -> PerformanceMetrics {
    PERF_METRICS.with(|metrics| metrics.borrow().clone())
}

/// Record search operation
pub fn record_search_operation() {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().record_search());
}

/// Record index operation
pub fn record_index_operation() {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().record_index());
}

/// Update memory usage
pub fn update_memory_usage(bytes: u64) {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().update_memory_usage(bytes));
}

/// Update document count
pub fn update_document_count(count: u64) {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().update_document_count(count));
}

/// Record cache hit
pub fn record_cache_hit() {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().record_cache_hit());
}

/// Record cache miss
pub fn record_cache_miss() {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().record_cache_miss());
}

/// Log performance summary
pub fn log_performance_summary() {
    PERF_METRICS.with(|metrics| metrics.borrow().log_summary());
}

/// Reset performance metrics
pub fn reset_performance_metrics() {
    PERF_METRICS.with(|metrics| metrics.borrow_mut().reset());
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_telemetry_config_default() {
        let config = TelemetryConfig::default();
        assert_eq!(config.log_level, "info");
        assert!(!config.enable_file_logging);
        assert!(config.enable_performance_metrics);
    }
    
    #[test]
    fn test_parse_log_level() {
        assert_eq!(TelemetryConfig::parse_log_level("info"), Level::INFO);
        assert_eq!(TelemetryConfig::parse_log_level("debug"), Level::DEBUG);
        assert_eq!(TelemetryConfig::parse_log_level("warn"), Level::WARN);
        assert_eq!(TelemetryConfig::parse_log_level("error"), Level::ERROR);
        assert_eq!(TelemetryConfig::parse_log_level("trace"), Level::TRACE);
        assert_eq!(TelemetryConfig::parse_log_level("invalid"), Level::INFO);
    }
    
    #[test]
    fn test_performance_metrics() {
        let mut metrics = PerformanceMetrics::new();
        
        metrics.record_search();
        metrics.record_cache_hit();
        metrics.record_cache_miss();
        
        assert_eq!(metrics.search_operations, 1);
        assert_eq!(metrics.cache_hits, 1);
        assert_eq!(metrics.cache_misses, 1);
        assert_eq!(metrics.cache_hit_ratio(), 0.5);
    }
}
