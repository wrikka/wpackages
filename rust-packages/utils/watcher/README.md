# Watcher 🚀

A fast, cross-platform, asynchronous filesystem watcher for Rust. It provides a unified interface to monitor files and directories for changes, automatically selecting the most efficient backend for your operating system.

## Features ✨

- **Cross-Platform**: Native support for Linux (inotify), macOS (FSEvents), and Windows (ReadDirectoryChangesW).
- **Asynchronous**: Built on top of `tokio` for high-performance, non-blocking I/O.
- **Smart Backends**: Automatically selects the best native backend or falls back to polling if necessary.
- **Advanced Filtering**: Support for include/exclude patterns and respecting VCS ignore files (e.g., `.gitignore`).
- **Event Debouncing**: Built-in support for debouncing and aggregating rapid filesystem events.
- **Task Runner**: Trigger shell commands or HTTP requests automatically when files change.
- **Configurable**: Easily configured via TOML files or programmatically.

## Installation 📦

Add this to your `Cargo.toml`:

```toml
[dependencies]
watcher = { path = "../../rust-packages/watcher" }
tokio = { version = "1", features = ["full"] }
```

## Usage 🛠️

### Library Example

```rust
use watcher::{Watcher, Config, Event};
use tokio::sync::mpsc;
use std::path::Path;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 1. Create a communication channel
    let (tx, mut rx) = mpsc::channel(100);

    // 2. Initialize watcher with default configuration
    let config = Config::default();
    let mut watcher = Watcher::new(config, tx)?;

    // 3. Add paths to watch
    watcher.add_path(Path::new("./src"))?;

    // 4. Start watching in a separate task
    tokio::spawn(async move {
        if let Err(e) = watcher.watch().await {
            eprintln!("Watcher error: {}", e);
        }
    });

    println!("Watching for changes in ./src...");

    // 5. Handle events
    while let Some(result) = rx.recv().await {
        match result {
            Ok(event) => println!("Detected change: {:?}", event),
            Err(e) => eprintln!("Error: {}", e),
        }
    }

    Ok(())
}
```

### CLI Usage

The `watcher` package includes a CLI tool for monitoring directories and executing actions.

#### Install CLI
```bash
cargo install --path . --features cli
```

#### Run CLI
```bash
# Watch current directory
watcher-cli .

# Watch multiple paths with verbose logging
watcher-cli ./src ./docs -vv

# Use a custom configuration file
watcher-cli . --config watcher.toml
```

## Configuration ⚙️

You can customize the watcher behavior using a `watcher.toml` file:

```toml
# Backend selection: "Automatic", "Native", or "Polling"
backend = "Automatic"

# Watcher behavior
follow_symlinks = true
watch_metadata = true

[debouncing]
timeout = { secs = 0, nanos = 500000000 } # 500ms
aggregate = true

[filtering]
include = ["*.rs", "*.toml"]
exclude = ["target/**", ".git/**"]
ignore_vcs = true

[polling]
interval = { secs = 1, nanos = 0 }
compare_contents = false

# Automatic Actions
[[actions]]
type = "Command"
command = "cargo"
args = ["test"]
working_dir = "."

[[actions]]
type = "Http"
url = "https://hooks.example.com/rebuild"
method = "POST"
headers = { "Authorization" = "Bearer secret-token" }
```

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
