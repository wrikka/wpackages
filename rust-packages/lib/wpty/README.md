# wpty

PTY (pseudo-terminal) management library for wterminal IDE with cross-platform support.

## Introduction

wpty provides comprehensive pseudo-terminal management capabilities for wterminal IDE. It enables creation and management of PTY instances, handling terminal emulation, and providing bidirectional communication with child processes. This library is essential for implementing terminal-based features in the IDE.

## Features

- 🖥️ **PTY Management** - Create and manage pseudo-terminals
- 🔄 **Bidirectional Communication** - Full read/write support
- 🎨 **Terminal Emulation** - VTE-based terminal emulation
- 📊 **Event Handling** - Process events and terminal changes
- 🔧 **Configurable** - Flexible configuration options
- ⚡ **Fast** - Optimized for performance

## Goal

- 🎯 Provide reliable PTY management for wterminal IDE
- 🖥️ Enable terminal-based features
- 🔄 Support bidirectional communication
- 🎨 Handle terminal emulation properly

## Design Principles

- 🖥️ **Cross-platform** - Work on Windows, macOS, and Linux
- 🔄 **Reliable** - Ensure stable PTY operations
- 🎨 **Accurate** - Proper terminal emulation
- ⚡ **Efficient** - Minimal overhead

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
wpty = { path = "../wpty" }
```

## Usage

### Create a PTY

```rust
use wpty::{Pty, PtyConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = PtyConfig::builder()
        .shell("/bin/bash")
        .cols(80)
        .rows(24)
        .build();
    
    let pty = Pty::new(config).await?;
    
    // Write to PTY
    pty.write(b"echo 'Hello, World!'\n").await?;
    
    // Read from PTY
    let output = pty.read().await?;
    println!("Output: {}", String::from_utf8_lossy(&output));
    
    Ok(())
}
```

### Resize PTY

```rust
use wpty::Pty;

let pty = Pty::new(config).await?;

// Resize terminal
pty.resize(120, 30).await?;
```

### Handle Events

```rust
use wpty::Pty;

let pty = Pty::new(config).await?;

// Subscribe to events
let mut events = pty.events();

while let Some(event) = events.next().await {
    match event {
        PtyEvent::Output(data) => println!("Output: {}", data),
        PtyEvent::Exit(code) => println!("Exited with code: {}", code),
        PtyEvent::Resize(cols, rows) => println!("Resized to {}x{}", cols, rows),
    }
}
```

## Examples

### Interactive Shell

```rust
use wpty::{Pty, PtyConfig};

let config = PtyConfig::builder()
    .shell("/bin/bash")
    .cols(80)
    .rows(24)
    .build();

let pty = Pty::new(config).await?;

// Start interactive session
pty.write(b"ls -la\n").await?;
let output = pty.read().await?;
println!("{}", String::from_utf8_lossy(&output));
```

### Process Execution

```rust
use wpty::{Pty, PtyConfig};

let config = PtyConfig::builder()
    .command("python3")
    .args(vec!["script.py"])
    .build();

let pty = Pty::new(config).await?;

// Wait for completion
let exit_code = pty.wait().await?;
println!("Process exited with code: {}", exit_code);
```

### Terminal Emulation

```rust
use wpty::{Pty, PtyConfig};
use wpty::emulation::TerminalEmulator;

let config = PtyConfig::default();
let pty = Pty::new(config).await?;

let mut emulator = TerminalEmulator::new(80, 24);

// Process terminal output
let output = pty.read().await?;
emulator.process(&output)?;

// Get rendered content
let content = emulator.render();
println!("{}", content);
```

## License

MIT
