# concurrency

Package for concurrency

Functional concurrency utilities for async operations and parallel processing

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

- `build`: tsdown --dts --minify
- `dev`: tsdown --watch
- `test`: vitest run
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `verify`: bun run lint && bun run test && bun run build
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT