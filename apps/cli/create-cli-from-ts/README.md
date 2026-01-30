# create-cli-from-ts

Application for create-cli-from-ts

Complete CLI toolkit - Commands, Components, and Prompts

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

- `watch`: bun lint && bun watch && bun test
- `start`: bun --watch dev && vitest:ui
- `dev`: bun run src/index.ts
- `examples`: bun run src/index.ts build --entry examples/hello.ts --name example-generated-cli
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `postbuild`: bun run src/scripts/add-shebang.ts
- `build`: tsdown && bun run postbuild
- `format`: dprint fmt
- `test`: vitest --run --passWithNoTests
- `verify`: bun format && bun lint && bun run test && bun audit && bun run build

## License

MIT