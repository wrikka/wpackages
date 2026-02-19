# Streaming Library

## Introduction

The Streaming Library provides a comprehensive set of utilities for working with asynchronous streams in Rust. It offers efficient stream processing with backpressure handling, making it ideal for processing large datasets, real-time data feeds, and any scenario where data arrives incrementally.

Built with performance and reliability in mind, this library enables developers to create composable, efficient streaming pipelines with automatic backpressure management. It's ideal for data processing pipelines, real-time data feeds, and any application requiring efficient async stream processing.

## Features

- 🌊 **Async Streams** - Full async stream support with tokio-stream
- 🔄 **Backpressure Handling** - Automatic backpressure management
- 📊 **Stream Processing** - Transform and filter streams
- 🔄 **Stream Composition** - Combine multiple streams
- ⚡ **High Performance** - Optimized for high throughput
- 🔧 **Configurable** - Flexible configuration options
- 🎨 **Clean API** - Intuitive interface for stream operations
- 🔒 **Type Safety** - Generic interface for any stream type
- 📈 **Scalable** - Handles large datasets efficiently
- 🧪 **Well-Tested** - Comprehensive unit tests

## Goals

- 🎯 Provide efficient streaming utilities for wterminal IDE
- 🌊 Enable real-time data processing
- 🔄 Handle backpressure automatically
- ⚡ Optimize for high throughput
- 🎨 Provide clean, intuitive API design
- 🔒 Ensure type safety and memory safety
- 📈 Scale to handle large datasets
- 🧩 Enable modular and reusable stream components
- 🌐 Seamless integration with tokio ecosystem
- 🛡️ Build fault-tolerant streaming pipelines

## Design Principles

- 🌊 **Stream-First** - Design with streaming in mind
- 🔄 **Composable** - Easy to combine streams
- ⚡ **Efficient** - Zero-copy where possible
- 🔧 **Flexible** - Support various stream types
- 🔒 **Type Safety** - Leverage Rust's type system
- 🎨 **Simplicity** - Clean, intuitive API
- 📈 **Performance** - Minimal overhead
- 🧩 **Modularity** - Independent and reusable
- 🛡️ **Robustness** - Comprehensive error handling
- 🌐 **Integration** - Works with tokio

## Installation

<details>
<summary>As a Rust Dependency</summary>

Add this to your `Cargo.toml`:

```toml
[dependencies]
streaming = { path = "../streaming" }
tokio = { version = "1.35", features = ["full"] }
tokio-stream = "0.1"
futures = "0.3"
```

</details>

<details>
<summary>From Source</summary>

```bash
# Clone the repository
git clone https://github.com/your-org/wterminal.git
cd wterminal/rust-packages/foundation/streaming

# Build the library
cargo build --release

# Run tests
cargo test
```

</details>

## Usage

### Create a Stream

```rust
use streaming::{StreamBuilder, StreamConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = StreamConfig::builder()
        .buffer_size(100)
        .build();

    let stream = StreamBuilder::new(config)
        .from_iter(vec![1, 2, 3, 4, 5])
        .build();

    tokio::pin!(stream);

    while let Some(item) = stream.next().await {
        println!("Item: {}", item);
    }

    Ok(())
}
```

### Transform Streams

```rust
use streaming::StreamExt;

let stream = StreamBuilder::new(config)
    .from_iter(vec![1, 2, 3, 4, 5])
    .map(|x| x * 2)
    .filter(|x| *x > 4)
    .build();
```

### Combine Streams

```rust
use streaming::StreamExt;

let stream1 = StreamBuilder::new(config).from_iter(vec![1, 2, 3]).build();
let stream2 = StreamBuilder::new(config).from_iter(vec![4, 5, 6]).build();

let combined = stream1.merge(stream2);
```

## Examples

### Example 1: File Streaming

```rust
use streaming::{FileStream, StreamConfig};

let config = StreamConfig::default();
let stream = FileStream::new("large_file.txt", config).await?;

tokio::pin!(stream);

while let Some(chunk) = stream.next().await {
    let chunk = chunk?;
    process_chunk(chunk).await?;
}
```

### Example 2: Real-time Data Processing

```rust
use streaming::{StreamBuilder, StreamConfig};

let config = StreamConfig::builder()
    .buffer_size(1000)
    .backpressure(true)
    .build();

let stream = StreamBuilder::new(config)
    .from_channel(receiver)
    .map(|data| transform(data))
    .filter(|data| is_valid(data))
    .batch(100)
    .build();
```

### Example 3: Rate-limited Stream

```rust
use streaming::{StreamBuilder, StreamConfig};
use std::time::Duration;

let config = StreamConfig::builder()
    .rate_limit(10) // 10 items per second
    .build();

let stream = StreamBuilder::new(config)
    .from_iter(data)
    .build();
```

### Example 4: Stream Composition

```rust
use streaming::{StreamBuilder, StreamConfig, StreamExt};

let config = StreamConfig::default();

let stream = StreamBuilder::new(config)
    .from_iter(vec![1, 2, 3, 4, 5])
    .map(|x| x * 2)
    .filter(|x| *x > 5)
    .take(3)
    .build();
```

## License

MIT
