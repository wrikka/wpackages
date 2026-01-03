# CLI Builder

A powerful and type-safe CLI builder that supports both flag-based and prompt-based interactions, built with TypeScript and Effect-TS.

## Features

- **Dual Mode**: Works seamlessly with command-line flags (like `commander`) and interactive prompts (like `@clack/prompts`).
- **Type-Safe**: Leverages TypeScript and Effect-TS for robust, error-free code.
- **Functional**: Written with a functional programming approach for clean, testable, and maintainable code.
- **Configurable**: Easily define commands, options, and actions in a simple configuration object. Supports loading external config files (`<name>.config.ts`).
- **Nesting**: Supports nested commands for complex CLI structures.
- **Hooks**: Global and command-specific `before` and `after` hooks for middleware-like functionality.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd cli-builder

# Install dependencies
bun install
```

## Usage

There are two ways to use the CLI:

### 1. Flag Mode

Run commands directly with flags, similar to `commander`.

```bash
# Run the 'hello' command with a name
bun src/index.ts hello --name Cascade

# Get help
bun src/index.ts --help

# Get version
bun src/index.ts --version
```

### 2. Prompt Mode

Run the CLI without any arguments to enter an interactive prompt mode, powered by `@clack/prompts`.

```bash
bun src/index.ts
```

The CLI will guide you through the available commands and their options.

## Advanced Features

### Command Nesting

You can nest commands by defining a `subCommands` array within a command.

```typescript
// src/config/cli.config.ts
{
  name: 'git',
  description: 'A git-like command',
  subCommands: [
    {
      name: 'remote',
      description: 'Manage remotes',
      // ... further nesting
    },
  ],
}
```

### Hooks (Middleware)

Hooks can be defined globally or on a per-command basis. They are executed in the following order:

1. Global `before`
2. Command `before`
3. Command `action`
4. Command `after`
5. Global `after`

```typescript
// src/config/cli.config.ts
export const config: CliConfig = {
	name: "my-cli",
	before: () => console.log("Global before hook"),
	after: () => console.log("Global after hook"),
	commands: [
		{
			name: "hello",
			before: () => console.log("Command before hook"),
			action: () => {/* ... */},
		},
	],
};
```

## Configuration

All commands and options are defined in `src/config/cli.config.ts`. You can easily add or modify commands by editing this file.

```typescript
// src/config/cli.config.ts
import type { CliConfig } from "../types";

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
			action: args => {
				console.log(`Hello, ${args.name}!`);
			},
		},
		// Add more commands here
	],
};
```

## Project Structure

The project follows a functional programming structure inspired by Effect-TS best practices:

- `src/app.ts`: Main application entry point.
- `src/components/`: Pure functions for UI/display logic.
- `src/config/`: CLI configuration.
- `src/constant/`: Application-wide constants.
- `src/lib/`: Wrappers for third-party libraries.
- `src/services/`: Effect-based services that handle side effects.
- `src/types/`: Shared type definitions.
- `src/utils/`: Pure utility functions.

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
