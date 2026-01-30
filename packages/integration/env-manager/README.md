# env-manager

Package for env-manager

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

- `postinstall`: 
- `watch`: bun --watch src/app.ts
- `dev`: bun src/app.ts
- `build`: tsdown
- `postbuild`: bun run src/scripts/add-shebang.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `test:coverage`: vitest run --coverage
- `audit`: bun audit
- `verify`: bun run format && bun run audit && bun run lint && bun run test && bun run build

## License

MIT