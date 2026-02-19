# browser-use

Headless browser automation CLI for AI agents, written in Rust.

## Features

- **Fast startup**: Rust binary for quick command parsing (~1-2ms)
- **AI-Optimized**: Snapshot-based element selection using accessibility tree references.
- **Self-Healing**: Automatically finds elements even when the UI changes.
- **Session Persistence**: Saves and restores browser sessions (cookies, local storage).
- **Stealth Mode**: Evades bot detection measures.
- **Enterprise Ready**: Includes monitoring, containerization, and a focus on security.
- **Type-Safe & Fast**: Built in Rust for reliability and performance.

## Installation

```bash
cargo install browser-use
```

## Usage

### Navigation

```bash
# Open a URL
browser-use open https://example.com

# Navigate back/forward
browser-use back
browser-use forward

# Reload page
browser-use reload
```

### Interaction

```bash
# Click an element
browser-use click @e1

# Type text
browser-use type @e2 "hello world"

# Type secret text (value is redacted from logs)
browser-use type-secret @e2 "my-super-secret-password"

# Fill form
browser-use fill @e3 "test@example.com"

# Hover over element
browser-use hover @e4

# Scroll element into view
browser-use scroll @e5
```

### Information Extraction

```bash
# Get text content
browser-use get-text @e1

# Get HTML content
browser-use get-html @e1

# Get input value
browser-use get-value @e1

# Get page title
browser-use get-title

# Get page URL
browser-use get-url

# Get an attribute
browser-use get-attr @e1 href

# Get element count
browser-use get-count "button"

# Extract table data as JSON
browser-use extract-table "#my-table"
```

### State Checking

```bash
# Check visibility
browser-use is-visible @e1

# Check enabled
browser-use is-enabled @e1

# Check checked
browser-use is-checked @e1
```

### Snapshot

```bash
# Take a snapshot of the page
browser-use snapshot
```

Output:
```
- heading "Example Domain" [ref=e1] [level=1]
- button "Submit" [ref=e2]
- textbox "Email" [ref=e3]
```

### Screenshots

```bash
# Take a screenshot
browser-use screenshot

# Save to specific path
browser-use screenshot --path screenshot.png
```

### Session Isolation

```bash
# Use a specific session
browser-use --session agent1 open https://example.com
browser-use --session agent2 open https://another.com

# Persist a session to disk
browser-use --datadir /path/to/data open https://example.com

# Enable stealth mode
browser-use --stealth open https://example.com
```

## Architecture

```
CLI (Rust) -> IPC (TCP) -> Daemon (Rust) -> Chromium (via chromiumoxide) -> Browser
```

### Components

- **CLI**: Command-line interface using clap
- **IPC Layer**: Inter-process communication via TCP.
- **Daemon**: Background process managing browser instances, with Prometheus metrics at `/metrics`.
- **Browser Manager**: Chromium automation using the `chromiumoxide` crate.
- **Snapshot System**: Accessibility tree with stable element references and self-healing capabilities.

## Containerization

A Dockerfile is provided to run the daemon in a containerized environment.

```bash
# Build the container
docker build -t browser-use-daemon .

# Run the container
docker run -p 8080:8080 -p 9090:9090 browser-use-daemon
```

## Development

### Build

```bash
cargo build --release
```

### Test

```bash
cargo test
```

### Run

```bash
cargo run -- open https://example.com
```

## License

MIT
