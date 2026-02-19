# computer-use

Cross-platform desktop automation CLI designed for AI agents. Provides fast, reliable computer control through a command-line interface optimized for machine consumption.

## Features

- **Cross-Platform**: Support for Windows, macOS, and Linux
- **AI-Optimized**: Snapshot-based element selection using accessibility tree references
- **Fast**: Native binary for low-latency command execution
- **Type-Safe**: Zod-validated protocol with comprehensive error handling
- **Session Isolation**: Multiple concurrent sessions for multi-agent workflows

## Installation

```bash
bun install computer-use
```

## Quick Start

```bash
# Take a snapshot of the current desktop
computer-use snapshot

# Click on an element
computer-use click @e1

# Type text
computer-use type @e2 "Hello, World!"

# Press a key
computer-use press Enter
```

## Architecture

computer-use implements a hybrid client-daemon architecture:

- **Rust CLI Binary**: Fast command parsing and IPC communication
- **Node.js Daemon**: Desktop automation logic with nut.js
- **IPC Layer**: Unix socket (Linux/macOS) or TCP (Windows) for communication
- **Protocol Layer**: Type-safe command/response validation with Zod

## Commands

### Navigation & Interaction
- `click <selector>` - Click on an element
- `type <selector> <text>` - Type text into an element
- `press <key>` - Press a keyboard key
- `hover <selector>` - Hover over an element
- `drag <start> <end>` - Drag from one element to another

### Information Retrieval
- `snapshot` - Take a snapshot of the desktop
- `get text <selector>` - Get text from an element
- `get position <selector>` - Get element position
- `get size <selector>` - Get element size

### Window Management
- `list windows` - List all open windows
- `focus <window>` - Focus a window
- `minimize <window>` - Minimize a window
- `maximize <window>` - Maximize a window
- `close <window>` - Close a window

### Mouse Control
- `move <x> <y>` - Move mouse to position
- `scroll <amount>` - Scroll
- `click-left` - Left click
- `click-right` - Right click

### Keyboard Control
- `key-down <key>` - Key down
- `key-up <key>` - Key up
- `type-text <text>` - Type text directly

## Session Isolation

computer-use supports multiple isolated sessions:

```bash
computer-use --session agent1 snapshot
computer-use --session agent2 snapshot
```

Each session maintains:
- Independent daemon process
- Separate IPC endpoint
- Isolated desktop state

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build
bun run build

# Run tests
bun run test

# Lint
bun run lint
```

## License

MIT
