# AI Library 🤖

## Introduction

AI/ML orchestration suite for wterminal IDE with completion, embeddings, and RAG support. This library provides a comprehensive set of AI/ML capabilities including code completion, text embeddings generation, vector search, and Retrieval-Augmented Generation (RAG). Built with Rust for performance and includes Node.js bindings for cross-platform integration.

## Features

- 💬 **Completion Service** - AI-powered code completion
- 🧠 **Embeddings Generation** - Generate text embeddings
- 🔍 **Vector Search** - Semantic search capabilities
- 📝 **RAG Support** - Retrieval-Augmented Generation
- 🌐 **Node.js Bindings** - NAPI for Node.js integration
- ⚡ **Fast** - Optimized for performance

## Goals

- 🎯 Provide comprehensive AI/ML orchestration capabilities
- 💬 Enable AI-powered code completion
- 🧠 Support embeddings generation for semantic understanding
- 🔍 Enable vector search for efficient retrieval
- 📝 Provide RAG capabilities for enhanced AI responses
- 🌐 Support cross-platform integration with Node.js bindings
- ⚡ Deliver high-performance AI/ML operations
- 🔒 Ensure type safety and memory safety

## Design Principles

- ⚡ **Performance First** - Optimized for speed and efficiency
- 🔒 **Type Safety** - Leverage Rust's type system
- 🌐 **Cross-Platform** - Works on multiple platforms
- 🧩 **Modular** - Independent and reusable components
- 📊 **Observable** - Built-in logging and monitoring
- 🛡️ **Secure** - Safe and reliable operations

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
ai = { path = "../ai", features = ["full"] }
```

## Usage

### Basic Usage

```rust
use ai::{AiService, AiRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = AiService::new();

    let request = AiRequest::builder()
        .prompt("Explain Rust ownership")
        .model("gpt-4")
        .build();

    let response = service.complete(request).await?;

    println!("Response: {}", response.text);

    Ok(())
}
```

### Code Completion

```rust
use ai::AiService;

let service = AiService::new();

let completion = service.complete("fn main() {}").await?;
```

### Embeddings

```rust
use ai::AiService;

let service = AiService::new();

let embeddings = service.generate_embeddings("Hello, world!").await?;
```

### RAG

```rust
use ai::AiService;

let service = AiService::new();

let context = service.retrieve_context("What is Rust?").await?;
```

### Node.js Bindings

```bash
cargo build --features napi
```

### Development

```bash
cargo build --features full
cargo test
```

## License

MIT
