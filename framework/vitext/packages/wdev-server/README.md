# w-devserver

Advanced development server with hot module replacement, built to be better than Vite's dev server.

## Features

- ⚡ **Lightning Fast**: Optimized development server with minimal overhead
- 🔥 **Hot Module Replacement**: Instant updates without full page reloads
- 📦 **Smart Caching**: Intelligent caching with automatic invalidation
- 👁️ **Advanced File Watching**: High-performance file watcher with negation patterns
- 🔄 **Auto Reload**: Automatic browser reload on file changes
- 🛡️ **Error Overlay**: In-browser error display with source mapping
- 📊 **Performance Monitoring**: Real-time performance metrics and recommendations
- 🎯 **Configurable**: Highly configurable with sensible defaults
- 🧪 **Testing Ready**: Built-in support for testing environments
- 🌐 **WebSocket Support**: Native WebSocket integration for real-time features

## Installation

```bash
bun add w-devserver
```

## Usage

### Basic Usage

```typescript
import { createDevServer } from 'w-devserver'

const server = createDevServer({
  root: './src',
  port: 3000,
  hostname: 'localhost'
})

await server.start()
```

### Advanced Configuration

```typescript
import { createDevServer } from 'w-devserver'

const server = createDevServer({
  root: './src',
  port: 3000,
  hostname: 'localhost',
  watch: {
    ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    debounceMs: 100
  },
  cache: {
    enabled: true,
    ttl: 300000 // 5 minutes
  },
  server: {
    middleware: [
      // Custom middleware
    ]
  }
})

// Register reload callback
server.onReload(() => {
  console.log('Hot reload triggered')
})

// Get performance stats
setInterval(() => {
  console.log('Performance stats:', server.getStats())
}, 5000)

await server.start()
```

## API

### `createDevServer(config)`

Create a new development server instance.

**Parameters:**
- `config`: Configuration options

**Returns:** DevServerInstance

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | `string` | `process.cwd()` | Root directory for the project |
| `port` | `number` | `3000` | Server port |
| `hostname` | `string` | `'localhost'` | Server hostname |
| `watch` | `WatchConfig` | `{}` | File watching configuration |
| `cache` | `CacheConfig` | `{}` | Caching configuration |
| `server` | `ServerConfig` | `{}` | Server configuration |

### DevServerInstance Methods

- `start()`: Start the development server
- `stop()`: Stop the development server
- `onReload(callback)`: Register reload callback
- `getStats()`: Get server statistics
- `getPerformanceStats()`: Get performance statistics
- `getRecommendations()`: Get performance recommendations

## Integration with Other WTS Packages

### With web-server

```typescript
import { createDevServer } from 'w-devserver'
import { createApp } from 'web-server'

const app = createApp()
const server = createDevServer({
  app, // Integrate with web-server
  root: './src',
  port: 3000
})

await server.start()
```

### With config-manager

```typescript
import { createDevServer } from 'w-devserver'
import { createConfigManager } from 'config-manager'

const configManager = createConfigManager({
  // Configuration sources
})

const server = createDevServer({
  configManager, // Integrate with config manager
  root: './src',
  port: 3000
})

await server.start()
```

### With observability

```typescript
import { createDevServer } from 'w-devserver'
import { createTracer } from 'observability'

const tracer = createTracer({
  serviceName: 'dev-server'
})

const server = createDevServer({
  tracer, // Integrate with observability
  root: './src',
  port: 3000
})

await server.start()
```

## Architecture

This development server follows the functional programming structure:

```
src/
├── components/    # CLI display components
├── services/      # Core services (server, watcher, cache, hmr)
├── config/        # Configuration utilities
├── types/         # Type definitions
├── utils/         # Utility functions
├── lib/           # Third-party library wrappers
├── constant/      # Constants
├── app.ts         # Main application entry point
└── index.ts       # Public API
```

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Format code
bun run format

# Lint code
bun run lint

# Review (format, lint, test, build)
bun run review
```

## License

MIT
