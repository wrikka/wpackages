# open-in-web

Application for open-in-web

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

- `start`: bun run --watch src/index.ts
- `dev`: bun run --watch src/index.ts
- `build`: tsdown --exports --dts --minify
- `postbuild`: bun link
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `release`: release-it
- `verify`: bunx taze -r && bun run lint && bun run build
- `test`: bun test
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT