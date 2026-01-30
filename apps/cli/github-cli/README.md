# github-cli

Application for github-cli

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

- `start`: bun run dev
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `audit`: bun audit --production
- `build`: tsdown
- `test`: vitest --run
- `verify`: bun run format && bun run lint && bun run test && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT