# cli-components

Package for cli-components

Terminal UI toolkit - Unified interface for CLI command, display, and prompts

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

- `dev`: tsdown --watch
- `build`: tsdown --exports --dts --minify
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `test:watch`: vitest
- `test:coverage`: vitest run --coverage
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT