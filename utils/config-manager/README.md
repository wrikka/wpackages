# @wts/config-manager

A robust and type-safe configuration manager for modern TypeScript applications. It supports loading configurations from multiple sources, schema validation, variable expansion, and more.

## Features

- **Multi-Source Loading**: Load configurations from files (`.json`, `.js`, `.ts`), environment variables, and default objects.
- **Schema Validation**: Ensure your configuration is valid and complete using a simple schema definition.
- **Type Casting**: Automatically cast configuration values to their correct types (e.g., `"true"` to `true`).
- **Variable Expansion**: Expand environment variables within your configuration files.
- **Encryption**: Support for encrypting and decrypting sensitive configuration values.
- **Hot-Reload**: Watch for file changes and automatically reload the configuration.

## Getting Started

### Installation

```bash
bun add @wts/config-manager
```

### Usage

Create a configuration loader and use it to load your application's configuration.

```typescript
import { createConfigManager } from "@wts/config-manager";

interface AppConfig {
	port: number;
	nodeEnv: "development" | "production" | "test";
	apiKey: string;
}

const configManager = createConfigManager<AppConfig>({
	schema: {
		port: { type: "number", required: true },
		nodeEnv: { choices: ["development", "production", "test"], required: true },
		apiKey: { type: "string", required: true },
	},
});

async function start() {
	try {
		const { config } = await configManager.load();
		console.log("Configuration loaded:", config);
		// Start your application with the loaded config
	} catch (error) {
		console.error("Failed to load configuration:", error);
		process.exit(1);
	}
}

start();
```
