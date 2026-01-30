# dotfiles-manager

Application for dotfiles-manager

A simple dotfiles manager inspired by chezmoi

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

- `watch`: bun lint && bun watch && bun test
- `start`: bun --watch dev && vitest:ui
- `dev`: bun run src/index.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: tsdown
- `format`: dprint fmt
- `test`: vitest --run --passWithNoTests
- `verify`: bun format && bun lint && bun test && bun audit && run build

## License

MIT