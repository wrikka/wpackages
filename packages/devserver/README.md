# @wpackages/devserver

## Introduction

`@wpackages/devserver` is a modern, high-performance development server built from scratch to provide a superior developer experience. It features Hot Module Replacement (HMR), intelligent caching, module graph tracking, and monorepo workspace support, designed to compete with and surpass existing solutions like Vite and Rsbuild.

## Features

### ✅ Implemented (Phase A + Phase B)

- ⚡ **Core Runtime**: HTTP server + WebSocket + static file serving
- 🔥 **HMR Protocol**: Custom WebSocket-based HMR with full-reload support
- 🧠 **Transform Cache**: In-memory + disk caching for transformed modules
- 📊 **Module Graph**: Dependency tracking and invalidation system
- 🔍 **Smart Resolver**: Module resolution with monorepo workspace support (`@workspace/package`)
- 👀 **File Watching**: High-performance watcher with performance monitoring
- 📈 **Performance Metrics**: Real-time stats and recommendations
- 🔌 **Plugin API**: Type-safe hooks (resolve/load/transform/configureServer)
- ✅ **Test Coverage**: Vitest tests with coverage reporting
- 🏗️ **Build System**: TypeScript compilation with type declarations
- 🌐 **Proxy Server**: Multiple proxy targets with path rewriting
- 🔒 **HTTPS Support**: Custom SSL certificates for secure development
- 🎨 **Error Overlay**: Browser overlay for runtime errors with stack traces

### 🚧 In Progress

- ⚡ **Partial HMR**: Module-level hot updates (vs full-reload)
- 📦 **Optimize Deps**: Dependency pre-bundling strategy

### 📋 Planned

- 🌐 **SSR Support**: Server-side rendering development story
- 🔬 **Tracing Integration**: Performance tracing with `@wpackages/tracing`
- 📊 **Benchmarks**: Performance comparison against Vite/Rsbuild

## Architecture

```
@wpackages/devserver
├── Core Runtime
│   ├── HTTP Server (h3)
│   ├── WebSocket Server (ws)
│   └── Static File Serving
├── HMR System
│   ├── WebSocket Protocol
│   ├── Module Graph
│   └── Transform Cache
├── Plugin System
│   ├── Type-safe Hooks
│   └── Plugin Manager
└── Developer Tools
    ├── Performance Monitor
    ├── Error Overlay (TODO)
    └── Devtools Integration
```

## Installation

This is a workspace package. Install dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Basic Setup

```typescript
import { createDevServer } from "@wpackages/devserver";

const server = createDevServer({
	root: "./src",
	port: 3000,
	hostname: "localhost",
	alias: {
		"@": "./src",
	},
	extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
});

// Start the server
await server.start();

// Handle reloads
server.onReload(() => {
	console.log("Files changed, reloading...");
});

// Graceful shutdown
process.on("SIGINT", async () => {
	await server.stop();
	process.exit(0);
});
```

### Monorepo Workspace Support

```typescript
const server = createDevServer({
	root: ".",
	// Automatically resolves @workspace/package to packages/package
});

// Import from workspace packages
import { utils } from "@workspace/shared";
```

### Plugin Development

```typescript
import type { DevServerPluginInstance } from "@wpackages/devserver";

const myPlugin: DevServerPluginInstance = {
	name: "my-plugin",
	version: "1.0.0",
	hooks: {
		async resolveId(id, importer) {
			if (id.startsWith("virtual:")) {
				return id; // Handle virtual modules
			}
			return null; // Let other resolvers handle it
		},
		async transform(code, id) {
			if (id.endsWith(".special")) {
				return { code: transformSpecial(code) };
			}
			return null;
		},
	},
};
```

## API Reference

### createDevServer(config)

Creates a new dev server instance.

**Config Options:**

- `port?: number` - Server port (default: 3000)
- `hostname?: string` - Server hostname (default: "localhost")
- `root?: string` - Project root directory
- `alias?: Record<string, string>` - Path aliases
- `extensions?: readonly string[]` - File extensions to resolve
- `cache?: CacheConfig` - Cache configuration
- `watch?: WatchOptions` - File watching options

**Server Methods:**

- `start(): Promise<void>` - Start the server
- `stop(): Promise<void>` - Stop the server
- `onReload(callback): void` - Register reload callback
- `getStats(): ServerStats` - Get server statistics
- `getPerformanceStats(): PerformanceStats` - Get performance metrics

## Development

### Scripts

```bash
bun run dev          # Start development mode
bun run build        # Build the package
bun run test         # Run tests
bun run test:coverage # Run tests with coverage
bun run lint         # Run linter
bun run verify       # Run all checks (lint + test + build)
```

### Testing

The package includes comprehensive tests with Vitest and coverage reporting:

```bash
bun run test:coverage
```

Current coverage: ~17% (growing with new features)

## Performance

### Benchmarks (Coming Soon)

We're working on comprehensive benchmarks comparing:

- Cold start time
- First page load
- HMR latency
- Memory usage
- Monorepo scale performance

### Goals

- **Cold Start**: < 100ms (vs Vite ~200ms)
- **HMR Latency**: < 50ms (vs Vite ~100ms)
- **Memory Usage**: < 50MB for small projects
- **Monorepo**: Linear scaling with package count

## Comparison with Other Tools

| Feature       | @wpackages/devserver | Vite | Rsbuild | Rspack | Webpack |
| ------------- | -------------------- | ---- | ------- | ------ | ------- |
| Core Runtime  | ✅                   | ✅   | ✅      | ✅     | ✅      |
| HMR           | ✅ (custom)          | ✅   | ✅      | ✅     | ✅      |
| Plugin API    | ✅ (type-safe)       | ✅   | ✅      | ✅     | ✅      |
| Cache         | ✅ (multi-layer)     | ✅   | ✅      | ✅     | ✅      |
| Module Graph  | ✅                   | ✅   | ✅      | ✅     | ✅      |
| Monorepo      | ✅ (native)          | ⚠️    | ✅      | ⚠️      | ⚠️       |
| Error Overlay | 🚧                   | ✅   | ✅      | ✅     | ✅      |
| Performance   | ✅ (monitoring)      | ✅   | ✅      | ✅     | ⚠️       |
| TypeScript    | ✅ (native)          | ✅   | ✅      | ✅     | ⚠️       |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `bun run verify` to ensure quality
5. Submit a pull request

## License

MIT
});

// Start the server
await server.start();

console.log("Dev server running on http://localhost:3000");

````
### Example: Advanced Configuration

```typescript
import { createDevServer } from "@wpackages/devserver";

const server = createDevServer({
	root: "./src",
	port: 3000,
	watch: {
		// Ignore node_modules and build output
		ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
		debounceMs: 100, // Wait 100ms after a change to trigger a reload
	},
	cache: {
		enabled: true,
		ttl: 300000, // 5-minute cache lifetime
	},
});

// Register a callback for when HMR is triggered
server.onReload(() => {
	console.log("Hot reload triggered!");
});

await server.start();
````

## License

This project is licensed under the MIT License.
