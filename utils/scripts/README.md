# @wpackages/utils-scripts

## Introduction

`@wpackages/utils-scripts` is a functional, configuration-driven script management tool for running and orchestrating tasks. Built with `Effect-TS`, it provides a robust and type-safe way to define, manage, and execute scripts with advanced features like dependency management, parallel execution, retries, and timeouts.

## Features

- 📄 **Configuration-Driven**: Define all your scripts in a single, type-safe `scripts.config.ts` file.
- 🔗 **Dependency Management**: Automatically resolves and executes scripts in the correct order based on their declared dependencies.
- parallel **Parallel Execution**: Run independent scripts concurrently to speed up your workflows.
- 💪 **Resilience**: Built-in support for retries (with configurable delays) and timeouts for long-running scripts.
-
  - **Functional and Type-Safe**: Leverages `Effect-TS` for robust, composable, and predictable error handling.
-
  - **CLI and Programmatic API**: Can be used as a command-line tool or integrated directly into other applications.

## Goal

- 🎯 **Standardize Scripting**: To provide a single, consistent, and powerful way to manage all project scripts, moving beyond simple `package.json` scripts.
- 🚀 **Orchestrate Complex Workflows**: To enable the creation of complex, multi-step workflows with dependencies and parallel execution.
- 🛡️ **Improve Reliability**: To make script execution more reliable with built-in fault-tolerance patterns like retries and timeouts.

## Design Principles

- **Declarative**: You declare your scripts and their relationships in a configuration file; the runner handles the execution logic.
- **Type-Safe**: The configuration is fully typed, providing autocompletion and catching errors at compile time.
- **Effect-Driven**: All script executions are managed as `Effect`s, making them easy to compose, test, and reason about.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### 1. Configuration

Create a `scripts.config.ts` file in your project root to define your scripts.

```typescript
import { defineConfig } from "@wpackages/utils-scripts";

export default defineConfig({
	scripts: {
		build: {
			command: "bun run build",
			description: "Build the project",
			timeout: 30000, // 30 seconds
		},
		test: {
			command: "bun run test",
			description: "Run tests",
			dependencies: ["build"], // Depends on the 'build' script
		},
		deploy: {
			command: "bun run deploy",
			description: "Deploy the application",
			dependencies: ["test"],
			retries: 3,
			retryDelay: 2000, // 2 seconds
		},
	},
});
```

### 2. CLI Execution

Use the CLI to run your defined scripts.

```bash
# List all available scripts
scripts list

# Run a specific script (and its dependencies)
scripts run test

# Run all scripts sequentially
scripts run-all

# Run all independent scripts in parallel
scripts run-all --parallel
```

## License

This project is licensed under the MIT License.
