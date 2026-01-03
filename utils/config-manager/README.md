# @wpackages/config-manager

## Introduction

`@wpackages/config-manager` is a robust and type-safe configuration manager for modern TypeScript applications. It supports loading configurations from multiple sources (files, environment variables, defaults), validating them against a schema, and providing a fully typed configuration object to your application.

## Features

- 🔄 **Multi-Source Loading**: Load configurations from files (`.json`, `.js`, `.ts`, `.toml`, `.yaml`), environment variables, and default objects.
- ✅ **Schema Validation**: Ensure your configuration is valid and complete using a simple, yet powerful schema definition.
- 🔧 **Type Casting**: Automatically casts configuration values to their correct types (e.g., a string `"true"` becomes a boolean `true`).
- 🌿 **Variable Expansion**: Expands environment variables (e.g., `$PORT`) within your configuration files.
- 🔒 **Encryption Support**: Includes helpers for encrypting and decrypting sensitive configuration values.
- 🔥 **Hot-Reload**: Can watch for file changes and automatically reload the configuration during development.

## Goal

- 🎯 **Reliable Configuration**: To provide a single, reliable source of truth for application configuration.
- 🛡️ **Prevent Runtime Errors**: To catch configuration errors at startup, rather than at runtime, through schema validation.
- 🧑‍💻 **Great DX**: To offer a simple and intuitive API for managing complex application configurations.

## Design Principles

- **Layered Configuration**: Configuration sources are layered, allowing defaults to be cleanly overridden by environment-specific settings.
- **Fail-Fast**: The manager is designed to throw an error and exit the process if the configuration is invalid, preventing the application from starting in a broken state.
- **Type-Safe**: Leverages TypeScript generics to provide a fully typed configuration object.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Define a schema, create a `ConfigManager` instance, and use it to load your application's configuration.

```typescript
import { createConfigManager } from "@wpackages/config-manager";

// 1. Define the shape of your configuration
interface AppConfig {
	port: number;
	nodeEnv: "development" | "production" | "test";
	apiKey: string;
}

// 2. Create a config manager with a validation schema
const configManager = createConfigManager<AppConfig>({
	schema: {
		port: { type: "number", required: true, env: "PORT" },
		nodeEnv: {
			choices: ["development", "production", "test"],
			required: true,
			env: "NODE_ENV",
		},
		apiKey: { type: "string", required: true, env: "API_KEY" },
	},
});

// 3. Load the configuration
async function start() {
	try {
		// This will load from .env files, environment variables, and defaults, then validate.
		const { config } = await configManager.load();

		console.log("Configuration loaded successfully:", config);
		// Now you can start your application with the validated `config` object.
	} catch (error) {
		console.error("Failed to load configuration:", error.message);
		process.exit(1);
	}
}

start();
```

## License

This project is licensed under the MIT License.
