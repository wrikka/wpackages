# @wpackages/vitext

## Introduction

`@wpackages/vitext` is a modern, fast, and lightweight web framework for building high-performance web applications. It is designed to provide a superior developer experience to existing tools like Vite, enhanced with a powerful integrated caching layer, an advanced file watching system, and robust functional error handling.

## Features

- **Extremely Fast Dev Server**: A lightning-fast development server with Hot Module Replacement (HMR) powered by `@wpackages/devserver`.
- **Optimized Builds**: Utilizes modern bundlers like Rolldown for highly optimized production builds.
- **File-Based Routing**: Automatic route generation based on your file system structure, powered by `radix3`.
- **Type-Safe APIs**: First-class TypeScript support throughout the framework.
- **Advanced Caching**: A multi-layer caching system (build artifacts, module resolution, file system) with TTL and LRU eviction policies.
- **Intelligent File Watching**: A high-performance file watcher with support for negation patterns, performance monitoring, and debounced hot reloading.
- **Functional Error Handling**: Leverages functional constructs for type-safe, composable, and robust error management.
- **Flexible Configuration**: Simple and powerful configuration via a `vitext.config.ts` file.

## Goal

- **Superior DX**: To provide a development experience that is faster, more intuitive, and more powerful than existing web frameworks.
- **Peak Performance**: To deliver both a rapid development workflow and a highly optimized production output.
- **Integrated Power-Features**: To seamlessly integrate advanced capabilities like caching and file-watching without requiring complex configuration.

## Design Principles

- **Performance First**: Every architectural decision is made with performance as a primary consideration.
- **Functional and Composable**: The framework is built using a functional programming approach, leading to code that is more predictable, testable, and maintainable.
- **Sensible Defaults, Powerful Customization**: Works great out of the box, but provides deep customization options for advanced use cases.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

Vitext is typically used to power a web application within the monorepo.

### Development

To start the development server for an app using Vitext:

```bash
# Example: running the 'my-web-app' workspace
turbo dev --filter=my-web-app
```

### Build

To build the application for production:

```bash
turbo build --filter=my-web-app
```

## Examples

### Configuration (`vitext.config.ts`)

Create a `vitext.config.ts` file in your application's root to configure the framework:

```typescript
import { defineConfig } from "@wpackages/vitext";

export default defineConfig({
	server: {
		port: 3000,
		hostname: "localhost",
	},
	root: "./src",
	build: {
		outDir: "dist",
		minify: true,
		sourcemap: true,
	},
	define: {
		__VERSION__: JSON.stringify("1.0.0"),
	},
});
```

### Advanced API Usage

Vitext exposes its internal services for advanced integrations:

```typescript
import { createVitextApp } from "@wpackages/vitext";

const app = await createVitextApp();

// Access the caching service
app.cache.setBuildArtifact("my-key", { data: "some-value" });

// Listen for file changes
app.watcher.onChange((path, event) => {
	console.log(`File ${event}: ${path}`);
});
```

## License

This project is licensed under the MIT License.
