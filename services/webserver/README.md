# @wpackages/webserver

High-performance web server using Elysia framework - better than Nitro.

## Features

- **Ultrafast Performance**: Built with Elysia framework which has static code analysis (Sucrose) for optimal performance
- **Better than Nitro**: Outperforms Nitro in benchmarks according to TechEmpower
- **Type-Safe**: Full TypeScript support with Elysia's type inference
- **Effect-TS Integration**: Uses Effect-TS for robust error handling and composability
- **Bun Native**: Optimized for Bun runtime
- **Middleware Support**: Extensible middleware system
- **Routing**: Powerful routing with parameter extraction

## Installation

```bash
bun install
```

## Usage

```typescript
import { Elysia } from 'elysia'

const app = new Elysia()
  .get('/', () => 'Hello World')
  .listen(3000)

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`)
```

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `test` - Run tests
- `lint` - Run linting
- `typecheck` - Run type checking
- `verify` - Run all checks

## Performance

Elysia provides:
- Static code analysis (Sucrose) for performance optimization
- Better performance than Hono and other frameworks
- Optimized for Bun runtime
- Minimal overhead

## License

MIT
