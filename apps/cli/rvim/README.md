# rvim - Modern Terminal-Based Text Editor

rvim is a modern terminal-based text editor written in Rust, designed to be a better alternative to Helix with advanced and modern features.

## Quickstart

Install dependencies from the monorepo root:

```bash
bun install
```

Run in development mode:

```bash
bun --cwd apps/rvim run dev
```

Build / Test:

```bash
bun --cwd apps/rvim run build
bun --cwd apps/rvim run test
```

## Features

### Core Features
- **Modal Editing** - Normal, Insert, Select, Command modes
- **Command Palette** - Easily find and execute commands
- **File Explorer** - Conveniently select and open files
- **Configuration** - Flexible configuration with Config.toml

### Advanced Features
- **Tree-sitter Integration** - Syntax highlighting ที่ accurate และ fast
- **LSP Support** - Code intelligence (completion, diagnostics, hover, go-to-definition)
- **Multiple Selections** - Kakoune-style multiple selections
- **Syntax-aware Motions** - Smart textobjects and motions
- **Surround Feature** - Edit pairs of characters (quotes, brackets, tags)
- **Plugin System** - Extensible architecture สำหรับ custom features

### Developer Workflow
- **Git Integration** - Git commands แบบ built-in (commit, push, pull, status, branch, stash, checkout, merge, rebase)
- **Build/Test Integration** - Commands สำหรับ Run, Build, Test
- **Async Architecture** - ใช้ tokio ทำให้ responsive และ scalable
- **Observability** - tracing system สำหรับ debugging

### Theme System
- **Beautiful Themes** - Dark, Light, Nord, Dracula, Gruvbox
- **Syntax Highlighting** - Tree-sitter-based syntax highlighting
- **Customizable** - ปรับแต่ง theme ได้

## Installation

```bash
cargo install rvim
```

## Usage

### Basic Usage
```bash
rvim [FILE]
```

### Keybindings

#### Mode Switching
- `Esc` - Switch to Normal mode
- `i` - Switch to Insert mode
- `:` - Switch to Command mode

#### Movement
- `h`, `j`, `k`, `l` - Move left, down, up, right
- `w` - Move word forward
- `b` - Move word backward
- `0` - Move to line start
- `$` - Move to line end
- `gg` - Move to file start
- `G` - Move to file end

#### Editing
- `x` - Delete character
- `dd` - Delete line
- `yy` - Yank line
- `p` - Paste
- `u` - Undo
- `Ctrl+r` - Redo

#### Multiple Selections
- `sw` - Select word
- `sa` - Select all occurrences
- `sl` - Select line
- `se` - Expand selection
- `ss` - Shrink selection
- `sc` - Clear selections

#### Text Objects
- `tow` - Text object: word
- `tol` - Text object: line
- `tob` - Text object: block
- `tof` - Text object: function
- `toc` - Text object: class

#### Surround
- `as` - Add surround
- `cs` - Change surround
- `ds` - Delete surround

#### LSP
- `gd` - Go to definition
- `gh` - Get hover info
- `gc` - Get completions
- `gd` - Get diagnostics

#### Git
- `gc` - Git commit
- `gp` - Git push
- `gl` - Git pull
- `gs` - Git status
- `gb` - Git branch
- `gst` - Git stash
- `gco` - Git checkout
- `gm` - Git merge
- `gr` - Git rebase

#### Build/Test
- `F5` - Run
- `F6` - Build
- `F7` - Test

#### Other
- `Ctrl+S` - Save
- `Ctrl+Q` - Quit
- `Ctrl+O` - Open file
- `Ctrl+N` - New file
- `/` - Find
- `:` - Replace
- `Alt+F` - Format
- `nu` - Toggle line numbers
- `nw` - Toggle word wrap
- `ns` - Toggle syntax
- `th` - Theme
- `?` - Help

## Configuration

rvim uses `Config.toml` for configuration:

```toml
[editor]
theme = "dark"
font_size = 14
line_numbers = true
syntax_highlighting = true

[terminal]
default_shell = "powershell"

[keybindings]
save = "Ctrl+S"
quit = "Ctrl+Q"
open_file = "Ctrl+O"
new_file = "Ctrl+N"
```

## Plugin System

rvim has a flexible plugin system for adding custom features:

### Plugin Manifest
```toml
name = "my-plugin"
version = "0.1.0"
description = "My custom plugin"
author = "Your Name"
entry_point = "plugin.wasm"
dependencies = []
```

### Plugin Events
- `EditorReady`
- `FileOpened`
- `FileSaved`
- `FileClosed`
- `CursorMoved`
- `ModeChanged`
- `CommandExecuted`

### Loading Plugins
```rust
let mut plugin_system = PluginSystem::new();
plugin_system.load_plugin(path)?;
```

## Theme System

rvim has a beautiful and customizable theme system:

### Available Themes
- `dark` - Dark theme
- `light` - Light theme
- `nord` - Nord theme
- `dracula` - Dracula theme
- `gruvbox` - Gruvbox theme

### Changing Theme
```rust
let mut theme_service = ThemeService::new();
theme_service.set_theme("nord")?;
```

## Development

### Building
```bash
bun --cwd apps/rvim run dev:build
```

### Testing
```bash
bun --cwd apps/rvim run test
```

### Running
```bash
bun --cwd apps/rvim run dev
```

## Architecture

rvim uses a modular architecture:

```
src/
├── components/
│   ├── editor.rs       - Editor state and logic
│   ├── command_palette.rs - Command palette UI
│   ├── file_explorer.rs - File explorer UI
│   └── ui.rs           - UI renderer
├── services/
│   ├── tree_sitter.rs  - Tree-sitter integration
│   ├── lsp.rs          - LSP client
│   ├── multi_selection.rs - Multiple selections
│   ├── textobjects.rs  - Text objects and motions
│   ├── surround.rs     - Surround feature
│   ├── plugins.rs      - Plugin system
│   ├── theme.rs        - Theme system
│   └── keybindings.rs  - Key bindings
├── config.rs           - Configuration
├── error.rs            - Error handling
├── telemetry.rs        - Observability
└── lib.rs              - Library exports
```

## Comparison with Helix

### rvim Advantages
- **Command Palette** - rvim has a more advanced command palette
- **Git Integration** - rvim has built-in git commands
- **Build/Test Integration** - rvim has commands for build/test
- **Async Architecture** - rvim uses tokio, making it scalable
- **Observability** - rvim has a tracing system
- **Plugin System** - rvim has a plugin architecture
- **Modular Architecture** - rvim has a flexible architecture

### rvim Features
- Tree-sitter Integration ✓
- LSP Support ✓
- Multiple Selections ✓
- Syntax-aware Motions ✓
- Surround Feature ✓
- Plugin System ✓
- Theme System ✓
- Git Integration ✓
- Build/Test Integration ✓
- Async Architecture ✓
- Observability ✓

## Roadmap

### Phase 1 (Completed)
- Tree-sitter Integration
- LSP Support
- Multiple Selections
- Syntax-aware Motions

### Phase 2 (Completed)
- Surround Feature
- Plugin System
- Theme System

### Phase 3 (Completed)
- Extended Commands
- Git Integration
- Build/Test Integration

### Phase 4 (Future)
- GUI Frontend (WebGPU-based)
- More Language Support
- More Themes
- Better Documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Helix - Inspiration for modal editing
- Kakoune - Inspiration for multiple selections
- Tree-sitter - Syntax highlighting
- LSP - Code intelligence
- Ratatui - TUI framework
