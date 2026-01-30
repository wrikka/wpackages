# ts-build

Package for ts-build

A powerful and extensible build tool for TypeScript, Node.js, and native addons.

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

- `dev`: bun run src/index.ts --watch
- `build`: bun run src/cli.ts build
- `test`: bun ../test/bin/wtest.mjs
- `test:coverage`: bun ../test/bin/wtest.mjs --coverage
- `verify`: bun run lint && bun run test && bun run build
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `prepublishOnly`: bun run build
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT