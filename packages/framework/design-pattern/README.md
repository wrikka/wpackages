# design-pattern

Package for design-pattern

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

- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest
- `test:ui`: vitest --ui
- `check`: oxlint && vitest run
- `watch`: bun --watch src/index.ts
- `dev`: bun run src/index.ts
- `build`: tsdown --exports --dts --minify

## License

MIT