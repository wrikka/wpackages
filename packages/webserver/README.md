# @wpackages/webserver

High-performance web server primitives built on `Bun.serve` with a lightweight router, middleware pipeline, and optional schema validation.

## Features

- **Bun Native**: Uses `Bun.serve` for fast request handling
- **Routing**: Path params support (e.g. `/users/:id`) with a fast matching path
- **Middleware Support**: Composable middleware pipeline
- **Schema Validation**: Optional request/response validation hooks
- **Effect Integration**: Service layer helper via `./services` export

## Installation

```bash
bun install
```

## Usage

```typescript
import { createWebServer } from "@wpackages/webserver/lib";

const app = createWebServer({ port: 3000, host: "localhost" });

app.get("/", () => ({ message: "Hello World" }));
app.get("/health", () => ({ status: "ok" }));

await app.start();
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
