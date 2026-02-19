# parser

Package for parser

Universal multi-language parser - JavaScript, TypeScript, JSON, YAML, TOML, Markdown, HTML, XML, CSS and more

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

- `build:wasm:json`: cd native/json-parser && wasm-pack build --target nodejs --out-dir ../../wasm/json
- `build:wasm:yaml`: cd native/yaml-parser && wasm-pack build --target nodejs --out-dir ../../wasm/yaml
- `build:wasm:toml`: cd native/toml-parser && wasm-pack build --target nodejs --out-dir ../../wasm/toml
- `build:wasm:xml`: cd native/xml-parser && wasm-pack build --target nodejs --out-dir ../../wasm/xml
- `build:wasm`: bun run build:wasm:json && bun run build:wasm:yaml && bun run build:wasm:toml && bun run build:wasm:xml
- `build`: tsdown --exports --dts --minify
- `dev`: bun --watch src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `test:watch`: vitest
- `verify`: bunx taze -r && bun run format && bun run lint && bun run build && bun run test
- `watch`: bun --watch src/index.ts

## License

MIT