# styling

Package for styling

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

- `dev`: vite
- `build`: vite build
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `typecheck`: tsc -p tsconfig.json --noEmit
- `test`: vitest
- `test:coverage`: vitest run --coverage
- `verify`: bun run lint && bun run typecheck && bun run test
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT