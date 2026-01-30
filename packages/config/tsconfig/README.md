# tsconfig

Package for tsconfig

TypeScript configuration presets for different environments (node, bun, cli, web, turbo)

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

- `watch`: bun --watch src/index.ts
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `build`: tsdown --exports --dts --minify

## License

MIT