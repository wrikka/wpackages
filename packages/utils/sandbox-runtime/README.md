# sandbox-runtime

Package for sandbox-runtime

## Installation

```bash
bun install
```

## Usage

```bash
bun run dev
```

## Development

```bash
bun run build
bun run test
```

## Available Scripts

- `dev`: cargo watch -x run
- `dev:build`: cargo build
- `check`: cargo check
- `format`: cargo fmt --all
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: cargo test --all-features
- `test:nextest`: cargo nextest run --all-features --verbose
- `build`: cargo build --release
- `build:wasm`: wasm-pack build --out-dir pkg --target bundler
- `build:node`: napi build --release
- `audit`: cargo audit
- `deny`: cargo deny check
- `verify`: bun run format -- --check && bun run lint && bun run test:nextest && cargo audit && cargo deny check
- `verify:ci`: bun run format -- --check && bun run lint && bun run test:nextest --ci && cargo audit && cargo deny check
- `watch`: bun --watch src/index.ts

## License

MIT