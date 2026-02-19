# Config Library

## Introduction

The Config Library is a comprehensive configuration management suite designed for the wterminal IDE ecosystem. It provides powerful tools for managing application configuration with support for multiple formats, hot reloading, and validation. Built with flexibility and developer experience in mind, this library enables developers to manage configuration across different environments without application restarts.

The library supports TOML, JSON, and environment variable formats, provides hot reload capabilities for seamless configuration updates, and includes comprehensive validation to ensure configuration correctness. It's ideal for applications requiring dynamic configuration management with profile support and environment-specific settings.

## Features

- ⚙️ **Configuration Management** - Manage application configuration easily
- 📝 **Multiple Formats** - Support for TOML, JSON, and ENV formats
- 🔄 **Hot Reload** - Reload configuration without application restart
- ✅ **Validation** - Comprehensive configuration validation
- 👤 **Profile Management** - Multiple configuration profiles support
- ⚡ **High Performance** - Optimized for fast configuration loading
- 🎨 **Clean API** - Intuitive interface for configuration access
- 🔒 **Type Safety** - Generic interface for any configuration type
- 📊 **Observability** - Track configuration changes
- 🧪 **Well-Tested** - Comprehensive unit tests

## Goals

- 🎯 Provide comprehensive configuration management for wterminal IDE
- 📝 Support multiple configuration formats (TOML, JSON, ENV)
- 🔄 Enable hot reload without application restart
- ✅ Ensure configuration correctness with validation
- 👤 Support multiple configuration profiles
- ⚡ Maintain high performance for configuration loading
- 🎨 Provide clean, intuitive API design
- 🔒 Ensure type safety and memory safety
- 📊 Enable comprehensive observability
- 🌐 Seamless integration with application lifecycle

## Design Principles

- ⚙️ **Flexibility** - Support multiple formats and sources
- 🔄 **Dynamic** - Hot reload without restart
- ✅ **Validation** - Ensure configuration correctness
- 🎨 **Simplicity** - Clean, intuitive API
- ⚡ **Performance** - Fast configuration loading
- 🔒 **Type Safety** - Leverage Rust's type system
- 📊 **Observability** - Track configuration changes
- 🧩 **Modularity** - Independent and reusable components
- 🛡️ **Robustness** - Comprehensive error handling
- 🌐 **Integration** - Works with application lifecycle

## Installation

<details>
<summary>As a Rust Dependency</summary>

Add this to your `Cargo.toml`:

```toml
[dependencies]
config = { path = "../config" }
```

</details>

<details>
<summary>From Source</summary>

```bash
# Clone the repository
git clone https://github.com/your-org/wterminal.git
cd wterminal/rust-packages/foundation/config

# Build the library
cargo build --release

# Run tests
cargo test
```

</details>

## Usage

### Basic Configuration Loading

```rust
use config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::load("config.toml")?;

    let value: String = config.get("app.name")?;
    println!("App name: {}", value);

    Ok(())
}
```

### Loading from Different Sources

```rust
use config::Config;

// Load from file
let config = Config::load("config.toml")?;

// Load from environment
let config = Config::from_env()?;

// Load with defaults
let config = Config::with_defaults("config.toml")?;
```

### Profile Management

```rust
use config::Config;

let config = Config::load_profile("development")?;
```

### Hot Reload

```rust
use config::Config;

let mut config = Config::load("config.toml")?;

config.enable_hot_reload()?;

config.on_change(|new_config| {
    println!("Config changed!");
});
```

### Validation

```rust
use config::Config;

let config = Config::load("config.toml")?;

config.validate()?;
```

## Examples

### Example 1: Basic Configuration

```rust
use config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::load("config.toml")?;

    let value: String = config.get("app.name")?;
    println!("App name: {}", value);

    Ok(())
}
```

### Example 2: Profile-Based Configuration

```rust
use config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::load_profile("development")?;

    let database_url: String = config.get("database.url")?;
    println!("Database: {}", database_url);

    Ok(())
}
```

### Example 3: Hot Reload

```rust
use config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut config = Config::load("config.toml")?;

    config.enable_hot_reload()?;

    config.on_change(|new_config| {
        println!("Configuration updated!");
    });

    Ok(())
}
```

### Example 4: Configuration Validation

```rust
use config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::load("config.toml")?;

    config.validate()?;

    println!("Configuration is valid!");

    Ok(())
}
```

## License

MIT
