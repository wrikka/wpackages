# generate

Application for generate

Powerful code generation library with template engine for scaffolding, components, modules, tests, and documentation

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
- `dev`: tsdown --watch
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `format`: dprint fmt
- `verify`: bun format && bun lint && bun test
- `test`: vitest
- `watch`: bun --watch src/index.ts

## License

MIT