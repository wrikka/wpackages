# @wpackages/file-system

## Introduction

`@wpackages/file-system` is a functional, type-safe, and composable service for interacting with the file system. It provides an `Effect-TS`-based wrapper around Node.js's `fs` module, transforming file system operations from side effects into declarative, testable `Effect`s.

## Features

- ⚡ **Effect-Based API**: All file system operations (read, write, delete, etc.) are exposed as `Effect`s.
- 💪 **Robust Error Handling**: File system errors (e.g., file not found, permission denied) are captured as typed `Effect` failures, enabling exhaustive error handling.
- 🧪 **Highly Testable**: By modeling the file system as a service, you can easily provide a mock implementation in your tests to simulate file operations without touching the actual disk.
- 🧩 **Composable**: File system effects can be seamlessly composed with other effects in your application.

## Goal

- 🎯 **Safe Side Effects**: To provide a safe and controlled interface for the side effect of interacting with the file system.
- ✅ **Enable Testability**: To allow application logic that depends on the file system to be tested easily and reliably.
- 🧑‍💻 **Consistent Functional Interface**: To offer a consistent, functional API for all file system interactions, aligned with the rest of the `Effect-TS` ecosystem.

## Design Principles

- **Service-Oriented**: File system access is modeled as a service that can be provided via a `Layer`.
- **Declarative**: You describe the file operation you want to perform as an effect; the service's implementation handles the actual interaction with the `fs` module.
- **Structured Errors**: All potential errors are modeled as typed, structured data, not just strings.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The service provides `Effect`s for common file system operations.

### Example: Reading and Writing a File

```typescript
import { FileSystem } from "@wpackages/file-system";
import { Effect } from "effect";

// 1. Define a program that uses the FileSystem service
const program = Effect.gen(function*() {
	// Access the service from the context
	const fs = yield* FileSystem;

	const filePath = "example.txt";
	const content = "Hello from Effect-TS!";

	// Write to a file
	yield* fs.writeFile(filePath, content);

	// Read from the file
	const readContent = yield* fs.readFile(filePath, "utf-8");

	console.log("File content:", readContent);
});

// 2. To run this, you would provide the live implementation of the FileSystem service.
// const runnable = Effect.provide(program, FileSystemLive);
// Effect.runPromise(runnable);
```

## License

This project is licensed under the MIT License.
