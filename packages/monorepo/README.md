# monorepo

![npm version](https://img.shields.io/npm/v/monorepo.svg) ![license](https://img.shields.io/npm/l/monorepo.svg)

A fast monorepo task runner written in Rust, inspired by Turborepo.

## Features

- High-performance task running with dependency graph
- Local and remote caching with integrity checks
- Watch mode with polling
- Prune/subset repo for CI
- Affected/changed detection
- Concurrency control and clean outputs
- Config validation and workspace discovery

## Getting Started

### Prerequisites

- Bun
- Rust toolchain

### Config

Create `wmo.config.json` in repo root:

```json
{
	"$schema": "https://wmo.vercel.app/schema.json",
	"workspaces": ["packages/*"],
	"pipeline": {
		"build": {
			"outputs": ["dist/**"],
			"depends_on": ["^build"]
		}
	}
}
```

### Commands

```bash
wmorepo run build
wmorepo watch build --interval-ms 1000
wmorepo prune ./out --scope @scope/pkg
wmorepo changed --since main
wmorepo affected --filter "tag:frontend"
wmorepo init
wmorepo doctor
```

### Flags

```bash
wmorepo run build --concurrency 4 --dry-run --print-graph --strict --no-cache --force --clean
```

### Remote Cache

Set env vars:
- `WMO_REMOTE_CACHE_TOKEN`
- `WMO_REMOTE_CACHE_HEADERS_JSON`
- `WMO_REMOTE_CACHE_TIMEOUT_MS`
- `WMO_REMOTE_CACHE_RETRY`
- `WMO_REMOTE_CACHE_INTEGRITY_HEADER`

### CI

```yaml
- uses: actions/checkout@v4
- run: bun run verify  # runs fmt/lint/test/audit/build
```

## Development

```bash
bun install
bun run dev
bun run verify
```

## Contributing

See `packages/wmonorepo/README.md` for CLI details.
