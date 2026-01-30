# vitext-vite

Package for vitext-vite

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
- `test:coverage`: vitest run --coverage
- `verify`: bun run format && bun run lint && bun run test:coverage && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT