# plugin-system

> Type-safe, functional plugin system with lifecycle management, dependency resolution, and observability built with Result pattern

**Version:** 0.0.1

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Functional](https://img.shields.io/badge/Style-Functional-green.svg)](https://github.com/wrikka/wts)
[![Bun](https://img.shields.io/badge/Runtime-Bun-orange.svg)](https://bun.sh/)

## Features

- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🔄 **Lifecycle Management**: Complete plugin lifecycle (install, enable, disable, uninstall, update)
- 📦 **Dependency Resolution**: Automatic dependency sorting and circular dependency detection
- 🎯 **Event System**: Event-driven architecture for plugin state changes
- 📊 **Metrics & Monitoring**: Built-in performance tracking and health checks
- 💾 **Storage**: File-based and in-memory storage options
- 🔒 **Security**: Permission system and security context
- 📝 **Logging**: Structured logging with configurable levels
- 🔍 **Plugin Discovery**: Automatic plugin discovery from directories
- ⚡ **Functional**: Result pattern from functional for better error handling
- 🔄 **Hot Update**: Support plugin version updates with automatic re-initialization
- 📈 **Registry Info**: Query plugin registry with has(), count(), getDisabled()

## Installation

```bash
bun add plugin-system
```

## Quick Start

```typescript
import {
	createPluginManager,
	createPluginLogger,
	type Plugin,
} from "plugin-system";

// Create a plugin
const myPlugin: Plugin = {
	metadata: {
		id: "my-plugin",
		name: "My Plugin",
		version: "1.0.0",
		description: "An example plugin",
		author: "Your Name",
	},
	init: async (api) => {
		console.log("Plugin initialized!");
		api.on("some-event", (data) => {
			console.log("Event received:", data);
		});
	},
	hooks: {
		onEnable: async () => {
			console.log("Plugin enabled!");
		},
		onDisable: async () => {
			console.log("Plugin disabled!");
		},
	},
};

// Create plugin manager with logger
const logger = createPluginLogger({ level: "info" });
const manager = createPluginManager({
	pluginDir: "./plugins",
	logger,
});

// Install and enable plugin (with Result pattern)
const installResult = await manager.install(myPlugin);
if (installResult.isOk()) {
	const enableResult = await manager.enable("my-plugin");
	if (enableResult.isOk()) {
		console.log("Plugin enabled successfully!");
	}
}

// Get plugin info
const plugin = manager.get("my-plugin");
console.log(plugin?.status); // "enabled"
```

## Plugin Discovery

```typescript
import { discoverPlugins } from "plugin-system";

const result = await discoverPlugins({
	paths: ["./plugins", "./node_modules"],
	patterns: ["**/*.plugin.js", "**/*.plugin.ts"],
	autoLoad: true,
});

console.log(`Found ${result.found.length} plugins`);
console.log(`Loaded ${result.loaded.length} plugins`);

// Install discovered plugins
for (const plugin of result.loaded) {
	await manager.install(plugin);
}
```

## Plugin Structure

```typescript
import type { Plugin } from "plugin-system";

export const myPlugin: Plugin = {
	metadata: {
		id: "my-plugin",
		name: "My Plugin",
		version: "1.0.0",
		description: "Plugin description",
		author: "Author Name",
		homepage: "https://example.com",
		license: "MIT",
	},
	dependencies: [
		{ id: "other-plugin", version: "1.0.0" },
		{ id: "optional-plugin", version: "1.0.0", optional: true },
	],
	capabilities: {
		hotReload: false,
		sandboxed: true,
		priority: "normal",
	},
	hooks: {
		onInstall: async () => {
			// Run on installation
		},
		onEnable: async () => {
			// Run when enabled
		},
		onDisable: async () => {
			// Run when disabled
		},
		onUninstall: async () => {
			// Run on uninstallation
		},
	},
	init: async (api) => {
		// Initialize plugin with API
		api.register("my-handler", myHandler);
		api.on("my-event", handleEvent);
	},
};
```

## Logging

```typescript
import { createPluginLogger } from "plugin-system";

// Create logger
const logger = createPluginLogger({
	level: "debug",
	prefix: "[my-app]",
	pretty: true,
	enabled: true,
});

// Use logger
logger.info("Plugin loaded", { pluginId: "my-plugin" });
logger.error("Plugin error", error, { pluginId: "my-plugin" });
```

## Storage

```typescript
import {
	createFileStorage,
	createMemoryStorage,
} from "plugin-system";

// File-based storage
const fileStorage = createFileStorage("./data/plugins.json");
await fileStorage.save(manager.getAll());
const plugins = await fileStorage.load();

// Memory storage
const memStorage = createMemoryStorage();
```

## Metrics

```typescript
import { createMetricsCollector } from "plugin-system";

const metrics = createMetricsCollector();

// Record metrics
metrics.recordLoad("my-plugin", 123);
metrics.recordInit("my-plugin", 45);

// Get metrics
const pluginMetrics = metrics.getMetrics("my-plugin");
const stats = metrics.getStats();
const health = metrics.checkHealth("my-plugin");
```

## Development

### Available Scripts

- `bun run build` - Build with tsdown
- `bun run dev` - Watch mode
- `bun run format` - Format code
- `bun run lint` - Lint and type-check
- `bun run review` - Format, lint, and test
- `bun run test` - Run tests

## Architecture

```
src/
├── config/           # Configuration files
│   ├── logger.config.ts
│   └── plugin-manager.config.ts
├── constant/         # Constants
├── services/         # Core services
│   ├── plugin-manager.service.ts
│   ├── plugin-loader.service.ts
│   ├── plugin-discovery.service.ts
│   ├── plugin-storage.service.ts
│   └── plugin-metrics.service.ts
├── types/            # Type definitions
├── utils/            # Utility functions
└── index.ts          # Main exports
```

## API Reference

### PluginManager

All async methods return `Result<void, string>` for functional error handling:

- `install(plugin: Plugin): Promise<Result<void, string>>` - Install a plugin
- `uninstall(pluginId: string): Promise<Result<void, string>>` - Uninstall a plugin
- `enable(pluginId: string): Promise<Result<void, string>>` - Enable an installed plugin
- `disable(pluginId: string): Promise<Result<void, string>>` - Disable an enabled plugin
- `update(pluginId: string, newPlugin: Plugin): Promise<Result<void, string>>` - Update plugin to new version
- `get(pluginId: string): PluginState | undefined` - Get plugin state
- `getAll(): readonly PluginState[]` - Get all plugins
- `getEnabled(): readonly PluginState[]` - Get enabled plugins
- `getDisabled(): readonly PluginState[]` - Get disabled plugins
- `has(pluginId: string): boolean` - Check if plugin exists
- `count(): number` - Get total plugin count
- `events: PluginEventEmitter` - Event emitter for plugin events

### Result Pattern

```typescript
import { ok, err, type Result } from "plugin-system";

const result = await manager.install(plugin);

if (result.isOk()) {
	console.log("Success!");
} else {
	console.error("Error:", result.unwrapErr());
}

// Or use match
result.match({
	ok: () => console.log("Success!"),
	err: (error) => console.error("Error:", error),
});
```

## Plugin Update Example

```typescript
// Update plugin to new version
const updatedPlugin: Plugin = {
	metadata: {
		id: "my-plugin",
		name: "My Plugin",
		version: "2.0.0", // New version
		description: "Updated plugin",
		author: "Your Name",
	},
	init: async (api) => {
		// New implementation
	},
	hooks: {
		onUpdate: async (oldVersion) => {
			console.log(`Updating from ${oldVersion} to 2.0.0`);
			// Migration logic here
		},
	},
};

const result = await manager.update("my-plugin", updatedPlugin);
if (result.isOk()) {
	console.log("Plugin updated successfully!");
}
```

## Dependencies

- **functional**: Functional programming utilities (Result pattern)
- **observability**: Observability primitives
- **program**: Program utilities
- **utils**: General utilities

## Contributing

เมื่อสร้าง utils ใหม่:
1. สร้างไฟล์ `.test.ts` สำหรับ tests
2. สร้างไฟล์ `.usage.ts` สำหรับ usage examples
3. ใช้ functional programming และ Result pattern

## License

Part of WTS framework monorepo.
