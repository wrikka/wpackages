# watch

A modern, high-performance file system watcher with advanced features for monitoring file changes. Built to be faster and more feature-rich than alternatives like Chokidar and Nodemon.

## Features

- 🚀 **High Performance**: Optimized file watching with minimal overhead
- ⚡ **Debouncing & Throttling**: Built-in event debouncing and throttling
- 🎯 **Advanced Pattern Matching**: Glob patterns with negation support (e.g., `!**/*.spec.ts`)
- 📊 **Performance Monitoring**: Real-time metrics and performance recommendations
- 🔄 **Hot Reload**: Built-in hot reload service for development workflows
- 🔧 **Configurable**: Highly configurable with sensible defaults
- 📦 **TypeScript**: First-class TypeScript support
- 🌐 **Cross-platform**: Works on Windows, macOS, and Linux
- 📈 **Statistics**: Enhanced statistics with event timing and distribution

## Installation

```bash
bun add watch
```

## Usage

```typescript
import { watch } from 'watch'

// Basic usage
const watcher = watch('./src')

watcher.on('change', (event) => {
  console.log(`File changed: ${event.path}`)
})

await watcher.start()

// Advanced usage with configuration
const advancedWatcher = watch(['./src', './tests'], {
  ignored: ['**/node_modules/**', '**/*.log', '!**/important.log'],
  debounceMs: 200,
  depth: 5,
  enableHotReload: true,
  handler: (event) => {
    console.log(`Event: ${event.type} - ${event.path}`)
  }
})

// Register hot reload callback
advancedWatcher.onHotReload((event) => {
  console.log(`Hot reload triggered by: ${event.path}`)
})

// Get performance stats
setInterval(() => {
  console.log('Performance stats:', advancedWatcher.getPerformanceStats())
  console.log('Recommendations:', advancedWatcher.getPerformanceRecommendations())
}, 5000)

await advancedWatcher.start()
```

## API

### `watch(paths, config?)`

Create a new file watcher instance.

**Parameters:**
- `paths`: String or array of paths to watch
- `config`: Configuration options (optional)

**Returns:** WatcherInstance

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `paths` | `string[]` | `[]` | Paths to watch |
| `ignored` | `string[]` or `function` | Default patterns | Files/dirs to ignore (supports negation with !) |
| `ignoreInitial` | `boolean` | `true` | Ignore initial scan events |
| `debounceMs` | `number` | `100` | Debounce delay in milliseconds |
| `depth` | `number` | `Infinity` | Maximum directory depth |
| `handler` | `function` | `undefined` | Global event handler |
| `errorHandler` | `function` | `undefined` | Error handler |
| `usePolling` | `boolean` | `false` | Use polling instead of native |
| `followSymlinks` | `boolean` | `false` | Follow symbolic links |
| `enableHotReload` | `boolean` | `false` | Enable hot reload service |
| `enableStats` | `boolean` | `true` | Enable statistics collection |

### Events

- `add`: File added
- `change`: File changed
- `unlink`: File removed
- `addDir`: Directory added
- `unlinkDir`: Directory removed
- `ready`: Watcher ready
- `error`: Error occurred
- `all`: All events

## Advanced Features

### Negation Patterns

The watcher supports negation patterns that allow you to include files that would otherwise be excluded:

```typescript
const watcher = watch('./src', {
  // Ignore all .spec.ts files except those in the __tests__ directory
  ignored: ['**/*.spec.ts', '!**/__tests__/**/*.spec.ts']
})
```

### Performance Monitoring

Get detailed performance metrics and recommendations:

```typescript
const watcher = watch('./src', { enableStats: true })

// Get performance statistics
const stats = watcher.getPerformanceStats()
console.log('Events per second:', stats.eventsPerSecond)
console.log('Average processing time:', stats.avgProcessingTime)

// Get performance recommendations
const recommendations = watcher.getPerformanceRecommendations()
recommendations.forEach(rec => console.log('Recommendation:', rec))
```

### Hot Reload

Built-in hot reload service for development workflows:

```typescript
const watcher = watch('./src', { enableHotReload: true })

watcher.onHotReload((event) => {
  // Trigger rebuild or reload
  console.log(`Hot reload triggered by ${event.path}`)
  // Your reload logic here
})
```

## Comparison with Other Watchers

| Feature | watch | chokidar | nodemon |
|---------|------------|----------|---------|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Debouncing | Built-in | Configurable | Limited |
| Pattern Matching | Advanced (w/ negation) | Good | Basic |
| Statistics | Real-time + Performance Monitoring | None | Basic |
| Hot Reload | Built-in | None | Built-in (limited) |
| TypeScript | First-class | Good | Good |
| Memory Usage | Low | Medium | High |
| Configuration | Flexible | Flexible | Limited |
| Negation Patterns | ✅ (`!**/*.spec.ts`) | ❌ | ❌ |
| Performance Recommendations | ✅ | ❌ | ❌ |
| Event Timing Metrics | ✅ | ❌ | ❌ |

## License

MIT