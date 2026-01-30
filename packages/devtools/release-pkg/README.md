# release-pkg

Package for release-pkg

Modern release automation tool - Better than release-it with Effect-TS

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
- `verify`: bun lint && bun test
- `test`: vitest run
- `test:watch`: vitest
- `test:coverage`: vitest run --coverage
- `prepublishOnly`: bun run build
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT