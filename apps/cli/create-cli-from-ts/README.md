# @wpackages/create-cli-from-ts

## Introduction

`@wpackages/create-cli-from-ts` is a powerful CLI tool designed to bundle a TypeScript file and its local dependencies into a complete, distributable Node.js package. It analyzes your entry file, traces all local imports, and scaffolds a new package directory with all the necessary source files, configuration (`package.json`, `tsconfig.json`), and utility scripts.

## Features

- 🚀 **Zero-Configuration Bundling**: Simply point the CLI to your TypeScript entry file, and it handles the rest.
- 🔍 **Automatic Dependency Crawling**: Intelligently finds and includes all local TypeScript modules imported by your entry file.
- 📦 **Complete Package Scaffolding**: Generates a full package structure with `package.json`, `tsconfig.json`, `.gitignore`, and other essential configuration files.
- ✨ **AI-Powered Enhancement**: Optionally uses the OpenAI API to automatically improve the generated `README.md` and add descriptive metadata to `package.json`.
- ⚙️ **Ready-to-Use Scripts**: The generated package includes pre-configured scripts for building, linting, formatting, and testing.
- 交互 **Interactive and Non-Interactive Modes**: Can be run with an interactive wizard or with command-line flags for automation.

## Goal

- 🎯 **Rapid Prototyping**: To enable developers to turn a single TypeScript file into a shareable CLI tool in seconds.
- 📦 **Simplified Distribution**: To abstract away the complexity of packaging a TypeScript project for distribution.
- 🤖 **Automated Documentation**: To leverage AI for generating high-quality documentation and package metadata, saving developer time.

## Design Principles

- **Pragmatic Defaults**: The generated package includes a minimal but highly effective setup for building, linting, and testing.
- **Local-First Bundling**: The tool focuses on bundling local source imports (files with relative paths), treating external dependencies as standard npm packages.
- **Reproducible Output**: Uses standardized templates for configuration files, ensuring that every generated package is consistent.
- **CLI-Friendly Build**: Automatically adds a shebang to the build output, making the resulting JavaScript file directly executable.

## Installation

This tool is an internal package. Ensure all root dependencies are installed:

```bash
# From the monorepo root
bun install
```

The `create-cli-from-ts` command is available via the `bin` field in `package.json`.

## Usage

To bundle a TypeScript file into a new package, run the tool from the monorepo root and provide the path to your entry file.

```bash
bun create-cli-from-ts <path-to-your-entry-file.ts>
```

The tool will launch an interactive wizard to guide you through the process.

### Non-Interactive Usage

You can also provide all options as flags for use in automated scripts:

```bash
bun create-cli-from-ts build --entry <path> --name <package-name> --ai --openaiKey <key>
```

**Options:**

- `--entry`, `-e`: The path to the TypeScript entry file.
- `--name`, `-n`: The name for the generated package folder.
- `--ai`: Enable AI-powered enhancement.
- `--openaiKey`: Your OpenAI API key (required for AI mode).

## Examples

### Run the Built-in Example

The repository includes an example file at `examples/hello.ts`. To bundle it, run:

```bash
# Run from the package root (cli/create-cli-from-ts)
bun run examples
```

This will generate a new folder named `example-generated-cli` with the complete package structure.

## License

This project is licensed under the MIT License.
