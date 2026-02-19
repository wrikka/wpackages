# Extensions Library

## Introduction

Extension registry and API for wterminal with WASM support and hot reload. This library provides a comprehensive extension system that allows developers to extend wterminal IDE functionality using WebAssembly or native libraries, with features like hot reload and metrics collection.

## Features

- 📦 **Extension Registry** - Central registry for extensions
- 🔌 **WASM Support** - Run extensions in WebAssembly
- 🔄 **Hot Reload** - Reload extensions without restart
- 📊 **Metrics** - Built-in metrics collection
- 🔒 **Permission System** - Role-based access control
- ⚡ **Fast** - Optimized for performance

## Goal

- 🎯 Provide flexible extension system for wterminal IDE
- 🔌 Enable WASM-based extensions
- 🔄 Support hot reload for development
- 📊 Track extension performance

## Design Principles

- 📦 **Modular** - Easy to add and remove extensions
- 🔌 **Secure** - Permission-based access control
- 🔄 **Dynamic** - Hot reload support
- 📊 **Observable** - Metrics and monitoring

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
extensions = { path = "../extensions" }
```

## Usage

### Loading Extensions

```rust
use extensions::{ExtensionManager, ExtensionConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let manager = ExtensionManager::new();
    
    // Load extension
    let config = ExtensionConfig::builder()
        .path("./extensions/my-extension.wasm")
        .build();
    
    let extension = manager.load_extension(config).await?;
    
    // Call extension
    let result = extension.call("hello", &["world"]).await?;
    
    println!("Result: {:?}", result);
    
    Ok(())
}
```

## Examples

### Hot Reload

```rust
use extensions::ExtensionManager;

let manager = ExtensionManager::new();
manager.enable_hot_reload().await?;

// Extensions will automatically reload on file changes
```

## Loading Extensions

```rust
use extensions::ExtensionManager;

let manager = ExtensionManager::new();

// Load WASM extension
let extension = manager.load_extension_from_wasm("./extension.wasm").await?;

// Load native extension
let extension = manager.load_extension_from_library("./extension.so").await?;
```

## Hot Reload

```rust
use extensions::ExtensionManager;

let manager = ExtensionManager::new();
manager.enable_hot_reload().await?;

// Extensions will automatically reload on file changes
```

## Metrics

```rust
use extensions::ExtensionManager;

let manager = ExtensionManager::new();
manager.enable_metrics().await?;

let metrics = manager.get_metrics("my-extension").await?;
println!("Metrics: {:?}", metrics);
```

## Development

```bash
cargo build --features metrics
cargo test
```

## License

MIT
