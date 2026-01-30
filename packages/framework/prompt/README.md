# prompt

Package for prompt

An elegant and feature-rich command-line prompt library, inspired by @clack/prompts but with 3x more components and a focus on superior UX/UI.

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
- `build`: bun build src/index.ts --outdir dist --target bun --format esm && bun build src/index.ts --outdir dist --target bun --format esm --sourcemap
- `test`: bun test
- `verify`: bun run format && bun audit && bun run lint && bun run test && bun run build && bun run dev

## License

MIT