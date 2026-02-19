# tui

Package for tui

A blazing fast library for building interactive command-line apps, inspired by React and Ink.

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

- `build`: tsdown
- `dev`: bun run src/app.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: biome format --write src
- `test`: vitest --run
- `verify`: bun format && bun lint && bun test && bun build
- `watch`: bun --watch src/index.ts

## License

MIT