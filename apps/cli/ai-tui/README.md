# AI TUI 🖥️

## Introduction

A modern AI-powered Terminal User Interface (TUI) application built with Rust. This application provides a rich terminal user interface experience using the ratatui framework, enabling developers to create beautiful, cross-platform terminal applications with native performance. Built with async support, configuration management, and AI capabilities, it offers a powerful foundation for building intelligent terminal applications.

The application leverages modern Rust libraries including ratatui for UI rendering, tokio for async operations, and figment for configuration management. It includes AI integration, text input handling, code structure analysis, and comprehensive cross-platform support via crossterm, making it ideal for developers looking to create sophisticated AI-powered terminal-based applications with Rust.

## Features

- 🖥️ **AI TUI Framework** - Built with ratatui for rich terminal UI with AI integration
- 🤖 **AI Integration** - Built-in AI completion and chat capabilities
- 🌐 **Cross-Platform** - Works on Linux, macOS, and Windows via crossterm
- 📝 **Text Input** - Enhanced text editing with tui-textarea
- 🧠 **Code Understanding** - Includes parsers for analyzing code structure
- ⚡ **Async Support** - Built on tokio for async operations
- ⚙️ **Configuration** - Uses figment for flexible configuration
- 🎨 **Modern UI** - Beautiful, responsive terminal interface
- 🔒 **Type Safety** - Full Rust type safety throughout
- 📊 **Observability** - Built-in logging and monitoring

## Goals

- 🎯 Provide a modern AI-powered TUI framework for Rust developers
- 🤖 Enable intelligent terminal applications with AI integration
- 🖥️ Enable cross-platform terminal applications
- 📝 Offer rich text input and editing capabilities
- 🧠 Enable code understanding and analysis
- ⚡ Support async operations for responsive UI
- ⚙️ Provide flexible configuration management
- 🎨 Create beautiful, responsive terminal interfaces
- 🔒 Ensure type safety and memory safety
- 📊 Enable comprehensive observability
- 🌐 Build a foundation for modern AI-powered TUI applications

## Design Principles

- 🖥️ **Terminal-First** - Designed for terminal environments
- 🎨 **Modern UI** - Beautiful, responsive interface design
- ⚡ **Performance** - Optimized for fast rendering
- 🔒 **Type Safety** - Leverage Rust's type system
- ⚙️ **Configurable** - Flexible configuration options
- 📊 **Observable** - Built-in logging and monitoring
- 🧩 **Modular** - Independent and reusable components
- 🌐 **Cross-Platform** - Works everywhere
- 🛡️ **Secure** - Safe and reliable operations

## Installation

<details>
<summary>Prerequisites</summary>

- Rust 1.85 or higher
- Bun (for package management)

</details>

<details>
<summary>Build</summary>

```bash
bun --cwd apps/ai-tui run build
```

</details>

<details>
<summary>Run</summary>

```bash
bun --cwd apps/ai-tui run dev
```

</details>

<details>
<summary>Test</summary>

```bash
bun --cwd apps/ai-tui run test
```

</details>

## Usage

### Development Mode

```bash
bun --cwd apps/ai-tui run dev
```

### Production Build

```bash
bun --cwd apps/ai-tui run build
```

### Testing

```bash
bun --cwd apps/ai-tui run test
```

## Examples

### Basic TUI Application

```rust
use ai_tui::app::TuiApp;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut app = TuiApp::new().await?;
    app.run()?;
    Ok(())
}
```

### Using AI Service

```rust
use ai_tui::services::TuiAiService;

let ai_service = TuiAiService::new().await?;
let response = ai_service.complete("Explain Rust ownership").await?;
```

### File Explorer

```rust
use ai_tui::components::ui::file_explorer::FileExplorer;

let current_dir = std::env::current_dir()?;
let file_explorer = FileExplorer::new(current_dir);
```

### Git Integration

```rust
use ai_tui::services::git_service::GitServiceWrapper;

let git_service = GitServiceWrapper::new();
let commits = git_service.get_commit_history(10)?;
```

## Project Structure

- `src/` - Main source code
- `tests/` - Integration tests
- `Config.toml` - Application configuration

## License

MIT
