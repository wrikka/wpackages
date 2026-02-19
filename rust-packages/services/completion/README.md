# Completion Service

## Introduction

AI completion service for wterminal IDE with streaming support and caching. This service provides intelligent code suggestions and completions powered by various AI models, helping developers write code faster and with fewer errors.

## Features

- 💬 **Code Completion** - Context-aware code suggestions
- 🌊 **Streaming** - Real-time streaming responses
- 💾 **Caching** - Built-in response caching
- ⚡ **Fast** - Low-latency responses
- 🎯 **Multi-Model** - Support for multiple AI models
- 🔧 **Configurable** - Flexible configuration options

## Goal

- 🎯 Provide intelligent code completion for wterminal IDE
- ⚡ Deliver fast, context-aware suggestions
- 🌊 Enable real-time streaming completions
- 💾 Optimize performance with caching

## Design Principles

- 💬 **Context-aware** - Understand code context
- ⚡ **Fast** - Minimal latency
- 🌊 **Streaming-first** - Real-time responses
- 💾 **Efficient** - Smart caching strategies

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
completion = { path = "../completion" }
cache = { path = "../cache" }
```

## Usage

### Basic Completion

```rust
use completion::{CompletionService, CompletionRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = CompletionService::new();
    
    let request = CompletionRequest::builder()
        .prompt("function add(a, b) {")
        .language("javascript")
        .max_tokens(50)
        .build();
    
    let suggestions = service.complete(request).await?;
    
    for suggestion in suggestions {
        println!("Suggestion: {}", suggestion.text);
    }
    
    Ok(())
}
```

## Examples

### Streaming Completion

```rust
use completion::CompletionService;

let service = CompletionService::new();
let request = CompletionRequest::builder()
    .prompt("const arr = [1, 2, 3];")
    .language("javascript")
    .build();

let mut stream = service.complete_stream(request).await?;

while let Some(chunk) = stream.next().await {
    print!("{}", chunk.text);
}
```

## Streaming Completion

```rust
use completion::CompletionService;

let service = CompletionService::new();
let request = CompletionRequest::builder()
    .prompt("const arr = [1, 2, 3];")
    .language("javascript")
    .build();

let mut stream = service.complete_stream(request).await?;

while let Some(chunk) = stream.next().await {
    print!("{}", chunk.text);
}
```

## Configuration

```rust
use completion::{CompletionService, CompletionConfig};

let config = CompletionConfig::builder()
    .max_tokens(100)
    .temperature(0.7)
    .top_p(0.9)
    .enable_cache(true)
    .build();

let service = CompletionService::with_config(config);
```

## Development

```bash
cargo build
cargo test
```

## License

MIT
