# wpackages

## Introduction

`wpackages` is a comprehensive monorepo built with Bun and TypeScript, managed by Turborepo. It serves as a centralized hub for developing and maintaining a collection of reusable packages, services, applications, CLI tools, and utilities. The primary goal is to foster code sharing, maintain consistency, and accelerate development across multiple related projects within a single, unified codebase.

## Features

- ⚡️ **High-Performance Tooling**: Utilizes **Bun** as the package manager and runtime for exceptional speed.
- 🚀 **Optimized Task Running**: Employs **Turborepo** to orchestrate and cache tasks, speeding up builds, tests, and linting.
- 🏗️ **Structured Workspace**: Organizes code logically into distinct workspaces like `packages`, `services`, `apps`, `utils`, and more.
- ✅ **Automated Quality Checks**: Integrates **Oxlint** for linting and **dprint** for code formatting to ensure code consistency.
- 🧪 **Robust Testing**: Uses **Vitest** for running unit and integration tests within each workspace.
- 훅 **Git Hooks**: Leverages **Lefthook** to automate checks like formatting and linting before commits and pushes.
- 🧩 **Shared Configurations**: Centralizes configurations like `tsconfig.json` to maintain consistency across the entire monorepo.

## Goal

- 🎯 **Centralized Development**: Provide a single workspace to develop and share internal libraries (`packages/*`, `services/*`, `utils/*`, `framework/*`, `lib/*`).
- 🔄 **Consistent Tooling**: Keep tooling and conventions consistent across many small projects.
- ⏩ **Rapid Iteration**: Enable fast iteration with optimized task pipelines (`format` -> `lint` -> `test` -> `build` -> `verify`).

## Design Principles

- 🏛️ **Monorepo First**: Workspaces are versioned and developed together as a cohesive unit.
- 🤖 **Automation**: Prefer `turbo` tasks over running tools manually to ensure reliability and speed.
- 📏 **Consistency**: Maintain uniform `tsconfig.json` and script conventions across all packages.
- 🔒 **Safety**: Utilize Git hooks to run formatting before commits and verification checks before pushes.

## Installation

### Prerequisites

- `bun` (This repository uses `bun@1.3.5`)
- `git`

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/newkub/wpackages.git
   cd wpackages
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Install Git hooks:
   ```bash
   bun run prepare
   ```

## Usage

### Root Commands

Common commands to run from the repository root:

```bash
# Format all code
bun run format

# Lint all workspaces
bun run lint

# Run tests across all workspaces
bun run test

# Build all packages and apps
bun run build

# Run all verification steps (format, lint, test)
bun run verify

# Start development mode for all apps
bun run dev
```

### Workspace-Specific Commands

To run a command for a specific workspace, use the `--filter` flag with Turborepo. The package name is defined in its `package.json`.

## Workspaces

This monorepo contains the following packages and applications:

### Packages

- **`@wpackages/api-builder`**: A powerful and lightweight library for building robust, type-safe, and scalable APIs in TypeScript using Effect-TS.
- **`@wpackages/styling`**: Generate CSS from utility classes using Tailwind CSS v4 (shortcuts, custom rules, icons, disk cache).

## Examples

```bash
# Build only the 'program' app
turbo build --filter=@wpackages/program

# Run tests for the 'palse' library
turbo test --filter=@wpackages/palse

# Lint the 'cache' service
turbo lint --filter=@wpackages/cache
```

## License

This project is licensed under the MIT License.
