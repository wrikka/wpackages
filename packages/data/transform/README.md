# transform

Package for transform

Universal document transformer - Convert between MD, TS, TOML, JSON formats using OXC parser

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
- `test`: vitest run
- `test:watch`: vitest
- `verify`: bun run format && bun run lint && bun run build && bun run test
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT