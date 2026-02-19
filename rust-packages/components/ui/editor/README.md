# Editor Library

## Introduction

Text editor component for wterminal including editor, editor-ui, and editor-core. This library provides a full-featured text editing engine with syntax highlighting, LSP integration, and advanced editing capabilities for building IDE-like applications.

## Features

- ✏️ **Text Editing** - Full text editing capabilities
- 🎨 **Syntax Highlighting** - Support for multiple languages
- 🔌 **LSP Integration** - Language Server Protocol support
- 🧭 **Navigation** - Code navigation and search
- 🔍 **Search** - Find and replace functionality
- 📊 **Multiple Cursors** - Multi-cursor editing
- ⚡ **Fast** - Optimized for performance

## Goal

- 🎯 Provide full-featured text editing for wterminal IDE
- 🎨 Enable syntax highlighting for multiple languages
- 🔌 Integrate with LSP for advanced features
- ⚡ Deliver fast, responsive editing experience

## Design Principles

- ✏️ **Powerful** - Full editing capabilities
- 🎨 **Beautiful** - Syntax highlighting and themes
- 🔌 **Integrated** - LSP and tooling support
- ⚡ **Fast** - Minimal latency

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
editor = { path = "../editor" }
filesystem = { path = "../filesystem" }
```

## Usage

### Basic Editing

```rust
use editor::Editor;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let editor = Editor::new();
    
    // Open file
    editor.open_file("main.rs").await?;
    
    // Insert text
    editor.insert_text(0, 0, "fn main() {}")?;
    
    // Get content
    let content = editor.get_content();
    println!("Content: {}", content);
    
    Ok(())
}
```

## Examples

### Syntax Highlighting

```rust
use editor::{Editor, Language};

let editor = Editor::new();
editor.set_language(Language::Rust);

let highlighted = editor.get_highlighted_text()?;
```

## Text Editing

```rust
use editor::Editor;

let editor = Editor::new();

// Insert text
editor.insert_text(line, col, "text")?;

// Delete text
editor.delete_text(start_line, start_col, end_line, end_col)?;

// Replace text
editor.replace_text(start_line, start_col, end_line, end_col, "new text")?;
```

## Syntax Highlighting

```rust
use editor::{Editor, Language};

let editor = Editor::new();
editor.set_language(Language::Rust);

let highlighted = editor.get_highlighted_text()?;
```

## LSP Integration

```rust
use editor::Editor;

let editor = Editor::new();
editor.enable_lsp().await?;

// Get completions
let completions = editor.get_completions(line, col).await?;
```

## Search

```rust
use editor::Editor;

let editor = Editor::new();

// Find
let results = editor.find("pattern")?;

// Replace
let count = editor.replace_all("old", "new")?;
```

## Development

```bash
cargo build --features full
cargo test
```

## License

MIT
