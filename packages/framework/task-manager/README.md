# task-manager

Package for task-manager

A command-line task manager for organizing and tracking tasks

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
- `dev`: bun run --watch src/index.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `release`: release-it
- `watch`: bun --watch src/index.ts
- `test`: vitest run

## License

MIT