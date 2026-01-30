# palse

Package for palse

Experimental reactive core (signals/effects) aiming to be a better Vue alternative

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

- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: bun test
- `test:coverage`: bun test --coverage
- `build`: bun build src/index.ts --outdir dist --target bun
- `verify`: bun run format && bun run lint && bun run test && bun run build
- `watch`: bun --watch src/index.ts
- `dev`: bun run src/index.ts
- `format`: dprint fmt

## License

MIT