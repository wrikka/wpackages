# @wpackages/devserver

## Introduction

`@wpackages/devserver` is an advanced, high-performance development server designed to provide a best-in-class developer experience. It offers features like Hot Module Replacement (HMR), smart caching, and an advanced file watcher, aiming to be a more powerful and integrated alternative to Vite's development server within the `wpackages` ecosystem.

## Features

- ⚡ **Lightning Fast**: An optimized development server with minimal overhead for rapid startup and response times.
- 🔥 **Hot Module Replacement**: Provides instant updates in the browser without requiring a full page reload.
- 🧠 **Smart Caching**: An intelligent multi-layer caching system for modules and file system operations with automatic invalidation.
- 👀 **Advanced File Watching**: A high-performance file watcher with support for negation patterns and performance monitoring, powered by `@wpackages/watch`.
- 🛡️ **In-Browser Error Overlay**: Displays runtime errors directly in the browser with source-mapped stack traces for easy debugging.
- 📊 **Performance Monitoring**: Offers real-time performance metrics and actionable recommendations.
- 🔌 **Middleware Support**: Easily extend the server with custom middleware through a simple and powerful API.
- 🌐 **Integrated WebSocket**: Native WebSocket support for building real-time features.

## Goal

- 🎯 **Peak Developer Productivity**: To create a development server that is so fast and reliable it becomes invisible to the developer.
- 🧩 **Seamless Integration**: To tightly integrate with other packages in the monorepo, such as `webserver` and `watch`, providing a cohesive experience.
- 🚀 **Next-Generation Performance**: To push the boundaries of what is possible for a development server in terms of speed and features.

## Design Principles

- **Performance-Oriented**: Performance is a key consideration in every aspect of the server's design.
- **Extensibility**: The server is designed to be easily extendable and configurable to fit a wide variety of project needs.
- **Sensible Defaults**: Provides a powerful and intuitive experience out of the box with minimal configuration required.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The primary way to use this package is by creating a server instance and starting it.

### Example: Basic Server Setup

```typescript
import { createDevServer } from "@wpackages/devserver";

const server = createDevServer({
	root: "./src", // Your project's source root
	port: 3000,
	hostname: "localhost",
});

// Start the server
await server.start();

console.log("Dev server running on http://localhost:3000");
```

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
```

## License

This project is licensed under the MIT License.
