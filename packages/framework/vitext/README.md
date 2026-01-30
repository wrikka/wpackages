# vitext

Package for vitext

A modern, fast, and lightweight web framework for building web applications, built to be better than Vite.

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

- `dev`: bun --watch src/index.ts
- `build`: tsdown --exports --dts --minify
- `server`: bun src/server.ts
- `test`: vitest
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `clean`: rm -rf dist
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT