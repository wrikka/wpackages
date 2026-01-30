# logger

Package for logger

Logger service (Effect tag) with levels and redaction

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
- `dev`: bun --watch src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `verify`: bun run format && bun run lint && (bun audit || true) && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT