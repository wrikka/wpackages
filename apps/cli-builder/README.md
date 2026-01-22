# @wpackages/cli-builder

## Introduction

`@wpackages/cli-builder` is a powerful and type-safe library for building command-line interfaces in TypeScript. It is built with Effect-TS and supports both traditional flag-based execution and modern interactive prompt-based flows out of the box. Its functional design makes it easy to create CLIs that are robust, testable, and maintainable.

## Features

- 🎭 **Dual Mode**: Works seamlessly with command-line flags (e.g., `my-cli --name=cascade`) and interactive prompts for a guided experience.
- 🔒 **Type-Safe**: Leverages `Effect-TS` and `@effect/schema` for robust, compile-time validation of commands, options, and arguments.
- 🧩 **Functional by Design**: Written with a functional programming approach, promoting clean, composable, and easily testable code.
- ⚙️ **Highly Configurable**: Define commands, options, and actions through a simple configuration object. Supports loading external config files (e.g., `my-cli.config.ts`).
- 🌳 **Command Nesting**: Supports deeply nested commands (e.g., `git remote add ...`) for creating complex CLI structures.
- 훅 **Lifecycle Hooks**: Provides global and command-specific `before` and `after` hooks for implementing middleware-like functionality.

## Goal

- 🎯 **Developer Experience**: To provide a best-in-class, type-safe API for building complex CLIs without boilerplate.
- 🛡️ **Robustness**: To eliminate runtime errors through a powerful type system and functional constructs.
- 🤸 **Flexibility**: To allow developers to build both simple scripts and complex, interactive command-line applications with the same tool.

## Design Principles

- **Configuration as Code**: CLIs are defined declaratively using TypeScript objects, making them easy to read, modify, and extend.
- **Effect-Driven**: All side effects (like file system access or network requests) are managed through the `Effect` system, making the CLI fully interruptible and testable.
- **Composability**: Commands and options are designed to be composable, allowing for the creation of reusable CLI components.

## Installation

This is a workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The CLI builder can be used to create a new CLI application. The core of the application is a configuration file that defines its structure and behavior.

### Configuration

All commands and options are defined in a configuration object. Here is a basic example:

```typescript
// my-cli.config.ts
import type { CliConfig } from "@wpackages/cli-builder";

export const config: CliConfig = {
	name: "my-cli",
	version: "0.0.1",
	commands: [
		{
			name: "hello",
			description: "Prints a greeting",
			options: [
				{
					name: "--name",
					shorthand: "-n",
					description: "The name to greet",
					defaultValue: "World",
				},
			],
			action: ({ options }) => {
				console.log(`Hello, ${options.name}!`);
			},
		},
	],
};
```

## Examples

### Running in Flag Mode

Execute commands directly from the terminal with flags.

```bash
# Run the 'hello' command with a name
bun my-cli hello --name Cascade

# Get help
bun my-cli --help
```

### Running in Prompt Mode

Run the CLI without arguments to enter an interactive prompt mode.

```bash
bun my-cli
```

The CLI will guide you through the available commands and their options.

### Advanced Example: Hooks and Nesting

```typescript
// my-cli.config.ts
export const config: CliConfig = {
	name: "git-cli",
	before: () => console.log("Global before hook"),
	after: () => console.log("Global after hook"),
	commands: [
		{
			name: "remote",
			description: "Manage remotes",
			before: () => console.log("Remote command before hook"),
			subCommands: [
				{
					name: "add",
					action: () => {/* ... */},
				},
			],
		},
	],
};
```

## License

This project is licensed under the MIT License.
