# update-deps

Package for update-deps

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

- `watch`: bun --watch verify
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: bun build src/index.ts --outdir dist --target node
- `test`: bun test
- `verify`: bun run format && bun audit && bun run lint && bun run build
- `start`: bun dist/index.js

## License

MIT