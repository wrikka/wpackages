# @wpackages/env-manager

## Introduction

`@wpackages/env-manager` is a command-line tool for managing environment variables. It can read configuration from multiple sources (like `.env` files), validate them, and output them in different formats. It is built with `Effect-TS` and uses `@wpackages/config-manager` for its core logic.

## Features

-
  - **Multi-Source Loading**: Reads environment variables from `.env`, `.env.local`, and environment-specific files (e.g., `.env.production`).
-
  - **Multiple Output Formats**: Can output the resolved environment variables as a standard `.env` file or other formats.
-
  - **Path Aggregation**: Can read and aggregate `.env` files from multiple directory paths in a single command.
-
  - **Type-Safe**: Built with `Effect-TS` for robust and type-safe operations.

## Goal

- 🎯 **Centralize Environment Management**: To provide a single tool for managing environment variables across different applications and services in the monorepo.
-
  - **Simplify Local Development**: To make it easy to assemble the required environment variables for running an application locally.
-
  - **Ensure Consistency**: To help ensure that different environments (development, production) are configured consistently.

## Design Principles

- **CLI-First**: Designed as a convenient command-line tool for developers.
- **Configuration as Code**: Leverages the power of `@wpackages/config-manager` to handle the complexity of loading and merging configurations.
- **Simplicity**: Provides a simple and intuitive command-line interface.

## Installation

This is an internal workspace package. Ensure you have installed dependencies from the monorepo root:

```bash
bun install
```

## Usage

The tool is run via the `wenv` command from the monorepo root.

### Basic Usage

Read `.env` files from the current directory and print the result.

```bash
bun wenv
```

### Specifying Paths

Read and merge `.env` files from multiple locations.

```bash
bun wenv . ./apps/program
```

### Specifying an Environment

Load environment-specific files (e.g., `.env.production`).

```bash
bun wenv --env production
```

### Changing Output Format

Output the result in `dotenv` format.

```bash
bun wenv --output dotenv
```

## License

This project is licensed under the MIT License.
