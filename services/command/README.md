# @wpackages/command

## Introduction

`@wpackages/command` provides a functional, type-safe, and composable service for executing operating system commands within an `Effect-TS` application. It wraps the complexity of spawning and managing child processes in a declarative `Effect`-based API, making interactions with external tools safe, testable, and easy to reason about.

## Features

- ⚡ **Effect-Based API**: Execute shell commands as declarative `Effect`s, fully integrated with the Effect ecosystem.
- 🔒 **Type-Safe**: Provides strong typing for command inputs and structured, predictable outputs.
- 📝 **Handles Stdout/Stderr**: Captures and separates standard output and standard error streams.
- 💪 **Robust Error Handling**: Treats process errors (e.g., non-zero exit codes) as typed `Effect` failures, allowing for robust error handling strategies.
- 🧪 **Testable**: Easily mock or replace the command execution layer for deterministic unit and integration tests.

## Goal

- 🎯 **Safe Side Effects**: To provide a safe and controlled way to interact with external processes, which are a common source of side effects.
- 🧩 **Composability**: To enable shell commands to be seamlessly composed with other effects in an application's logic.
- 🧑‍💻 **Improved DX**: To abstract away the low-level details of `child_process` and provide a high-level, developer-friendly API.

## Design Principles

- **Service-Oriented**: Command execution is modeled as a service (`Command`) that can be provided via a `Layer` (`CommandExecutorLive`).
- **Declarative**: You describe the command you want to run as a data structure; the service handles the execution.
- **Structured Output**: The result of a command is a structured object containing the exit code, stdout, and stderr, not just a raw string.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The primary way to use this service is to access the `Command` service via `Effect.gen` and then provide the `CommandExecutorLive` layer to your application's runtime.

### Example: Running a Command

```typescript
import { Command, CommandExecutorLive } from "@wpackages/command";
import { Effect, Layer } from "effect";

// 1. Define a program that uses the Command service
const program = Effect.gen(function*() {
	// Access the service from the context
	const command = yield* Command;

	// Execute 'ls -la' and get the result
	const result = yield* command.execute("ls -la");

	console.log("Exit Code:", result.exitCode);
	console.log("Stdout:", result.stdout);
	console.error("Stderr:", result.stderr);

	// Example of a failing command
	const failingResult = yield* Effect.either(command.execute("exit 1"));
	console.log("Failing command result:", failingResult);
});

// 2. Provide the live implementation of the service
const runnable = Effect.provide(program, CommandExecutorLive);

// 3. Run the program
Effect.runPromise(runnable);
```

## License

This project is licensed under the MIT License.
