# async

Package for async

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

- `dev`: tsdown --watch
- `build`: tsdown --exports --dts --minify
- `test`: vitest run
- `test:watch`: vitest
- `typecheck`: tsc --noEmit
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT