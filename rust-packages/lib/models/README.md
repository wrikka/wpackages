# AI Models Library

## Introduction

A unified, type-safe abstraction layer for working with multiple AI model providers in Rust. This library provides a consistent interface for interacting with various AI services including OpenAI, Anthropic, Ollama, Groq, and Mistral, enabling developers to easily switch between providers and implement advanced features like caching, retry logic, and fallback strategies.

## Features

- 🤖 **Multi-Provider Support** - OpenAI, Anthropic, Ollama, Groq, Mistral
- 💬 **Chat Completions** - Full support for chat-based interactions
- ✍️ **Text Completions** - Traditional text completion support
- 🔢 **Embeddings** - Generate embeddings for text
- 🌊 **Streaming** - Real-time streaming responses
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 🛡️ **Fallback** - Automatic failover to backup providers
- 💾 **Caching** - In-memory response caching with TTL
- 📊 **Strategy Pattern** - Load balancing and cost optimization
- 🎯 **Type-Safe** - Full Rust type safety with serde
- 🔍 **Observability** - Built-in tracing support

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
ai-models = { path = "../rust-packages/ai-models" }
```

## Quick Start

```rust
use ai_models::*;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize telemetry
    init_subscriber();
    
    // Create a default registry with auto-detected providers
    let registry = create_default_registry().await?;
    
    // Get the default chat provider
    let provider = registry.get_default_chat_provider().await?;
    
    // Create a chat request
    let request = ChatRequest::new("gpt-4", vec![
        Message::user("Hello, how are you?")
    ])
    .with_temperature(0.7)
    .with_max_tokens(100);
    
    // Send the request
    let response = provider.chat(request).await?;
    
    println!("Response: {}", response.choices[0].message.content);
    
    Ok(())
}
```

## Providers

### OpenAI

```rust
use ai_models::providers::*;

let openai = OpenAIProvider::new(
    OpenAIConfig::new("your-api-key")
        .with_base_url("https://api.openai.com/v1")
        .with_timeout(30)
);
```

### Anthropic

```rust
let anthropic = AnthropicProvider::new(
    AnthropicConfig::new("your-api-key")
        .with_base_url("https://api.anthropic.com/v1")
        .with_timeout(30)
);
```

### Ollama (Local)

```rust
let ollama = OllamaProvider::new(
    OllamaConfig::new("http://localhost:11434")
        .with_timeout(120)
);
```

### Groq

```rust
let groq = GroqProvider::new(
    GroqConfig::new("your-api-key")
        .with_base_url("https://api.groq.com/openai/v1")
        .with_timeout(30)
);
```

### Mistral

```rust
let mistral = MistralProvider::new(
    MistralConfig::new("your-api-key")
        .with_base_url("https://api.mistral.ai/v1")
        .with_timeout(30)
);
```

## Model Registry

The `ModelRegistry` allows you to manage multiple providers:

```rust
use ai_models::*;
use std::sync::Arc;

let registry = ModelRegistry::new();

// Register providers
let openai = Arc::new(OpenAIProvider::new(OpenAIConfig::new("api-key")));
registry.register_chat_provider("openai", openai.clone()).await;
registry.register_completion_provider("openai", openai.clone()).await;
registry.register_embeddings_provider("openai", openai).await;

// Set defaults
registry.set_default_chat_provider("openai").await?;

// Get providers
let provider = registry.get_chat_provider("openai").await.unwrap();
```

## Caching

Enable response caching to reduce API calls:

```rust
use ai_models::services::*;

let cache = ResponseCache::new(3600, 100); // 1 hour TTL, 100 MB max

// Check cache first
if let Some(cached) = cache.get_chat(&request).await {
    return Ok(cached);
}

// Make API call
let response = provider.chat(request.clone()).await?;

// Store in cache
cache.put_chat(&request, response.clone()).await?;

Ok(response)
```

## Retry Logic

Automatic retry with exponential backoff:

```rust
use ai_models::services::*;

let config = RetryConfig::new(3)
    .with_initial_delay(Duration::from_millis(1000))
    .with_max_delay(Duration::from_secs(10))
    .with_backoff_multiplier(2.0);

let response = retry_with_backoff(&config, || {
    provider.chat(request.clone())
}).await?;
```

## Fallback

Automatic failover to backup providers:

```rust
use ai_models::services::*;

let fallback = FallbackManager::new(FallbackConfig::default())
    .with_enabled(true)
    .with_max_attempts(3);

let providers = vec![
    Arc::new(OpenAIProvider::new(OpenAIConfig::new("key1"))),
    Arc::new(AnthropicProvider::new(AnthropicConfig::new("key2"))),
];

let response = fallback.chat_with_fallback(
    providers,
    request,
    || async { request.clone() }
).await?;
```

## Strategy Pattern

Load balancing and cost optimization:

```rust
use ai_models::services::*;

let config = StrategyConfig::new(StrategyType::RoundRobin)
    .with_weight("openai", 0.7)
    .with_weight("anthropic", 0.3);

let manager = StrategyManager::new(config);
let provider = manager.select_provider(&providers)?;
```

## Streaming

Stream responses in real-time:

```rust
let request = ChatRequest::new("gpt-4", messages)
    .with_stream(true);

let mut stream = provider.chat_stream(request).await?;

while let Some(chunk) = stream.next().await {
    let chunk = chunk?;
    if let Some(content) = chunk.choices[0].delta.content {
        print!("{}", content);
    }
}
```

## Configuration

Create a `Config.toml`:

```toml
[providers.openai]
provider_type = "openai"
api_key = "your-api-key"
base_url = "https://api.openai.com/v1"
timeout_seconds = 30
max_retries = 3
enabled = true

[cache]
enabled = true
ttl_seconds = 3600
max_size_mb = 100
persistent = false

[retry]
max_attempts = 3
initial_delay_ms = 1000
max_delay_ms = 10000
backoff_multiplier = 2.0

[strategy]
strategy_type = "round_robin"
fallback_enabled = true
fallback_providers = ["anthropic", "ollama"]
```

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GROQ_API_KEY` - Groq API key
- `MISTRAL_API_KEY` - Mistral API key
- `RUST_LOG` - Log level (e.g., `info`, `debug`)

## Architecture

```
src/
├── traits.rs          # Core provider traits
├── types.rs           # Shared types (Message, Request, Response)
├── error.rs           # Error types
├── config.rs          # Configuration structures
├── telemetry.rs       # Logging setup
├── registry.rs        # Model registry
├── providers/         # Provider implementations
│   ├── openai.rs
│   ├── anthropic.rs
│   ├── ollama.rs
│   ├── groq.rs
│   └── mistral.rs
└── services/          # Supporting services
    ├── cache.rs       # Response caching
    ├── retry.rs       # Retry logic
    ├── fallback.rs    # Fallback mechanism
    └── strategy.rs    # Selection strategies
```

## Testing

Run tests:

```bash
cargo test -p ai-models
```

Run with nextest:

```bash
cargo nextest run -p ai-models
```

## License

MIT
