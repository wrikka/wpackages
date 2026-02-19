# Context Library

## Introduction

The Context Library is a comprehensive project context analysis suite designed for the wterminal IDE ecosystem. It provides powerful tools for extracting project context, watching file changes, analyzing dependencies, and understanding code structure. Built with performance and real-time updates in mind, this library enables developers to maintain an up-to-date understanding of their projects.

The library offers intelligent file watching, dependency analysis, and code understanding capabilities, making it ideal for IDE features like IntelliSense, refactoring tools, and code analysis. It integrates seamlessly with other ecosystem components and provides a clean, intuitive API for easy integration.

## Features

- 📊 **Context Extraction** - Extract comprehensive project context
- 📁 **File Watching** - Watch for file changes with real-time updates
- 🔗 **Dependency Analysis** - Analyze project dependencies and relationships
- 💻 **Code Understanding** - Understand code structure and semantics
- ⚡ **High Performance** - Optimized for large projects
- 🔄 **Real-time** - Instant updates on file changes
- 🎨 **Clean API** - Intuitive interface for easy integration
- 📈 **Scalable** - Handles projects of any size
- 🔒 **Type Safety** - Generic interface for any project type
- 🧪 **Well-Tested** - Comprehensive unit tests

## Goals

- 🎯 Provide comprehensive project context analysis for wterminal IDE
- 📁 Enable real-time file watching with instant updates
- 🔗 Analyze project dependencies and relationships
- 💻 Understand code structure and semantics
- ⚡ Maintain high performance for large projects
- 🔄 Provide real-time updates on file changes
- 🎨 Offer clean, intuitive API design
- 📈 Scale to handle projects of any size
- 🔒 Ensure type safety and memory safety
- 🌐 Seamless integration with IDE components

## Design Principles

- ⚡ **Performance First** - Optimized for large projects
- 🔄 **Real-time** - Instant updates on changes
- 🎨 **Simplicity** - Clean, intuitive API
- 🔒 **Type Safety** - Leverage Rust's type system
- 📈 **Scalability** - Handle projects of any size
- 🧩 **Modularity** - Independent and reusable components
- 🛡️ **Robustness** - Comprehensive error handling
- 📊 **Observability** - Track analysis progress
- 🌐 **Integration** - Works with other ecosystem tools
- 🧪 **Testability** - Comprehensive test coverage

## Installation

<details>
<summary>As a Rust Dependency</summary>

Add this to your `Cargo.toml`:

```toml
[dependencies]
context = { path = "../context" }
```

</details>

<details>
<summary>From Source</summary>

```bash
# Clone the repository
git clone https://github.com/your-org/wterminal.git
cd wterminal/rust-packages/foundation/context

# Build the library
cargo build --release

# Run tests
cargo test
```

</details>

## Usage

### Basic Context Analysis

```rust
use context::ContextAnalyzer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let analyzer = ContextAnalyzer::new();

    let context = analyzer.analyze("./src").await?;

    println!("Files: {}", context.files.len());
    println!("Dependencies: {}", context.dependencies.len());

    Ok(())
}
```

### File Watching

```rust
use context::ContextAnalyzer;

let analyzer = ContextAnalyzer::new();
analyzer.watch("./src", |event| {
    println!("File changed: {:?}", event);
}).await?;
```

### Dependency Analysis

```rust
use context::ContextAnalyzer;

let analyzer = ContextAnalyzer::new();
let dependencies = analyzer.analyze_dependencies("./src").await?;
```

### Code Structure Analysis

```rust
use context::ContextAnalyzer;

let analyzer = ContextAnalyzer::new();
let structure = analyzer.analyze_structure("./src").await?;
```

## Examples

### Example 1: Basic Project Analysis

```rust
use context::ContextAnalyzer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let analyzer = ContextAnalyzer::new();

    let context = analyzer.analyze("./src").await?;

    println!("Files: {}", context.files.len());
    println!("Dependencies: {}", context.dependencies.len());

    Ok(())
}
```

### Example 2: Real-time File Watching

```rust
use context::ContextAnalyzer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let analyzer = ContextAnalyzer::new();

    analyzer.watch("./src", |event| {
        println!("File changed: {:?}", event);
    }).await?;

    Ok(())
}
```

### Example 3: Dependency Graph Analysis

```rust
use context::ContextAnalyzer;

let analyzer = ContextAnalyzer::new();
let dependencies = analyzer.analyze_dependencies("./src").await?;

for dep in dependencies {
    println!("{} depends on {}", dep.source, dep.target);
}
```

### Example 4: Code Structure Understanding

```rust
use context::ContextAnalyzer;

let analyzer = ContextAnalyzer::new();
let structure = analyzer.analyze_structure("./src").await?;

for module in structure.modules {
    println!("Module: {}", module.name);
    for function in module.functions {
        println!("  Function: {}", function.name);
    }
}
```

## License

MIT
