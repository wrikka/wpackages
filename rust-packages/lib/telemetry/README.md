# Telemetry Library

## Introduction

The Telemetry Library is a comprehensive monitoring and observability solution designed for the WAI ecosystem. It provides structured logging, error tracking, and performance monitoring capabilities that enable developers to gain deep insights into application behavior. Built with production-grade reliability in mind, this library offers flexible configuration options and seamless integration with popular monitoring platforms.

The library supports multiple log formats (JSON and Pretty), file logging with rotation, and optional Sentry integration for advanced error tracking and performance monitoring. It's ideal for applications requiring comprehensive observability with minimal setup and maximum flexibility.

## Features

- 📊 **Structured Logging** - Structured logging with `tracing`
- 📝 **Multiple Formats** - JSON and Pretty log formats
- 📁 **File Logging** - File logging with rotation
- 🔍 **Error Tracking** - Sentry integration for error tracking (optional)
- ⚙️ **Environment-Based** - Environment-based configuration
- 🎨 **Clean API** - Intuitive interface for telemetry setup
- 🔒 **Type Safety** - Generic interface for any application
- 📈 **Performance Monitoring** - Built-in performance tracking
- 🧪 **Well-Tested** - Comprehensive unit tests
- 🌐 **Integration** - Works with WAI ecosystem

## Goals

- 🎯 Provide comprehensive telemetry for WAI ecosystem
- 📊 Enable structured logging with multiple formats
- 📁 Support file logging with rotation
- 🔍 Enable error tracking with Sentry integration
- ⚙️ Provide environment-based configuration
- 🎨 Offer clean, intuitive API design
- 🔒 Ensure type safety and memory safety
- 📈 Enable performance monitoring
- 🌐 Seamless integration with ecosystem
- 🧩 Enable modular and reusable components

## Design Principles

- 📊 **Structured** - Structured logging for better analysis
- 📝 **Flexible** - Multiple log formats and outputs
- 📁 **Persistent** - File logging with rotation
- 🔍 **Observable** - Track errors and performance
- ⚙️ **Configurable** - Environment-based configuration
- 🎨 **Simplicity** - Clean, intuitive API
- 🔒 **Type Safety** - Leverage Rust's type system
- 📈 **Performance** - Minimal overhead
- 🧩 **Modularity** - Independent and reusable
- 🌐 **Integration** - Works with ecosystem

## Installation

<details>
<summary>As a Rust Dependency</summary>

Add to your `Cargo.toml`:

```toml
[dependencies]
telemetry = { path = "../telemetry" }

# Optional: Enable Sentry integration
telemetry = { path = "../telemetry", features = ["sentry"] }
```

</details>

<details>
<summary>From Source</summary>

```bash
# Clone the repository
git clone https://github.com/your-org/wterminal.git
cd wterminal/rust-packages/foundation/telemetry

# Build the library
cargo build --release

# Run tests
cargo test
```

</details>

## Usage

### Basic Usage

```rust
use telemetry::{init_telemetry, TelemetryConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = TelemetryConfig {
        service_name: "my-service".to_string(),
        environment: "production".to_string(),
        log_level: "info".to_string(),
        log_format: telemetry::LogFormat::Json,
        sentry: None,
    };

    init_telemetry(config)?;

    tracing::info!("Application started");
    tracing::error!("Something went wrong");

    Ok(())
}
```

### With Sentry

```rust
use telemetry::{init_telemetry, TelemetryConfig, SentryConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = TelemetryConfig {
        service_name: "my-service".to_string(),
        environment: "production".to_string(),
        log_level: "info".to_string(),
        log_format: telemetry::LogFormat::Json,
        sentry: Some(SentryConfig {
            dsn: std::env::var("SENTRY_DSN")?,
            sample_rate: 1.0,
            traces_sample_rate: 0.1,
        }),
    };

    init_telemetry(config)?;

    Ok(())
}
```

### File Logging

```rust
use telemetry::init_file_logging;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (_guard, log_path) = init_file_logging("my-app")?;

    tracing::info!("Logs will be written to: {}", log_path);

    Ok(())
}
```

## Examples

### Example 1: Basic Telemetry Setup

```rust
use telemetry::{init_telemetry, TelemetryConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = TelemetryConfig {
        service_name: "my-service".to_string(),
        environment: "production".to_string(),
        log_level: "info".to_string(),
        log_format: telemetry::LogFormat::Json,
        sentry: None,
    };

    init_telemetry(config)?;

    tracing::info!("Application started");
    tracing::error!("Something went wrong");

    Ok(())
}
```

### Example 2: Sentry Integration

```rust
use telemetry::{init_telemetry, TelemetryConfig, SentryConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = TelemetryConfig {
        service_name: "my-service".to_string(),
        environment: "production".to_string(),
        log_level: "info".to_string(),
        log_format: telemetry::LogFormat::Json,
        sentry: Some(SentryConfig {
            dsn: std::env::var("SENTRY_DSN")?,
            sample_rate: 1.0,
            traces_sample_rate: 0.1,
        }),
    };

    init_telemetry(config)?;

    Ok(())
}
```

### Example 3: File Logging

```rust
use telemetry::init_file_logging;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (_guard, log_path) = init_file_logging("my-app")?;

    tracing::info!("Logs will be written to: {}", log_path);

    Ok(())
}
```

### Example 4: Environment Configuration

```rust
use telemetry::{init_telemetry, TelemetryConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = TelemetryConfig {
        service_name: "my-service".to_string(),
        environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
        log_level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
        log_format: telemetry::LogFormat::Json,
        sentry: None,
    };

    init_telemetry(config)?;

    Ok(())
}
```

## Configuration

### Environment Variables

- `ENVIRONMENT` - Application environment (default: `development`)
- `LOG_LEVEL` - Log level (default: `info`)
- `SENTRY_DSN` - Sentry DSN for error tracking
- `SENTRY_SAMPLE_RATE` - Sentry error sample rate (default: `1.0`)
- `SENTRY_TRACES_SAMPLE_RATE` - Sentry traces sample rate (default: `0.1`)

### Log Levels

- `trace`
- `debug`
- `info` (default)
- `warn`
- `error`

## Features

### Default

- Structured logging
- Environment-based configuration
- Pretty log format in development

### Sentry (optional)

- Error tracking with Sentry
- Performance monitoring
- Release tracking

Enable with:

```toml
telemetry = { path = "../telemetry", features = ["sentry"] }
```

## License

MIT
