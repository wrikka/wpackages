# api-integrations

Package for api-integrations

Utilities for building API integrations, including error handling, retry logic, caching, and more.

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

- `build`: tsdown --exports --dts --minify
- `dev`: tsdown --watch
- `test`: vitest run
- `test:watch`: vitest
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `verify`: bun run format && bun run lint && bun run build && bun run test
- `watch`: bun --watch src/index.ts

## License

MIT