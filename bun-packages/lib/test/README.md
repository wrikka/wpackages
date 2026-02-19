# test

Package for test

Type-safe, functional testing framework with unified unit and E2E testing

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
- `verify`: bun run lint && bun run test && bun run build
- `test`: bun ./bin/wtest.mjs
- `test:watch`: bun ./bin/wtest.mjs --watch
- `clean`: rm -rf dist .tsbuildinfo coverage
- `prepublishOnly`: bun run clean && bun run build
- `watch`: bun --watch src/index.ts

## License

MIT