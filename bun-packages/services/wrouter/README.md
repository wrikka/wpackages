# @wpackages/wrouter

Functional router library with advanced routing capabilities, middleware support, and performance optimization.

## Features

- **Fast Routing**: High-performance route matching and resolution
- **Dynamic Routes**: Support for parameters and wildcards
- **Middleware Chain**: Composable middleware system
- **Route Groups**: Organize routes with prefixes
- **Type Safety**: Full TypeScript support
- **Performance Optimized**: Efficient route lookup algorithms

## Installation

```bash
bun add @wpackages/wrouter
```

## Usage

```typescript
import { createRouter, get, post, group } from '@wpackages/wrouter'

const router = createRouter()

// Add routes
get(router, '/users', async () => {
  return { users: [] }
})

// Route groups
const apiRouter = group(router, '/api', (router) => {
  return group(router, '/v1', (router) => {
    get(router, '/users', async () => ({ users: [] }))
    post(router, '/users', async (req, res) => ({ created: true }))
  })
})
```

## API

### Core Functions
- `createRouter()` - Create new router instance
- `get(router, path, handler)` - Add GET route
- `post(router, path, handler)` - Add POST route
- `put(router, path, handler)` - Add PUT route
- `delete(router, path, handler)` - Add DELETE route
- `group(router, prefix, fn)` - Create route group with prefix

### Advanced Features
- Middleware composition
- Route parameter extraction
- Query string parsing
- Header manipulation
- Error handling

## Development

```bash
bun run dev    # Start development
bun run build  # Build for production
bun run test   # Run tests
bun run lint   # Lint code
```

## Available Scripts

- `watch`: bun --watch verify
- `dev`: bun run src/index.ts
- `format`: dprint fmt
- `lint`: tsc --noEmit && oxlint --fix --type-aware
- `build`: bun build src/index.ts --outdir dist --target bun --minify
- `test`: vitest run
- `test:coverage`: vitest run --coverage
- `verify`: bun run format && bun audit && bun run lint && bun run test && bun run build && bun run dev

## License

MIT