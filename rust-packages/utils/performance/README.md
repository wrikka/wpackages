# Performance Monitoring and Profiling

A comprehensive Rust library for performance monitoring, profiling, and optimization in WAI applications.

## Features

- **Metrics Collection**: Collect and store performance metrics with timestamps
- **Resource Monitoring**: Track CPU, memory, and system resource usage
- **Performance Profiling**: Start/stop profiling sessions with detailed reports
- **Optimization Suggestions**: Generate recommendations based on performance data
- **UX Improvements**: Track and suggest user experience improvements
- **Async Support**: Full async/await support for non-blocking operations
- **Type Safety**: Comprehensive error handling with custom error types

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
performance = { path = "../utils/performance" }
```

## Quick Start

```rust
use performance::prelude::*;

#[tokio::main]
async fn main() -> PerformanceResult<()> {
    // Create a performance client
    let client = create_performance_client();
    
    // Create a performance snapshot
    let snapshot = client.create_snapshot().await?;
    println!("Created snapshot with {} metrics", snapshot.metric_count());
    
    // Generate a performance report
    let report = client.generate_report(
        "My App Report".to_string(),
        std::time::Duration::from_secs(60)
    ).await?;
    
    println!("Report: {}", report.display_summary());
    
    Ok(())
}
```

## Core Components

### PerformanceClient

The main trait for all performance operations:

```rust
#[async_trait]
pub trait PerformanceClient: Send + Sync {
    async fn create_snapshot(&self) -> PerformanceResult<PerformanceSnapshot>;
    async fn get_metrics(&self) -> PerformanceResult<Vec<PerformanceMetric>>;
    async fn generate_report(&self, name: String, duration: Duration) -> PerformanceResult<PerformanceReport>;
    async fn get_optimizations(&self) -> PerformanceResult<Vec<PerformanceOptimization>>;
    async fn apply_optimization(&self, optimization_id: &str) -> PerformanceResult<bool>;
    // ... more methods
}
```

### PerformanceClientImpl

Default implementation with comprehensive features:

- **Thread-safe**: Uses `Arc<Mutex<T>>` for safe concurrent access
- **Configurable**: Support for custom performance configurations
- **Extensible**: Plugin architecture for custom metrics and optimizations
- **Observable**: Built-in logging and tracing support

### Types

#### PerformanceMetric
```rust
pub struct PerformanceMetric {
    pub id: String,
    pub name: String,
    pub category: MetricCategory,
    pub value: f64,
    pub unit: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, String>,
}
```

#### PerformanceSnapshot
```rust
pub struct PerformanceSnapshot {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metrics: Vec<PerformanceMetric>,
    pub memory_usage: MemoryUsage,
    pub cpu_usage: CpuUsage,
}
```

#### PerformanceReport
```rust
pub struct PerformanceReport {
    pub id: String,
    pub name: String,
    pub duration: Duration,
    pub snapshots: Vec<PerformanceSnapshot>,
    pub metrics_summary: MetricsSummary,
    pub optimizations: Vec<PerformanceOptimization>,
    pub recommendations: Vec<String>,
}
```

## Usage Examples

### Basic Metrics Collection

```rust
use performance::prelude::*;

let client = create_performance_client();

// Record custom metrics
let metric = PerformanceMetric::new(
    "api_response_time",
    "API Response Time",
    MetricCategory::Network,
    150.5,
    "ms",
);

client.record_metric(metric).await?;
```

### Performance Profiling

```rust
let mut client = create_performance_client();

// Start profiling session
client.start_profiling().await?;

// Do some work...
for i in 0..1000 {
    let _ = expensive_operation(i).await;
}

// Stop profiling and get report
let report = client.stop_profiling().await?;
println!("Profiling report: {}", report.display_summary());
```

### Custom Configuration

```rust
use performance::prelude::*;

let config = PerformanceConfig::new()
    .with_profiling(true)
    .with_metrics_retention(Duration::from_secs(3600))
    .with_auto_optimize(false);

let client = create_performance_client_with_config(config);
```

### Optimization Suggestions

```rust
let client = create_performance_client();

// Get available optimizations
let optimizations = client.get_optimizations().await?;

// Apply specific optimization
let success = client.apply_optimization("opt1").await?;
if success {
    println!("Applied optimization successfully");
}
```

## Error Handling

The library uses comprehensive error types:

```rust
#[derive(Error, Debug)]
pub enum PerformanceError {
    #[error("Invalid metric: {0}")]
    InvalidMetric(String),
    
    #[error("Metric not found: {0}")]
    MetricNotFound(String),
    
    #[error("Lock error: {0}")]
    LockError(String),
    
    #[error("Profiling already in progress")]
    ProfilingAlreadyInProgress,
    
    // ... more error variants
}

pub type PerformanceResult<T> = Result<T, PerformanceError>;
```

## Configuration

### PerformanceConfig

```rust
pub struct PerformanceConfig {
    pub enable_profiling: bool,
    pub profile_interval: Duration,
    pub enable_optimizations: bool,
    pub auto_optimize: bool,
    pub enable_metrics: bool,
    pub metrics_retention: Duration,
}
```

### Environment Variables

```env
# Enable performance monitoring
PERFORMANCE_ENABLED=true

# Profiling interval in milliseconds
PERFORMANCE_PROFILE_INTERVAL=1000

# Metrics retention duration
PERFORMANCE_RETENTION=3600
```

## Architecture

The library follows a clean architecture with clear separation of concerns:

```
src/
├── services/
│   ├── traits.rs          # PerformanceClient trait definition
│   ├── client.rs          # Implementation with all methods
│   └── mod.rs            # Module exports
├── types/
│   ├── core.rs            # Core types (PerformanceMetric, PerformanceSnapshot)
│   ├── optimization.rs    # Optimization types and suggestions
│   └── mod.rs            # Type exports
├── config.rs              # Configuration management
├── error.rs               # Error types and handling
├── telemetry.rs           # Logging and tracing setup
└── lib.rs                 # Main library entry point
```

## Best Practices

### Thread Safety

- All shared state uses `Arc<Mutex<T>>` for safe concurrent access
- Async methods properly handle lock contention
- No `unwrap()` calls on mutex operations

### Error Handling

- Comprehensive error types with `thiserror`
- Proper error propagation with `?` operator
- Context-aware error messages

### Performance Considerations

- Minimal allocations in hot paths
- Efficient data structures for metrics storage
- Async-first design for non-blocking operations

## Testing

Run the test suite:

```bash
cargo test
```

Run tests with coverage:

```bash
cargo test --coverage
```

## Integration

### With Nuxt Applications

```typescript
import { createPerformanceClient } from '@wai/performance';

const client = createPerformanceClient();

// Track page load performance
const startTime = performance.now();
// ... page loads
const loadTime = performance.now() - startTime;

await client.record_metric({
  id: 'page_load_time',
  name: 'Page Load Time',
  category: 'Rendering',
  value: loadTime,
  unit: 'ms',
});
```

### With CLI Tools

```rust
use performance::prelude::*;

let client = create_performance_client();

// Track command execution time
let start = std::time::Instant::now();
// ... execute command
let duration = start.elapsed();

client.record_metric(PerformanceMetric::new(
    "command_execution_time",
    "Command Execution Time",
    MetricCategory::Cpu,
    duration.as_millis() as f64,
    "ms",
)).await?;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
