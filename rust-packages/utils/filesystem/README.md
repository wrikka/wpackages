# Filesystem Utilities

Comprehensive Rust library for filesystem operations, navigation, and search capabilities in WAI applications.

## Features

- **📁 File Operations**: Read, write, delete, copy, and move files with proper error handling
- **🧭 Navigation**: Intuitive filesystem navigation with path resolution and directory traversal
- **🔍 Search**: Powerful file and content search with pattern matching and filtering
- **👀 File Watching**: Real-time file system monitoring with event streaming
- **🔌 LSP Integration**: Language Server Protocol support for IDE integration
- **⚡ High Performance**: Optimized for large file operations and recursive searches
- **🛡️ Type Safety**: Comprehensive error handling with UTF-8 path support
- **🔧 Async Support**: Full async/await support for non-blocking operations

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
filesystem = { path = "../utils/filesystem" }
```

## Quick Start

```rust
use filesystem::prelude::*;

#[tokio::main]
async fn main() -> FsResult<()> {
    // Create filesystem client
    let fs = FileSystem::new();
    
    // Read a file
    let content = fs.read_file("README.md").await?;
    println!("File content: {}", content);
    
    // List directory
    let files = fs.list_directory(".").await?;
    for file in files {
        println!("Found: {}", file.path());
    }
    
    // Search for files
    let rust_files = fs.search("*.rs").await?;
    println!("Found {} Rust files", rust_files.len());
    
    Ok(())
}
```

## Core Components

### FileSystem

Main interface for all filesystem operations:

```rust
pub struct FileSystem {
    config: FilesystemConfig,
}

impl FileSystem {
    pub fn new() -> Self;
    pub fn with_config(config: FilesystemConfig) -> Self;
    
    // File operations
    pub async fn read_file(&self, path: impl AsRef<Utf8Path>) -> FsResult<String>;
    pub async fn write_file(&self, path: impl AsRef<Utf8Path>, content: String) -> FsResult<()>;
    pub async fn delete_file(&self, path: impl AsRef<Utf8Path>) -> FsResult<()>;
    
    // Directory operations
    pub async fn list_directory(&self, path: impl AsRef<Utf8Path>) -> FsResult<Vec<FileNode>>;
    pub async fn create_directory(&self, path: impl AsRef<Utf8Path>) -> FsResult<()>;
    
    // Search operations
    pub async fn search(&self, pattern: &str) -> FsResult<Vec<FileNode>>;
    pub async fn search_content(&self, query: &str) -> FsResult<Vec<SearchResult>>;
}
```

### Navigation

```rust
use filesystem::navigation::*;

let navigator = Navigator::new("/path/to/project");

// Navigate to parent
navigator.cd("..").await?;

// Get current directory
let current = navigator.pwd().await?;

// List directory contents
let contents = navigator.ls().await?;
```

### Search

```rust
use filesystem::search::*;

let searcher = Searcher::new();

// Search by pattern
let files = searcher
    .pattern("*.rs")
    .case_sensitive(false)
    .recursive(true)
    .execute("/path/to/search")
    .await?;

// Search by content
let results = searcher
    .content("TODO")
    .file_types(&["rs", "ts"])
    .execute("/path/to/search")
    .await?;
```

### File Watching

```rust
use filesystem::watcher::*;

let watcher = Watcher::new()?;

watcher
    .watch("/path/to/watch", |event| {
        match event {
            WatchEvent::FileCreated(path) => println!("Created: {}", path),
            WatchEvent::FileModified(path) => println!("Modified: {}", path),
            WatchEvent::FileDeleted(path) => println!("Deleted: {}", path),
        }
    })
    .await?;
```

## Usage Examples

### Basic File Operations

```rust
use filesystem::prelude::*;

let fs = FileSystem::new();

// Read file
let content = fs.read_file("src/main.rs").await?;

// Write file
fs.write_file("output.txt", "Hello, World!").await?;

// Copy file
fs.copy_file("source.txt", "destination.txt").await?;

// Move file
fs.move_file("old_location.txt", "new_location.txt").await?;

// Delete file
fs.delete_file("temporary.txt").await?;
```

### Directory Navigation

```rust
use filesystem::prelude::*;

let fs = FileSystem::new();

// Change directory
fs.change_directory("/path/to/directory").await?;

// Get current directory
let current = fs.current_directory().await?;

// List directory contents
let contents = fs.list_directory(".").await?;

// Create directory
fs.create_directory("new_folder").await?;
```

### Advanced Search

```rust
use filesystem::prelude::*;

let fs = FileSystem::new();

// Search with multiple criteria
let results = fs.search(SearchQuery::new()
    .pattern("*.rs")
    .content("async")
    .case_sensitive(false)
    .max_depth(5)
    .exclude_patterns(&["target", "node_modules"])
).await?;

for result in results {
    println!("Found: {} at line {}", result.path(), result.line_number());
}
```

### File Watching with Filters

```rust
use filesystem::prelude::*;

let fs = FileSystem::new();

let watcher = fs.watcher()?;

watcher
    .add_path("/src", |event| {
        match event.kind {
            EventKind::Create => println!("Created: {:?}", event.paths),
            EventKind::Modify => println!("Modified: {:?}", event.paths),
            EventKind::Delete => println!("Deleted: {:?}", event.paths),
        }
    })
    .with_filter(|event| {
        // Only watch Rust files
        event.paths.iter().any(|p| p.extension() == Some("rs"))
    })
    .await?;
```

### Path Operations

```rust
use filesystem::prelude::*;
use camino::Utf8Path;

let path = Utf8Path::new("/path/to/file.rs");

// Get file information
let info = fs.file_info(path).await?;
println!("File size: {} bytes", info.size());
println!("Is directory: {}", info.is_directory());
println!("Extension: {}", path.extension().unwrap_or(""));

// Path manipulation
let parent = path.parent().unwrap();
let absolute = path.absolute().unwrap();
let normalized = path.normalize();
```

## Configuration

### FilesystemConfig

```rust
pub struct FilesystemConfig {
    pub enable_watching: bool,
    pub watch_debounce: Duration,
    pub search_case_sensitive: bool,
    pub max_search_results: usize,
    pub exclude_patterns: Vec<String>,
}
```

### Environment Variables

```env
# Default search case sensitivity
FILESYSTEM_CASE_SENSITIVE=false

# Maximum search depth
FILESYSTEM_MAX_DEPTH=10

# File watching debounce (ms)
FILESYSTEM_WATCH_DEBOUNCE=100

# Exclude patterns (comma-separated)
FILESYSTEM_EXCLUDE=target,node_modules,.git
```

## Error Handling

Comprehensive error types with `thiserror`:

```rust
#[derive(Error, Debug)]
pub enum FsError {
    #[error("I/O error for path: {path}")]
    Io {
        path: Utf8PathBuf,
        #[source]
        source: std::io::Error,
    },
    
    #[error("Not a directory: {0}")]
    NotADirectory(Utf8PathBuf),
    
    #[error("File not found: {path}")]
    NotFound {
        path: Utf8PathBuf,
    },
    
    #[error("Permission denied: {path}")]
    PermissionDenied {
        path: Utf8PathBuf,
    },
    
    #[error("Invalid UTF-8 in path: {path:?}")]
    InvalidUtf8 {
        path: std::path::PathBuf,
    },
}
```

## Performance Considerations

### Memory Efficiency

- Streaming operations for large files
- Lazy loading for directory listings
- Efficient pattern matching algorithms

### Concurrency

- Async/await throughout for non-blocking operations
- Thread-safe file watching with proper synchronization
- Lock-free path operations where possible

### Caching

- Intelligent caching for frequently accessed files
- Directory listing caching with TTL
- Search result caching with invalidation

## Testing

### Unit Tests

```bash
cargo test
```

### Integration Tests

```bash
cargo test --test filesystem_integration
```

### Property-Based Tests

```bash
cargo test --test filesystem_properties
```

## Architecture

```
src/
├── lib.rs                 # Main library entry point
├── error.rs               # Error types and handling
├── config.rs              # Configuration management
├── telemetry.rs           # Logging and tracing
├── prelude.rs             # Common imports
├── types/                 # Type definitions
│   ├── core.rs           # Core types (FileNode, FileKind)
│   └── mod.rs
├── operations/             # File operations
│   ├── read.rs           # File reading operations
│   ├── write.rs          # File writing operations
│   ├── dir.rs            # Directory operations
│   └── mod.rs
├── navigation/             # Navigation utilities
│   ├── client.rs         # Navigation client
│   ├── reference.rs      # Path references
│   └── mod.rs
├── search/                # Search functionality
│   ├── client.rs         # Search client
│   ├── matcher.rs        # Pattern matching
│   └── mod.rs
├── services/              # Business logic services
│   ├── watcher.rs       # File watching service
│   └── mod.rs
└── utils/                 # Utility functions
    ├── path_helpers.rs   # Path manipulation utilities
    └── mod.rs
```

## Integration Examples

### With LSP Server

```rust
use filesystem::prelude::*;

let fs = FileSystem::new();

// Provide file system operations to LSP
let workspace_root = fs.current_directory().await?;
let files = fs.search("**/*.rs").await?;

// Convert to LSP URIs
let uris: Vec<lsp_types::Url> = files
    .into_iter()
    .filter_map(|f| lsp_types::Url::from_file_path(&f.path()))
    .collect();
```

### With IDE Features

```rust
use filesystem::prelude::*;

let fs = FileSystem::new();

// File tree for IDE
let tree = fs.build_file_tree(".").await?;

// Symbol search
let symbols = fs.search_symbols("main").await?;

// Go to definition
let definition = fs.find_definition("my_function").await?;
```

## Best Practices

### Path Handling

- Always use `Utf8Path` for cross-platform compatibility
- Validate paths before operations
- Handle path canonicalization properly

### Error Handling

- Never use `unwrap()` on external operations
- Provide context in error messages
- Handle both synchronous and asynchronous errors

### Performance

- Use streaming for large file operations
- Implement proper cancellation for long-running operations
- Cache results of expensive operations

## Contributing

1. Follow Rust best practices and safety guidelines
2. Add comprehensive tests for new functionality
3. Ensure cross-platform compatibility
4. Document public APIs with examples
5. Run `cargo clippy` and `cargo fmt` before submitting

## License

MIT License - see LICENSE file for details.
