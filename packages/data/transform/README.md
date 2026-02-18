# transform

Universal document transformer - Convert between MD, TS, TOML, JSON formats using OXC parser

## Installation

```bash
bun install
```

## Usage

```typescript
import { transform } from '@wpackages/transform';
import { Effect } from 'effect';

// Transform markdown to JSON
const result = await Effect.runPromise(transform('# Hello', 'markdown', 'json'));
console.log(result); // {"content": "Hello", "level": 1}

// Auto-detect format
const result2 = await Effect.runPromise(transform('{"key": "value"}', 'auto', 'toml'));
```

## Supported Transforms

| From | To | Transformer |
|------|-----|-------------|
| JSON | TOML | `json->toml` |
| TOML | JSON | `toml->json` |
| JSON | Markdown | `json->markdown` |
| Markdown | JSON | `markdown->json` |
| TypeScript | JSON | `typescript->json` |
| TypeScript | Markdown | `typescript->markdown` |
| TOML | Markdown | `toml->markdown` |
| JSON | TypeScript | `json->typescript` |

## Development

```bash
bun run dev      # Watch mode
bun run build    # Build for production
bun run test     # Run tests
bun run lint     # Lint and fix
bun run verify   # Full verification
```

## Available Scripts

- `build`: tsdown --exports --dts --minify
- `dev`: bun --watch src/index.ts
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `test`: vitest run
- `test:watch`: vitest
- `verify`: bun run format && bun run lint && bun run build && bun run test
- `watch`: bun --watch src/index.ts
- `format`: dprint fmt

## License

MIT