# wmorepo

A blazing fast monorepo build tool written in Rust, inspired by Turborepo.

## Features

- **High-performance Task Running**: Execute tasks in parallel, respecting the dependency graph.
- **Advanced Caching**: Local and remote caching to avoid re-running tasks.
- **Explainable Cache**: Understand why a task was cached or not with `--explain`.
- **Native Watch Mode**: Uses native file system events for instant reruns.
- **Configuration Composition**: Extend and merge multiple configuration files.
- **Dependency Constraints**: Enforce architectural rules with tag-based dependency guards.
- **Plugin System**: Extend functionality with custom hooks for task lifecycle events.
- **CI Helpers**: `affected` and `changed` commands with JSON output for easy integration.

## Getting Started

### Prerequisites

- Bun
- Rust toolchain

### Installation

Build and install the binary:

```bash
cargo build --release
# The binary will be at target/release/wmorepo
```

## Commands

### `run`

Run a task across workspaces.

```bash
# Run 'build' task for all workspaces
wmorepo run build

# Run with a filter
wmorepo run build --filter="@scope/*"

# Common flags
wmorepo run build --dry-run
wmorepo run build --print-graph
wmorepo run build --concurrency 4
wmorepo run build --strict
wmorepo run build --no-cache
wmorepo run build --force
wmorepo run build --clean

# Explainability and Reporting
wmorepo run build --explain
wmorepo run build --report-json report.json
```

### `watch`

Watch for changes and re-run tasks.

```bash
# Poll for changes (default)
wmorepo watch build --interval-ms 1000

# Use native file system events
wmorepo watch build --watch-mode native
```

### `cache`

Manage the local cache.

```bash
# Show cache statistics
wmorepo cache inspect

# List all cache entries
wmorepo cache ls

# Clear the entire cache
wmorepo cache clean

# Garbage collect cache based on policies
wmorepo cache gc --ttl-seconds 86400 --max-bytes 1073741824
```

### `affected` and `changed`

List projects affected by changes, useful for CI.

```bash
# List affected projects since a git ref
wmorepo affected --since main

# Output as JSON for scripting
wmorepo affected --since main --json
```

### `doctor`

Run checks for common monorepo problems.

- Validates `wmo.config.json`.
- Detects circular workspace dependencies.
- Enforces dependency constraints.

```bash
wmorepo doctor
```

## Configuration (`wmo.config.json`)

### Basic Example

```json
{
	"$schema": "https://wmo.vercel.app/schema.json",
	"workspaces": ["apps/*", "packages/*"],
	"pipeline": {
		"build": {
			"inputs": ["src/**", "package.json"],
			"outputs": ["dist/**"],
			"depends_on": ["^build"]
		}
	}
}
```

### `extends`

Inherit and merge configurations from other files.

```json
{
  "extends": "../../wmo.base.json",
  "pipeline": {
    "build": { "env": ["MY_VAR"] }
  }
}
```

### `constraints`

Define tag-based dependency rules. The `doctor` command will report violations.

```json
{
  "projects": {
    "@scope/frontend": { "tags": ["frontend"] },
    "@scope/backend": { "tags": ["backend"] }
  },
  "constraints": {
    "deny": [
      { "from_tag": "frontend", "to_tag": "backend" }
    ]
  }
}
```

### `plugins`

Run external commands on lifecycle events.

```json
{
  "plugins": [
    {
      "command": "node",
      "args": ["scripts/my-plugin.js"],
      "enabled": true
    }
  ]
}
```

## Caching

### Local Cache

By default, cache artifacts are stored in `.wmo/cache`. Override this with the `WMO_CACHE_DIR` environment variable.

### Remote Cache

Set these environment variables to enable remote caching:

- `WMO_REMOTE_CACHE_URL` (e.g., `https://my-cache-server.com/api`)
- `WMO_REMOTE_CACHE_TOKEN` (Bearer token)
- `WMO_REMOTE_CACHE_HEADERS_JSON` (JSON object of additional headers)
- `WMO_REMOTE_CACHE_TIMEOUT_MS`
- `WMO_REMOTE_CACHE_RETRY`
