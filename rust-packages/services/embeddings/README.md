# Embeddings Library

## Introduction

Embeddings generation using Candle ML framework with HTTP server support. This library provides high-performance text embedding generation using various ML models, with support for batch processing and HTTP API for easy integration.

## Features

- 🧠 **Text Embeddings** - Generate embeddings for text
- 🤖 **Multiple Models** - Support for various ML models
- 🌐 **HTTP Server** - REST API for embeddings generation
- 💾 **Caching** - Built-in caching support
- ⚡ **Fast** - Optimized for performance
- 🔌 **Easy Integration** - Simple API

## Goal

- 🎯 Provide efficient embeddings generation for wterminal IDE
- 🤖 Support multiple ML models
- 🌐 Enable HTTP API for remote access
- 💾 Optimize with caching

## Design Principles

- 🧠 **Accurate** - High-quality embeddings
- ⚡ **Fast** - Optimized performance
- 🌐 **Accessible** - HTTP API support
- 💾 **Efficient** - Smart caching

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
embeddings = { path = "../embeddings" }
cache = { path = "../cache" }
```

## Usage

### Basic Embeddings

```rust
use embeddings::{EmbeddingsService, EmbeddingsRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = EmbeddingsService::new();
    
    let request = EmbeddingsRequest::builder()
        .text("Hello, world!")
        .model("all-MiniLM-L6-v2")
        .build();
    
    let embeddings = service.generate(request).await?;
    
    println!("Embeddings: {:?}", embeddings);
    
    Ok(())
}
```

## Examples

### Batch Processing

```rust
use embeddings::EmbeddingsService;

let service = EmbeddingsService::new();

let texts = vec![
    "First text",
    "Second text",
    "Third text",
];

let embeddings = service.generate_batch(texts).await?;
```

## HTTP Server

```rust
use embeddings::EmbeddingsServer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let server = EmbeddingsServer::new("0.0.0.0:8080").await?;
    server.start().await?;
    
    Ok(())
}
```

## Configuration

```rust
use embeddings::{EmbeddingsService, EmbeddingsConfig};

let config = EmbeddingsConfig::builder()
    .model("all-MiniLM-L6-v2")
    .enable_cache(true)
    .batch_size(32)
    .build();

let service = EmbeddingsService::with_config(config);
```

## Development

```bash
cargo build
cargo run --bin embeddings-server
cargo test
```

## License

MIT
