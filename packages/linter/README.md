# @wpackages/linter

## Introduction

`@wpackages/linter` is a custom, high-performance linter for the `wpackages` monorepo. It is designed to enforce project-specific coding conventions and best practices that may not be covered by general-purpose linters like ESLint or Oxlint. It uses `@wpackages/parser` to create an Abstract Syntax Tree (AST) and runs a series of custom rules against it.

## Features

- 🚀 **High Performance**: Built with performance in mind to provide fast feedback.
- 🌳 **AST-Based Rules**: Operates on the Abstract Syntax Tree, allowing for powerful and precise rule creation.
- 🔧 **Customizable Rules**: Easily extendable with new rules to enforce specific architectural patterns or coding styles.
- 🧩 **Functional and Type-Safe**: Written with `Effect-TS` for a robust, maintainable, and error-resistant codebase.
- CLI **Integrated CLI**: Comes with a `wlint` command-line tool for easy integration into development workflows and CI pipelines.

## Goal

- 🎯 **Enforce Project Conventions**: To programmatically enforce the unique architectural and stylistic conventions of the `wpackages` monorepo.
- 🛡️ **Prevent Common Errors**: To catch potential bugs and anti-patterns that are specific to this project's codebase.
- 🧑‍💻 **Improve Code Quality**: To serve as a tool for maintaining a high standard of code quality and consistency across all workspaces.

## Design Principles

- **Performance**: The linter must be fast enough to run frequently during development without causing friction.
- **Precision**: Rules should be precise to avoid false positives and provide clear, actionable feedback.
- **Extensibility**: The architecture should make it simple to add new rules as the project evolves.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The linter is run via the `wlint` command, which is available at the monorepo root.

### Running the Linter

To lint a specific file or directory:

```bash
# Lint a single file
bun wlint ./packages/linter/src/index.ts

# Lint all files in a directory
bun wlint ./packages/linter/src
```

### Integrating with `turbo`

It is typically run across the entire monorepo using the `lint` script defined in the root `package.json`.

```bash
# Run the linter on all workspaces
bun run lint

# Run the linter on a specific workspace
turbo lint --filter=@wpackages/linter
```

## License

This project is licensed under the MIT License.
