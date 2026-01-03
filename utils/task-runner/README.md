# @wpackages/task-runner

## Introduction

`@wpackages/task-runner` is an advanced, zero-dependency, and functional command runner for TypeScript, designed to be a more powerful and type-safe alternative to libraries like `execa`. It provides a rich, fluent API for building and executing shell commands, with built-in support for retries, timeouts, command piping, and robust, functional error handling.

## Features

- 🛡️ **Functional Error Handling**: Uses a `Result<T, E>` type instead of throwing exceptions, making error handling explicit and predictable.
- 🔁 **Built-in Retry Logic**: A powerful `executeWithRetry` function with configurable strategies like exponential backoff.
- 🔗 **Command Piping**: Safely and easily pipe the output of one command into another.
- ⏱️ **Timeout & Cancellation**: Built-in support for timeouts and cancellation via `AbortController`.
- 🏗️ **Fluent Builder Pattern**: A rich, fluent API for constructing complex commands in a readable way.
- 📝 **Tagged Template Literals**: A convenient way to construct commands with variables (`cmd`echo hello ${name}``).
- 📊 **Streaming I/O**: Full support for streaming `stdout` and `stderr` in real-time.
- 📦 **Zero Dependencies**: The core library has no production dependencies, keeping it lightweight.

## Goal

- 🎯 **Robust Scripting**: To provide a powerful and reliable foundation for writing complex scripts and automation in TypeScript.
- 🧑‍💻 **Superior DX**: To offer a developer experience that is more intuitive, type-safe, and powerful than existing command runners.
- ✅ **Functional Purity**: To enable the execution of shell commands in a way that aligns with functional programming principles.

## Design Principles

- **Errors as Values**: All operations return a `Result` object, forcing all failure cases to be handled explicitly.
- **Immutability**: The command builder is immutable; methods like `.cwd()` or `.env()` return a new, updated instance.
- **Composability**: The API is designed to be highly composable, allowing you to build complex commands from simpler parts.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Basic Execution with Result Handling

```typescript
import { execute, isOk } from "@wpackages/task-runner";

const result = await execute({ command: "echo", args: ["Hello, World!"] });

if (isOk(result)) {
	console.log(result.value.stdout); // 'Hello, World!'
} else {
	console.error("Command failed:", result.error.message);
}
```

### Fluent Builder Pattern

Build complex commands in a readable, chainable way.

```typescript
import { git, npm } from "@wpackages/task-runner";

// Run 'npm install' in a specific directory with a timeout
const result = await npm("install")
	.cwd("/path/to/project")
	.env({ NODE_ENV: "production" })
	.timeout(60000) // 60 seconds
	.run();

// Run a git command
const status = await git("status").args("--short").run();
```

## License

This project is licensed under the MIT License.
