# RAG Service

## Introduction

Retrieval-Augmented Generation service for wterminal with PDF processing. This service provides comprehensive RAG capabilities, enabling AI systems to retrieve relevant documents and generate contextually-aware responses.

## Features

- 🔍 **Document Retrieval** - Retrieve relevant documents
- 📝 **Context Generation** - Generate context for AI
- 📄 **PDF Processing** - Process PDF documents
- 💾 **Caching** - Built-in caching
- ⚡ **Fast** - Optimized for performance

## Goal

- 🎯 Provide RAG capabilities for wterminal IDE
- 🔍 Enable intelligent document retrieval
- 📝 Generate context for AI responses
- ⚡ Deliver fast retrieval

## Design Principles

- 🔍 **Accurate** - Relevant document retrieval
- 📝 **Context-aware** - Generate meaningful context
- 📄 **Flexible** - Support multiple document types
- ⚡ **Fast** - Optimized performance

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
rags = { path = "../rags" }
cache = { path = "../cache" }
```

## Usage

### Basic Retrieval

```rust
use rags::{RagService, RagRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = RagService::new();
    
    let request = RagRequest::builder()
        .query("What is Rust?")
        .limit(5)
        .build();
    
    let context = service.retrieve(request).await?;
    
    println!("Context: {}", context);
    
    Ok(())
}
```

## Examples

### Document Processing

```rust
use rags::RagService;

let service = RagService::new();
service.add_document("document.pdf").await?;
```

## Document Retrieval

```rust
use rags::RagService;

let service = RagService::new();

let context = service.retrieve("query").await?;
```

## PDF Processing

```rust
use rags::RagService;

let service = RagService::new();
service.add_document("document.pdf").await?;
```

## Configuration

```rust
use rags::{RagService, RagConfig};

let config = RagConfig::builder()
    .chunk_size(1000)
    .overlap(200)
    .enable_cache(true)
    .build();

let service = RagService::with_config(config);
```

## Development

```bash
cargo build
cargo test
```

## License

MIT
