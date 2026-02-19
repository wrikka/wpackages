# tui-home

A modern, feature-rich TUI (Terminal User Interface) file manager inspired by yazi but with better UX/UI and easier usage.

## Features

### Core Navigation
- **2-Pane Layout**: File list (left) + Preview (right)
- **Vim-style Keybindings**: `j/k` to move, `l/Enter` to open, `h` to go back
- **Visual Selection Mode**: Press `v` to select multiple files
- **History Navigation**: `Ctrl+b` to go back, `Ctrl+f` to go forward

### File Management
- **File Type Icons**: Beautiful emoji icons for different file types
- **Syntax Highlighting**: Preview code files with syntax highlighting
- **Search & Filter**: Press `/` to search files incrementally
- **Bookmarks**: Press `m` to bookmark current directory, `Shift+B` to show bookmarks

### File Operations
- **Copy**: `Ctrl+c` to start copy mode
- **Move**: `Ctrl+x` to start move mode
- **Delete**: `Ctrl+d` to start delete mode
- **Rename**: `Ctrl+r` to start rename mode

### Command Palette
- Press `:` to enter command mode
- Available commands:
  - `q` or `quit` - Exit the application
  - `help` - Show help information

## Keybindings

| Key | Action |
|-----|--------|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `l` / `Enter` / `→` | Open file/directory |
| `h` / `←` | Go to parent directory |
| `/` | Search files |
| `v` | Enter visual selection mode |
| `q` / `Esc` | Quit (exit visual mode first) |
| `Ctrl+g` | Go to first file |
| `Shift+G` | Go to last file |
| `Ctrl+b` | Go back in history |
| `Ctrl+f` | Go forward in history |
| `m` | Toggle bookmark |
| `Shift+B` | Show bookmarks |
| `:` | Enter command mode |
| `Ctrl+c` | Start copy operation |
| `Ctrl+x` | Start move operation |
| `Ctrl+d` | Start delete operation |
| `Ctrl+r` | Start rename operation |

## Installation

```bash
cd D:\wai\rust-packages\tui-home
cargo build --release
```

## Usage

```bash
# Run from current directory
cargo run

# Run from specific directory
cargo run -- /path/to/directory

# Run the release binary
./target/release/tui-home
```

## Configuration

Create a `tui-home.toml` file in your home directory or in the project directory:

```toml
# tui-home configuration file

[ui]
# Theme: dark, light
theme = "dark"

# Show hidden files
show_hidden = false

# File size format: bytes, human
size_format = "human"

# Preview settings
[preview]
max_size_kb = 50
show_line_numbers = true

# Keybindings (optional overrides)
[keybindings]
# You can customize keybindings here
```

## File Type Icons

- 📁 Directory
- 🖼️ Image (jpg, png, gif, svg, etc.)
- 🎬 Video (mp4, avi, mkv, etc.)
- 🎵 Audio (mp3, wav, flac, etc.)
- 📄 Document (pdf, doc, docx, etc.)
- 💻 Code (rs, py, js, ts, go, etc.)
- 📦 Archive (zip, rar, 7z, etc.)
- 📝 Text (txt, md, log, etc.)
- ⚙️ Config (toml, yaml, json, etc.)
- 📊 Data (csv, xml, sql, etc.)
- 🔧 Binary files
- 📎 Other files

## Development

### Building

```bash
cargo build
```

### Running tests

```bash
cargo test
```

### Formatting

```bash
cargo fmt
```

### Linting

```bash
cargo clippy
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] Tab navigation (multiple tabs)
- [ ] Image preview
- [ ] Archive preview
- [ ] File operations execution (copy, move, delete, rename)
- [ ] Command palette with more commands
- [ ] Config file support
- [ ] Theme customization
- [ ] Plugin system
- [ ] Fuzzy search
- [ ] File operations with confirmation dialogs
