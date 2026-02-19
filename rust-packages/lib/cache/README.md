# Cache Library

## Introduction

The Cache Library is a generic, high-performance caching solution designed for Rust applications requiring flexible and efficient data caching. It provides a unified interface for multiple storage backends including in-memory, disk-based, and distributed Redis caching, enabling developers to optimize application performance through intelligent caching strategies.

Built with performance, reliability, and observability in mind, this library offers comprehensive features such as TTL (Time-To-Live) support, configurable eviction policies, detailed metrics tracking, and a layered caching architecture that combines the speed of in-memory storage with the persistence of disk-based solutions. The library follows Rust best practices with pure functions in components and explicit side effects in services, ensuring type safety and maintainability.

## Features

- 🎯 **Performance Optimization** - Reduce latency and improve response times through intelligent caching
- 💾 **Multiple Storage Backends** - In-memory (Moka), Disk (Sled), and Redis support
- 📊 **Comprehensive Metrics** - Hit rate, miss rate, utilization tracking
- ⚡ **High-Throughput** - Optimized for high-throughput scenarios with async operations
- 🔄 **Layered Caching** - Two-tier caching combining memory and disk for optimal performance
- ⏰ **TTL Support** - Configurable Time-To-Live and TTL-Idle for automatic expiration
- 🗑️ **Eviction Policies** - LRU, LFU, and FIFO eviction strategies
- 📈 **Performance Monitoring** - Built-in metrics and observability
- 🔒 **Type Safety** - Generic interface for any key/value types
- 🌐 **Distributed Caching** - Redis support for distributed caching scenarios
- 📦 **Binary Serialization** - Optimized with bincode for faster serialization
- 🎨 **Clean API** - Intuitive builder pattern for configuration
- 🧪 **Well-Tested** - Comprehensive unit tests and benchmarks

## Goals

- 🚀 Maximize application performance through intelligent caching strategies
- 💾 Provide flexible storage options for different use cases
- 📊 Enable comprehensive observability with detailed metrics
- ⚡ Ensure high-throughput and low-latency operations
- 🔄 Support complex caching patterns (layered, distributed)
- 🛡️ Maintain data consistency and reliability
- 🎨 Provide clean, intuitive API for easy integration
- 📈 Scale horizontally with distributed caching support
- 🔒 Ensure type safety and memory safety
- 📚 Offer comprehensive documentation and examples

## Design Principles

- 🔄 **Generic Interface** - Work with any key/value types
- 💾 **Multiple Backends** - Support for in-memory, disk, and distributed storage
- 📊 **Observable** - Built-in metrics for monitoring and debugging
- ⚡ **Async-First** - Non-blocking operations for optimal performance
- 🧩 **Modularity** - Pure functions in components, side effects in services
- 🔒 **Type Safety** - Leverage Rust's type system for correctness
- 🎨 **Simplicity** - Clean, intuitive API design
- 📈 **Performance** - Optimized for high-throughput scenarios
- 🛡️ **Reliability** - Comprehensive error handling and recovery
- 🌐 **Extensibility** - Easy to add new backends and strategies

## Installation

<details>
<summary>As a Rust Dependency</summary>

Add this to your `Cargo.toml`:

```toml
[dependencies]
cache = { path = "../cache", features = ["default"] }
```

</details>

<details>
<summary>With Specific Features</summary>

```toml
[dependencies]
cache = { path = "../cache", features = ["in-memory", "disk", "redis", "telemetry"] }
```

Available features:
- `default`: Enables in-memory and disk backends
- `in-memory`: In-memory cache using Moka
- `disk`: Persistent disk cache using Sled
- `redis`: Distributed Redis caching
- `telemetry`: Tracing and logging support

</details>

<details>
<summary>From Source</summary>

```bash
# Clone the repository
git clone https://github.com/your-org/wterminal.git
cd wterminal/rust-packages/foundation/cache

# Build the library
cargo build --release

# Run tests
cargo test

# Run benchmarks
cargo bench
```

</details>

## Usage

### Basic Caching

```rust
use cache::prelude::*;

#[tokio::main]
async fn main() -> Result<(), CacheError> {
    let config = CacheConfig::builder()
        .max_capacity(1000)
        .ttl(std::time::Duration::from_secs(3600))
        .build();

    let cache = InMemoryCache::new(&config);

    // Set a value
    cache.set("key".to_string(), "value".to_string()).await?;

    // Get a value
    if let Some(value) = cache.get(&"key".to_string()).await? {
        println!("Found: {}", value);
    }

    Ok(())
}
```

## Examples

### Disk Cache

```rust
use cache::prelude::*;

let config = CacheConfig::disk("/path/to/cache.db".to_string());
let cache = DiskCache::new(&config)?;

cache.set("persistent_key", "persistent_value").await?;
let value = cache.get(&"persistent_key".to_string()).await?;
```

## Storage Backends

### In-Memory Cache

Fast, volatile storage using Moka. Best for:
- Hot data caching
- Session data
- Temporary computations

```rust
use cache::prelude::*;

let config = CacheConfig::in_memory();
let cache = InMemoryCache::new(&config);
```

### Disk Cache

Persistent storage using Sled. Best for:
- Large datasets
- Long-term caching
- Data persistence across restarts

```rust
use cache::prelude::*;

let config = CacheConfig::disk("/path/to/cache.db".to_string());
let cache = DiskCache::new(&config)?;
```

## Configuration

Use `CacheConfig` builder to configure cache behavior:

```rust
use cache::prelude::*;
use std::time::Duration;

let config = CacheConfig::builder()
    .backend(CacheBackendType::InMemory)
    .max_capacity(10000)
    .ttl(Duration::from_secs(3600))
    .ttl_idle(Duration::from_secs(300))
    .eviction_policy(EvictionPolicy::Lru)
    .enable_metrics(true)
    .namespace("my_app".to_string())
    .build();
```

## Metrics

Track cache performance with built-in metrics:

```rust
use cache::prelude::*;

let cache = InMemoryCache::new(&CacheConfig::default());
// ... use cache ...

let metrics = cache.metrics();
println!("Hit rate: {:.2}%", metrics.hit_rate() * 100.0);
println!("Miss rate: {:.2}%", metrics.miss_rate() * 100.0);
println!("Utilization: {:.2}%", metrics.utilization() * 100.0);
```

## Observability

Enable tracing for cache operations:

```rust
use cache::prelude::*;

fn main() {
    init_subscriber();
    // Your application code
}
```

Set log level via environment variable:

```bash
RUST_LOG=cache=debug cargo run
```

## Features

- `default`: Enables in-memory and disk backends
- `in-memory`: In-memory cache using Moka
- `disk`: Persistent disk cache using Sled
- `telemetry`: Tracing and logging support

## License

MIT
