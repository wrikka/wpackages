# git

Package for git

A TypeScript library for interacting with Git repositories.

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
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `verify`: turbo format && bun lint && bun test
- `test`: vitest
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT