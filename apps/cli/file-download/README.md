# file-download

Application for file-download

CLI for downloading files (URL, GitHub raw file, JSON API)

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

- `dev`: bun --watch src/cli.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `build`: tsdown
- `test`: vitest --run
- `test:ui`: vitest --ui
- `verify`: bun run format && bun run lint && bun run test && bun audit && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT