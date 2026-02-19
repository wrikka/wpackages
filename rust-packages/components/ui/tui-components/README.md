# TUI Components

## Introduction

Reusable TUI components built with ratatui for Rust terminal applications. This library provides a comprehensive set of pre-built terminal UI components including command palette, file explorer, chat panel, and theme system.

## Features

- **Command Palette**: Fuzzy search with categories and history
- **File Explorer**: Navigation with breadcrumbs and search
- **Chat Panel**: Syntax highlighting with timestamps
- **Theme System**: Customizable themes
- **Status Bar**: Status display with mode indicator
- **Plan Panel**: Execution plan display with approval workflow

## Goals

- 🎯 Provide reusable TUI components for wterminal IDE
- 🖥️ Enable beautiful terminal interfaces
- 🎨 Support theming and customization
- ⚡ Deliver fast rendering

## Design Principles

- 🖥️ **Terminal-first** - Optimized for terminal UI
- 🎨 **Beautiful** - Modern, clean design
- ⚡ **Fast** - Efficient rendering
- 🔧 **Flexible** - Easy customization

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
tui-components = { path = "../tui-components" }
```

## Usage

### Command Palette

```rust
use tui_components::command_palette::CommandPalette;

let mut palette = CommandPalette::new();
palette.show();
palette.render(frame, area);
```

## Examples

### File Explorer

```rust
use tui_components::file_explorer::FileExplorer;

let mut explorer = FileExplorer::new(std::path::PathBuf::from("."));
explorer.render(frame, area);
```

### Chat Panel

```rust
use tui_components::chat_panel::{ChatPanel, ChatMessage, MessageRole};

let mut chat = ChatPanel::new();
chat.add_message(ChatMessage {
    role: MessageRole::User,
    content: "Hello".to_string(),
    timestamp: chrono::Utc::now(),
});
chat.render(frame, area);
```

### Theme System

```rust
use tui_components::theme::Theme;

let theme = Theme::default();
// or customize
let theme = Theme::custom(/* ... */);
```

## Architecture

```
src/
├── command_palette/  # Command palette with fuzzy search
├── file_explorer/     # File navigation widget
├── chat_panel/        # Chat with syntax highlighting
├── theme/             # Theme system
├── status_bar/        # Status display
├── plan_panel/        # Execution plan display
├── error.rs           # Error types
└── lib.rs             # Public API
```

## Dependencies

- `ratatui` - TUI framework
- `crossterm` - Cross-platform terminal handling
- `tui-textarea` - Text input widget
- `tokio` - Async runtime
- `chrono` - Date and time
- `thiserror` - Error handling

## License

MIT
