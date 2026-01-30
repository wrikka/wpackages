# web-to-desktop

Application for web-to-desktop

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
- `dev`: bun --watch src/bin/cli.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `verify`: bun lint && bun test && bun build
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT