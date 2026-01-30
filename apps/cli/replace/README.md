# replace

Application for replace

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

- `dev`: bun --watch src/index.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run --passWithNoTests
- `build`: tsdown
- `verify`: bun run format && bun run lint && bun run test && bun run build
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT