# github-app-bot

Application for github-app-bot

GitHub App bot for dependency/version review (optional AI summary)

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

- `postinstall`: echo skip
- `watch`: bun --watch src/index.ts
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `test:coverage`: vitest run --coverage
- `build`: tsdown --exports --dts --minify
- `verify`: bun run format && bun audit && bun run lint && bun run test:coverage && bun run build

## License

MIT