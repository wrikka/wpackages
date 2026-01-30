# @wpackages/formatter

## Introduction

`@wpackages/formatter` is a simple command-line wrapper around the `dprint` code formatter. It provides a standardized command, `wformat`, for formatting code across the entire `wpackages` monorepo, ensuring a consistent code style.

## Features

- 🚀 **Powered by `dprint`**: Leverages the high-speed, plugin-based `dprint` formatter for consistent and fast code formatting.
- 🔧 **Simple CLI**: A zero-configuration wrapper that provides a single, memorable command for formatting.
-
  - **Project-Wide Consistency**: Ensures all code in the monorepo adheres to the same formatting rules defined in the root `dprint.json` file.

## Goal

- 🎯 **Standardize Formatting**: To provide a single, unified command for code formatting across all workspaces.
- 🧑‍💻 **Simplify Developer Workflow**: To make code formatting a quick and effortless part of the development process.

## Design Principles

- **Simplicity**: The tool is a thin wrapper around `dprint`, providing a simple and focused command-line interface.
- **Convention over Configuration**: It automatically discovers and uses the project's root `dprint.json` configuration file.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The tool is run via the `wformat` command from the monorepo root.

### Format All Files

To format all supported files in the entire project:

```bash
bun wformat
```

### Format Specific Paths

You can also provide one or more paths to format only specific files or directories:

```bash
bun wformat ./services/formatter/src ./packages/bench/src
```

## License

This project is licensed under the MIT License.
