# algorithms

Package for algorithms

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
- `test`: bun test
- `typecheck`: tsc --noEmit
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `scan`: bunx sg scan
- `update:deps`: bunx taze -r -w && ni
- `review`: bun update:deps && bun format && bun lint && bun test
- `watch`: bun --watch src/index.ts

## License

MIT