# wpackages

## Introduction

`wpackages` is a comprehensive monorepo built with Bun and TypeScript, managed by Turborepo. It serves as a centralized hub for developing and maintaining a collection of reusable packages, services, applications, CLI tools, and utilities. The primary goal is to foster code sharing, maintain consistency, and accelerate development across multiple related projects within a single, unified codebase. Built with functional programming principles and type-safety at its core, wpackages provides a robust foundation for building modern applications.

## Features

- ⚡️ **High-Performance Tooling**: Utilizes **Bun** as the package manager and runtime for exceptional speed
- 🚀 **Optimized Task Running**: Employs **Turborepo** to orchestrate and cache tasks, speeding up builds, tests, and linting
- 🏗️ **Structured Workspace**: Organizes code logically into distinct workspaces like `packages`, `services`, `apps`, `utils`, `framework`, `lib`, and `cli`
- ✅ **Automated Quality Checks**: Integrates **Oxlint** for linting and **dprint** for code formatting to ensure code consistency
- 🧪 **Robust Testing**: Uses **Vitest** for running unit and integration tests within each workspace
- 🪝 **Git Hooks**: Leverages **Lefthook** to automate checks like formatting and linting before commits and pushes
- 🧩 **Shared Configurations**: Centralizes configurations like `tsconfig.json` to maintain consistency across the entire monorepo
- 🎨 **Framework Kits**: Unified meta-packages that aggregate related tools for specific development needs
- 🔒 **Type-Safe**: Built with TypeScript and Effect-TS for compile-time safety and functional programming
- 🌐 **Cross-Platform**: Works seamlessly across different platforms and runtimes

## Goal

- 🎯 **Centralized Development**: Provide a single workspace to develop and share internal libraries (`packages/*`, `services/*`, `utils/*`, `framework/*`, `lib/*`)
- 🔄 **Consistent Tooling**: Keep tooling and conventions consistent across many small projects
- ⏩ **Rapid Iteration**: Enable fast iteration with optimized task pipelines (`format` -> `lint` -> `test` -> `build` -> `verify`)
- 🤸 **Flexibility**: Support diverse development needs from CLI tools to web applications
- 🛡️ **Quality**: Maintain high code quality through automated tooling and comprehensive testing

## Design Principles

- 🏛️ **Monorepo First**: Workspaces are versioned and developed together as a cohesive unit
- 🤖 **Automation**: Prefer `turbo` tasks over running tools manually to ensure reliability and speed
- 📏 **Consistency**: Maintain uniform `tsconfig.json` and script conventions across all packages
- 🔒 **Safety**: Utilize Git hooks to run formatting before commits and verification checks before pushes
- 💫 **Effect-Driven**: Leverage Effect-TS for functional programming and robust error handling
- 🧩 **Composability**: Design components to be composable and reusable across projects
- 🔒 **Type Safety First**: Leverage TypeScript's type system to catch errors at compile time

## Installation

### Prerequisites

- `bun` (This repository uses `bun@1.3.5`)
- `git`

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/newkub/wpackages.git
   cd wpackages
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Install Git hooks:
   ```bash
   bun run prepare
   ```

## Usage

### Root Commands

Common commands to run from the repository root:

```bash
# Format all code
bun run format

# Lint all workspaces
bun run lint

# Run tests across all workspaces
bun run test

# Build all packages and apps
bun run build

# Run all verification steps (format, lint, test)
bun run verify

# Start development mode for all apps
bun run dev
```

### Workspace-Specific Commands

To run a command for a specific workspace, use the `--filter` flag with Turborepo. The package name is defined in its `package.json`.

```bash
# Build only the 'program' app
turbo build --filter=@wpackages/program

# Run tests for the 'palse' library
turbo test --filter=@wpackages/palse

# Lint the 'cache' service
turbo lint --filter=@wpackages/cache
```

## Workspaces

### Framework Kits

Framework kits are meta-packages that aggregate related tools for specific development needs:

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/cli-kit` | Unified interface for CLI builder, TUI components, prompts, and config management | Bun, Node.js | CLI Development | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/web-kit` | Unified interface for API builder, HTTP, routing, server, plugins, and tracing | Bun, Node.js | Web/API Development | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/utils-kit` | Unified interface for error handling, schema validation, signals, store, and diff | Bun, Node.js, Browser | Utility Libraries | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/dev-kit` | Unified interface for testing, TypeScript build, formatting, and reporting | Bun, Node.js | Development Tools | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |

### Packages

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/api-builder` | Build robust, type-safe APIs with Effect-TS | Bun, Node.js | API Development | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/http-server` | Complete HTTP server stack with routing and response handling | Bun, Node.js | HTTP Server | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/plugins-system` | Plugin system for building extensible applications | Bun, Node.js, Browser | Plugin Architecture | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/tracing` | Distributed tracing utilities for observability | Bun, Node.js | Observability | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | S |

### Services

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/cache` | Caching service with multiple backends | Bun, Node.js | Caching | ✅ Stable | ✅ Full | ✅ Vitest | ✅ Bench | M |
| `@wpackages/config-manager` | Configuration management with validation and hot-reload | Bun, Node.js, Browser | Config Management | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/api-integrations` | API integration utilities | Bun, Node.js | API Integration | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | S |

### Libraries

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/error` | Error handling utilities | Bun, Node.js, Browser | Error Handling | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | S |
| `@wpackages/schema` | Schema validation system | Bun, Node.js, Browser | Validation | ✅ Stable | ✅ Full | ✅ Vitest | ✅ Bench | M |
| `@wpackages/signal` | Reactive signals for state management | Bun, Node.js, Browser | Reactivity | ✅ Stable | ✅ Full | ✅ Vitest | ✅ Bench | M |
| `@wpackages/store` | State management store | Bun, Node.js, Browser | State Management | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/diff` | Diff utilities for comparing data structures | Bun, Node.js, Browser | Data Comparison | ✅ Stable | ✅ Full | ✅ Vitest | ✅ Bench | M |

### CLI Tools

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/cli-builder` | Build command-line interfaces with Effect-TS | Bun, Node.js | CLI Development | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/tui` | Terminal UI components | Bun, Node.js | Terminal UI | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/prompt` | Interactive prompts with Ink.js and React | Bun, Node.js | Interactive Prompts | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | L |

### Components

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/cli-components` | Reusable CLI components | Bun, Node.js | CLI Components | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/prompt` | Interactive prompt components | Bun, Node.js | Prompt Components | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | L |

### Applications

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/program` | Main program application | Bun | Application | 🚧 In Development | 📝 Partial | ⏳ Planned | ❌ None | L |
| `@wpackages/dotfiles-manager` | Dotfiles management tool | Bun | System Tools | 🚧 In Development | 📝 Partial | ⏳ Planned | ❌ None | M |
| `@wpackages/record-terminal` | Terminal recording utility | Bun | Terminal Tools | 🚧 In Development | 📝 Partial | ⏳ Planned | ❌ None | M |
| `@wpackages/replace` | Text replacement tool | Bun | Text Processing | 🚧 In Development | 📝 Partial | ⏳ Planned | ❌ None | S |

### Development Tools

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/test` | Testing utilities | Bun, Node.js | Testing | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/ts-build` | TypeScript build tools | Bun, Node.js | Build Tools | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/formatter` | Code formatter | Bun, Node.js | Code Formatting | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | M |
| `@wpackages/reporter` | Reporting utilities | Bun, Node.js | Reporting | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | S |

### Utilities

| Package | Description | Platform | Use Case | Status | Documentation | Testing | Bench | Size |
|---------|-------------|----------|----------|--------|--------------|---------|-------|------|
| `@wpackages/algorithms` | Algorithm implementations | Bun, Node.js, Browser | Algorithms | ✅ Stable | ✅ Full | ✅ Vitest | ✅ Bench | L |
| `@wpackages/async` | Async utilities | Bun, Node.js, Browser | Async Operations | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | S |
| `@wpackages/cleanup` | Cleanup utilities | Bun, Node.js | Resource Management | ✅ Stable | ✅ Full | ✅ Vitest | ❌ None | S |
| `@wpackages/concurrency` | Concurrency utilities | Bun, Node.js, Browser | Concurrency | ✅ Stable | ✅ Full | ✅ Vitest | ✅ Bench | M |

## Examples

### Using CLI Kit

```typescript
import { createCli, components, prompt } from "@wpackages/cli-kit";

const config = {
	name: "my-cli",
	version: "1.0.0",
	commands: [
		{
			name: "hello",
			description: "Prints a greeting",
			action: async () => {
				const name = await prompt.text({ message: "What is your name?" });
				yield* components.display.success(`Hello, ${name}!`);
			},
		},
	],
};

const cli = createCli(config);
Effect.runPromise(cli.run);
```

### Using Web Kit

```typescript
import { ApiBuilder, HttpServer } from "@wpackages/web-kit";

const api = ApiBuilder.create({
	routes: [
		{
			method: "GET",
			path: "/users",
			handler: Effect.succeed({ users: [] }),
		},
	],
});

Effect.runPromise(api.start({ port: 3000 }));
```

### Using Utils Kit

```typescript
import { Schema, Signal, Store } from "@wpackages/utils-kit";

const schema = Schema.struct({
	name: Schema.string,
	age: Schema.number,
});

const count = Signal.create(0);
const store = Store.create({ user: null });
```

### Using Dev Kit

```typescript
import { describe, it, expect, Builder, Formatter } from "@wpackages/dev-kit";

describe("My test", () => {
	it("should work", () => {
		expect(1 + 1).toBe(2);
	});
});

await Builder.create({ entry: "src/index.ts", outDir: "dist" }).build();
await Formatter.create().format("src/**/*.ts");
```

## Quick Reference

### Platform Legend

- **Bun**: Optimized for Bun runtime
- **Node.js**: Compatible with Node.js
- **Browser**: Works in browser environments

### Status Legend

- ✅ **Stable**: Production-ready and actively maintained
- 🚧 **In Development**: Work in progress, not yet production-ready
- ⚠️ **Deprecated**: Still available but not recommended for new projects
- 🧪 **Experimental**: Early stage, may have breaking changes

### Documentation Legend

- ✅ **Full**: Complete documentation with examples
- 📝 **Partial**: Basic documentation available
- ❌ **None**: No documentation yet

### Testing Legend

- ✅ **Vitest**: Full Vitest test suite
- ⏳ **Planned**: Tests planned but not implemented
- ❌ **None**: No tests

### Benchmark Legend

- ✅ **Bench**: Benchmarks available
- ❌ **None**: No benchmarks

### Size Legend

- **S**: Small (< 100 KB)
- **M**: Medium (100 KB - 1 MB)
- **L**: Large (> 1 MB)

## License

This project is licensed under the MIT License.
