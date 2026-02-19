# @wpackages/devserver

Bun-native development server with Vite-like features, built for performance and simplicity.

## Features

- 🔥 **Hot Module Replacement (HMR)** - Instant updates without page reload
- ⚡ **Lightning Fast** - Built on Bun's native runtime
- 📦 **Zero Dependencies** - Pure Bun implementation
- 🔧 **Plugin System** - Extensible architecture
- 🌐 **CORS Support** - Built-in CORS handling
- 📁 **Static File Serving** - Automatic file serving with proper MIME types
- 🛠️ **TypeScript Support** - Full TypeScript integration
- 📊 **Developer Tools** - Rich logging and error handling

## Comparison with Other Dev Servers

| Priority | Feature | @wpackages/devserver | Vite | Parcel | esbuild |
|----------|---------|-------------------|-------|--------|----------|
| 🔴 | Development Speed | ⚡⚡⚡⚡⚡ Native Bun | ⚡⚡⚡⚡ esbuild + ESM | ⚡⚡⚡⚡ Auto-detect | ⚡⚡⚡⚡⚡ Go binary |
| 🔴 | Hot Module Replacement | ✅ Built-in WebSocket | ✅ ESM + WebSocket | ✅ Built-in | ❌ No HMR |
| 🔴 | Zero Configuration | ✅ Minimal config | ✅ Good defaults | ✅ Zero-config | ⚠️ Basic |
| 🔴 | TypeScript Support | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| 🟡 | Plugin Ecosystem | ⚠️ Limited | ✅ Rich ecosystem | ⚠️ Growing | ⚠️ Minimal |
| 🟡 | CSS Processing | ⚠️ Basic | ✅ Full support | ✅ Full support | ❌ No CSS |
| 🟡 | Bundle Size | ⚠️ Basic | ✅ Optimized | ✅ Optimized | ⚠️ Basic |

### When to Use @wpackages/devserver

- **Perfect for**: Bun-native projects, microservices, simple web apps
- **Choose when**: You want maximum speed with minimal dependencies
- **Avoid when**: You need complex build pipelines or extensive plugin ecosystem

### When to Use Vite

- **Perfect for**: React/Vue/Svelte projects, complex applications
- **Choose when**: You need rich plugin ecosystem and framework integration
- **Avoid when**: You want zero dependencies or Bun-native performance

### When to Use Parcel

- **Perfect for**: Rapid prototyping, zero-config projects
- **Choose when**: You want automatic detection and minimal setup
- **Avoid when**: You need fine-grained control over build process

### When to Use esbuild

- **Perfect for**: CI/CD pipelines, library bundling, maximum speed
- **Choose when**: You need fastest possible builds
- **Avoid when**: You need dev server or HMR capabilities

## Installation

```bash
bun add @wpackages/devserver
```

## Quick Start

### Programmatic Usage

```typescript
import { createDevServer } from '@wpackages/devserver';

const server = createDevServer({
  port: 3000,
  root: './public',
  hmr: { enabled: true },
  cors: { enabled: true }
});

await server.start();
console.log(`Server running at http://localhost:3000`);
```

### CLI Usage

```bash
# Start with default settings
bunx @wpackages/devserver

# Custom port and open browser
bunx @wpackages/devserver --port 3000 --open

# Custom root directory
bunx @wpackages/devserver --root ./dist

# Disable HMR
bunx @wpackages/devserver --no-hmr

# Debug logging
bunx @wpackages/devserver --log-level debug
```

## Configuration

### DevServerConfig

```typescript
interface DevServerConfig {
  port?: number;           // Server port (default: 5173)
  host?: string;           // Server host (default: 'localhost')
  root?: string;           // Root directory (default: process.cwd())
  base?: string;           // Base path (default: '/')
  hmr?: HmrConfig;         // HMR configuration
  cors?: CorsConfig;       // CORS configuration
  fs?: FileSystemConfig;    // File system configuration
  server?: ServerConfig;    // Server middleware configuration
  build?: BuildConfig;      // Build configuration
}
```

### HMR Configuration

```typescript
interface HmrConfig {
  enabled?: boolean;        // Enable HMR (default: true)
  port?: number;           // HMR WebSocket port (default: 24678)
  host?: string;           // HMR WebSocket host (default: 'localhost')
  path?: string;            // HMR endpoint path (default: '/@hmr')
  timeout?: number;         // Connection timeout (default: 30000)
  overlay?: boolean;        // Error overlay (default: true)
}
```

### CORS Configuration

```typescript
interface CorsConfig {
  enabled?: boolean;        // Enable CORS (default: true)
  origin?: string | string[]; // Allowed origins (default: '*')
  methods?: string[];       // Allowed methods
  allowedHeaders?: string[]; // Allowed headers
  credentials?: boolean;     // Allow credentials
}
```

## Plugin System

Create custom plugins to extend functionality:

```typescript
import type { Plugin } from '@wpackages/devserver';

const myPlugin: Plugin = {
  name: 'my-plugin',
  
  // Configure server
  configureServer(server) {
    console.log('Server configured!');
  },
  
  // Transform files
  async transform(code, id) {
    if (id.endsWith('.my-ext')) {
      return { code: transformMyExt(code) };
    }
  },
  
  // Handle HMR
  async handleHotUpdate(ctx) {
    if (ctx.file.endsWith('.my-ext')) {
      // Custom HMR logic
      return [ctx];
    }
  }
};

const server = createDevServer({}, [myPlugin]);
```

## CLI Options

```
Usage: devserver [options]

Options:
  -p, --port <number>     Port to listen on (default: 5173)
  -h, --host <string>     Host to listen on (default: localhost)
  -r, --root <string>     Root directory (default: current directory)
  -b, --base <string>     Base path (default: /)
  --no-hmr               Disable Hot Module Replacement
  --no-cors              Disable CORS
  -o, --open             Open browser automatically
  --log-level <level>     Log level: debug, info, warn, error
  -H, --help             Show help
```

## Examples

### Basic HTML/CSS/JS Project

```typescript
import { createDevServer } from '@wpackages/devserver';

const server = createDevServer({
  port: 3000,
  root: './public'
});

await server.start();
```

### React with TypeScript

```typescript
import { createDevServer } from '@wpackages/devserver';

const reactPlugin: Plugin = {
  name: 'react-transform',
  async transform(code, id) {
    if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
      // Transform JSX/TSX here
      return { code };
    }
  }
};

const server = createDevServer({
  port: 3000,
  root: './src',
  hmr: { enabled: true }
}, [reactPlugin]);

await server.start();
```

### Custom Middleware

```typescript
import { createDevServer } from '@wpackages/devserver';

const server = createDevServer({
  port: 3000,
  server: {
    middleware: [
      {
        name: 'auth',
        handler: async (req, next) => {
          // Custom auth logic
          if (req.url.includes('/api')) {
            // Check authentication
          }
          return next();
        }
      }
    ]
  }
});

await server.start();
```

## API Reference

### DevServer Class

```typescript
class DevServer {
  readonly config: DevServerConfig;
  readonly plugins: Plugin[];
  
  start(): Promise<void>;
  stop(): Promise<void>;
  reload(): Promise<void>;
  sendHmr(message: HmrMessage): Promise<void>;
}
```

### Utility Functions

```typescript
// Create server with default config
createDevServer(config?: Partial<DevServerConfig>, plugins?: Plugin[]): DevServer

// Create default configuration
createDefaultConfig(overrides?: Partial<DevServerConfig>): DevServerConfig

// File utilities
class FileUtils {
  getMimeType(filePath: string): string;
  getFileExtension(filePath: string): string;
  isSupportedFile(filePath: string): boolean;
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, content: string): Promise<void>;
  fileExists(filePath: string): Promise<boolean>;
  isDirectory(filePath: string): Promise<boolean>;
  // ... more methods
}

// Logger utilities
class ConsoleLogger implements Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test

# Lint
bun run lint

# Development mode
bun run dev
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Comparison with Vite

| Feature | @wpackages/devserver | Vite |
|---------|---------------------|------|
| Runtime | Bun-native | Node.js |
| Dependencies | Zero | esbuild, rollup, etc |
| Startup Speed | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ |
| HMR | Built-in | Built-in |
| Plugin System | ✅ | ✅ Rich ecosystem |
| TypeScript | ✅ Built-in | ✅ Built-in |
| CSS Processing | Basic | Advanced |
| Bundle Size | Minimal | Larger |
