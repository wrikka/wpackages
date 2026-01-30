# formatter

Application for formatter

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

- `watch`: bun --watch verify
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: tsdown
- `test`: vitest --run
- `verify`: bun run format && bun audit && bun run lint && bun run test && bun run build

## License

MIT