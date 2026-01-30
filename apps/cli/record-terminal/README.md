# record-terminal

Application for record-terminal

A CLI tool to record terminal sessions and convert them to GIF or MP4.

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
- `build`: bun run prebuild && bun run build:wasm && bun run build:ts
- `build:wasm`: wasm-pack build ./core --target nodejs --out-dir ./dist
- `prebuild`: pwsh -Command "if (Test-Path ./dist) { Remove-Item -Recurse -Force ./dist }; New-Item -ItemType Directory -Path ./dist"
- `build:ts`: tsup src/index.ts --format esm --dts --minify
- `start`: bun dist/index.js
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT