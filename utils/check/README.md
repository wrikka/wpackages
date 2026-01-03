# @wpackages/check

## Introduction

`@wpackages/check` is a comprehensive, all-in-one code quality checker for the `wpackages` monorepo. It is built with `Effect-TS` and provides a suite of tools for static analysis, including TypeScript type checking, unused code detection, dependency analysis, circular dependency detection, and more. It can be run via its interactive CLI (`wcheck`) or programmatically.

## Features

- ✅ **Multi-Faceted Analysis**: A wide range of checks including type safety, unused code, dependencies, import validation, and code complexity.
- interactive **Interactive CLI**: A user-friendly interactive mode powered by `@clack/prompts` that allows you to select which checks to run.
- 🚀 **Parallel Execution**: The ability to run multiple checks concurrently for maximum speed.
- 🎨 **Beautiful Output**: Presents results in a colorful, readable, and easy-to-understand format.
- 🧩 **Functional and Type-Safe**: The entire tool is built with `Effect-TS`, making it robust, testable, and maintainable.
- 🔧 **Programmatic API**: In addition to the CLI, it exposes a functional API for integration into other tools and scripts.

## Goal

- 🎯 **Holistic Code Quality**: To provide a single, unified tool for maintaining all aspects of code quality within the monorepo.
- 🛡️ **Prevent Errors**: To proactively identify potential issues like type errors, circular dependencies, and unused code before they become problems.
- 🧑‍💻 **Streamline Reviews**: To automate common code review tasks and provide a consistent baseline for code quality.

## Design Principles

- **All-in-One**: Aims to be a one-stop shop for code quality analysis, reducing the need for multiple disparate tools.
- **User-Friendly**: Both the CLI and the output are designed to be as intuitive and helpful as possible.
- **Performance**: Leverages parallel execution and efficient analysis techniques to provide fast feedback.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

### Interactive CLI

The `wcheck` command launches an interactive wizard that lets you choose which checks to perform.

```bash
# Run from the monorepo root
bun wcheck
```

### Programmatic API

You can also run the checker programmatically within an `Effect-TS` program.

```typescript
import { runChecker } from "@wpackages/check";
import { Effect } from "effect";

// Define a program to run specific checks
const program = runChecker({
	checks: ["type", "unused", "circular"],
});

// Run the program
await Effect.runPromise(program);
```

### Available Checks

- `type`: Full TypeScript type checking.
- `unused`: Detects unused variables, imports, and exports.
- `deps`: Analyzes `package.json` dependencies.
- `circular`: Finds circular dependency chains between files.
- `complexity`: Measures cyclomatic complexity of functions.
- And many more...

## License

This project is licensed under the MIT License.
