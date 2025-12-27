# vitext

A modern, fast, and lightweight web framework for building web applications, built to be better than Vite. Enhanced with powerful caching, advanced file watching, and functional error handling.

## Features

- **Fast Development**: Lightning-fast development server with hot module replacement
- **Efficient Build**: Optimized builds using Rolldown for maximum performance
- **Web Server Integration**: Built-in server using the web-server framework
- **File-based Routing**: Automatic route registration from the file system
- **TypeScript Support**: First-class TypeScript support with excellent type inference
- **Advanced Caching**: Build artifacts, module resolution, and file system caching with TTL and LRU eviction
- **File Watching**: Advanced file watching with negation patterns and performance monitoring
- **Functional Error Handling**: Robust error handling using Result and Option types
- **Hot Reload**: Automatic hot reload with debouncing and performance optimization
- **Configuration Management**: Flexible configuration with vitext.config.ts support

## Installation

```bash
bun add vitext
```

## Usage

### Development Server

Start the development server:

```bash
bun run dev
```

### Building for Production

Build your application for production:

```bash
bun run build
```

### Starting the Server

Start the production server:

```bash
bun run server
```

### Advanced Usage

Access enhanced capabilities through the Vitext app instance:

```typescript
import { createVitextApp } from 'vitext'

const app = await createVitextApp()

// Access caching service
app.cache.setBuildArtifact('key', { data: 'value' })
const cached = app.cache.getBuildArtifact('key')

// Access file watcher
app.watcher.onChange((path, event) => {
  console.log(`File ${event}: ${path}`)
})

// Get performance stats
const stats = app.watcher.getStats()
console.log('Watcher stats:', stats)
```

## Configuration

Create a `vitext.config.ts` file in your project root:

```typescript
import { defineConfig } from 'vitext'

export default defineConfig({
  server: {
    port: 3000,
    hostname: 'localhost'
  },
  root: './src',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: true,
    sourcemap: true
  },
  define: {
    __VERSION__: JSON.stringify('1.0.0')
  },
  mode: 'development'
})
```

## Project Structure

```
src/
├── components/    # UI components
├── services/      # Business logic and services
├── config/        # Configuration files
├── types/         # TypeScript types
├── utils/         # Utility functions
├── lib/           # Third-party library wrappers
├── constant/      # Constants and enums
├── routes/        # File-based routes
├── app.ts         # Application entry point
└── index.ts       # Library entry point
```

## Scripts

- `dev` - Start the development server
- `build` - Build the application for production
- `server` - Start the production server
- `test` - Run tests
- `lint` - Lint the codebase
- `clean` - Clean the build directory

## Architecture

Vitext follows a functional programming approach with a clear separation of concerns:

- **components/** - Pure UI components with no side effects
- **services/** - Side effect handlers using Effect-TS
- **config/** - Configuration management
- **types/** - TypeScript types and schemas
- **utils/** - Pure utility functions
- **lib/** - Third-party library wrappers
- **constant/** - Compile-time constants

## Enhanced Capabilities

### Advanced Caching

Vitext includes a powerful caching system with:

- Build artifact caching with TTL and LRU eviction
- Module resolution caching
- File system operation caching
- Memoization for expensive operations

### File Watching

Enhanced file watching capabilities:

- Negation pattern support (e.g., `!**/*.spec.ts`)
- Performance monitoring and recommendations
- Hot reload with debouncing
- Advanced glob pattern matching

### Functional Error Handling

Robust error handling using Result and Option types:

- Type-safe error handling
- Composable error management
- Automatic error logging
- Graceful fallbacks

## Configuration Options

### Server Configuration

- `port`: Server port (default: 3000)
- `hostname`: Server hostname (default: 'localhost')

### Build Configuration

- `outDir`: Output directory (default: 'dist')
- `assetsDir`: Assets directory (default: 'assets')
- `minify`: Enable minification (default: false)
- `sourcemap`: Generate sourcemaps (default: false)

### Advanced Build Options

- `manifest`: Generate manifest file
- `ssrManifest`: Generate SSR manifest
- `ssr`: Server-side rendering mode
- `emptyOutDir`: Empty output directory before build

## License

Part of the WTS framework monorepo.