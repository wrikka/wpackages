# reporter

Package for reporter

Universal report formatting utilities for code analysis tools

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

- `dev`: bun run src/index.ts
- `build`: bun build src/index.ts --outdir dist --target bun
- `test`: bun test
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `verify`: bun format && bun lint && bun test && bun build
- `watch`: bun --watch src/index.ts

## License

MIT